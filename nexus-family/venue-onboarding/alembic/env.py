# =============================================================================
# NEXUS FAMILY PASS - ALEMBIC ENVIRONMENT CONFIGURATION
# =============================================================================
"""
Alembic Environment Configuration.

This module configures Alembic for database migrations.
It handles both online (connected to database) and offline
(generating SQL scripts) migration modes.

Features:
    - Async SQLAlchemy support
    - Automatic model discovery
    - Environment-based configuration
    - pgvector extension support
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # For async migration support
from logging.config import fileConfig  # Logging configuration

# Third-party imports
from sqlalchemy import pool  # Connection pooling
from sqlalchemy.engine import Connection  # Connection type
from sqlalchemy.ext.asyncio import async_engine_from_config  # Async engine

# Alembic imports
from alembic import context  # Alembic context

# =============================================================================
# CONFIGURATION
# =============================================================================
# This is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# =============================================================================
# MODEL METADATA
# =============================================================================
# Import all models to ensure they're registered with the metadata
# This is required for autogenerate to detect model changes

# Import base and all models
from app.models.base import Base
from app.models.venue import Venue
from app.models.activity import Activity, ActivitySession
from app.models.vendor import VendorCredential
from app.models.review import GoogleReview
from app.models.quality_score import VenueQualityScore, VenueMockPricing

# Set target metadata for autogenerate support
target_metadata = Base.metadata

# =============================================================================
# DATABASE URL CONFIGURATION
# =============================================================================
def get_url() -> str:
    """
    Get the database URL from environment configuration.
    
    Returns:
        str: Database URL for migrations
    """
    # Import settings here to avoid circular imports
    from app.config import settings
    
    # Return the async URL (replace asyncpg with psycopg2 for Alembic)
    # Alembic doesn't use async connections directly
    url = settings.DATABASE_URL
    
    # If using asyncpg, convert to psycopg2 for Alembic
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql://")
    
    return url


# =============================================================================
# OFFLINE MIGRATIONS (SQL SCRIPT GENERATION)
# =============================================================================
def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the Engine
    creation we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    # Get database URL
    url = get_url()
    
    # Configure context for offline mode
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        # Include object names in autogenerate
        include_object=include_object,
        # Compare types for column type changes
        compare_type=True,
    )

    # Run migrations
    with context.begin_transaction():
        context.run_migrations()


# =============================================================================
# ONLINE MIGRATIONS (DIRECT DATABASE CONNECTION)
# =============================================================================
def do_run_migrations(connection: Connection) -> None:
    """
    Run migrations with an active database connection.
    
    Args:
        connection: Active database connection
    """
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        # Include object names in autogenerate
        include_object=include_object,
        # Compare types for column type changes
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Run migrations asynchronously.
    
    Creates an async engine and runs migrations within
    an async context.
    """
    # Build configuration dictionary
    configuration = config.get_section(config.config_ini_section) or {}
    
    # Override with actual database URL
    configuration["sqlalchemy.url"] = get_url()
    
    # Create async engine
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    # Run migrations
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    # Dispose engine
    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    In this scenario we need to create an Engine and associate
    a connection with the context.
    """
    asyncio.run(run_async_migrations())


# =============================================================================
# OBJECT FILTERING
# =============================================================================
def include_object(
    object,
    name,
    type_,
    reflected,
    compare_to,
) -> bool:
    """
    Filter which database objects to include in migrations.
    
    This function is called by Alembic's autogenerate to determine
    which objects should be included in generated migrations.
    
    Args:
        object: The SQLAlchemy schema object
        name: Name of the object
        type_: Type of object (table, column, index, etc.)
        reflected: Whether object was reflected from database
        compare_to: Object being compared to (for diffs)
    
    Returns:
        bool: True to include, False to exclude
    """
    # Skip alembic's own version table
    if type_ == "table" and name == "alembic_version":
        return False
    
    # Skip tables that start with underscore (internal/temp tables)
    if type_ == "table" and name.startswith("_"):
        return False
    
    # Include everything else
    return True


# =============================================================================
# MAIN EXECUTION
# =============================================================================
# Determine which mode to run in
if context.is_offline_mode():
    # Offline mode - generate SQL scripts
    run_migrations_offline()
else:
    # Online mode - apply to database
    run_migrations_online()
