from typing import Optional, List
from pydantic import BaseModel

class ParseUrlRequest(BaseModel):
    url: str

class ParseUrlResponse(BaseModel):
    is_valid: bool
    url_type: str  # "pull_request" or "repository" or "invalid"
    owner: Optional[str] = None
    repo: Optional[str] = None
    pull_number: Optional[int] = None
    normalized_url: Optional[str] = None
    error: Optional[str] = None

class GitHubFileItem(BaseModel):
    filename: str
    status: str  # added, modified, removed
    additions: int
    deletions: int
    changes: int
    patch: Optional[str] = None
    raw_url: Optional[str] = None

class GitHubPRResponse(BaseModel):
    owner: str
    repo: str
    pull_number: int
    title: str
    author: str
    body: Optional[str] = None
    state: str
    created_at: str
    source_branch: str
    target_branch: str
    additions: int
    deletions: int
    changed_files: int
    files: List[GitHubFileItem] = []

class ReviewCommentRequest(BaseModel):
    finding_id: str
    body: str
    path: str
    line: int
    confirm_publish: bool = False  # Explicit confirmation required
