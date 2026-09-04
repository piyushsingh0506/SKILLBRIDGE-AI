import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Academia–Industry Connect"
    PROJECT_TAGLINE: str = "From Skills to Opportunities — One Connected Ecosystem."
    PROJECT_VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "sih-ai-academia-industry-connect-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # Database
    # Defaults to local SQLite for instant zero-config running; easily swapped with PostgreSQL via DATABASE_URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./academia_industry.db"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # AI Engine Configuration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "local") # "gemini" or "local"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
