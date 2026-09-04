import os
from pydantic_settings import BaseSettings, SettingsConfigDict

backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(backend_dir, ".env")


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:mysql@localhost:3306/skillbridge"
    SECRET_KEY: str = "my-super-secret-skillbridge-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=env_path if os.path.exists(env_path) else ".env",
        extra="ignore"
    )


settings = Settings()