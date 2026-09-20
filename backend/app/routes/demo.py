from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.demo_data import get_demo_dataset
from app.models.repository import Repository
from app.models.pull_request import PullRequest
from app.models.scan import Scan
from app.models.scan_job import ScanJob
from app.models.finding import Finding
from app.models.ai_explanation import AIExplanation

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/load")
def load_demo_data(db: Session = Depends(get_db)):
    """Loads bundled static sample dataset without requiring external credentials."""
    data = get_demo_dataset()
    
    # 1. Ensure Repository exists
    repo_data = data["repository"]
    repo = db.query(Repository).filter(Repository.full_name == repo_data["full_name"]).first()
    if not repo:
        repo = Repository(**repo_data)
        db.add(repo)
        db.flush()

    # 2. Ensure PullRequest exists
    pr_data = data["pull_request"]
    pr = db.query(PullRequest).filter(
        PullRequest.repository_id == repo.id,
        PullRequest.number == pr_data["number"]
    ).first()
    if not pr:
        pr = PullRequest(repository_id=repo.id, **pr_data)
        db.add(pr)
        db.flush()

    # 3. Create Scan
    scan_dict = data["scan"]
    scan = Scan(pull_request_id=pr.id, **scan_dict)
    db.add(scan)
    db.flush()

    # 4. Create ScanJob
    job_dict = data["scan_job"]
    job = ScanJob(scan_id=scan.id, **job_dict)
    db.add(job)

    # 5. Create Findings and AIExplanations
    for f in data["findings"]:
        ai_data = f.get("ai_explanation")
        finding = Finding(
            scan_id=scan.id,
            rule_id=f["rule_id"],
            title=f["title"],
            description=f["description"],
            pattern_label=f.get("pattern_label", "Confirmed pattern"),
            severity=f["severity"],
            confidence=f["confidence"],
            exploitability=f["exploitability"],
            impact=f["impact"],
            exposure=f["exposure"],
            risk_score=f["risk_score"],
            file_path=f["file_path"],
            line_start=f["line_start"],
            line_end=f["line_end"],
            column_start=f.get("column_start", 1),
            column_end=f.get("column_end", 1),
            code_snippet=f["code_snippet"],
            source=f["source"],
            cwe=f["cwe"],
            owasp_category=f["owasp_category"],
            status="open",
            ai_explanation_status="complete" if ai_data else "none",
        )
        db.add(finding)
        db.flush()

        if ai_data:
            ai_expl = AIExplanation(
                finding_id=finding.id,
                model_name=ai_data.get("model_name", "gemini-2.5-flash"),
                prompt_version=ai_data.get("prompt_version", "v1.0"),
                summary=ai_data["summary"],
                impact=ai_data["impact"],
                why_flagged=ai_data["why_flagged"],
                recommended_fix=ai_data["recommended_fix"],
                patched_code=ai_data["patched_code"],
                attack_scenario=ai_data["attack_scenario"],
                confidence=ai_data["confidence"],
                needs_human_review=ai_data["needs_human_review"],
                limitations=ai_data["limitations"],
                input_tokens=ai_data.get("input_tokens", 180),
                output_tokens=ai_data.get("output_tokens", 110),
                latency_ms=ai_data.get("latency_ms", 15),
                attempt_count=ai_data.get("attempt_count", 1),
                provider_status=ai_data.get("provider_status", "demo_mode"),
            )
            db.add(ai_expl)

    db.commit()

    return {
        "message": "Demo data loaded successfully.",
        "mode": "DEMO MODE — STATIC SAMPLE DATA",
        "scan_id": scan.id,
        "repository": repo_data["full_name"],
        "pull_request": pr_data["number"],
        "findings_count": len(data["findings"]),
        "overall_score": scan.overall_score,
    }
