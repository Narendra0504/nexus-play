# =============================================================================
# NEXUS FAMILY PASS - GOOGLE PLACES API MODELS
# =============================================================================
"""
Google Places API Response Models.

This module defines Pydantic models for parsing Google Places API (New)
responses. These models ensure type safety and validation when
processing API data.

Models match the Google Places API (New) response format:
https://developers.google.com/maps/documentation/places/web-service/reference

Note: Only fields used by Nexus are defined; unused fields are ignored.
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import Optional, List, Dict, Any  # Type hints
from datetime import datetime  # Timestamps

# Third-party imports
from pydantic import BaseModel, Field, field_validator  # Pydantic


# =============================================================================
# LOCATION MODELS
# =============================================================================
class LatLng(BaseModel):
    """
    Geographic coordinates model.
    
    Represents a point on Earth with latitude and longitude.
    """
    
    # Latitude in degrees (-90 to 90)
    latitude: float = Field(
        ...,
        ge=-90,
        le=90,
        description="Latitude in degrees",
    )
    
    # Longitude in degrees (-180 to 180)
    longitude: float = Field(
        ...,
        ge=-180,
        le=180,
        description="Longitude in degrees",
    )


class Viewport(BaseModel):
    """
    Viewport model defining a rectangular area.
    
    Used for map display boundaries.
    """
    
    # Northeast corner of the viewport
    high: LatLng = Field(
        ...,
        description="Northeast corner",
    )
    
    # Southwest corner of the viewport
    low: LatLng = Field(
        ...,
        description="Southwest corner",
    )


# =============================================================================
# ADDRESS MODELS
# =============================================================================
class AddressComponent(BaseModel):
    """
    Address component from Google Places.
    
    Represents a single component of an address (city, state, etc.).
    """
    
    # Long form of the component (e.g., "Karnataka")
    longText: Optional[str] = Field(
        default=None,
        alias="longText",
        description="Long form of the component",
    )
    
    # Short form of the component (e.g., "KA")
    shortText: Optional[str] = Field(
        default=None,
        alias="shortText",
        description="Short form of the component",
    )
    
    # Component types (e.g., ["administrative_area_level_1"])
    types: List[str] = Field(
        default_factory=list,
        description="Types of this component",
    )


# =============================================================================
# OPERATING HOURS MODELS
# =============================================================================
class OpeningHoursPeriod(BaseModel):
    """
    A single opening period (open to close).
    """
    
    # Day of week (0=Sunday, 6=Saturday)
    day: int = Field(
        ...,
        ge=0,
        le=6,
        description="Day of week",
    )
    
    # Opening hour (0-23)
    hour: int = Field(
        ...,
        ge=0,
        le=23,
        description="Opening hour",
    )
    
    # Opening minute (0-59)
    minute: int = Field(
        default=0,
        ge=0,
        le=59,
        description="Opening minute",
    )


class OpeningHours(BaseModel):
    """
    Operating hours for a place.
    """
    
    # Whether the place is currently open
    openNow: Optional[bool] = Field(
        default=None,
        alias="openNow",
        description="Whether currently open",
    )
    
    # Weekly schedule text
    weekdayDescriptions: Optional[List[str]] = Field(
        default=None,
        alias="weekdayDescriptions",
        description="Text descriptions for each day",
    )


# =============================================================================
# REVIEW MODEL
# =============================================================================
class AuthorAttribution(BaseModel):
    """
    Review author information.
    """
    
    # Author's display name
    displayName: Optional[str] = Field(
        default=None,
        alias="displayName",
        description="Author's display name",
    )
    
    # Author's profile photo URI
    photoUri: Optional[str] = Field(
        default=None,
        alias="photoUri",
        description="Author's profile photo",
    )


class PlaceReview(BaseModel):
    """
    A review for a place from Google Places.
    
    Contains the review text, rating, author info, and timestamp.
    """
    
    # Review name/ID from Google
    name: Optional[str] = Field(
        default=None,
        description="Review identifier",
    )
    
    # Rating (1-5 stars)
    rating: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Star rating (1-5)",
    )
    
    # Review text content
    text: Optional[Dict[str, str]] = Field(
        default=None,
        description="Review text with language code",
    )
    
    # Original review text (preferred)
    originalText: Optional[Dict[str, str]] = Field(
        default=None,
        alias="originalText",
        description="Original review text",
    )
    
    # Relative time description (e.g., "2 weeks ago")
    relativePublishTimeDescription: Optional[str] = Field(
        default=None,
        alias="relativePublishTimeDescription",
        description="Relative time description",
    )
    
    # Publish timestamp
    publishTime: Optional[str] = Field(
        default=None,
        alias="publishTime",
        description="ISO timestamp of review",
    )
    
    # Author information
    authorAttribution: Optional[AuthorAttribution] = Field(
        default=None,
        alias="authorAttribution",
        description="Author information",
    )
    
    @property
    def review_text(self) -> Optional[str]:
        """
        Get the review text, preferring original.
        
        Returns:
            str or None: The review text content
        """
        # Prefer original text
        if self.originalText and "text" in self.originalText:
            return self.originalText["text"]
        
        # Fall back to translated text
        if self.text and "text" in self.text:
            return self.text["text"]
        
        return None
    
    @property
    def author_name(self) -> Optional[str]:
        """
        Get the author's display name.
        
        Returns:
            str or None: Author's name
        """
        if self.authorAttribution:
            return self.authorAttribution.displayName
        return None


# =============================================================================
# PHOTO MODEL
# =============================================================================
class PlacePhoto(BaseModel):
    """
    A photo associated with a place.
    
    Contains the photo reference for building URLs.
    """
    
    # Photo resource name (used to fetch photo)
    name: str = Field(
        ...,
        description="Photo resource name",
    )
    
    # Photo width in pixels
    widthPx: Optional[int] = Field(
        default=None,
        alias="widthPx",
        description="Photo width",
    )
    
    # Photo height in pixels
    heightPx: Optional[int] = Field(
        default=None,
        alias="heightPx",
        description="Photo height",
    )
    
    # Photo attributions
    authorAttributions: Optional[List[AuthorAttribution]] = Field(
        default=None,
        alias="authorAttributions",
        description="Photo attributions",
    )
    
    def get_url(self, api_key: str, max_width: int = 800) -> str:
        """
        Generate the photo URL.
        
        Args:
            api_key: Google API key
            max_width: Maximum width in pixels
        
        Returns:
            str: Photo URL
        """
        # Google Places API (New) photo URL format
        return (
            f"https://places.googleapis.com/v1/{self.name}/media"
            f"?maxWidthPx={max_width}&key={api_key}"
        )


# =============================================================================
# PLACE MODELS
# =============================================================================
class PlaceSearchResult(BaseModel):
    """
    A place from search results (minimal data).
    
    Contains basic information returned by Text Search.
    """
    
    # Place resource name (unique identifier)
    name: str = Field(
        ...,
        description="Place resource name",
    )
    
    # Place ID for further lookups
    id: str = Field(
        ...,
        description="Place ID",
    )
    
    # Display name
    displayName: Optional[Dict[str, str]] = Field(
        default=None,
        alias="displayName",
        description="Display name with language",
    )
    
    # Formatted address
    formattedAddress: Optional[str] = Field(
        default=None,
        alias="formattedAddress",
        description="Full formatted address",
    )
    
    # Location coordinates
    location: Optional[LatLng] = Field(
        default=None,
        description="Geographic coordinates",
    )
    
    # Place types
    types: List[str] = Field(
        default_factory=list,
        description="Place types",
    )
    
    # Rating
    rating: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Average rating",
    )
    
    # Number of reviews
    userRatingCount: Optional[int] = Field(
        default=None,
        alias="userRatingCount",
        ge=0,
        description="Number of user ratings",
    )
    
    @property
    def display_name(self) -> Optional[str]:
        """
        Get the display name text.
        
        Returns:
            str or None: Place name
        """
        if self.displayName and "text" in self.displayName:
            return self.displayName["text"]
        return None


class PlaceDetails(PlaceSearchResult):
    """
    Full place details from Place Details API.
    
    Extends PlaceSearchResult with additional fields.
    """
    
    # Short formatted address
    shortFormattedAddress: Optional[str] = Field(
        default=None,
        alias="shortFormattedAddress",
        description="Short address",
    )
    
    # Address components
    addressComponents: Optional[List[AddressComponent]] = Field(
        default=None,
        alias="addressComponents",
        description="Address components",
    )
    
    # Phone number
    nationalPhoneNumber: Optional[str] = Field(
        default=None,
        alias="nationalPhoneNumber",
        description="National format phone",
    )
    
    internationalPhoneNumber: Optional[str] = Field(
        default=None,
        alias="internationalPhoneNumber",
        description="International format phone",
    )
    
    # Website
    websiteUri: Optional[str] = Field(
        default=None,
        alias="websiteUri",
        description="Website URL",
    )
    
    # Operating hours
    regularOpeningHours: Optional[OpeningHours] = Field(
        default=None,
        alias="regularOpeningHours",
        description="Regular operating hours",
    )
    
    # Current opening hours (may differ on holidays)
    currentOpeningHours: Optional[OpeningHours] = Field(
        default=None,
        alias="currentOpeningHours",
        description="Current operating hours",
    )
    
    # Reviews
    reviews: Optional[List[PlaceReview]] = Field(
        default=None,
        description="Place reviews",
    )
    
    # Photos
    photos: Optional[List[PlacePhoto]] = Field(
        default=None,
        description="Place photos",
    )
    
    # Editorial summary
    editorialSummary: Optional[Dict[str, str]] = Field(
        default=None,
        alias="editorialSummary",
        description="Editorial summary",
    )
    
    # Viewport for map display
    viewport: Optional[Viewport] = Field(
        default=None,
        description="Map viewport",
    )
    
    # Business status
    businessStatus: Optional[str] = Field(
        default=None,
        alias="businessStatus",
        description="Business status",
    )
    
    # Price level (0-4)
    priceLevel: Optional[str] = Field(
        default=None,
        alias="priceLevel",
        description="Price level",
    )
    
    @property
    def editorial_summary_text(self) -> Optional[str]:
        """
        Get editorial summary text.
        
        Returns:
            str or None: Summary text
        """
        if self.editorialSummary and "text" in self.editorialSummary:
            return self.editorialSummary["text"]
        return None
    
    def get_address_component(self, component_type: str) -> Optional[str]:
        """
        Get a specific address component.
        
        Args:
            component_type: Type of component (e.g., "locality", "administrative_area_level_1")
        
        Returns:
            str or None: Component long text
        """
        if not self.addressComponents:
            return None
        
        for component in self.addressComponents:
            if component_type in component.types:
                return component.longText
        
        return None
    
    @property
    def city(self) -> Optional[str]:
        """Get the city from address components."""
        return self.get_address_component("locality")
    
    @property
    def state(self) -> Optional[str]:
        """Get the state from address components."""
        return self.get_address_component("administrative_area_level_1")
    
    @property
    def postal_code(self) -> Optional[str]:
        """Get the postal code from address components."""
        return self.get_address_component("postal_code")
    
    @property
    def country(self) -> Optional[str]:
        """Get the country from address components."""
        return self.get_address_component("country")


# =============================================================================
# API RESPONSE MODELS
# =============================================================================
class TextSearchResponse(BaseModel):
    """
    Response from Text Search API.
    """
    
    # List of places
    places: List[PlaceSearchResult] = Field(
        default_factory=list,
        description="Search results",
    )
    
    # Next page token for pagination
    nextPageToken: Optional[str] = Field(
        default=None,
        alias="nextPageToken",
        description="Pagination token",
    )
