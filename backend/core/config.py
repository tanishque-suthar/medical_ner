# app/core/config.py

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from a .env file at the project root.
# This allows you to keep sensitive data like database URLs and secret keys
# out of your version-controlled source code.
load_dotenv()

class Settings(BaseSettings):
    """
    Manages all application settings using Pydantic.
    It automatically reads environment variables or values from a .env file.
    This provides a single, reliable source for all configuration.
    """
    # --- Application Settings ---
    PROJECT_NAME: str = "Hospital Medical Analyzer API"
    API_V1_STR: str = "/api"

    # --- Database Settings ---
    # The URL for connecting to your database.
    # Example for PostgreSQL: "postgresql://user:password@host:port/dbname"
    # The default value uses a simple SQLite database file.
    SQLALCHEMY_DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    # --- AI Service URLs ---
    # These should point to the running instances of your AI microservices.
    NER_SERVICE_URL: str = os.getenv("NER_SERVICE_URL", "http://localhost:5001")
    XRAY_SERVICE_URL: str = os.getenv("XRAY_SERVICE_URL", "http://localhost:5002")
    
    # --- Gemini API Key ---
    # Google Gemini API key for X-ray analysis and comparison
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # --- JWT Security Settings ---
    # This key MUST be kept secret and should be a long, random string.
    # It's critical to set this in your .env file for production.
    # You can generate a good secret key using: openssl rand -hex 32
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a_very_insecure_default_key_for_development_only")
    
    # The algorithm used to sign the JWT tokens.
    ALGORITHM: str = "HS256"
    
    # The lifetime of an access token in minutes.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # Token valid for 24 hours

    class Config:
        # Pydantic's configuration class to load from a .env file.
        case_sensitive = True
        env_file = ".env"

# Create a single, importable instance of the settings that can be used
# throughout the application to access configuration values.
settings = Settings()
