# =============================================================================
# NEXUS FAMILY PASS - SERVICES PACKAGE
# =============================================================================
"""
Business Logic Services Package.

This package contains service classes that implement the business logic
of the application. Services act as an intermediary between API endpoints
and database models.

Architecture:
    API Endpoint → Service → Repository/Database
    
Services handle:
    - Business rule validation
    - Complex data transformations
    - Orchestration of multiple operations
    - External service integration coordination

Services Included:
    - BaseService: Abstract base class with common functionality
    - VenueService: Venue discovery and management
    - ActivityService: Activity management
    - VendorService: Vendor authentication and portal

Usage:
    ```python
    from app.services import VenueService
    
    venue_service = VenueService(db)
    venues = await venue_service.list_venues(page=1, page_size=20)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
from app.services.base import BaseService
from app.services.venue_service import VenueService
from app.services.activity_service import ActivityService
from app.services.vendor_service import VendorService

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = [
    "BaseService",
    "VenueService",
    "ActivityService",
    "VendorService",
]
