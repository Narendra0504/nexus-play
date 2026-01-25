# =============================================================================
# NEXUS FAMILY PASS - VENUE SCHEMAS
# =============================================================================
"""
Venue Pydantic Schemas Module.

This module contains all Pydantic schemas for venue-related operations,
including creation, updates, and API responses.
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime  # Timestamp handling
from typing import Any, Dict, List, Optional  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from pydantic import BaseModel, Field, field_validator  # Pydantic v2

# Local imports
from app.schemas.common import BaseSchema, TimestampMixin


# =============================================================================
# BASE VENUE SCHEMA
# =============================================================================
class VenueBase(BaseSchema):
    """
    Base schema for venue data.
    
    Contains common fields used across create, update, and response schemas.
    """
    
    # Core information
    name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Venue name",
    )
    
    short_description: Optional[str] = Field(
        None,
        max_length=150,
        description="Brief description (150 chars max)",
    )
    
    full_description: Optional[str] = Field(
        None,
        description="Full venue description",
    )
    
    primary_category: Optional[str] = Field(
        None,
        description="Primary activity category",
    )
    
    # Location
    address_line1: Optional[str] = Field(
        None,
        max_length=255,
        description="Street address",
    )
    
    city: Optional[str] = Field(
        None,
        max_length=100,
        description="City name",
    )
    
    state: Optional[str] = Field(
        None,
        max_length=100,
        description="State/province",
    )
    
    postal_code: Optional[str] = Field(
        None,
        max_length=20,
        description="Postal code",
    )
    
    country: str = Field(
        default="India",
        max_length=100,
        description="Country",
    )
    
    latitude: Optional[float] = Field(
        None,
        ge=-90,
        le=90,
        description="Geographic latitude",
    )
    
    longitude: Optional[float] = Field(
        None,
        ge=-180,
        le=180,
        description="Geographic longitude",
    )
    
    # Contact
    contact_phone: Optional[str] = Field(
        None,
        max_length=50,
        description="Contact phone number",
    )
    
    website_url: Optional[str] = Field(
        None,
        max_length=500,
        description="Website URL",
    )


# =============================================================================
# CREATE SCHEMA
# =============================================================================
class VenueCreate(VenueBase):
    """
    Schema for creating a new venue.
    
    Used when manually adding venues (not via Google Places).
    """
    
    # Google Place ID if importing from Google
    google_place_id: Optional[str] = Field(
        None,
        description="Google Places ID",
    )
    
    # Data source
    data_source: str = Field(
        default="manual",
        description="Data source: google_places, manual",
    )


# =============================================================================
# UPDATE SCHEMA
# =============================================================================
class VenueUpdate(BaseSchema):
    """
    Schema for updating an existing venue.
    
    All fields are optional since partial updates are allowed.
    """
    
    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=255,
    )
    
    short_description: Optional[str] = Field(
        None,
        max_length=150,
    )
    
    full_description: Optional[str] = None
    primary_category: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    contact_phone: Optional[str] = None
    website_url: Optional[str] = None
    is_active: Optional[bool] = None


# =============================================================================
# RESPONSE SCHEMAS
# =============================================================================
class VenueResponse(VenueBase, TimestampMixin):
    """
    Schema for venue API response.
    
    Includes all venue data plus computed fields.
    """
    
    # Primary key
    id: UUID = Field(..., description="Venue ID")
    
    # Slug for URLs
    slug: str = Field(..., description="URL-friendly identifier")
    
    # Data source info
    google_place_id: Optional[str] = Field(
        None,
        description="Google Places ID",
    )
    
    data_source: str = Field(
        ...,
        description="Data source",
    )
    
    # Status
    is_active: bool = Field(
        ...,
        description="Whether venue is active",
    )
    
    # Ratings
    google_rating: Optional[float] = Field(
        None,
        description="Google rating (1-5)",
    )
    
    google_review_count: int = Field(
        default=0,
        description="Number of Google reviews",
    )
    
    # Photos
    photos_urls: List[str] = Field(
        default_factory=list,
        description="Photo URLs",
    )
    
    # Business hours
    business_hours: Dict[str, Any] = Field(
        default_factory=dict,
        description="Business hours by day",
    )
    
    # Computed fields
    full_address: Optional[str] = Field(
        None,
        description="Full formatted address",
    )
    
    has_quality_scores: bool = Field(
        default=False,
        description="Whether AI quality scores exist",
    )


class VenueListResponse(BaseSchema):
    """
    Schema for venue list response.
    
    Simplified venue data for list views.
    """
    
    id: UUID
    name: str
    slug: str
    short_description: Optional[str] = None
    city: Optional[str] = None
    primary_category: Optional[str] = None
    google_rating: Optional[float] = None
    google_review_count: int = 0
    primary_photo_url: Optional[str] = None
    is_active: bool = True


class VenueDetailResponse(VenueResponse):
    """
    Schema for detailed venue response.
    
    Includes all venue data plus related data.
    """
    
    # Include activities count
    activities_count: int = Field(
        default=0,
        description="Number of activities at this venue",
    )
    
    # Include quality scores if available
    quality_scores: Optional[Dict[str, float]] = Field(
        None,
        description="AI quality scores",
    )
    
    # Include mock pricing if available
    pricing: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Mock pricing data",
    )


# =============================================================================
# SEARCH SCHEMAS
# =============================================================================
class VenueSearchParams(BaseSchema):
    """
    Schema for venue search parameters.
    
    Used for filtering and searching venues.
    """
    
    # Text search
    query: Optional[str] = Field(
        None,
        max_length=200,
        description="Search query",
    )
    
    # Location filter
    city: Optional[str] = Field(
        None,
        description="Filter by city",
    )
    
    # Category filter
    category: Optional[str] = Field(
        None,
        description="Filter by category",
    )
    
    # Rating filter
    min_rating: Optional[float] = Field(
        None,
        ge=1,
        le=5,
        description="Minimum Google rating",
    )
    
    # Coordinates for distance search
    latitude: Optional[float] = Field(
        None,
        ge=-90,
        le=90,
    )
    
    longitude: Optional[float] = Field(
        None,
        ge=-180,
        le=180,
    )
    
    # Distance radius in km
    radius_km: Optional[float] = Field(
        None,
        ge=1,
        le=50,
        description="Search radius in km",
    )
    
    # Only active venues
    active_only: bool = Field(
        default=True,
        description="Only return active venues",
    )
    
    # Sort options
    sort_by: str = Field(
        default="name",
        description="Sort by: name, rating, distance, created_at",
    )
    
    sort_order: str = Field(
        default="asc",
        description="Sort order: asc, desc",
    )
    
    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v: str) -> str:
        """Validate sort_by field."""
        allowed = ["name", "rating", "distance", "created_at", "google_rating"]
        if v not in allowed:
            raise ValueError(f"sort_by must be one of: {', '.join(allowed)}")
        return v
    
    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v: str) -> str:
        """Validate sort_order field."""
        if v.lower() not in ["asc", "desc"]:
            raise ValueError("sort_order must be 'asc' or 'desc'")
        return v.lower()


# =============================================================================
# GOOGLE PLACES IMPORT SCHEMA
# =============================================================================
class GooglePlacesImportRequest(BaseSchema):
    """
    Schema for importing venues from Google Places.
    
    Used by the ingestion script/endpoint.
    """
    
    # Search query
    query: str = Field(
        ...,
        min_length=3,
        description="Search query (e.g., 'swimming pools in Bangalore')",
    )
    
    # Location center
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Center latitude",
    )
    
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Center longitude",
    )
    
    # Search radius in meters
    radius_meters: int = Field(
        default=10000,
        ge=100,
        le=50000,
        description="Search radius in meters",
    )
    
    # Maximum results
    max_results: int = Field(
        default=20,
        ge=1,
        le=60,
        description="Maximum venues to import",
    )


class GooglePlacesImportResponse(BaseSchema):
    """
    Schema for Google Places import response.
    """
    
    imported_count: int = Field(
        ...,
        description="Number of venues imported",
    )
    
    skipped_count: int = Field(
        default=0,
        description="Number of venues skipped (already exist)",
    )
    
    error_count: int = Field(
        default=0,
        description="Number of errors",
    )
    
    venue_ids: List[UUID] = Field(
        default_factory=list,
        description="IDs of imported venues",
    )
