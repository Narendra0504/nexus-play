# =============================================================================
# NEXUS FAMILY PASS - ACTIVITY ENDPOINTS
# =============================================================================
"""
Activity Listing and Details Endpoints Module.

This module provides endpoints for:
    - Listing activities with pagination and filtering
    - Getting activity details
    - Getting activity sessions
    - Filtering by age, category, venue
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import List, Optional  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from fastapi import APIRouter, Depends, Query, Path  # Router and utilities

# Local imports
from app.api.v1.dependencies import (
    get_activity_service,
    PaginationParams,
    ActivityFilterParams,
)
from app.services.activity_service import ActivityService
from app.schemas.activity import (
    ActivityResponse,
    ActivityListResponse,
    ActivityDetailResponse,
    ActivitySessionResponse,
    ActivitySessionListResponse,
)

# =============================================================================
# ROUTER
# =============================================================================
router = APIRouter()


# =============================================================================
# ENDPOINTS
# =============================================================================
@router.get(
    "",
    response_model=ActivityListResponse,
    summary="List Activities",
    description="Get a paginated list of activities with optional filtering.",
)
async def list_activities(
    pagination: PaginationParams = Depends(),
    filters: ActivityFilterParams = Depends(),
    activity_service: ActivityService = Depends(get_activity_service),
) -> ActivityListResponse:
    """
    List all activities with pagination and filtering.
    
    Supports filtering by:
        - category: Activity category (sports, stem, arts, etc.)
        - age: Child's age (filters to age-appropriate activities)
        - city: Venue city
        - venue_id: Specific venue
        - min_credits/max_credits: Credit range
        - search: Text search
    
    Args:
        pagination: Pagination parameters (page, page_size)
        filters: Filter parameters
        activity_service: Activity service (injected)
    
    Returns:
        ActivityListResponse: Paginated list of activities
    
    Example:
        GET /api/v1/activities?category=sports&age=7&city=Bangalore
    """
    # Call service to get activities
    activities, total = await activity_service.list_activities(
        page=pagination.page,
        page_size=pagination.page_size,
        category=filters.category,
        child_age=filters.age,
        city=filters.city,
        venue_id=filters.venue_id,
        min_credits=filters.min_credits,
        max_credits=filters.max_credits,
        search_query=filters.search,
        is_active=True,
    )
    
    # Calculate pagination metadata
    total_pages = max(1, (total + pagination.page_size - 1) // pagination.page_size)
    
    # Convert models to response schemas with venue info
    activity_responses = []
    for activity in activities:
        response = ActivityResponse.model_validate(activity)
        
        # Add computed display fields
        response.age_range_display = f"Ages {activity.min_age}-{activity.max_age}"
        
        # Format duration
        if activity.duration_minutes >= 60:
            hours = activity.duration_minutes // 60
            mins = activity.duration_minutes % 60
            if mins == 0:
                response.duration_display = f"{hours} hour{'s' if hours > 1 else ''}"
            else:
                response.duration_display = f"{hours}h {mins}m"
        else:
            response.duration_display = f"{activity.duration_minutes} mins"
        
        activity_responses.append(response)
    
    return ActivityListResponse(
        activities=activity_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        total_pages=total_pages,
    )


@router.get(
    "/categories",
    response_model=List[str],
    summary="Get Activity Categories",
    description="Get list of available activity categories.",
)
async def get_categories(
    activity_service: ActivityService = Depends(get_activity_service),
) -> List[str]:
    """
    Get list of available activity categories.
    
    Returns:
        List of category names
    
    Example:
        GET /api/v1/activities/categories
        Response: ["sports", "stem", "arts", "music", "dance"]
    """
    return await activity_service.get_available_categories()


@router.get(
    "/age-range",
    summary="Get Age Range",
    description="Get the supported age range for activities.",
)
async def get_age_range(
    activity_service: ActivityService = Depends(get_activity_service),
) -> dict:
    """
    Get the range of ages supported by activities.
    
    Returns:
        dict: min_age and max_age
    
    Example:
        GET /api/v1/activities/age-range
        Response: {"min_age": 3, "max_age": 15}
    """
    return await activity_service.get_age_range()


@router.get(
    "/{activity_id}",
    response_model=ActivityDetailResponse,
    summary="Get Activity Details",
    description="Get detailed information about a specific activity.",
)
async def get_activity(
    activity_id: UUID = Path(..., description="The activity's UUID"),
    include_sessions: bool = Query(
        True,
        description="Include upcoming sessions in response"
    ),
    activity_service: ActivityService = Depends(get_activity_service),
) -> ActivityDetailResponse:
    """
    Get detailed activity information.
    
    Returns activity with:
        - Basic information (name, description, etc.)
        - Age requirements
        - Duration and credits
        - Venue information
        - Upcoming sessions (optional)
    
    Args:
        activity_id: The activity's UUID
        include_sessions: Whether to include upcoming sessions
        activity_service: Activity service (injected)
    
    Returns:
        ActivityDetailResponse: Detailed activity information
    
    Raises:
        404: Activity not found
    
    Example:
        GET /api/v1/activities/123e4567-e89b-12d3-a456-426614174000
    """
    activity = await activity_service.get_activity_detail(
        activity_id,
        include_sessions=include_sessions,
    )
    
    # Build response
    response = ActivityDetailResponse.model_validate(activity)
    
    # Add computed display fields
    response.age_range_display = f"Ages {activity.min_age}-{activity.max_age}"
    
    # Format duration
    if activity.duration_minutes >= 60:
        hours = activity.duration_minutes // 60
        mins = activity.duration_minutes % 60
        if mins == 0:
            response.duration_display = f"{hours} hour{'s' if hours > 1 else ''}"
        else:
            response.duration_display = f"{hours}h {mins}m"
    else:
        response.duration_display = f"{activity.duration_minutes} mins"
    
    # Add venue information
    if activity.venue:
        response.venue_name = activity.venue.name
        response.venue_slug = activity.venue.slug
        response.venue_rating = activity.venue.google_rating
        response.venue_address = activity.venue.address_line1
        response.venue_city = activity.venue.city
    
    # Add upcoming sessions if loaded
    if include_sessions and hasattr(activity, '_upcoming_sessions'):
        response.upcoming_sessions = [
            ActivitySessionResponse.model_validate(session)
            for session in activity._upcoming_sessions
        ]
    
    return response


@router.get(
    "/{activity_id}/sessions",
    response_model=ActivitySessionListResponse,
    summary="Get Activity Sessions",
    description="Get upcoming sessions for an activity.",
)
async def get_activity_sessions(
    activity_id: UUID = Path(..., description="The activity's UUID"),
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Maximum sessions to return"
    ),
    activity_service: ActivityService = Depends(get_activity_service),
) -> ActivitySessionListResponse:
    """
    Get upcoming sessions for an activity.
    
    Returns:
        - Date and time
        - Capacity information
        - Availability status
    
    Args:
        activity_id: The activity's UUID
        limit: Maximum sessions to return
        activity_service: Activity service (injected)
    
    Returns:
        ActivitySessionListResponse: List of upcoming sessions
    
    Example:
        GET /api/v1/activities/123e4567.../sessions?limit=20
    """
    sessions = await activity_service.get_upcoming_sessions(
        activity_id,
        limit=limit,
    )
    
    # Convert to response format with computed fields
    session_responses = []
    for session in sessions:
        response = ActivitySessionResponse.model_validate(session)
        
        # Add computed fields
        response.available_spots = session.total_capacity - session.booked_count
        response.is_full = response.available_spots == 0
        
        # Format time display
        start = session.start_time.strftime("%I:%M %p")
        end = session.end_time.strftime("%I:%M %p")
        response.time_display = f"{start} - {end}"
        
        session_responses.append(response)
    
    return ActivitySessionListResponse(
        sessions=session_responses,
        total=len(session_responses),
    )


@router.get(
    "/{activity_id}/statistics",
    summary="Get Activity Statistics",
    description="Get statistics for an activity.",
)
async def get_activity_statistics(
    activity_id: UUID = Path(..., description="The activity's UUID"),
    activity_service: ActivityService = Depends(get_activity_service),
) -> dict:
    """
    Get statistics for an activity.
    
    Returns:
        - Venue information
        - Session count
        - Rating and reviews
    
    Args:
        activity_id: The activity's UUID
        activity_service: Activity service (injected)
    
    Returns:
        dict: Activity statistics
    
    Example:
        GET /api/v1/activities/123e4567.../statistics
    """
    return await activity_service.get_activity_statistics(activity_id)


@router.get(
    "/venue/{venue_id}",
    response_model=List[ActivityResponse],
    summary="Get Venue Activities",
    description="Get all activities for a specific venue.",
)
async def get_venue_activities(
    venue_id: UUID = Path(..., description="The venue's UUID"),
    activity_service: ActivityService = Depends(get_activity_service),
) -> List[ActivityResponse]:
    """
    Get all activities at a specific venue.
    
    Args:
        venue_id: The venue's UUID
        activity_service: Activity service (injected)
    
    Returns:
        List of activities at the venue
    
    Example:
        GET /api/v1/activities/venue/123e4567-e89b-12d3-a456-426614174000
    """
    activities = await activity_service.get_venue_activities(
        venue_id,
        is_active=True,
    )
    
    return [
        ActivityResponse.model_validate(activity)
        for activity in activities
    ]
