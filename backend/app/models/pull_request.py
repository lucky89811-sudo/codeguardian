from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PullRequest(Base):
    __tablename__ = "pull_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    repository_id = Column(String(36), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    number = Column(Integer, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    author = Column(String(100), default="unknown")
    source_branch = Column(String(200), default="feature")
    target_branch = Column(String(200), default="main")
    additions = Column(Integer, default=0)
    deletions = Column(Integer, default=0)
    changed_files = Column(Integer, default=0)
    github_url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    repository = relationship("Repository", back_populates="pull_requests")
    scans = relationship("Scan", back_populates="pull_request", cascade="all, delete-orphan")
