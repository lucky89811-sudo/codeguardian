import os
import shutil
from fastapi import APIRouter
from app.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health():
    semgrep_present = shutil.which("semgrep") is not None
    gemini_configured = bool(settings.GEMINI_API_KEY)
    github_configured = bool(settings.GITHUB_TOKEN)
    
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "owasp_standard": settings.OWASP_VERSION,
        "capabilities": {
            "semgrep_installed": semgrep_present,
            "gemini_configured": gemini_configured,
            "github_token_configured": github_configured,
            "custom_rules_count": 15,
            "demo_mode_ready": True
        }
    }
