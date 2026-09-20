from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.ai_explanation import AIExplanationResponse

class FindingBase(BaseModel):
    rule_id: str
    title: str
    description: str
    pattern_label: str = "Confirmed pattern"
    severity: str  # critical, high, medium, low, info
    confidence: float
    exploitability: float
    impact: float
    exposure: float = 0.8
    risk_score: float
    file_path: str
    line_start: int
    line_end: int
    column_start: Optional[int] = None
    column_end: Optional[int] = None
    code_snippet: str
    source: str  # semgrep, custom_rule, semgrep+custom_rule, dependency
    cwe: str
    owasp_category: str
    status: str = "open"
    ai_explanation_status: str = "pending"

class FindingCreate(FindingBase):
    scan_id: str

class FindingStatusUpdate(BaseModel):
    status: str  # open, reviewed, false_positive, resolved
    note: Optional[str] = None

class FindingResponse(FindingBase):
    id: str
    scan_id: str
    created_at: datetime
    ai_explanation: Optional[AIExplanationResponse] = None

    model_config = ConfigDict(from_attributes=True)
