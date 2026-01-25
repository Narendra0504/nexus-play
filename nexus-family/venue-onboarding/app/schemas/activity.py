# =============================================================================
# NEXUS FAMILY PASS - ACTIVITY SCHEMAS
# =============================================================================
"""
Activity-Related Pydantic Schemas Module.

This module defines Pydantic models for Activity and ActivitySession
request validation and response serialization.

Schemas:
    - ActivityBase: Base fields for activity
    - ActivityCreate: Schema for creating activities
    - ActivityResponse: Schema for activity responses
    - ActivityListResponse: Paginated list of activities
    - ActivityDetailResponse: Detailed activity with sessions
    - ActivitySessionResponse: Schema for session responses
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import date, time, datetime  # Date/time types
from typing import Optional, List, Any  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from pydantic import BaseModel, Field, ConfigDict  # Pydantic base and config


# =============================================================================
# ACTIVITY SESSION SCHEMAS
# =============================================================================
class ActivitySessionBase(BaseModel):
    """
    Base schema for ActivitySession with common fields.
    
    Contains the core fields that are present in all session operations.
    """
    
    # Session date
    session_date: date = Field(
        ...,
        description="Date of the session",
        examples=["2024-02-15"],
    )
    
    # Start time
    start_time: time = Field(
        ...,
        description="Session start time",
        examples=["10:00:00"],
    )
    
    # End time
    end_time: time = Field(
        ...,
        description="Session end time",
        examples=["11:00:00"],
    )
    
    # Capacity
    total_capacity: int = Field(
        default=15,
        ge=1,
        le=100,
        description="Maximum participants",
    )


class ActivitySessionResponse(ActivitySessionBase):
    """
    Schema for ActivitySession responses.
    
    Includes all session fields plus computed properties.
    """
    
    # Model configuration for ORM compatibility
    model_config = ConfigDict(from_attributes=True)
    
    # Session ID
    id: UUID = Field(
        ...,
        description="Unique session identifier",
    )
    
    # Activity reference
    activity_id: UUID = Field(
        ...,
        description="Reference to the activity",
    )
    
    # Current bookings
    booked_count: int = Field(
        default=0,
        ge=0,
        description="Current number of bookings",
    )
    
    # Status flags
    is_cancelled: bool = Field(
        default=False,
        description="Whether session is cancelled",
    )
    
    is_completed: bool = Field(
        default=False,
        description="Whether session has completed",
    )
    
    # Optional fields
    instructor_name: Optional[str] = Field(
        default=None,
        description="Instructor name if assigned",
    )
    
    timezone: str = Field(
        default="Asia/Kolkata",
        description="Session timezone",
    )
    
    # Timestamps
    created_at: datetime = Field(
        ...,
        description="When session was created",
    )
    
    # Computed fields (not in DB, calculated)
    available_spots: Optional[int] = Field(
        default=None,
        description="Number of available spots",
    )
    
    is_full: Optional[bool] = Field(
        default=None,
        description="Whether session is fully booked",
    )
    
    time_display: Optional[str] = Field(
        default=None,
        description="Formatted time range",
    )


class ActivitySessionListResponse(BaseModel):
    """
    Schema for a list of activity sessions.
    """
    
    # List of sessions
    sessions: List[ActivitySessionResponse] = Field(
        default_factory=list,
        description="List of sessions",
    )
    
    # Total count
    total: int = Field(
        default=0,
        ge=0,
        description="Total number of sessions",
    )


# =============================================================================
# ACTIVITY SCHEMAS
# =============================================================================
class ActivityBase(BaseModel):
    """
    Base schema for Activity with common fields.
    
    Contains the core fields present in all activity operations.
    These fields are shared between create, update, and response schemas.
    """
    
    # Activity name
    name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Activity name",
        examples=["Swimming Lessons"],
    )
    
    # Category
    category: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Activity category",
        examples=["sports", "stem", "arts", "music"],
    )
    
    # Brief description
    short_description: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Brief description (150 chars max)",
        examples=["Learn to swim with certified instructors"],
    )
    
    # Age requirements
    min_age: int = Field(
        default=3,
        ge=0,
        le=18,
        description="Minimum age requirement",
    )
    
    max_age: int = Field(
        default=15,
        ge=0,
        le=18,
        description="Maximum age requirement",
    )
    
    # Duration
    duration_minutes: int = Field(
        default=60,
        ge=15,
        le=480,
        description="Session duration in minutes",
    )
    
    # Credits
    credits_required: int = Field(
        default=2,
        ge=1,
        le=20,
        description="Credits required to book",
    )


class ActivityCreate(ActivityBase):
    """
    Schema for creating a new activity.
    
    Extends ActivityBase with additional fields needed during creation.
    """
    
    # Venue reference
    venue_id: UUID = Field(
        ...,
        description="Reference to the venue offering this activity",
    )
    
    # Full description (optional during creation)
    full_description: Optional[str] = Field(
        default=None,
        description="Full activity description",
    )
    
    # Capacity
    capacity_per_session: int = Field(
        default=15,
        ge=1,
        le=100,
        description="Maximum participants per session",
    )
    
    # Activity tags
    activity_tags: Optional[dict] = Field(
        default_factory=dict,
        description="Activity characteristics tags",
        examples=[{"indoor": True, "messy": False, "competitive": False}],
    )
    
    # Learning outcomes
    learning_outcomes: Optional[List[str]] = Field(
        default_factory=list,
        description="What children will learn",
        examples=[["Water safety", "Basic strokes", "Confidence"]],
    )
    
    # What to bring
    what_to_bring: Optional[List[str]] = Field(
        default_factory=list,
        description="Items participants should bring",
        examples=[["Swimsuit", "Towel", "Goggles"]],
    )


class ActivityResponse(ActivityBase):
    """
    Schema for Activity responses.
    
    Includes all activity fields plus computed properties
    and related data.
    """
    
    # Model configuration for ORM compatibility
    model_config = ConfigDict(from_attributes=True)
    
    # Activity ID
    id: UUID = Field(
        ...,
        description="Unique activity identifier",
    )
    
    # Venue reference
    venue_id: UUID = Field(
        ...,
        description="Reference to the venue",
    )
    
    # URL slug
    slug: str = Field(
        ...,
        description="URL-friendly identifier",
    )
    
    # Full description
    full_description: Optional[str] = Field(
        default=None,
        description="Full activity description",
    )
    
    # Capacity
    capacity_per_session: int = Field(
        default=15,
        description="Maximum participants per session",
    )
    
    # Status
    is_active: bool = Field(
        default=True,
        description="Whether activity is active",
    )
    
    # Ratings
    average_rating: Optional[float] = Field(
        default=None,
        ge=0,
        le=5,
        description="Average rating (1-5)",
    )
    
    total_reviews: int = Field(
        default=0,
        ge=0,
        description="Total number of reviews",
    )
    
    # Media
    primary_image_url: Optional[str] = Field(
        default=None,
        description="Primary activity image URL",
    )
    
    photos_urls: Optional[List[str]] = Field(
        default_factory=list,
        description="Activity photo URLs",
    )
    
    # Metadata
    activity_tags: Optional[dict] = Field(
        default_factory=dict,
        description="Activity characteristics tags",
    )
    
    learning_outcomes: Optional[List[str]] = Field(
        default_factory=list,
        description="What children will learn",
    )
    
    what_to_bring: Optional[List[str]] = Field(
        default_factory=list,
        description="Items to bring",
    )
    
    # Timestamps
    created_at: datetime = Field(
        ...,
        description="When activity was created",
    )
    
    updated_at: datetime = Field(
        ...,
        description="When activity was last updated",
    )
    
    # Computed display fields
    age_range_display: Optional[str] = Field(
        default=None,
        description="Formatted age range (e.g., 'Ages 5-12')",
    )
    
    duration_display: Optional[str] = Field(
        default=None,
        description="Formatted duration (e.g., '1 hour')",
    )


class ActivityWithVenueResponse(ActivityResponse):
    """
    Activity response with embedded venue information.
    
    Used when you need activity details along with venue info.
    """
    
    # Venue name (denormalized for convenience)
    venue_name: Optional[str] = Field(
        default=None,
        description="Name of the venue",
    )
    
    # Venue rating
    venue_rating: Optional[float] = Field(
        default=None,
        description="Venue's Google rating",
    )
    
    # Venue city
    venue_city: Optional[str] = Field(
        default=None,
        description="City where venue is located",
    )


class ActivityListResponse(BaseModel):
    """
    Paginated list of activities.
    """
    
    # List of activities
    activities: List[ActivityResponse] = Field(
        default_factory=list,
        description="List of activities",
    )
    
    # Pagination info
    total: int = Field(
        default=0,
        ge=0,
        description="Total number of activities",
    )
    
    page: int = Field(
        default=1,
        ge=1,
        description="Current page number",
    )
    
    page_size: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Items per page",
    )
    
    total_pages: int = Field(
        default=1,
        ge=1,
        description="Total number of pages",
    )


class ActivityDetailResponse(ActivityResponse):
    """
    Detailed activity response with sessions and venue info.
    """
    
    # Upcoming sessions
    upcoming_sessions: List[ActivitySessionResponse] = Field(
        default_factory=list,
        description="Upcoming available sessions",
    )
    
    # Venue details
    venue_name: Optional[str] = Field(
        default=None,
        description="Name of the venue",
    )
    
    venue_slug: Optional[str] = Field(
        default=None,
        description="Venue URL slug",
    )
    
    venue_rating: Optional[float] = Field(
        default=None,
        description="Venue's Google rating",
    )
    
    venue_address: Optional[str] = Field(
        default=None,
        description="Venue address",
    )
    
    venue_city: Optional[str] = Field(
        default=None,
        description="Venue city",
    )


class ActivityFilterParams(BaseModel):
    """
    Parameters for filtering activities.
    """
    
    # Category filter
    category: Optional[str] = Field(
        default=None,
        description="Filter by category",
    )
    
    # Age filter
    age: Optional[int] = Field(
        default=None,
        ge=0,
        le=18,
        description="Filter by child's age",
    )
    
    # Venue filter
    venue_id: Optional[UUID] = Field(
        default=None,
        description="Filter by venue",
    )
    
    # City filter
    city: Optional[str] = Field(
        default=None,
        description="Filter by city",
    )
    
    # Credit range
    min_credits: Optional[int] = Field(
        default=None,
        ge=1,
        description="Minimum credits required",
    )
    
    max_credits: Optional[int] = Field(
        default=None,
        le=20,
        description="Maximum credits required",
    )
    
    # Only active
    is_active: bool = Field(
        default=True,
        description="Only show active activities",
    )
