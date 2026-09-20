from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.finding import FindingResponse

class ScanCreate(BaseModel):
    pull_request_url: Optional[str] = None
    repository_url: Optional[str] = None
    is_demo: bool = False

class ScanProgressResponse(BaseModel):
    scan_id: str
    status: str  # queued, fetching_files, running_semgrep, running_custom_rules, normalizing_findings, generating_ai_explanations, completed, failed, cancelled
    current_stage: str
    progress_percent: int
    error_message: Optional[str] = None

class ScanTimelineItem(BaseModel):
    id: str
    stage: str
    title: str
    description: str
    timestamp: datetime
    status: str  # completed, in_progress, pending, failed

class FileHotspot(BaseModel):
    file_path: str
    findings_count: int
    highest_severity: str
    risk_score: float
    lines_changed: int

class ScanAnalyticsResponse(BaseModel):
    scan_id: str
    overall_score: float
    total_findings: int
    severity_breakdown: Dict[str, int]
    owasp_breakdown: Dict[str, int]
    source_breakdown: Dict[str, int]
    file_hotspots: List[FileHotspot]
    avg_exploitability: float
    avg_impact: float

class PullRequestInfo(BaseModel):
    id: str
    number: int
    title: str
    author: str
    source_branch: str
    target_branch: str
    additions: int
    deletions: int
    changed_files: int
    github_url: str
    repo_name: str
    repo_owner: str

class ScanResponse(BaseModel):
    id: str
    pull_request_id: str
    status: str
    overall_score: float
    total_findings: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    info_count: int
    files_analyzed: int
    duration_ms: int
    scanner_version: str
    owasp_version: str = "2025"
    is_demo: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    pull_request: Optional[PullRequestInfo] = None
    findings: Optional[List[FindingResponse]] = None

    model_config = ConfigDict(from_attributes=True)
