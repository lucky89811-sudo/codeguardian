import subprocess
import shutil
import json
import os
from typing import List, Dict, Any
from app.config import settings
from app.services.normalization_service import NormalizationService
from app.services.risk_service import RiskService
from app.services.secret_redaction_service import SecretRedactionService

class SemgrepService:
    @staticmethod
    def is_available() -> bool:
        """Checks if semgrep CLI binary exists on the system PATH."""
        return shutil.which("semgrep") is not None

    @classmethod
    def scan_directory(cls, target_dir: str) -> List[Dict[str, Any]]:
        """
        Runs Semgrep on target_dir using structured JSON output.
        Gracefully returns an empty list if Semgrep is not installed or times out.
        """
        if not cls.is_available():
            return []

        # Enforce path safety
        safe_path = os.path.abspath(target_dir)
        if not os.path.exists(safe_path):
            return []

        cmd = [
            "semgrep",
            "scan",
            "--config", "p/default",
            "--json",
            "--quiet",
            safe_path
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=settings.SEMGREP_TIMEOUT_SECONDS,
                check=False
            )
            
            if not result.stdout:
                return []

            data = json.loads(result.stdout)
            return cls._parse_semgrep_results(data, safe_path)

        except subprocess.TimeoutExpired:
            return []
        except Exception:
            return []

    @classmethod
    def _parse_semgrep_results(cls, data: Dict[str, Any], base_dir: str) -> List[Dict[str, Any]]:
        findings = []
        raw_results = data.get("results", [])

        for item in raw_results:
            rule_id = item.get("check_id", "semgrep-rule")
            raw_path = item.get("path", "")
            rel_path = os.path.relpath(raw_path, base_dir).replace("\\", "/")
            
            start = item.get("start", {})
            end = item.get("end", {})
            line_start = start.get("line", 1)
            line_end = end.get("line", 1)
            
            extra = item.get("extra", {})
            raw_severity = extra.get("severity", "WARNING")
            severity = NormalizationService.normalize_severity(raw_severity)
            message = extra.get("message", "Semgrep security finding")
            lines_code = extra.get("lines", "")
            
            redacted_code = SecretRedactionService.redact(lines_code.strip())
            
            metadata = extra.get("metadata", {})
            cwe_list = metadata.get("cwe", [])
            cwe = cwe_list[0] if isinstance(cwe_list, list) and cwe_list else "CWE-Other"
            
            owasp_cat = NormalizationService.resolve_owasp_category(cwe)
            exposure = RiskService.calculate_exposure(rel_path)
            
            conf_val = 0.85
            exploit_val = 0.80 if severity in ["critical", "high"] else 0.60
            impact_val = 0.85 if severity in ["critical", "high"] else 0.55
            
            risk_score = RiskService.calculate_finding_risk(
                severity=severity,
                confidence=conf_val,
                exploitability=exploit_val,
                exposure=exposure
            )

            findings.append({
                "rule_id": rule_id,
                "title": message.split("\n")[0][:120],
                "description": message,
                "pattern_label": "Confirmed pattern",
                "severity": severity,
                "confidence": conf_val,
                "exploitability": exploit_val,
                "impact": impact_val,
                "exposure": exposure,
                "risk_score": risk_score,
                "file_path": rel_path,
                "line_start": line_start,
                "line_end": line_end,
                "column_start": start.get("col", 1),
                "column_end": end.get("col", 1),
                "code_snippet": redacted_code,
                "source": "semgrep",
                "cwe": cwe,
                "owasp_category": owasp_cat,
                "status": "open",
                "ai_explanation_status": "pending",
            })

        return findings
