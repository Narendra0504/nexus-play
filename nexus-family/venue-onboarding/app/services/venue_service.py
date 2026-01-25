# =============================================================================
# NEXUS FAMILY PASS - VENUE SERVICE
# =============================================================================
"""
Venue Service Module.

This service handles all business logic related to venues including:
    - Venue listing and search
    - Venue details retrieval
    - Quality scores access
    - Geographic filtering

Phase 1 Features:
    - List venues with pagination
    - Get venue by ID or slug
    - Filter by city and category
    - Get quality scores

Phase 2 Will Add:
    - Semantic search with embeddings
    - Geographic proximity search
    - Venue management by admins
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import Optional, List, Tuple, Dict, Any  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from sqlalchemy import select, func, or_, and_  # Query building
from sqlalchemy.orm import selectinload  # Eager loading
from sqlalchemy.ext.asyncio import AsyncSession  # Session type

# Local imports
from app.services.base import BaseService  # Base class
from app.models.venue import Venue  # Venue model
from app.models.quality_score import VenueQualityScore, VenueMockPricing  # Related models
from app.core.logging_config import get_logger  # Logging
from app.core.exceptions import NotFoundError  # Exceptions

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# VENUE SERVICE
# =============================================================================
class VenueService(BaseService[Venue]):
    """
    Service class for venue-related business logic.
    
    This service extends BaseService with venue-specific functionality
    like filtering by city, category, and geographic proximity.
    
    Attributes:
        Inherits all attributes from BaseService
    
    Example:
        ```python
        venue_service = VenueService(db)
        
        # List all active venues
        venues, total = await venue_service.list_venues(page=1, page_size=20)
        
        # Get venue with related data
        venue = await venue_service.get_venue_detail(venue_id)
        ```
    """
    
    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the venue service.
        
        Args:
            db: The async database session
        """
        # Call parent constructor with Venue model
        super().__init__(db, Venue)
    
    # =========================================================================
    # VENUE LISTING
    # =========================================================================
    async def list_venues(
        self,
        page: int = 1,
        page_size: int = 20,
        city: Optional[str] = None,
        category: Optional[str] = None,
        is_active: bool = True,
        min_rating: Optional[float] = None,
        search_query: Optional[str] = None,
    ) -> Tuple[List[Venue], int]:
        """
        List venues with optional filtering.
        
        Args:
            page: Page number (1-indexed)
            page_size: Number of items per page (max 100)
            city: Filter by city name
            category: Filter by primary category
            is_active: Filter by active status (default True)
            min_rating: Minimum Google rating filter
            search_query: Text search in name/description
        
        Returns:
            Tuple of (list of venues, total count)
        
        Example:
            ```python
            # Get all venues in Bangalore
            venues, total = await venue_service.list_venues(
                city="Bangalore",
                min_rating=4.0
            )
            ```
        """
        # Validate page_size
        page_size = min(page_size, 100)
        
        # Calculate offset for pagination
        offset = (page - 1) * page_size
        
        # Build base query
        query = select(Venue)
        count_query = select(func.count()).select_from(Venue)
        
        # Build filter conditions
        conditions = []
        
        # Active status filter
        if is_active is not None:
            conditions.append(Venue.is_active == is_active)
        
        # City filter (case-insensitive)
        if city:
            conditions.append(func.lower(Venue.city) == city.lower())
        
        # Category filter
        if category:
            conditions.append(Venue.primary_category == category)
        
        # Minimum rating filter
        if min_rating is not None:
            conditions.append(Venue.google_rating >= min_rating)
        
        # Text search filter (simple ILIKE for Phase 1)
        # Phase 2 will use pgvector for semantic search
        if search_query:
            search_term = f"%{search_query}%"
            conditions.append(
                or_(
                    Venue.name.ilike(search_term),
                    Venue.short_description.ilike(search_term),
                    Venue.city.ilike(search_term),
                )
            )
        
        # Apply filters to both queries
        if conditions:
            filter_clause = and_(*conditions)
            query = query.where(filter_clause)
            count_query = count_query.where(filter_clause)
        
        # Add ordering (by rating descending, then name)
        query = query.order_by(
            Venue.google_rating.desc().nullslast(),
            Venue.name.asc()
        )
        
        # Add pagination
        query = query.offset(offset).limit(page_size)
        
        # Add eager loading for quality scores
        query = query.options(selectinload(Venue.quality_score))
        
        # Execute queries
        result = await self.db.execute(query)
        venues = list(result.scalars().all())
        
        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()
        
        logger.debug(
            f"Listed venues: {len(venues)} of {total}",
            extra={
                "page": page,
                "page_size": page_size,
                "city": city,
                "category": category,
            }
        )
        
        return venues, total
    
    # =========================================================================
    # VENUE DETAIL
    # =========================================================================
    async def get_venue_detail(
        self,
        venue_id: UUID,
    ) -> Venue:
        """
        Get detailed venue information with all related data.
        
        Loads venue with:
            - Quality scores
            - Activities
            - Mock pricing
            - Google reviews
        
        Args:
            venue_id: The venue's UUID
        
        Returns:
            Venue with all related data loaded
        
        Raises:
            NotFoundError: If venue not found
        """
        # Build query with eager loading
        query = (
            select(Venue)
            .where(Venue.id == venue_id)
            .options(
                selectinload(Venue.quality_score),
                selectinload(Venue.activities),
                selectinload(Venue.mock_pricing),
                selectinload(Venue.google_reviews),
            )
        )
        
        # Execute query
        result = await self.db.execute(query)
        venue = result.scalar_one_or_none()
        
        if venue is None:
            raise NotFoundError(
                f"Venue with ID {venue_id} not found",
                details={"venue_id": str(venue_id)}
            )
        
        return venue
    
    async def get_venue_by_slug(
        self,
        slug: str,
    ) -> Venue:
        """
        Get venue by URL slug with related data.
        
        Args:
            slug: The venue's URL slug
        
        Returns:
            Venue with related data
        
        Raises:
            NotFoundError: If venue not found
        """
        # Build query
        query = (
            select(Venue)
            .where(Venue.slug == slug)
            .options(
                selectinload(Venue.quality_score),
                selectinload(Venue.activities),
            )
        )
        
        # Execute
        result = await self.db.execute(query)
        venue = result.scalar_one_or_none()
        
        if venue is None:
            raise NotFoundError(
                f"Venue with slug '{slug}' not found",
                details={"slug": slug}
            )
        
        return venue
    
    # =========================================================================
    # QUALITY SCORES
    # =========================================================================
    async def get_venue_quality_scores(
        self,
        venue_id: UUID,
    ) -> Optional[VenueQualityScore]:
        """
        Get AI-generated quality scores for a venue.
        
        Args:
            venue_id: The venue's UUID
        
        Returns:
            Quality scores if available, None otherwise
        
        Raises:
            NotFoundError: If venue not found
        """
        # Verify venue exists
        venue = await self.get_by_id(venue_id)
        if venue is None:
            raise NotFoundError(f"Venue with ID {venue_id} not found")
        
        # Query quality scores
        query = select(VenueQualityScore).where(
            VenueQualityScore.venue_id == venue_id
        )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    # =========================================================================
    # MOCK PRICING
    # =========================================================================
    async def get_venue_mock_pricing(
        self,
        venue_id: UUID,
    ) -> List[VenueMockPricing]:
        """
        Get mock pricing for a venue.
        
        Args:
            venue_id: The venue's UUID
        
        Returns:
            List of mock pricing records
        
        Raises:
            NotFoundError: If venue not found
        """
        # Verify venue exists
        venue = await self.get_by_id(venue_id)
        if venue is None:
            raise NotFoundError(f"Venue with ID {venue_id} not found")
        
        # Query mock pricing
        query = (
            select(VenueMockPricing)
            .where(VenueMockPricing.venue_id == venue_id)
            .order_by(VenueMockPricing.activity_type)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    # =========================================================================
    # STATISTICS
    # =========================================================================
    async def get_venue_statistics(
        self,
        venue_id: UUID,
    ) -> Dict[str, Any]:
        """
        Get statistics for a venue.
        
        Args:
            venue_id: The venue's UUID
        
        Returns:
            Dictionary with venue statistics
        """
        venue = await self.get_venue_detail(venue_id)
        
        # Count activities
        from app.models.activity import Activity
        activity_query = select(func.count()).select_from(Activity).where(
            and_(
                Activity.venue_id == venue_id,
                Activity.is_active == True
            )
        )
        activity_result = await self.db.execute(activity_query)
        active_activities = activity_result.scalar_one()
        
        # Build statistics
        stats = {
            "venue_id": str(venue_id),
            "venue_name": venue.name,
            "total_activities": len(venue.activities) if venue.activities else 0,
            "active_activities": active_activities,
            "google_rating": venue.google_rating,
            "google_review_count": venue.google_review_count,
            "has_quality_scores": venue.quality_score is not None,
            "is_active": venue.is_active,
        }
        
        # Add quality score if available
        if venue.quality_score:
            stats["overall_quality_score"] = venue.quality_score.overall_score
        
        return stats
    
    # =========================================================================
    # GEOGRAPHIC QUERIES (PHASE 1 - SIMPLE)
    # =========================================================================
    async def list_venues_by_city(
        self,
        city: str,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[List[Venue], int]:
        """
        List all venues in a specific city.
        
        Simple city-based filtering for Phase 1.
        Phase 2 will add proximity search with coordinates.
        
        Args:
            city: City name to filter by
            page: Page number
            page_size: Items per page
        
        Returns:
            Tuple of (venues, total count)
        """
        return await self.list_venues(
            page=page,
            page_size=page_size,
            city=city,
            is_active=True,
        )
    
    async def get_available_cities(self) -> List[str]:
        """
        Get list of cities with venues.
        
        Returns:
            List of unique city names
        """
        query = (
            select(Venue.city)
            .where(
                and_(
                    Venue.is_active == True,
                    Venue.city.isnot(None)
                )
            )
            .distinct()
            .order_by(Venue.city)
        )
        
        result = await self.db.execute(query)
        cities = [row[0] for row in result.fetchall()]
        
        return cities
    
    async def get_available_categories(self) -> List[str]:
        """
        Get list of available venue categories.
        
        Returns:
            List of unique category names
        """
        query = (
            select(Venue.primary_category)
            .where(
                and_(
                    Venue.is_active == True,
                    Venue.primary_category.isnot(None)
                )
            )
            .distinct()
            .order_by(Venue.primary_category)
        )
        
        result = await self.db.execute(query)
        categories = [row[0] for row in result.fetchall()]
        
        return categories
