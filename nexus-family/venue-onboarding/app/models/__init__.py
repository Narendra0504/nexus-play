# =============================================================================
# NEXUS FAMILY PASS - DATABASE MODELS PACKAGE
# =============================================================================
"""
SQLAlchemy ORM Models Package.

This package contains all SQLAlchemy model definitions for the application.
Models represent database tables and provide an object-oriented interface
for database operations.

Models Included:
    - Base: Abstract base class for all models
    - Venue: Activity venues discovered from Google Places
    - Activity: Activities offered at venues
    - VendorCredential: Vendor login credentials (Phase 1)
    - GoogleReview: Raw reviews from Google Places
    - VenueQualityScore: AI-extracted quality scores
    - VenueMockPricing: Mock pricing for Phase 1

Relationships:
    ```
    Venue (1) ──────┬───── (N) Activity
                    │
                    ├───── (N) GoogleReview
                    │
                    ├───── (1) VenueQualityScore
                    │
                    ├───── (N) VenueMockPricing
                    │
                    └───── (1) VendorCredential
    ```

Usage:
    ```python
    from app.models import Venue, Activity, VendorCredential
    
    # Query venues
    result = await db.execute(select(Venue).where(Venue.is_active == True))
    venues = result.scalars().all()
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Import all models for convenient access
from app.models.base import Base, TimestampMixin, UUIDMixin
from app.models.venue import Venue
from app.models.activity import Activity, ActivitySession
from app.models.vendor import VendorCredential
from app.models.review import GoogleReview
from app.models.quality_score import VenueQualityScore, VenueMockPricing

# =============================================================================
# EXPORTS
# =============================================================================
# Define what is available when someone does `from app.models import *`
__all__ = [
    # Base classes
    "Base",
    "TimestampMixin",
    "UUIDMixin",
    
    # Core models
    "Venue",
    "Activity",
    "ActivitySession",
    "VendorCredential",
    "GoogleReview",
    "VenueQualityScore",
    "VenueMockPricing",
]
