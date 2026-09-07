import os
from pathlib import Path
from pydantic_settings import BaseSettings

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DEFAULT_DB = (_BACKEND_DIR / "recoverai.db").as_posix()

class Settings(BaseSettings):
    PROJECT_NAME: str = "RecoverAI — Autonomous AI Revenue Recovery Platform"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB}")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "demo-key")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "recoverai-super-secret-key-2026")
    
    # Policy limits
    AUTO_RECOVERY_THRESHOLD_INR: float = 10000.0
    LIMITED_RECOVERY_THRESHOLD_INR: float = 50000.0
    MAX_RETRY_ATTEMPTS: int = 3
    MAX_OUTREACH_ATTEMPTS: int = 3

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
