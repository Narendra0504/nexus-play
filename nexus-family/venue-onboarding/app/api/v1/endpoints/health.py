# =============================================================================
# NEXUS FAMILY PASS - HEALTH CHECK ENDPOINTS
# =============================================================================
"""
Health Check Endpoints Module.

This module provides health check and system status endpoints.
These endpoints are used for:
    - Load balancer health checks
    - Kubernetes liveness/readiness probes
    - Monitoring and alerting
    - Basic connectivity testing
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime  # Timestamp

# Third-party imports
from fastapi import APIRouter, Depends  # Router and dependencies

# Local imports
from app import __version__  # Application version
from app.config import settings  # Configuration
from app.core.database import check_db_connection  # Database health
from app.schemas.common import HealthResponse  # Response schema

# =============================================================================
# ROUTER
# =============================================================================
# Create the router for health endpoints
router = APIRouter()


# =============================================================================
# ENDPOINTS
# =============================================================================
@router.get(
    "",
    response_model=HealthResponse,
    summary="Health Check",
    description="Basic health check endpoint that verifies the API is running.",
)
async def health_check() -> HealthResponse:
    """
    Basic health check endpoint.
    
    Returns a simple response indicating the API is running.
    This endpoint is fast and doesn't check external dependencies.
    
    Returns:
        HealthResponse: Basic health status
    
    Example Response:
        ```json
        {
            "status": "healthy",
            "version": "0.1.0",
            "timestamp": "2024-01-15T10:30:00Z"
        }
        ```
    """
    return HealthResponse(
        status="healthy",
        version=__version__,
        timestamp=datetime.utcnow(),
    )


@router.get(
    "/detailed",
    response_model=HealthResponse,
    summary="Detailed Health Check",
    description="Detailed health check that verifies database connectivity.",
)
async def detailed_health_check() -> HealthResponse:
    """
    Detailed health check with dependency verification.
    
    This endpoint checks:
        - API is running
        - Database is connected and responding
    
    Use this for comprehensive health monitoring.
    Note: This endpoint is slower than the basic health check.
    
    Returns:
        HealthResponse: Detailed health status with dependency info
    
    Example Response:
        ```json
        {
            "status": "healthy",
            "version": "0.1.0",
            "timestamp": "2024-01-15T10:30:00Z",
            "details": {
                "database": "healthy",
                "environment": "development"
            }
        }
        ```
    """
    # Check database connectivity
    db_healthy = await check_db_connection()
    
    # Determine overall status
    # Status is "healthy" only if all dependencies are healthy
    overall_status = "healthy" if db_healthy else "degraded"
    
    return HealthResponse(
        status=overall_status,
        version=__version__,
        timestamp=datetime.utcnow(),
        details={
            "database": "healthy" if db_healthy else "unhealthy",
            "environment": settings.APP_ENV,
        }
    )


@router.get(
    "/ready",
    response_model=HealthResponse,
    summary="Readiness Check",
    description="Kubernetes readiness probe endpoint.",
)
async def readiness_check() -> HealthResponse:
    """
    Readiness check for Kubernetes.
    
    This endpoint indicates whether the service is ready to accept traffic.
    It checks that all required dependencies are available.
    
    Returns:
        HealthResponse: Readiness status
    
    Note:
        Kubernetes uses this to determine if the pod should receive traffic.
        If this returns an error status, traffic will be routed elsewhere.
    """
    # Check database
    db_healthy = await check_db_connection()
    
    if not db_healthy:
        # Return unhealthy status (still 200, but status field indicates issue)
        return HealthResponse(
            status="not_ready",
            version=__version__,
            timestamp=datetime.utcnow(),
            details={
                "database": "unhealthy",
                "message": "Database connection failed"
            }
        )
    
    return HealthResponse(
        status="ready",
        version=__version__,
        timestamp=datetime.utcnow(),
    )


@router.get(
    "/live",
    response_model=HealthResponse,
    summary="Liveness Check",
    description="Kubernetes liveness probe endpoint.",
)
async def liveness_check() -> HealthResponse:
    """
    Liveness check for Kubernetes.
    
    This endpoint indicates whether the service is alive and should be kept running.
    It's a simple check that doesn't verify external dependencies.
    
    Returns:
        HealthResponse: Liveness status
    
    Note:
        Kubernetes uses this to determine if the pod should be restarted.
        This should be fast and always succeed if the process is healthy.
    """
    return HealthResponse(
        status="alive",
        version=__version__,
        timestamp=datetime.utcnow(),
    )
