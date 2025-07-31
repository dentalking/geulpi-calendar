from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # OpenAI Configuration
    openai_api_key: str = ""
    openai_model: str = "gpt-3.5-turbo"
    openai_max_tokens: int = 1000
    openai_temperature: float = 0.7
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False
    
    # CORS Configuration
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    
    # Backend API Configuration
    backend_api_url: str = "http://localhost:8080"
    backend_graphql_endpoint: str = "http://localhost:8080/graphql"
    
    # Redis Configuration (for caching)
    redis_url: str = "redis://localhost:6379"
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()