from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "jyad-tenders-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = "sqlite:///./jyad.db"
    DATA_FILE: str = "../mock_tenders_data.json"

    class Config:
        env_file = ".env"


settings = Settings()
