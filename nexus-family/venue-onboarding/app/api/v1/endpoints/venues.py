# =============================================================================
# NEXUS FAMILY PASS - VENUE ENDPOINTS
# =============================================================================
"""
Venue Discovery and Details Endpoints Module.

This module provides endpoints for:
    - Listing venues with pagination and filtering
    - Getting venue details
    - Retrieving venue quality scores
    - Getting venue activities
    - Searching venues
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
    get_venue_service,
    PaginationParams,
    VenueFilterParams,
)
from app.services.venue_service import VenueService
from app.schemas.venue import (
    VenueResponse,
    VenueListResponse,
    VenueDetailResponse,
)
from app.schemas.vendor import QualityScoreResponse, MockPricingListResponse

# =============================================================================
# ROUTER
# =============================================================================
router = APIRouter()


# =============================================================================
# ENDPOINTS
# =============================================================================
@router.get(
    "",
    response_model=VenueListResponse,
    summary="List Venues",
    description="Get a paginated list of venues with optional filtering.",
)
async def list_venues(
    pagination: PaginationParams = Depends(),
    filters: VenueFilterParams = Depends(),
    venue_service: VenueService = Depends(get_venue_service),
) -> VenueListResponse:
    """
    List all venues with pagination and filtering.
    
    Supports filtering by:
        - city: City name (case-insensitive)
        - category: Primary activity category
        - min_rating: Minimum Google rating
        - search: Text search in name/description
    
    Args:
        pagination: Pagination parameters (page, page_size)
        filters: Filter parameters
        venue_service: Venue service (injected)
    
    Returns:
        VenueListResponse: Paginated list of venues
    
    Example:
        GET /api/v1/venues?city=Bangalore&min_rating=4.0&page=1&page_size=20
    """
    # Call service to get venues
    venues, total = await venue_service.list_venues(
        page=pagination.page,
        page_size=pagination.page_size,
        city=filters.city,
        category=filters.category,
        min_rating=filters.min_rating,
        search_query=filters.search,
        is_active=True,
    )
    
    # Calculate pagination metadata
    total_pages = max(1, (total + pagination.page_size - 1) // pagination.page_size)
    
    # Convert models to response schemas
    venue_responses = [
        VenueResponse.model_validate(venue) for venue in venues
    ]
    
    return VenueListResponse(
        venues=venue_responses,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        total_pages=total_pages,
    )


@router.get(
    "/cities",
    response_model=List[str],
    summary="Get Available Cities",
    description="Get list of cities that have venues.",
)
async def get_cities(
    venue_service: VenueService = Depends(get_venue_service),
) -> List[str]:
    """
    Get list of cities with active venues.
    
    Returns:
        List of city names
    
    Example:
        GET /api/v1/venues/cities
        Response: ["Bangalore", "Chennai", "Mumbai"]
    """
    return await venue_service.get_available_cities()


@router.get(
    "/categories",
    response_model=List[str],
    summary="Get Available Categories",
    description="Get list of venue categories.",
)
async def get_categories(
    venue_service: VenueService = Depends(get_venue_service),
) -> List[str]:
    """
    Get list of available venue categories.
    
    Returns:
        List of category names
    
    Example:
        GET /api/v1/venues/categories
        Response: ["sports", "arts", "stem", "music"]
    """
    return await venue_service.get_available_categories()


@router.get(
    "/{venue_id}",
    response_model=VenueDetailResponse,
    summary="Get Venue Details",
    description="Get detailed information about a specific venue.",
)
async def get_venue(
    venue_id: UUID = Path(..., description="The venue's UUID"),
    venue_service: VenueService = Depends(get_venue_service),
) -> VenueDetailResponse:
    """
    Get detailed venue information.
    
    Returns venue with:
        - Basic information (name, address, etc.)
        - Google rating and reviews
        - Quality scores (if available)
        - Activities at this venue
    
    Args:
        venue_id: The venue's UUID
        venue_service: Venue service (injected)
    
    Returns:
        VenueDetailResponse: Detailed venue information
    
    Raises:
        404: Venue not found
    
    Example:
        GET /api/v1/venues/123e4567-e89b-12d3-a456-426614174000
    """
    venue = await venue_service.get_venue_detail(venue_id)
    
    # Build response with related data
    response = VenueDetailResponse.model_validate(venue)
    
    # Add quality scores if available
    if venue.quality_score:
        response.quality_scores = QualityScoreResponse.model_validate(
            venue.quality_score
        )
    
    # Add activity count
    response.activity_count = len(venue.activities) if venue.activities else 0
    
    return response


@router.get(
    "/slug/{slug}",
    response_model=VenueDetailResponse,
    summary="Get Venue by Slug",
    description="Get venue details using URL-friendly slug.",
)
async def get_venue_by_slug(
    slug: str = Path(..., description="The venue's URL slug"),
    venue_service: VenueService = Depends(get_venue_service),
) -> VenueDetailResponse:
    """
    Get venue by URL slug.
    
    Useful for building SEO-friendly URLs like /venues/abc-swimming-academy
    
    Args:
        slug: The venue's URL slug
        venue_service: Venue service (injected)
    
    Returns:
        VenueDetailResponse: Detailed venue information
    
    Raises:
        404: Venue not found
    
    Example:
        GET /api/v1/venues/slug/abc-swimming-academy
    """
    venue = await venue_service.get_venue_by_slug(slug)
    return VenueDetailResponse.model_validate(venue)


@router.get(
    "/{venue_id}/quality-scores",
    response_model=QualityScoreResponse,
    summary="Get Venue Quality Scores",
    description="Get AI-generated quality scores for a venue.",
)
async def get_venue_quality_scores(
    venue_id: UUID = Path(..., description="The venue's UUID"),
    venue_service: VenueService = Depends(get_venue_service),
) -> QualityScoreResponse:
    """
    Get AI-generated quality scores for a venue.
    
    Quality scores are extracted from Google reviews using AI
    and include ratings for:
        - Hygiene
        - Safety
        - Teaching quality
        - Facilities
        - Value for money
        - Ambience
        - Staff friendliness
        - Location convenience
    
    Args:
        venue_id: The venue's UUID
        venue_service: Venue service (injected)
    
    Returns:
        QualityScoreResponse: AI-generated quality scores
    
    Raises:
        404: Venue or quality scores not found
    
    Example:
        GET /api/v1/venues/123e4567-e89b-12d3-a456-426614174000/quality-scores
    """
    scores = await venue_service.get_venue_quality_scores(venue_id)
    
    if scores is None:
        from app.core.exceptions import NotFoundError
        raise NotFoundError(
            "Quality scores not available for this venue",
            details={"venue_id": str(venue_id)}
        )
    
    return QualityScoreResponse.model_validate(scores)


@router.get(
    "/{venue_id}/pricing",
    response_model=MockPricingListResponse,
    summary="Get Venue Pricing",
    description="Get mock pricing for a venue's activities (Phase 1).",
)
async def get_venue_pricing(
    venue_id: UUID = Path(..., description="The venue's UUID"),
    venue_service: VenueService = Depends(get_venue_service),
) -> MockPricingListResponse:
    """
    Get mock pricing for a venue.
    
    Phase 1 uses mock prices in INR.
    Phase 2 will convert to credits.
    
    Args:
        venue_id: The venue's UUID
        venue_service: Venue service (injected)
    
    Returns:
        MockPricingListResponse: List of pricing records
    
    Example:
        GET /api/v1/venues/123e4567-e89b-12d3-a456-426614174000/pricing
    """
    from app.schemas.vendor import MockPricingResponse
    
    pricing = await venue_service.get_venue_mock_pricing(venue_id)
    
    pricing_responses = [
        MockPricingResponse.model_validate(p) for p in pricing
    ]
    
    return MockPricingListResponse(
        pricing=pricing_responses,
        total=len(pricing_responses),
    )


@router.get(
    "/{venue_id}/statistics",
    summary="Get Venue Statistics",
    description="Get statistics for a venue.",
)
async def get_venue_statistics(
    venue_id: UUID = Path(..., description="The venue's UUID"),
    venue_service: VenueService = Depends(get_venue_service),
) -> dict:
    """
    Get statistics for a venue.
    
    Returns:
        - Activity count
        - Review count
        - Rating
        - Quality score (if available)
    
    Args:
        venue_id: The venue's UUID
        venue_service: Venue service (injected)
    
    Returns:
        dict: Venue statistics
    
    Example:
        GET /api/v1/venues/123e4567-e89b-12d3-a456-426614174000/statistics
    """
    return await venue_service.get_venue_statistics(venue_id)
