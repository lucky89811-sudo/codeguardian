from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class GeminiExplanationSchema(BaseModel):
    summary: str = Field(..., description="High-level human explanation of the security risk")
    impact: str = Field(..., description="Potential consequences if exploited")
    why_flagged: str = Field(..., description="Specific code pattern that triggered this rule")
    recommended_fix: str = Field(..., description="Step-by-step guidance on how to remediate")
    patched_code: str = Field(..., description="Suggested secure code replacement")
    attack_scenario: str = Field(..., description="Realistic narrative of how an attacker could leverage this vulnerability")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI confidence score between 0.0 and 1.0")
    needs_human_review: bool = Field(True, description="Flag indicating developer confirmation is required")
    limitations: List[str] = Field(default_factory=list, description="Caveats or assumptions made by the model")

class AIExplanationResponse(BaseModel):
    id: str
    finding_id: str
    model_name: str
    prompt_version: str
    summary: str
    impact: str
    why_flagged: str
    recommended_fix: str
    patched_code: str
    attack_scenario: str
    confidence: float
    needs_human_review: bool
    limitations: List[str]
    input_tokens: int = 0
    output_tokens: int = 0
    latency_ms: int = 0
    attempt_count: int = 1
    provider_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
