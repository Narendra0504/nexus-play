# =============================================================================
# NEXUS FAMILY PASS - API ENDPOINTS PACKAGE
# =============================================================================
"""
API Endpoints Package.

This package contains individual endpoint modules for the API.
Each module handles a specific domain of the application.

Modules:
    - health: Health check and system status
    - venues: Venue discovery and details
    - activities: Activity listings and search
    - vendors: Vendor portal endpoints
    - webhooks: N8N workflow automation webhooks
"""

# =============================================================================
# IMPORTS
# =============================================================================
from app.api.v1.endpoints import health
from app.api.v1.endpoints import venues
from app.api.v1.endpoints import activities
from app.api.v1.endpoints import vendors
from app.api.v1.endpoints import webhooks

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = [
    "health",
    "venues",
    "activities",
    "vendors",
    "webhooks",
]
