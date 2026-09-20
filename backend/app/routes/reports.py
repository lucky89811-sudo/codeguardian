from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.scan import Scan
from app.models.finding import Finding
from app.models.pull_request import PullRequest
from app.models.repository import Repository
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{scan_id}")
@router.get("/{scan_id}/html")
def view_html_report(scan_id: str, db: Session = Depends(get_db)):
    scan = (
        db.query(Scan)
        .options(
            joinedload(Scan.pull_request).joinedload(PullRequest.repository),
            joinedload(Scan.findings).joinedload(Finding.ai_explanation)
        )
        .filter(Scan.id == scan_id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    pr = scan.pull_request
    repo = pr.repository if pr else None
    pr_info = {
        "repo_name": repo.name if repo else "repo",
        "repo_owner": repo.owner if repo else "owner",
        "number": pr.number if pr else 0,
        "title": pr.title if pr else "Pull Request",
    }

    html_content = ReportService.generate_html_report(scan, scan.findings, pr_info)
    return Response(content=html_content, media_type="text/html")

@router.get("/{scan_id}/download")
def download_html_report(scan_id: str, db: Session = Depends(get_db)):
    scan = (
        db.query(Scan)
        .options(
            joinedload(Scan.pull_request).joinedload(PullRequest.repository),
            joinedload(Scan.findings).joinedload(Finding.ai_explanation)
        )
        .filter(Scan.id == scan_id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    pr = scan.pull_request
    repo = pr.repository if pr else None
    pr_info = {
        "repo_name": repo.name if repo else "repo",
        "repo_owner": repo.owner if repo else "owner",
        "number": pr.number if pr else 0,
        "title": pr.title if pr else "Pull Request",
    }

    html_content = ReportService.generate_html_report(scan, scan.findings, pr_info)
    filename = f"codeguardian-report-pr{pr_info['number']}-{scan_id[:8]}.html"
    return Response(
        content=html_content,
        media_type="text/html",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
