from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.finding import Finding
from app.models.ai_explanation import AIExplanation
from app.models.review_action import ReviewAction
from app.schemas.finding import FindingResponse, FindingStatusUpdate
from app.services.gemini_service import GeminiExplanationProvider, DemoExplanationProvider
from app.config import settings

router = APIRouter(prefix="/findings", tags=["Findings"])

@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding(finding_id: str, db: Session = Depends(get_db)):
    finding = (
        db.query(Finding)
        .options(joinedload(Finding.ai_explanation))
        .filter(Finding.id == finding_id)
        .first()
    )
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")
    return finding

@router.patch("/{finding_id}/status", response_model=FindingResponse)
def update_finding_status(
    finding_id: str,
    payload: FindingStatusUpdate,
    db: Session = Depends(get_db)
):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    valid_statuses = ["open", "reviewed", "false_positive", "resolved"]
    if payload.status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    finding.status = payload.status.lower()
    
    # Create audit log action
    action = ReviewAction(
        finding_id=finding.id,
        action=payload.status.lower(),
        note=payload.note
    )
    db.add(action)
    db.commit()
    db.refresh(finding)
    return finding

@router.post("/{finding_id}/explain")
async def trigger_finding_explanation(finding_id: str, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    provider = GeminiExplanationProvider() if settings.GEMINI_API_KEY else DemoExplanationProvider()
    
    f_dict = {
        "rule_id": finding.rule_id,
        "title": finding.title,
        "description": finding.description,
        "severity": finding.severity,
        "file_path": finding.file_path,
        "line_start": finding.line_start,
        "code_snippet": finding.code_snippet,
        "cwe": finding.cwe,
        "owasp_category": finding.owasp_category,
    }
    
    ai_data = await provider.explain_finding(f_dict, finding.code_snippet)

    # Check if explanation already exists
    existing = db.query(AIExplanation).filter(AIExplanation.finding_id == finding_id).first()
    if existing:
        existing.summary = ai_data["summary"]
        existing.impact = ai_data["impact"]
        existing.why_flagged = ai_data["why_flagged"]
        existing.recommended_fix = ai_data["recommended_fix"]
        existing.patched_code = ai_data["patched_code"]
        existing.attack_scenario = ai_data["attack_scenario"]
        existing.confidence = ai_data["confidence"]
        existing.needs_human_review = ai_data["needs_human_review"]
        existing.limitations = ai_data["limitations"]
        existing.input_tokens = ai_data.get("input_tokens", 0)
        existing.output_tokens = ai_data.get("output_tokens", 0)
        existing.latency_ms = ai_data.get("latency_ms", 0)
        existing.provider_status = ai_data.get("provider_status", "live_gemini")
    else:
        new_ai = AIExplanation(
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
            input_tokens=ai_data.get("input_tokens", 0),
            output_tokens=ai_data.get("output_tokens", 0),
            latency_ms=ai_data.get("latency_ms", 0),
            attempt_count=1,
            provider_status=ai_data.get("provider_status", "live_gemini"),
        )
        db.add(new_ai)

    finding.ai_explanation_status = "complete"
    db.commit()
    db.refresh(finding)
    return finding
