# =============================================================================
# NEXUS FAMILY PASS - GOOGLE PLACES INTEGRATION PACKAGE
# =============================================================================
"""
Google Places API Integration Package.

This package provides integration with Google Places API (New) for:
    - Venue discovery and search
    - Place details retrieval
    - Reviews extraction
    - Photos URL generation

Components:
    - client: GooglePlacesClient for API communication
    - models: Pydantic models for API responses
    - mapper: Maps API responses to internal models

Rate Limits (Free Tier):
    - Text Search: $32/1000 requests
    - Place Details: $17/1000 requests
    - Photos: $7/1000 requests

Usage:
    ```python
    from app.integrations.google_places import GooglePlacesClient
    
    client = GooglePlacesClient()
    venues = await client.search_nearby(
        location="Bangalore, India",
        type="gym"
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
from app.integrations.google_places.client import GooglePlacesClient
from app.integrations.google_places.models import (
    PlaceSearchResult,
    PlaceDetails,
    PlaceReview,
    PlacePhoto,
)
from app.integrations.google_places.mapper import PlaceToVenueMapper

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = [
    "GooglePlacesClient",
    "PlaceSearchResult",
    "PlaceDetails",
    "PlaceReview",
    "PlacePhoto",
    "PlaceToVenueMapper",
]
