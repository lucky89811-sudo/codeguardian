from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(100), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    pattern_label = Column(String(50), default="Confirmed pattern")  # Confirmed pattern, Possible vulnerability, Needs human review
    severity = Column(String(20), nullable=False)  # critical, high, medium, low, info
    confidence = Column(Float, default=0.8)
    exploitability = Column(Float, default=0.7)
    impact = Column(Float, default=0.7)
    exposure = Column(Float, default=0.8)
    risk_score = Column(Float, default=0.0)
    file_path = Column(String(500), nullable=False)
    line_start = Column(Integer, default=1)
    line_end = Column(Integer, default=1)
    column_start = Column(Integer, nullable=True)
    column_end = Column(Integer, nullable=True)
    code_snippet = Column(Text, nullable=False)
    source = Column(String(100), default="custom_rule")  # semgrep, custom_rule, semgrep+custom_rule, dependency
    cwe = Column(String(50), default="CWE-Other")
    owasp_category = Column(String(100), default="A05:2025")
    status = Column(String(30), default="open")  # open, reviewed, false_positive, resolved
    ai_explanation_status = Column(String(30), default="pending")  # pending, complete, failed, none
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scan = relationship("Scan", back_populates="findings")
    ai_explanation = relationship("AIExplanation", back_populates="finding", uselist=False, cascade="all, delete-orphan")
    review_actions = relationship("ReviewAction", back_populates="finding", cascade="all, delete-orphan")
