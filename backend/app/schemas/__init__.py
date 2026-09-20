from app.schemas.common import ErrorResponse, ErrorDetail
from app.schemas.ai_explanation import GeminiExplanationSchema, AIExplanationResponse
from app.schemas.finding import FindingBase, FindingCreate, FindingResponse, FindingStatusUpdate
from app.schemas.scan import (
    ScanCreate,
    ScanResponse,
    ScanProgressResponse,
    ScanTimelineItem,
    ScanAnalyticsResponse,
    PullRequestInfo,
    FileHotspot
)
from app.schemas.github import (
    ParseUrlRequest,
    ParseUrlResponse,
    GitHubPRResponse,
    GitHubFileItem,
    ReviewCommentRequest
)

__all__ = [
    "ErrorResponse",
    "ErrorDetail",
    "GeminiExplanationSchema",
    "AIExplanationResponse",
    "FindingBase",
    "FindingCreate",
    "FindingResponse",
    "FindingStatusUpdate",
    "ScanCreate",
    "ScanResponse",
    "ScanProgressResponse",
    "ScanTimelineItem",
    "ScanAnalyticsResponse",
    "PullRequestInfo",
    "FileHotspot",
    "ParseUrlRequest",
    "ParseUrlResponse",
    "GitHubPRResponse",
    "GitHubFileItem",
    "ReviewCommentRequest",
]
