import asyncio
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.scan import Scan
from app.models.scan_job import ScanJob
from app.models.finding import Finding
from app.models.pull_request import PullRequest
from app.models.repository import Repository
from app.schemas.scan import (
    ScanCreate,
    ScanResponse,
    ScanProgressResponse,
    ScanTimelineItem,
    ScanAnalyticsResponse,
    PullRequestInfo,
    FileHotspot
)
from app.schemas.finding import FindingResponse
from app.services.scan_orchestrator import ScanOrchestrator
from app.services.github_service import GitHubService

router = APIRouter(prefix="/scans", tags=["Scans"])

def _format_scan_response(scan: Scan) -> ScanResponse:
    pr_info = None
    if scan.pull_request:
        pr = scan.pull_request
        repo = pr.repository
        pr_info = PullRequestInfo(
            id=pr.id,
            number=pr.number,
            title=pr.title,
            author=pr.author,
            source_branch=pr.source_branch,
            target_branch=pr.target_branch,
            additions=pr.additions,
            deletions=pr.deletions,
            changed_files=pr.changed_files,
            github_url=pr.github_url,
            repo_name=repo.name if repo else "repo",
            repo_owner=repo.owner if repo else "owner",
        )
    return ScanResponse(
        id=scan.id,
        pull_request_id=scan.pull_request_id,
        status=scan.status,
        overall_score=scan.overall_score,
        total_findings=scan.total_findings,
        critical_count=scan.critical_count,
        high_count=scan.high_count,
        medium_count=scan.medium_count,
        low_count=scan.low_count,
        info_count=scan.info_count,
        files_analyzed=scan.files_analyzed,
        duration_ms=scan.duration_ms,
        scanner_version=scan.scanner_version,
        owasp_version=scan.owasp_version or "2025",
        is_demo=scan.is_demo,
        started_at=scan.started_at,
        completed_at=scan.completed_at,
        error_message=scan.error_message,
        pull_request=pr_info,
        findings=[FindingResponse.model_validate(f) for f in scan.findings] if scan.findings else None
    )

@router.get("", response_model=List[ScanResponse])
def list_scans(limit: int = 20, db: Session = Depends(get_db)):
    """Retrieves historical scans sorted by newest first."""
    scans = (
        db.query(Scan)
        .options(joinedload(Scan.pull_request).joinedload(PullRequest.repository))
        .order_by(Scan.started_at.desc())
        .limit(limit)
        .all()
    )
    return [_format_scan_response(s) for s in scans]

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
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

    return _format_scan_response(scan)

