import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeGuardian"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./codeguardian.db")
    
    # External APIs
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN", None)
    ENABLE_GITHUB_COMMENTS: bool = os.getenv("ENABLE_GITHUB_COMMENTS", "false").lower() == "true"
    
    # Limits and Guardrails
    MAX_FILE_SIZE_BYTES: int = 500_000  # 500 KB per file
    MAX_CHANGED_FILES: int = 50
    SEMGREP_TIMEOUT_SECONDS: int = 25
    OWASP_VERSION: str = "2025"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        orig.strip() for orig in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,*"
        ).split(",") if orig.strip()
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
