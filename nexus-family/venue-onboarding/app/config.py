# =============================================================================
# NEXUS FAMILY PASS - CONFIGURATION MANAGEMENT
# =============================================================================
"""
Application Configuration Module.

This module uses Pydantic Settings to manage application configuration.
Configuration values are loaded from environment variables with validation
and type conversion.

Features:
    - Type-safe configuration with validation
    - Default values for optional settings
    - Environment variable loading from .env file
    - Nested configuration groups
    - Computed properties for derived values

Usage:
    ```python
    from app.config import settings
    
    # Access configuration values
    database_url = settings.DATABASE_URL
    is_debug = settings.APP_DEBUG
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from functools import lru_cache  # Cache for singleton pattern
from typing import Optional  # Optional type hints

# Third-party imports
from pydantic import Field, field_validator  # Validation decorators
from pydantic_settings import BaseSettings, SettingsConfigDict  # Settings base class


# =============================================================================
# CONFIGURATION CLASS
# =============================================================================
class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    This class defines all configuration parameters for the application.
    Values are automatically loaded from environment variables and validated.
    Default values are provided for optional settings.
    
    Attributes are organized into logical groups:
        - Database Configuration
        - Google Cloud Configuration
        - AI/ML Configuration
        - Application Configuration
        - Server Configuration
        - Logging Configuration
        - Vendor Portal Configuration
        - Mock Data Configuration
    
    Environment Variable Mapping:
        - Attribute names are converted to UPPER_SNAKE_CASE
        - Example: `database_url` -> `DATABASE_URL`
    
    Example:
        ```python
        settings = Settings()
        print(settings.DATABASE_URL)  # Reads from DATABASE_URL env var
        ```
    """
    
    # =========================================================================
    # PYDANTIC SETTINGS CONFIGURATION
    # =========================================================================
    # Configure how Pydantic loads settings
    model_config = SettingsConfigDict(
        # Path to .env file for local development
        env_file=".env",
        
        # Encoding of the .env file
        env_file_encoding="utf-8",
        
        # Case sensitivity for environment variables
        # False means DATABASE_URL and database_url are equivalent
        case_sensitive=False,
        
        # Extra fields in .env are ignored (not errors)
        extra="ignore",
    )
    
    # =========================================================================
    # DATABASE CONFIGURATION
    # =========================================================================
    # PostgreSQL connection string for Supabase
    # Format: postgresql://user:password@host:port/database
    DATABASE_URL: str = Field(
        ...,  # Required field (no default)
        description="PostgreSQL connection string (Supabase)",
        examples=["postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"],
    )
    
    # Connection pool size - number of persistent connections
    # Adjust based on Supabase plan limits
    DATABASE_POOL_SIZE: int = Field(
        default=5,
        ge=1,  # Greater than or equal to 1
        le=20,  # Less than or equal to 20
        description="Number of connections in the pool",
    )
    
    # Maximum overflow connections beyond pool size
    DATABASE_MAX_OVERFLOW: int = Field(
        default=10,
        ge=0,
        le=30,
        description="Maximum connections beyond pool size",
    )
    
    # Echo SQL statements to logs (for debugging)
    DATABASE_ECHO: bool = Field(
        default=False,
        description="Log all SQL statements",
    )
    
    # =========================================================================
    # GOOGLE CLOUD CONFIGURATION
    # =========================================================================
    # Google Places API (New) key
    GOOGLE_PLACES_API_KEY: str = Field(
        default="",
        description="Google Places API key",
    )
    
    # Search radius in meters for venue discovery
    GOOGLE_PLACES_SEARCH_RADIUS: int = Field(
        default=10000,
        ge=100,
        le=50000,
        description="Search radius in meters",
    )
    
    # Default location for searches (Bangalore, India)
    GOOGLE_PLACES_DEFAULT_LATITUDE: float = Field(
        default=12.9716,
        ge=-90.0,
        le=90.0,
        description="Default search latitude",
    )
    
    GOOGLE_PLACES_DEFAULT_LONGITUDE: float = Field(
        default=77.5946,
        ge=-180.0,
        le=180.0,
        description="Default search longitude",
    )
    
    # =========================================================================
    # AI/ML CONFIGURATION - GEMINI
    # =========================================================================
    # Google Gemini API key
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini API key",
    )
    
    # Gemini model for text generation
    GEMINI_MODEL: str = Field(
        default="gemini-1.5-flash",
        description="Gemini model name",
    )
    
    # Rate limit for Gemini API (free tier: 15 RPM)
    GEMINI_REQUESTS_PER_MINUTE: int = Field(
        default=15,
        ge=1,
        le=60,
        description="Max requests per minute to Gemini",
    )
    
    # Embedding model for vector generation
    GEMINI_EMBEDDING_MODEL: str = Field(
        default="models/embedding-001",
        description="Gemini embedding model",
    )
    
    # Vector dimension (must match pgvector column)
    EMBEDDING_DIMENSION: int = Field(
        default=768,
        description="Embedding vector dimension",
    )
    
    # =========================================================================
    # LANGSMITH CONFIGURATION
    # =========================================================================
    # LangSmith API key for AI tracing
    LANGSMITH_API_KEY: str = Field(
        default="",
        description="LangSmith API key",
    )

    # LangSmith project name
    LANGSMITH_PROJECT: str = Field(
        default="nexus-family-pass",
        description="LangSmith project name",
    )

    # Tracing mode: full, errors, false
    LANGSMITH_TRACING_ENABLED: str = Field(
        default="errors",
        description="Tracing mode: full, errors, or false",
    )

    # LangChain endpoint
    LANGCHAIN_ENDPOINT: str = Field(
        default="https://api.smith.langchain.com",
        description="LangSmith API endpoint",
    )

    # =========================================================================
    # AGENTIC AI CONFIGURATION
    # =========================================================================
    # Enable LangGraph workflows
    LANGGRAPH_ENABLED: bool = Field(
        default=True,
        description="Enable LangGraph stateful workflows",
    )

    # Enable MCP server
    MCP_SERVER_ENABLED: bool = Field(
        default=True,
        description="Enable Model Context Protocol server",
    )

    # N8N Webhook configuration
    WEBHOOK_SECRET: str = Field(
        default="nexus-webhook-secret",
        description="Secret for webhook authentication",
    )

    # LangChain temperature defaults
    LANGCHAIN_DEFAULT_TEMPERATURE: float = Field(
        default=0.7,
        ge=0.0,
        le=1.0,
        description="Default temperature for LangChain calls",
    )

    LANGCHAIN_JSON_TEMPERATURE: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Temperature for JSON output calls",
    )
    
    # =========================================================================
    # APPLICATION CONFIGURATION
    # =========================================================================
    # Application environment
    APP_ENV: str = Field(
        default="development",
        description="Environment: development, staging, production",
    )
    
    # Debug mode flag
    APP_DEBUG: bool = Field(
        default=True,
        description="Enable debug mode",
    )
    
    # Secret key for session signing
    APP_SECRET_KEY: str = Field(
        default="change-this-in-production",
        min_length=16,
        description="Secret key for cryptographic operations",
    )
    
    # API version prefix
    API_V1_PREFIX: str = Field(
        default="/api/v1",
        description="API v1 URL prefix",
    )
    
    # CORS origins (comma-separated)
    CORS_ORIGINS: str = Field(
        default="http://localhost:4200,http://localhost:8000",
        description="Allowed CORS origins (comma-separated)",
    )
    
    # =========================================================================
    # SERVER CONFIGURATION
    # =========================================================================
    # Server host
    HOST: str = Field(
        default="0.0.0.0",
        description="Server host address",
    )
    
    # Server port
    PORT: int = Field(
        default=8000,
        ge=1,
        le=65535,
        description="Server port number",
    )
    
    # Number of workers
    WORKERS: int = Field(
        default=1,
        ge=1,
        le=16,
        description="Number of worker processes",
    )
    
    # =========================================================================
    # LOGGING CONFIGURATION
    # =========================================================================
    # Log level
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level: DEBUG, INFO, WARNING, ERROR, CRITICAL",
    )
    
    # Log format
    LOG_FORMAT: str = Field(
        default="text",
        description="Log format: json or text",
    )
    
    # =========================================================================
    # VENDOR PORTAL CONFIGURATION (PHASE 1)
    # =========================================================================
    # Default password for auto-generated vendor accounts
    DEFAULT_VENDOR_PASSWORD: str = Field(
        default="VendorDemo2024!",
        min_length=8,
        description="Default vendor account password",
    )
    
    # Session expiry in hours
    SESSION_EXPIRY_HOURS: int = Field(
        default=24,
        ge=1,
        le=168,
        description="Session expiry time in hours",
    )
    
    # =========================================================================
    # MOCK DATA CONFIGURATION (PHASE 1)
    # =========================================================================
    # Base prices in INR for different activity types
    MOCK_PRICE_BASE_BADMINTON: int = Field(default=400)
    MOCK_PRICE_BASE_SWIMMING: int = Field(default=500)
    MOCK_PRICE_BASE_PICKLEBALL: int = Field(default=350)
    MOCK_PRICE_BASE_ART_CLASS: int = Field(default=275)
    MOCK_PRICE_BASE_CODING: int = Field(default=650)
    MOCK_PRICE_BASE_PLAY_ZONE: int = Field(default=250)
    
    # Price variation based on venue rating (percentage)
    MOCK_PRICE_RATING_VARIATION: int = Field(
        default=15,
        ge=0,
        le=50,
        description="Price variation percentage based on rating",
    )
    
    # Weekend price increase percentage
    MOCK_PRICE_WEEKEND_INCREASE: int = Field(
        default=20,
        ge=0,
        le=100,
        description="Weekend price increase percentage",
    )
    
    # =========================================================================
    # VALIDATORS
    # =========================================================================
    @field_validator("APP_ENV")
    @classmethod
    def validate_app_env(cls, v: str) -> str:
        """
        Validate that APP_ENV is one of the allowed values.
        
        Args:
            v: The environment value to validate
            
        Returns:
            The validated environment value (lowercased)
            
        Raises:
            ValueError: If the environment is not valid
        """
        allowed = ["development", "staging", "production"]
        v_lower = v.lower()
        if v_lower not in allowed:
            raise ValueError(f"APP_ENV must be one of: {', '.join(allowed)}")
        return v_lower
    
    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """
        Validate that LOG_LEVEL is a valid Python logging level.
        
        Args:
            v: The log level to validate
            
        Returns:
            The validated log level (uppercased)
            
        Raises:
            ValueError: If the log level is not valid
        """
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v_upper = v.upper()
        if v_upper not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of: {', '.join(allowed)}")
        return v_upper
    
    @field_validator("LANGSMITH_TRACING_ENABLED")
    @classmethod
    def validate_tracing(cls, v: str) -> str:
        """
        Validate LangSmith tracing mode.
        
        Args:
            v: The tracing mode value
            
        Returns:
            The validated tracing mode (lowercased)
            
        Raises:
            ValueError: If the tracing mode is not valid
        """
        allowed = ["full", "errors", "false"]
        v_lower = v.lower()
        if v_lower not in allowed:
            raise ValueError(f"LANGSMITH_TRACING_ENABLED must be one of: {', '.join(allowed)}")
        return v_lower
    
    # =========================================================================
    # COMPUTED PROPERTIES
    # =========================================================================
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.APP_ENV == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.APP_ENV == "development"
    
    @property
    def async_database_url(self) -> str:
        """
        Get the async version of the database URL.
        
        Converts postgresql:// to postgresql+asyncpg:// for async SQLAlchemy.
        
        Returns:
            Database URL with asyncpg driver
        """
        return self.DATABASE_URL.replace(
            "postgresql://",
            "postgresql+asyncpg://"
        )
    
    @property
    def sync_database_url(self) -> str:
        """
        Get the sync version of the database URL.
        
        Uses psycopg2 driver for synchronous operations (like Alembic).
        
        Returns:
            Database URL with psycopg2 driver
        """
        return self.DATABASE_URL.replace(
            "postgresql://",
            "postgresql+psycopg2://"
        )
    
    @property
    def langsmith_enabled(self) -> bool:
        """Check if LangSmith tracing is enabled."""
        return self.LANGSMITH_TRACING_ENABLED != "false" and bool(self.LANGSMITH_API_KEY)


# =============================================================================
# SETTINGS SINGLETON
# =============================================================================
@lru_cache()
def get_settings() -> Settings:
    """
    Get the application settings singleton.
    
    This function uses lru_cache to ensure only one Settings instance
    is created, regardless of how many times it's called. This is important
    because reading environment variables and parsing settings is expensive.
    
    Returns:
        Settings: The application settings instance
        
    Example:
        ```python
        settings = get_settings()
        print(settings.DATABASE_URL)
        ```
    """
    return Settings()


# =============================================================================
# MODULE-LEVEL SETTINGS INSTANCE
# =============================================================================
# Create a module-level settings instance for convenient importing
# Usage: from app.config import settings
settings = get_settings()