@router.get("/{scan_id}/progress", response_model=ScanProgressResponse)
def get_scan_progress(scan_id: str, db: Session = Depends(get_db)):
    """Pollable endpoint tracking asynchronous scan stages and completion percentage."""
    job = db.query(ScanJob).filter(ScanJob.scan_id == scan_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Scan job not found.")
    return ScanProgressResponse(
        scan_id=job.scan_id,
        status=job.status,
        current_stage=job.current_stage,
        progress_percent=job.progress_percent,
        error_message=job.error_message
    )

@router.get("/{scan_id}/findings", response_model=List[FindingResponse])
def get_scan_findings(
    scan_id: str,
    severity: Optional[str] = None,
    owasp: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = (
        db.query(Finding)
        .options(joinedload(Finding.ai_explanation))
        .filter(Finding.scan_id == scan_id)
    )
    if severity:
        query = query.filter(Finding.severity == severity.lower())
    if owasp:
        query = query.filter(Finding.owasp_category.ilike(f"%{owasp}%"))
    if status:
        query = query.filter(Finding.status == status.lower())
        
    findings = query.order_by(Finding.risk_score.desc()).all()
    return findings

@router.get("/{scan_id}/files")
def get_scan_files(scan_id: str, db: Session = Depends(get_db)):
    """Aggregates security risk scores and finding counts grouped per file."""
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    file_map = {}
    for f in findings:
        path = f.file_path
        if path not in file_map:
            file_map[path] = {
                "file_path": path,
                "findings_count": 0,
                "highest_severity": "info",
                "risk_score": 0.0,
                "lines_changed": 45,
                "severities": []
            }
        item = file_map[path]
        item["findings_count"] += 1
        item["severities"].append(f.severity)
        if f.risk_score > item["risk_score"]:
            item["risk_score"] = f.risk_score
            item["highest_severity"] = f.severity

    return list(file_map.values())

@router.get("/{scan_id}/timeline")
def get_scan_timeline(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    
    start = scan.started_at or datetime.now(timezone.utc)
    return [
        {
            "id": "tl-1",
            "stage": "fetching_files",
            "title": "Pull Request Metadata Ingested",
            "description": f"Retrieved {scan.files_analyzed} changed files for analysis.",
            "timestamp": start,
            "status": "completed"
        },
        {
            "id": "tl-2",
            "stage": "running_semgrep",
            "title": "Semgrep Static Analysis",
            "description": "Executed static pattern rules across changed files.",
            "timestamp": start,
            "status": "completed"
        },
        {
            "id": "tl-3",
            "stage": "running_custom_rules",
            "title": "Custom 15-Rule Security Inspection",
            "description": "Scanned code against OWASP Top 10:2025 security patterns.",
            "timestamp": start,
            "status": "completed"
        },
        {
            "id": "tl-4",
            "stage": "normalizing_findings",
            "title": "Deduplication & Category Resolution",
            "description": "Consolidated overlapping findings and resolved CWE identifiers.",
            "timestamp": start,
            "status": "completed"
        },
        {
            "id": "tl-5",
            "stage": "generating_ai_explanations",
            "title": "Explainable AI Synthesis",
            "description": "Generated explainable reasoning, attack scenarios, and remediation patches.",
            "timestamp": scan.completed_at or start,
            "status": "completed" if scan.status == "completed" else "in_progress"
        }
    ]

@router.get("/{scan_id}/analytics", response_model=ScanAnalyticsResponse)
def get_scan_analytics(scan_id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")

    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()

    sev_counts = {
        "critical": scan.critical_count,
        "high": scan.high_count,
        "medium": scan.medium_count,
        "low": scan.low_count,
        "info": scan.info_count
    }

    owasp_counts = {}
    source_counts = {}
    total_exploit = 0.0
    total_impact = 0.0

    for f in findings:
        owasp_counts[f.owasp_category] = owasp_counts.get(f.owasp_category, 0) + 1
        source_counts[f.source] = source_counts.get(f.source, 0) + 1
        total_exploit += f.exploitability
        total_impact += f.impact

    count = max(1, len(findings))

    # File hotspots
    file_map = {}
    for f in findings:
        p = f.file_path
        if p not in file_map:
            file_map[p] = {"path": p, "count": 0, "max_sev": "info", "risk": 0.0}
        file_map[p]["count"] += 1
        if f.risk_score > file_map[p]["risk"]:
            file_map[p]["risk"] = f.risk_score
            file_map[p]["max_sev"] = f.severity

    hotspots = [
        FileHotspot(
            file_path=k,
            findings_count=v["count"],
            highest_severity=v["max_sev"],
            risk_score=v["risk"],
            lines_changed=30
        )
        for k, v in file_map.items()
    ]

    return ScanAnalyticsResponse(
        scan_id=scan.id,
        overall_score=scan.overall_score,
        total_findings=scan.total_findings,
        severity_breakdown=sev_counts,
        owasp_breakdown=owasp_counts,
        source_breakdown=source_counts,
        file_hotspots=hotspots,
        avg_exploitability=round(total_exploit / count, 2),
        avg_impact=round(total_impact / count, 2)
    )

@router.post("", response_model=ScanProgressResponse)
async def create_scan(
    payload: ScanCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Initiates a security scan asynchronously against a PR URL or loads sample fixtures."""
    parsed = GitHubService.parse_url(payload.pull_request_url or "")
    if not parsed["is_valid"] or parsed["url_type"] != "pull_request":
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_PULL_REQUEST_URL",
                "message": parsed.get("error", "The provided URL is not a valid GitHub pull-request URL.")
            }
        )

    owner = parsed["owner"]
    repo_name = parsed["repo"]
    pull_num = parsed["pull_number"]

    # Ingest or find repo
    repo = db.query(Repository).filter(Repository.full_name == f"{owner}/{repo_name}").first()
    if not repo:
        repo = Repository(
            owner=owner,
            name=repo_name,
            full_name=f"{owner}/{repo_name}",
            github_url=f"https://github.com/{owner}/{repo_name}"
        )
        db.add(repo)
        db.flush()

    # Ingest or find PR
    pr = db.query(PullRequest).filter(
        PullRequest.repository_id == repo.id,
        PullRequest.number == pull_num
    ).first()
    if not pr:
        pr = PullRequest(
            repository_id=repo.id,
            number=pull_num,
            title=f"Pull Request #{pull_num}",
            github_url=parsed["normalized_url"]
        )
        db.add(pr)
        db.flush()

    # Initialize Scan and ScanJob
    scan = Scan(
        pull_request_id=pr.id,
        status="scanning",
        scanner_version="CodeGuardian-v1.0",
        owasp_version="2025",
        is_demo=0
    )
    db.add(scan)
    db.flush()

    job = ScanJob(
        scan_id=scan.id,
        status="queued",
        current_stage="Scan queued for execution",
        progress_percent=5
    )
    db.add(job)
    db.commit()

    # Background task executor
    gh_service = GitHubService()
    
    async def run_bg_scan(scan_id: str, owner: str, repo_name: str, pr_num: int):
        from app.database import SessionLocal
        bg_db = SessionLocal()
        try:
            # Fetch files from GitHub
            pr_data = await gh_service.get_pull_request(owner, repo_name, pr_num)
            files_list = await gh_service.get_pull_request_files(owner, repo_name, pr_num)
            
            files_dict = {}
            for item in files_list:
                raw_url = item.get("raw_url")
                filename = item.get("filename")
                if raw_url and filename:
                    content = await gh_service.get_file_content_by_url(raw_url)
                    files_dict[filename] = content

            # Run orchestrator
            orchestrator = ScanOrchestrator(bg_db)
            await orchestrator.execute_scan(scan_id, files_dict)

        except Exception as e:
            bg_job = bg_db.query(ScanJob).filter(ScanJob.scan_id == scan_id).first()
            bg_scan = bg_db.query(Scan).filter(Scan.id == scan_id).first()
            if bg_job and bg_scan:
                bg_scan.status = "failed"
                bg_scan.error_message = str(e)
                bg_job.status = "failed"
                bg_job.current_stage = f"Scan failed: {str(e)}"
                bg_job.error_message = str(e)
                bg_db.commit()
        finally:
            bg_db.close()

    background_tasks.add_task(run_bg_scan, scan.id, owner, repo_name, pull_num)

    return ScanProgressResponse(
        scan_id=scan.id,
        status=job.status,
        current_stage=job.current_stage,
        progress_percent=job.progress_percent
    )
