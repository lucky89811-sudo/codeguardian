import os
import time
import tempfile
import shutil
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.scan import Scan
from app.models.scan_job import ScanJob
from app.models.finding import Finding
from app.models.ai_explanation import AIExplanation
from app.services.custom_rules_service import CustomRulesService
from app.services.semgrep_service import SemgrepService
from app.services.dependency_service import DependencyService
from app.services.deduplication_service import FindingDeduplicationService
from app.services.risk_service import RiskService
from app.services.gemini_service import GeminiExplanationProvider, DemoExplanationProvider
from app.services.secret_redaction_service import SecretRedactionService
from app.config import settings

class ScanOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.custom_rules_svc = CustomRulesService()
        self.gemini_provider = GeminiExplanationProvider() if settings.GEMINI_API_KEY else DemoExplanationProvider()

    def update_job_stage(self, job: ScanJob, status: str, stage: str, progress: int, error: Optional[str] = None):
        job.status = status
        job.current_stage = stage
        job.progress_percent = progress
        if error:
            job.error_message = error
        job.updated_at = datetime.now(timezone.utc)
        self.db.commit()

    async def execute_scan(
        self,
        scan_id: str,
        files: Dict[str, str],  # rel_path -> file_content
    ):
        scan = self.db.query(Scan).filter(Scan.id == scan_id).first()
        job = self.db.query(ScanJob).filter(ScanJob.scan_id == scan_id).first()
        if not scan or not job:
            return

        start_time = time.time()
        temp_dir = None

        try:
            # Stage 1: Fetching / Ingesting files
            self.update_job_stage(job, "fetching_files", f"Ingested {len(files)} files for analysis", 15)
            
            # Guard against oversized repositories
            if len(files) > settings.MAX_CHANGED_FILES:
                raise ValueError(f"Scan exceeded maximum allowed changed files ({settings.MAX_CHANGED_FILES}).")

            # Write files to an isolated temporary directory for Semgrep
            temp_dir = tempfile.mkdtemp(prefix="codeguardian_scan_")
            for rel_path, content in files.items():
                safe_rel_path = os.path.normpath(rel_path).lstrip("/\\")
                if ".." in safe_rel_path.split(os.sep):
                    continue  # Path traversal safety
                target_file_path = os.path.join(temp_dir, safe_rel_path)
                os.makedirs(os.path.dirname(target_file_path), exist_ok=True)
                with open(target_file_path, "w", encoding="utf-8", errors="ignore") as f:
                    f.write(content)

            raw_findings: List[Dict[str, Any]] = []

            # Stage 2: Semgrep Static Analysis
            self.update_job_stage(job, "running_semgrep", "Running static analysis via Semgrep engine", 30)
            if SemgrepService.is_available():
                semgrep_findings = SemgrepService.scan_directory(temp_dir)
                raw_findings.extend(semgrep_findings)

            # Stage 3: Custom Rules Engine
            self.update_job_stage(job, "running_custom_rules", "Applying 15 custom security rules", 50)
            for rel_path, content in files.items():
                custom_findings = self.custom_rules_svc.scan_file(rel_path, content)
                raw_findings.extend(custom_findings)

            # Stage 4: Dependency and Supply Chain Inspection (A03:2025)
            dep_findings = DependencyService.inspect_dependencies(files)
            raw_findings.extend(dep_findings)

            # Stage 5: Normalization & Deduplication
            self.update_job_stage(job, "normalizing_findings", "Deduplicating findings and mapping OWASP 2025 categories", 70)
            deduped_findings = FindingDeduplicationService.deduplicate(raw_findings)

            # Stage 6: AI Explanations via Google Gen AI SDK
            self.update_job_stage(job, "generating_ai_explanations", "Synthesizing explainable AI security reasoning", 85)
            
            persisted_findings = []
            for f_dict in deduped_findings:
                # Save finding model
                finding_model = Finding(
                    scan_id=scan.id,
                    rule_id=f_dict["rule_id"],
                    title=f_dict["title"],
                    description=f_dict["description"],
                    pattern_label=f_dict.get("pattern_label", "Confirmed pattern"),
                    severity=f_dict["severity"],
                    confidence=f_dict["confidence"],
                    exploitability=f_dict["exploitability"],
                    impact=f_dict["impact"],
                    exposure=f_dict.get("exposure", 0.8),
                    risk_score=f_dict["risk_score"],
                    file_path=f_dict["file_path"],
                    line_start=f_dict["line_start"],
                    line_end=f_dict["line_end"],
                    column_start=f_dict.get("column_start", 1),
                    column_end=f_dict.get("column_end", 1),
                    code_snippet=f_dict["code_snippet"],
                    source=f_dict["source"],
                    cwe=f_dict["cwe"],
                    owasp_category=f_dict["owasp_category"],
                    status="open",
                    ai_explanation_status="pending",
                )
                self.db.add(finding_model)
                self.db.flush()

                # Generate AI explanation for critical, high, and medium findings
                code_context = files.get(f_dict["file_path"], f_dict["code_snippet"])
                ai_data = await self.gemini_provider.explain_finding(f_dict, code_context)
                
                ai_model = AIExplanation(
                    finding_id=finding_model.id,
                    model_name=ai_data.get("model_name", "gemini-2.5-flash"),
                    prompt_version=ai_data.get("prompt_version", "v1.0"),
                    summary=ai_data.get("summary", "Security finding detected."),
                    impact=ai_data.get("impact", "Impact requires review."),
                    why_flagged=ai_data.get("why_flagged", "Pattern triggered rule."),
                    recommended_fix=ai_data.get("recommended_fix", "Consult documentation."),
                    patched_code=ai_data.get("patched_code", ""),
                    attack_scenario=ai_data.get("attack_scenario", "N/A"),
                    confidence=ai_data.get("confidence", 0.9),
                    needs_human_review=ai_data.get("needs_human_review", True),
                    limitations=ai_data.get("limitations", []),
                    input_tokens=ai_data.get("input_tokens", 0),
                    output_tokens=ai_data.get("output_tokens", 0),
                    latency_ms=ai_data.get("latency_ms", 0),
                    attempt_count=ai_data.get("attempt_count", 1),
                    provider_status=ai_data.get("provider_status", "live_gemini"),
                )
                finding_model.ai_explanation_status = "complete"
                self.db.add(ai_model)
                persisted_findings.append(finding_model)

            # Stage 7: Calculate Overall Risk Score & Finalize Scan
            duration_ms = int((time.time() - start_time) * 1000)
            overall_score = RiskService.calculate_overall_scan_score(persisted_findings)

            scan.status = "completed"
            scan.overall_score = overall_score
            scan.total_findings = len(persisted_findings)
            scan.critical_count = sum(1 for f in persisted_findings if f.severity == "critical")
            scan.high_count = sum(1 for f in persisted_findings if f.severity == "high")
            scan.medium_count = sum(1 for f in persisted_findings if f.severity == "medium")
            scan.low_count = sum(1 for f in persisted_findings if f.severity == "low")
            scan.info_count = sum(1 for f in persisted_findings if f.severity == "info")
            scan.files_analyzed = len(files)
            scan.duration_ms = duration_ms
            scan.completed_at = datetime.now(timezone.utc)

            self.update_job_stage(job, "completed", "Security review scan complete", 100)
            self.db.commit()

        except Exception as e:
            self.db.rollback()
            scan.status = "failed"
            scan.error_message = str(e)
            self.update_job_stage(job, "failed", f"Scan failed: {str(e)}", 100, error=str(e))
            self.db.commit()

        finally:
            if temp_dir and os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
