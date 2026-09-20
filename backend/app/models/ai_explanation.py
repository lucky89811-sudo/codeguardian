from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class AIExplanation(Base):
    __tablename__ = "ai_explanations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    finding_id = Column(String(36), ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, unique=True)
    model_name = Column(String(100), default="gemini-2.5-flash")
    prompt_version = Column(String(50), default="v1.0")
    
    summary = Column(Text, nullable=False)
    impact = Column(Text, nullable=False)
    why_flagged = Column(Text, nullable=False)
    recommended_fix = Column(Text, nullable=False)
    patched_code = Column(Text, nullable=False)
    attack_scenario = Column(Text, nullable=False)
    confidence = Column(Float, default=0.9)
    needs_human_review = Column(Boolean, default=True)
    limitations = Column(JSON, default=list)  # list of strings
    
    # Telemetry, latency, and cost tracking
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    attempt_count = Column(Integer, default=1)
    provider_status = Column(String(50), default="success")  # success, fallback, cached, failed
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    finding = relationship("Finding", back_populates="ai_explanation")
