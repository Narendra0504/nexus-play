# =============================================================================
# NEXUS FAMILY PASS - API V1 ROUTER
# =============================================================================
"""
API Version 1 Main Router Module.

This module combines all v1 endpoint routers into a single router
that can be included in the main FastAPI application.

The router is configured with tags for OpenAPI documentation and
prefixes for URL organization.
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Third-party imports
from fastapi import APIRouter  # Router class

# Local imports - endpoint routers
from app.api.v1.endpoints import (
    health,
    venues,
    activities,
    vendors,
    webhooks,
)

# =============================================================================
# MAIN API ROUTER
# =============================================================================
# Create the main v1 router
# This router will be included in the main application with prefix /api/v1
api_router = APIRouter()

# =============================================================================
# INCLUDE ENDPOINT ROUTERS
# =============================================================================
# Each endpoint module has its own router which is included here
# with appropriate prefixes and tags for organization

# Health check endpoints
# Prefix: /health
# Used for: Connectivity testing, load balancer health checks
api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"],
)

# Venue endpoints
# Prefix: /venues
# Used for: Venue discovery, search, details, quality scores
api_router.include_router(
    venues.router,
    prefix="/venues",
    tags=["venues"],
)

# Activity endpoints
# Prefix: /activities
# Used for: Activity listings, filtering, details, sessions
api_router.include_router(
    activities.router,
    prefix="/activities",
    tags=["activities"],
)

# Vendor portal endpoints
# Prefix: /vendors
# Used for: Vendor authentication, profile, venue management
api_router.include_router(
    vendors.router,
    prefix="/vendors",
    tags=["vendors"],
)

# N8N Webhook endpoints
# Prefix: /webhooks
# Used for: N8N workflow automation, batch jobs, async processing
api_router.include_router(
    webhooks.router,
    tags=["webhooks"],
)
