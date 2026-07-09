"""
Centralized configuration for the Skin Cancer AI Assistant backend.
Loads from environment variables (.env file) using pydantic-settings.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Server
    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Model
    model_path: str = "model/Improved_CNN.keras"
    image_size: int = 224
    class_names: str = "Benign,Malignant"
    malignant_index: int = 1

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Misc
    max_upload_mb: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    @property
    def class_names_list(self) -> List[str]:
        return [c.strip() for c in self.class_names.split(",") if c.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    return Settings()