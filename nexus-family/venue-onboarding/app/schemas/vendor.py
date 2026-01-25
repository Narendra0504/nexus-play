# =============================================================================
# NEXUS FAMILY PASS - VENDOR SCHEMAS
# =============================================================================
"""
Vendor Portal Pydantic Schemas Module.

This module defines Pydantic models for the Vendor Portal functionality
including authentication, profile management, and venue access.

Phase 1 Implementation:
    - Simple email/password authentication
    - Basic vendor profile
    - View-only venue access

Phase 2 Will Add:
    - JWT-based authentication
    - Full venue management
    - Activity and session management
    - Analytics dashboard
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime  # Date/time types
from typing import Optional, List, Dict, Any  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from pydantic import BaseModel, Field, ConfigDict, EmailStr  # Pydantic


# =============================================================================
# AUTHENTICATION SCHEMAS
# =============================================================================
class VendorLoginRequest(BaseModel):
    """
    Schema for vendor login request.
    
    Used when a vendor attempts to log in to the portal.
    """
    
    # Email address
    email: EmailStr = Field(
        ...,
        description="Vendor's email address",
        examples=["vendor@swimacademy.com"],
    )
    
    # Password
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Vendor's password",
        examples=["SecurePassword123!"],
    )
    
    # Remember me flag (extends session)
    remember_me: bool = Field(
        default=False,
        description="Extend session duration",
    )


class VendorLoginResponse(BaseModel):
    """
    Schema for successful vendor login response.
    
    Returns session information and basic vendor profile.
    """
    
    # Success flag
    success: bool = Field(
        default=True,
        description="Login was successful",
    )
    
    # Session token (Phase 1: simple token, Phase 2: JWT)
    token: str = Field(
        ...,
        description="Session or JWT token",
    )
    
    # Token expiry time
    expires_at: datetime = Field(
        ...,
        description="When the token expires",
    )
    
    # Vendor ID
    vendor_id: UUID = Field(
        ...,
        description="Vendor's unique identifier",
    )
    
    # Venue ID
    venue_id: UUID = Field(
        ...,
        description="Associated venue's identifier",
    )
    
    # Vendor name
    vendor_name: Optional[str] = Field(
        default=None,
        description="Vendor's display name",
    )
    
    # Venue name
    venue_name: Optional[str] = Field(
        default=None,
        description="Associated venue's name",
    )
    
    # Message
    message: str = Field(
        default="Login successful",
        description="Response message",
    )


class VendorLogoutResponse(BaseModel):
    """
    Schema for vendor logout response.
    """
    
    success: bool = Field(
        default=True,
        description="Logout was successful",
    )
    
    message: str = Field(
        default="Logged out successfully",
        description="Response message",
    )


# =============================================================================
# PROFILE SCHEMAS
# =============================================================================
class VendorProfileBase(BaseModel):
    """
    Base schema for vendor profile with common fields.
    """
    
    # Display name
    display_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
        description="Vendor's display name",
        examples=["John Smith"],
    )
    
    # Email address
    email: EmailStr = Field(
        ...,
        description="Vendor's email address",
    )
    
    # Phone number (optional)
    phone: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Vendor's phone number",
        examples=["+91 98765 43210"],
    )


class VendorProfileResponse(VendorProfileBase):
    """
    Schema for vendor profile response.
    
    Contains full vendor profile information.
    """
    
    # Model configuration for ORM compatibility
    model_config = ConfigDict(from_attributes=True)
    
    # Vendor ID
    id: UUID = Field(
        ...,
        description="Vendor's unique identifier",
    )
    
    # Venue reference
    venue_id: UUID = Field(
        ...,
        description="Associated venue's identifier",
    )
    
    # Venue name (denormalized for convenience)
    venue_name: Optional[str] = Field(
        default=None,
        description="Associated venue's name",
    )
    
    # Account status
    is_active: bool = Field(
        default=True,
        description="Whether vendor account is active",
    )
    
    # Timestamps
    created_at: datetime = Field(
        ...,
        description="When account was created",
    )
    
    last_login_at: Optional[datetime] = Field(
        default=None,
        description="Last login timestamp",
    )


class VendorProfileUpdateRequest(BaseModel):
    """
    Schema for updating vendor profile.
    """
    
    # Display name
    display_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
        description="New display name",
    )
    
    # Phone number
    phone: Optional[str] = Field(
        default=None,
        max_length=50,
        description="New phone number",
    )


class VendorPasswordChangeRequest(BaseModel):
    """
    Schema for changing vendor password.
    """
    
    # Current password
    current_password: str = Field(
        ...,
        min_length=8,
        description="Current password for verification",
    )
    
    # New password
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="New password",
    )
    
    # Confirm new password
    confirm_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Confirm new password",
    )


# =============================================================================
# VENUE SCHEMAS FOR VENDOR PORTAL
# =============================================================================
class VendorVenueResponse(BaseModel):
    """
    Schema for venue details as seen by the vendor.
    
    Contains venue information relevant to the vendor portal.
    """
    
    # Model configuration for ORM compatibility
    model_config = ConfigDict(from_attributes=True)
    
    # Venue ID
    id: UUID = Field(
        ...,
        description="Venue's unique identifier",
    )
    
    # Venue name
    name: str = Field(
        ...,
        description="Venue's business name",
    )
    
    # URL slug
    slug: str = Field(
        ...,
        description="URL-friendly identifier",
    )
    
    # Descriptions
    short_description: Optional[str] = Field(
        default=None,
        description="Brief description",
    )
    
    full_description: Optional[str] = Field(
        default=None,
        description="Full description",
    )
    
    # Category
    primary_category: Optional[str] = Field(
        default=None,
        description="Primary activity category",
    )
    
    # Location
    address_line1: Optional[str] = Field(
        default=None,
        description="Street address",
    )
    
    city: Optional[str] = Field(
        default=None,
        description="City",
    )
    
    state: Optional[str] = Field(
        default=None,
        description="State",
    )
    
    postal_code: Optional[str] = Field(
        default=None,
        description="Postal code",
    )
    
    # Contact
    contact_phone: Optional[str] = Field(
        default=None,
        description="Contact phone",
    )
    
    website_url: Optional[str] = Field(
        default=None,
        description="Website URL",
    )
    
    # Ratings
    google_rating: Optional[float] = Field(
        default=None,
        description="Google rating (1-5)",
    )
    
    google_review_count: int = Field(
        default=0,
        description="Number of Google reviews",
    )
    
    # Data source
    data_source: str = Field(
        default="google_places",
        description="Origin of venue data",
    )
    
    # Status
    is_active: bool = Field(
        default=True,
        description="Whether venue is active",
    )
    
    # Photos
    photos_urls: Optional[List[str]] = Field(
        default_factory=list,
        description="Venue photo URLs",
    )
    
    # Business hours
    business_hours: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Operating hours",
    )
    
    # Timestamps
    created_at: datetime = Field(
        ...,
        description="When venue was added",
    )
    
    updated_at: datetime = Field(
        ...,
        description="Last update timestamp",
    )


class VendorVenueSummaryResponse(BaseModel):
    """
    Summary venue statistics for vendor dashboard.
    """
    
    # Venue reference
    venue_id: UUID = Field(
        ...,
        description="Venue identifier",
    )
    
    venue_name: str = Field(
        ...,
        description="Venue name",
    )
    
    # Activity count
    total_activities: int = Field(
        default=0,
        ge=0,
        description="Total activities offered",
    )
    
    active_activities: int = Field(
        default=0,
        ge=0,
        description="Currently active activities",
    )
    
    # Rating info
    google_rating: Optional[float] = Field(
        default=None,
        description="Google rating",
    )
    
    total_reviews: int = Field(
        default=0,
        ge=0,
        description="Total reviews",
    )
    
    # Quality scores (if available)
    quality_score: Optional[float] = Field(
        default=None,
        ge=0,
        le=5,
        description="Overall AI quality score",
    )
    
    # Status
    is_active: bool = Field(
        default=True,
        description="Venue active status",
    )


# =============================================================================
# PRICING SCHEMAS (PHASE 1: MOCK)
# =============================================================================
class MockPricingResponse(BaseModel):
    """
    Schema for mock pricing information.
    
    Phase 1 uses mock prices in INR.
    Phase 2 will convert to credits.
    """
    
    # Model configuration for ORM compatibility
    model_config = ConfigDict(from_attributes=True)
    
    # Pricing ID
    id: UUID = Field(
        ...,
        description="Pricing record identifier",
    )
    
    # Venue reference
    venue_id: UUID = Field(
        ...,
        description="Venue identifier",
    )
    
    # Activity type
    activity_type: str = Field(
        ...,
        description="Type of activity",
        examples=["swimming", "badminton", "art_class"],
    )
    
    # Prices in INR
    weekday_price_inr: float = Field(
        ...,
        ge=0,
        description="Weekday price in INR",
    )
    
    weekend_price_inr: float = Field(
        ...,
        ge=0,
        description="Weekend price in INR",
    )
    
    # Price source
    price_source: str = Field(
        default="algorithm",
        description="How price was determined",
    )
    
    # Timestamps
    created_at: datetime = Field(
        ...,
        description="When pricing was set",
    )


class MockPricingUpdateRequest(BaseModel):
    """
    Schema for updating mock pricing (vendor can override).
    """
    
    # Activity type
    activity_type: str = Field(
        ...,
        description="Activity type to update",
    )
    
    # New prices
    weekday_price_inr: Optional[float] = Field(
        default=None,
        ge=0,
        le=10000,
        description="New weekday price",
    )
    
    weekend_price_inr: Optional[float] = Field(
        default=None,
        ge=0,
        le=10000,
        description="New weekend price",
    )


class MockPricingListResponse(BaseModel):
    """
    List of mock pricing records.
    """
    
    # Pricing records
    pricing: List[MockPricingResponse] = Field(
        default_factory=list,
        description="List of pricing records",
    )
    
    # Count
    total: int = Field(
        default=0,
        ge=0,
        description="Total pricing records",
    )


# =============================================================================
# QUALITY SCORE SCHEMAS
# =============================================================================
class QualityScoreResponse(BaseModel):
    """
    Schema for AI-generated quality scores.
    """
    
    # Model configuration for ORM compatibility
    model_config = ConfigDict(from_attributes=True)
    
    # Score ID
    id: UUID = Field(
        ...,
        description="Score record identifier",
    )
    
    # Venue reference
    venue_id: UUID = Field(
        ...,
        description="Venue identifier",
    )
    
    # Individual scores (1-5 scale)
    hygiene_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Hygiene/cleanliness score",
    )
    
    safety_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Safety score",
    )
    
    teaching_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Teaching quality score",
    )
    
    facilities_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Facilities score",
    )
    
    value_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Value for money score",
    )
    
    ambience_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Ambience score",
    )
    
    staff_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Staff friendliness score",
    )
    
    location_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Location convenience score",
    )
    
    # Overall score
    overall_score: Optional[float] = Field(
        default=None,
        ge=1,
        le=5,
        description="Overall quality score",
    )
    
    # Confidence
    confidence: Optional[float] = Field(
        default=None,
        ge=0,
        le=1,
        description="Confidence in the scores",
    )
    
    # Reviews analyzed
    review_count_analyzed: int = Field(
        default=0,
        ge=0,
        description="Number of reviews analyzed",
    )
    
    # Key phrases
    key_phrases: Optional[Dict[str, List[str]]] = Field(
        default_factory=dict,
        description="Key phrases by category",
    )
    
    # Timestamps
    processed_at: datetime = Field(
        ...,
        description="When scores were calculated",
    )
