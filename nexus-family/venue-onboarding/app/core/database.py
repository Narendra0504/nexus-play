# =============================================================================
# NEXUS FAMILY PASS - DATABASE CONFIGURATION
# =============================================================================
"""
Database Connection and Session Management Module.

This module configures SQLAlchemy for async database operations with PostgreSQL
(via Supabase). It provides:
    - Async engine creation and configuration
    - Session factory with context management
    - Dependency injection for FastAPI routes
    - Database lifecycle management (init/close)

Architecture:
    The module uses SQLAlchemy's async support with asyncpg driver.
    Sessions are scoped per-request using FastAPI's dependency injection.

Usage:
    ```python
    # In FastAPI routes
    from app.core.database import get_db
    
    @router.get("/items")
    async def get_items(db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(Item))
        return result.scalars().all()
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import AsyncGenerator  # Type hint for async generators

# Third-party imports - SQLAlchemy async components
from sqlalchemy.ext.asyncio import (
    AsyncSession,        # Async session class
    AsyncEngine,         # Async engine class
    create_async_engine, # Factory to create async engines
    async_sessionmaker,  # Factory to create session factories
)
from sqlalchemy.pool import NullPool  # For serverless environments
from sqlalchemy import text  # For raw SQL queries

# Local imports
from app.config import settings  # Application configuration
from app.core.logging_config import get_logger  # Logging

# =============================================================================
# LOGGING
# =============================================================================
# Get a logger for this module
logger = get_logger(__name__)


# =============================================================================
# DATABASE ENGINE
# =============================================================================
# The engine is created lazily and stored in this module-level variable
# It's initialized by init_db() during application startup
_engine: AsyncEngine | None = None

# Session factory is also created lazily
_async_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """
    Get or create the async database engine.
    
    This function implements lazy initialization of the database engine.
    The engine is created on first call and reused for subsequent calls.
    
    The engine is configured with:
        - Async PostgreSQL driver (asyncpg)
        - Connection pooling based on settings
        - Echo mode for SQL logging (development only)
    
    Returns:
        AsyncEngine: The SQLAlchemy async engine
        
    Raises:
        RuntimeError: If engine creation fails
        
    Note:
        The engine manages a connection pool. For serverless environments
        (like Vercel), consider using NullPool to avoid connection issues.
    """
    global _engine
    
    # Return existing engine if already created
    if _engine is not None:
        return _engine
    
    # Log engine creation
    logger.info(
        "Creating database engine",
        extra={
            "pool_size": settings.DATABASE_POOL_SIZE,
            "max_overflow": settings.DATABASE_MAX_OVERFLOW,
        }
    )
    
    # Create the async engine
    # Note: We use the async database URL which has postgresql+asyncpg://
    _engine = create_async_engine(
        # Connection URL with asyncpg driver
        settings.async_database_url,
        
        # Connection pool configuration
        # pool_size: Number of persistent connections to maintain
        pool_size=settings.DATABASE_POOL_SIZE,
        
        # max_overflow: Additional connections allowed beyond pool_size
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        
        # pool_pre_ping: Test connections before using them
        # This prevents errors from stale connections
        pool_pre_ping=True,
        
        # pool_recycle: Recycle connections after this many seconds
        # Prevents issues with connection timeouts (e.g., Supabase's idle timeout)
        pool_recycle=300,  # 5 minutes
        
        # echo: Log all SQL statements (only in development)
        echo=settings.DATABASE_ECHO,
        
        # future: Use SQLAlchemy 2.0 style
        future=True,
    )
    
    logger.info("Database engine created successfully")
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """
    Get or create the async session factory.
    
    The session factory is used to create new database sessions.
    Each session represents a "workspace" for database operations
    and manages transactions.
    
    Returns:
        async_sessionmaker: Factory for creating AsyncSession instances
        
    Session Configuration:
        - autocommit=False: Explicit commit required
        - autoflush=False: Manual flush control
        - expire_on_commit=False: Objects remain usable after commit
    """
    global _async_session_factory
    
    # Return existing factory if already created
    if _async_session_factory is not None:
        return _async_session_factory
    
    # Create session factory bound to the engine
    _async_session_factory = async_sessionmaker(
        # Bind to the database engine
        bind=get_engine(),
        
        # Session class to use
        class_=AsyncSession,
        
        # Don't auto-commit after each statement
        # We want explicit transaction control
        autocommit=False,
        
        # Don't auto-flush pending changes
        # We want explicit control over when SQL is executed
        autoflush=False,
        
        # Keep objects usable after commit
        # Without this, accessing object attributes after commit fails
        expire_on_commit=False,
    )
    
    logger.debug("Session factory created")
    return _async_session_factory


# =============================================================================
# DATABASE LIFECYCLE
# =============================================================================
async def init_db() -> None:
    """
    Initialize the database connection.
    
    This function should be called during application startup.
    It creates the engine, session factory, and verifies connectivity.
    
    The function:
        1. Creates the database engine
        2. Creates the session factory
        3. Tests the connection with a simple query
    
    Raises:
        Exception: If database connection fails
        
    Example:
        Called in app/main.py lifespan context manager:
        ```python
        async with lifespan(app):
            await init_db()
            yield
        ```
    """
    logger.info("Initializing database connection...")
    
    try:
        # Create engine and session factory
        engine = get_engine()
        get_session_factory()
        
        # Test the connection
        async with engine.begin() as conn:
            # Execute a simple query to verify connectivity
            result = await conn.execute(text("SELECT 1"))
            result.fetchone()
        
        logger.info("Database connection verified successfully")
        
    except Exception as e:
        logger.error(
            f"Failed to initialize database: {e}",
            extra={"error_type": type(e).__name__}
        )
        raise


async def close_db() -> None:
    """
    Close the database connection.
    
    This function should be called during application shutdown.
    It properly disposes of the engine and closes all connections.
    
    The function:
        1. Disposes of the engine (closes all connections)
        2. Resets module-level variables
    
    Example:
        Called in app/main.py lifespan context manager:
        ```python
        async with lifespan(app):
            yield
            await close_db()
        ```
    """
    global _engine, _async_session_factory
    
    logger.info("Closing database connections...")
    
    if _engine is not None:
        # Dispose closes all connections in the pool
        await _engine.dispose()
        _engine = None
        _async_session_factory = None
        logger.info("Database connections closed")


# =============================================================================
# DEPENDENCY INJECTION
# =============================================================================
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    
    This is the primary way to get a database session in route handlers.
    It creates a new session for each request and ensures proper cleanup.
    
    The session is automatically closed when the request completes,
    even if an exception occurs.
    
    Yields:
        AsyncSession: A database session for the request
        
    Example:
        ```python
        from fastapi import Depends
        from sqlalchemy.ext.asyncio import AsyncSession
        from app.core.database import get_db
        
        @router.get("/venues")
        async def list_venues(db: AsyncSession = Depends(get_db)):
            # Use the session
            result = await db.execute(select(Venue))
            return result.scalars().all()
        ```
        
    Transaction Handling:
        - By default, changes are not committed automatically
        - Call `await db.commit()` to persist changes
        - Call `await db.rollback()` to discard changes
        - The session is rolled back on exceptions
    """
    # Get the session factory
    session_factory = get_session_factory()
    
    # Create a new session
    async with session_factory() as session:
        try:
            # Yield the session to the route handler
            yield session
            
        except Exception as e:
            # Rollback on any exception
            await session.rollback()
            logger.error(f"Database session error, rolling back: {e}")
            raise
            
        finally:
            # Session is automatically closed by the context manager
            pass


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================
async def check_db_connection() -> bool:
    """
    Check if the database connection is healthy.
    
    This function performs a simple query to verify database connectivity.
    It's useful for health check endpoints.
    
    Returns:
        bool: True if connection is healthy, False otherwise
        
    Example:
        ```python
        @router.get("/health")
        async def health_check():
            db_healthy = await check_db_connection()
            return {"database": "healthy" if db_healthy else "unhealthy"}
        ```
    """
    try:
        engine = get_engine()
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False


# =============================================================================
# ENGINE REFERENCE FOR ALEMBIC
# =============================================================================
# Alembic needs a reference to create the engine
# This is used in alembic/env.py
engine = property(get_engine)
