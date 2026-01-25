# =============================================================================
# NEXUS FAMILY PASS - PYTEST CONFIGURATION
# =============================================================================
"""
Pytest Configuration and Fixtures.

This module provides shared fixtures and configuration for all tests.
Fixtures defined here are automatically available to all test modules.

Key Fixtures:
    - async_client: Async HTTP client for API testing
    - db_session: Database session with transaction rollback
    - test_venue: Sample venue for testing
    - test_activity: Sample activity for testing
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library
import asyncio
from typing import AsyncGenerator, Generator

# Third-party
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

# Local
from app.main import app
from app.models.base import Base
from app.core.database import get_db
from app.config import settings


# =============================================================================
# ASYNC EVENT LOOP CONFIGURATION
# =============================================================================
@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """
    Create an event loop for the test session.
    
    This fixture ensures all async tests share the same event loop.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# =============================================================================
# DATABASE FIXTURES
# =============================================================================
# Test database URL (use a separate test database)
TEST_DATABASE_URL = settings.DATABASE_URL.replace(
    "/nexus_family_pass",
    "/nexus_family_pass_test"
)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a database session for testing with transaction rollback.
    
    Each test gets a fresh session that rolls back after the test,
    ensuring test isolation.
    
    Yields:
        AsyncSession: Database session for the test
    """
    # Create test engine
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=NullPool,  # Don't pool connections in tests
    )
    
    # Create session factory
    async_session = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    async with async_session() as session:
        yield session
        # Rollback after test
        await session.rollback()
    
    async with engine.begin() as conn:
        # Drop all tables after test
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


# =============================================================================
# HTTP CLIENT FIXTURES
# =============================================================================
@pytest_asyncio.fixture(scope="function")
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an async HTTP client for API testing.
    
    The client is configured to use the test database session.
    
    Args:
        db_session: Database session fixture
    
    Yields:
        AsyncClient: HTTP client for API requests
    """
    
    # Override database dependency
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
    
    # Clear overrides
    app.dependency_overrides.clear()


# =============================================================================
# SAMPLE DATA FIXTURES
# =============================================================================
@pytest.fixture
def sample_venue_data() -> dict:
    """
    Sample venue data for testing.
    
    Returns:
        dict: Venue data dictionary
    """
    return {
        "name": "Test Swimming Academy",
        "slug": "test-swimming-academy",
        "short_description": "A test venue for swimming lessons",
        "city": "Bangalore",
        "state": "Karnataka",
        "country": "India",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "google_rating": 4.5,
        "google_review_count": 100,
        "is_active": True,
        "data_source": "test",
    }


@pytest.fixture
def sample_activity_data() -> dict:
    """
    Sample activity data for testing.
    
    Returns:
        dict: Activity data dictionary
    """
    return {
        "name": "Swimming Lessons",
        "slug": "swimming-lessons",
        "category": "sports",
        "short_description": "Learn to swim with expert instructors",
        "min_age": 5,
        "max_age": 15,
        "duration_minutes": 60,
        "credits_required": 2,
        "is_active": True,
    }


@pytest.fixture
def sample_vendor_credentials() -> dict:
    """
    Sample vendor credentials for testing.
    
    Returns:
        dict: Vendor credentials dictionary
    """
    return {
        "email": "test.vendor@example.com",
        "password": "TestPassword123!",
        "name": "Test Vendor",
    }


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
def assert_response_ok(response):
    """Assert that response status code is 2xx."""
    assert 200 <= response.status_code < 300, (
        f"Expected 2xx, got {response.status_code}: {response.text}"
    )


def assert_response_error(response, expected_status: int):
    """Assert that response has expected error status."""
    assert response.status_code == expected_status, (
        f"Expected {expected_status}, got {response.status_code}: {response.text}"
    )
