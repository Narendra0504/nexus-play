# =============================================================================
# NEXUS FAMILY PASS - API V1 PACKAGE
# =============================================================================
"""
API Version 1 Package.

This package contains all endpoints for API version 1.
All endpoints are prefixed with /api/v1/.

Endpoints:
    - /health: Health check and system status
    - /venues: Venue discovery and details
    - /activities: Activity listings and search
    - /vendors: Vendor portal authentication and management
"""

# =============================================================================
# EXPORTS
# =============================================================================
from app.api.v1.router import api_router

__all__ = ["api_router"]
