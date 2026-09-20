from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pull_request_id = Column(String(36), ForeignKey("pull_requests.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")  # pending, scanning, completed, failed
    overall_score = Column(Float, default=0.0)
    total_findings = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    info_count = Column(Integer, default=0)
    files_analyzed = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    scanner_version = Column(String(50), default="CodeGuardian-v1.0")
    owasp_version = Column(String(20), default="2025")
    is_demo = Column(Integer, default=0)  # 1 if loaded via demo mode
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    pull_request = relationship("PullRequest", back_populates="scans")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    job = relationship("ScanJob", back_populates="scan", uselist=False, cascade="all, delete-orphan")
