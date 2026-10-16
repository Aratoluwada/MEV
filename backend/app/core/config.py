from pathlib import Path
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    app_name: str = "Medicine Registry Checker (Powered by Gemma 4)"
    app_version: str = "0.1.0"
    gemini_api_key: SecretStr | None = None
    gemma_model: str = "gemma-4-26b-a4b-it"
    gemini_vision_model: str = "gemini-3.8-flash"
    database_url: str = f"sqlite:///{BACKEND_DIR / 'data' / 'registry.db'}"
    nafdac_api_base_url: str | None = None
    cors_origins: list[str] = ["*"]
    api_rate_limit_requests: int = 120
    api_rate_limit_window_seconds: int = 60

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def sqlite_db_path(self) -> Path:
        """Extract Path to the SQLite database file."""
        if self.database_url.startswith("sqlite:///"):
            raw_path = self.database_url.removeprefix("sqlite:///")
            path = Path(raw_path)
            if not path.is_absolute():
                path = BACKEND_DIR / path
            return path
        return BACKEND_DIR / "data" / "registry.db"


settings = Settings()
