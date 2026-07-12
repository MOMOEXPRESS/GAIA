from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Gaia Health API"
    debug: bool = True
    api_prefix: str = "/api/v1"

    # CORS
    cors_origins: str = "http://localhost:3000,https://*.vercel.app"

    # PostgreSQL (Supabase)
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/gaia"

    # MongoDB (symptom logs)
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "gaia_symptoms"

    # Redis (price cache)
    redis_url: str = "redis://localhost:6379/0"

    # JWT / Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""
    jwt_secret: str = "change-me-in-production"

    # Ollama (optional LLM)
    ollama_url: str = "http://localhost:11434"

    class Config:
        env_file = ".env"


settings = Settings()
