# =============================================================================
# NEXUS FAMILY PASS - ACTIVITY SERVICE
# =============================================================================
"""
Activity Service Module.

This service handles all business logic related to activities including:
    - Activity listing and filtering
    - Activity details retrieval
    - Session management
    - Age-appropriate filtering

Phase 1 Features:
    - List activities with filtering
    - Get activity by ID
    - Filter by category, age, venue
    - Get upcoming sessions

Phase 2 Will Add:
    - Semantic search with embeddings
    - Real session booking
    - Availability management
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import date, datetime, timedelta  # Date handling
from typing import Optional, List, Tuple, Dict, Any  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from sqlalchemy import select, func, or_, and_  # Query building
from sqlalchemy.orm import selectinload  # Eager loading
from sqlalchemy.ext.asyncio import AsyncSession  # Session type

# Local imports
from app.services.base import BaseService  # Base class
from app.models.activity import Activity, ActivitySession  # Models
from app.models.venue import Venue  # Venue model
from app.core.logging_config import get_logger  # Logging
from app.core.exceptions import NotFoundError  # Exceptions

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# ACTIVITY SERVICE
# =============================================================================
class ActivityService(BaseService[Activity]):
    """
    Service class for activity-related business logic.
    
    This service extends BaseService with activity-specific functionality
    like filtering by age, category, and venue.
    
    Example:
        ```python
        activity_service = ActivityService(db)
        
        # List activities for a 7-year-old
        activities, total = await activity_service.list_activities(
            child_age=7,
            category="sports"
        )
        
        # Get activity with sessions
        activity = await activity_service.get_activity_detail(activity_id)
        ```
    """
    
    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the activity service.
        
        Args:
            db: The async database session
        """
        # Call parent constructor with Activity model
        super().__init__(db, Activity)
    
    # =========================================================================
    # ACTIVITY LISTING
    # =========================================================================
    async def list_activities(
        self,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        child_age: Optional[int] = None,
        venue_id: Optional[UUID] = None,
        city: Optional[str] = None,
        is_active: bool = True,
        min_credits: Optional[int] = None,
        max_credits: Optional[int] = None,
        search_query: Optional[str] = None,
    ) -> Tuple[List[Activity], int]:
        """
        List activities with optional filtering.
        
        Args:
            page: Page number (1-indexed)
            page_size: Number of items per page (max 100)
            category: Filter by activity category
            child_age: Filter by age appropriateness
            venue_id: Filter by specific venue
            city: Filter by venue city
            is_active: Filter by active status
            min_credits: Minimum credits filter
            max_credits: Maximum credits filter
            search_query: Text search in name/description
        
        Returns:
            Tuple of (list of activities, total count)
        
        Example:
            ```python
            # Get STEM activities for 7-year-olds in Bangalore
            activities, total = await activity_service.list_activities(
                category="stem",
                child_age=7,
                city="Bangalore"
            )
            ```
        """
        # Validate page_size
        page_size = min(page_size, 100)
        
        # Calculate offset for pagination
        offset = (page - 1) * page_size
        
        # Build base query with venue join (needed for city filter)
        query = select(Activity).join(Venue, Activity.venue_id == Venue.id)
        count_query = select(func.count()).select_from(Activity).join(
            Venue, Activity.venue_id == Venue.id
        )
        
        # Build filter conditions
        conditions = []
        
        # Active status filter
        if is_active is not None:
            conditions.append(Activity.is_active == is_active)
            conditions.append(Venue.is_active == True)  # Only from active venues
        
        # Category filter
        if category:
            conditions.append(Activity.category == category)
        
        # Age filter (child's age must be within min_age and max_age)
        if child_age is not None:
            conditions.append(Activity.min_age <= child_age)
            conditions.append(Activity.max_age >= child_age)
        
        # Venue filter
        if venue_id:
            conditions.append(Activity.venue_id == venue_id)
        
        # City filter (via venue)
        if city:
            conditions.append(func.lower(Venue.city) == city.lower())
        
        # Credit range filters
        if min_credits is not None:
            conditions.append(Activity.credits_required >= min_credits)
        
        if max_credits is not None:
            conditions.append(Activity.credits_required <= max_credits)
        
        # Text search filter
        if search_query:
            search_term = f"%{search_query}%"
            conditions.append(
                or_(
                    Activity.name.ilike(search_term),
                    Activity.short_description.ilike(search_term),
                    Venue.name.ilike(search_term),
                )
            )
        
        # Apply filters
        if conditions:
            filter_clause = and_(*conditions)
            query = query.where(filter_clause)
            count_query = count_query.where(filter_clause)
        
        # Add ordering (by venue rating, then activity name)
        query = query.order_by(
            Venue.google_rating.desc().nullslast(),
            Activity.name.asc()
        )
        
        # Add pagination
        query = query.offset(offset).limit(page_size)
        
        # Add eager loading
        query = query.options(selectinload(Activity.venue))
        
        # Execute queries
        result = await self.db.execute(query)
        activities = list(result.scalars().all())
        
        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()
        
        logger.debug(
            f"Listed activities: {len(activities)} of {total}",
            extra={
                "page": page,
                "category": category,
                "child_age": child_age,
                "city": city,
            }
        )
        
        return activities, total
    
    # =========================================================================
    # ACTIVITY DETAIL
    # =========================================================================
    async def get_activity_detail(
        self,
        activity_id: UUID,
        include_sessions: bool = True,
        sessions_limit: int = 10,
    ) -> Activity:
        """
        Get detailed activity information with venue and sessions.
        
        Args:
            activity_id: The activity's UUID
            include_sessions: Whether to include upcoming sessions
            sessions_limit: Maximum sessions to return
        
        Returns:
            Activity with venue and optional sessions
        
        Raises:
            NotFoundError: If activity not found
        """
        # Build query with eager loading
        query = (
            select(Activity)
            .where(Activity.id == activity_id)
            .options(selectinload(Activity.venue))
        )
        
        # Execute query
        result = await self.db.execute(query)
        activity = result.scalar_one_or_none()
        
        if activity is None:
            raise NotFoundError(
                f"Activity with ID {activity_id} not found",
                details={"activity_id": str(activity_id)}
            )
        
        # Load upcoming sessions if requested
        if include_sessions:
            sessions = await self.get_upcoming_sessions(
                activity_id,
                limit=sessions_limit
            )
            # Attach sessions to activity (not persisted, just for response)
            activity._upcoming_sessions = sessions
        
        return activity
    
    async def get_activity_by_slug(
        self,
        venue_slug: str,
        activity_slug: str,
    ) -> Activity:
        """
        Get activity by venue and activity slugs.
        
        Args:
            venue_slug: The venue's URL slug
            activity_slug: The activity's URL slug
        
        Returns:
            Activity with venue loaded
        
        Raises:
            NotFoundError: If activity not found
        """
        # Build query with venue join
        query = (
            select(Activity)
            .join(Venue, Activity.venue_id == Venue.id)
            .where(
                and_(
                    Venue.slug == venue_slug,
                    Activity.slug == activity_slug
                )
            )
            .options(selectinload(Activity.venue))
        )
        
        # Execute
        result = await self.db.execute(query)
        activity = result.scalar_one_or_none()
        
        if activity is None:
            raise NotFoundError(
                f"Activity '{activity_slug}' at venue '{venue_slug}' not found"
            )
        
        return activity
    
    # =========================================================================
    # SESSIONS
    # =========================================================================
    async def get_upcoming_sessions(
        self,
        activity_id: UUID,
        limit: int = 10,
        from_date: Optional[date] = None,
    ) -> List[ActivitySession]:
        """
        Get upcoming sessions for an activity.
        
        Args:
            activity_id: The activity's UUID
            limit: Maximum sessions to return
            from_date: Start date for sessions (default: today)
        
        Returns:
            List of upcoming sessions
        """
        # Default to today if no date provided
        if from_date is None:
            from_date = date.today()
        
        # Build query
        query = (
            select(ActivitySession)
            .where(
                and_(
                    ActivitySession.activity_id == activity_id,
                    ActivitySession.session_date >= from_date,
                    ActivitySession.is_cancelled == False,
                )
            )
            .order_by(
                ActivitySession.session_date.asc(),
                ActivitySession.start_time.asc()
            )
            .limit(limit)
        )
        
        # Execute
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_session_by_id(
        self,
        session_id: UUID,
    ) -> ActivitySession:
        """
        Get a specific session by ID.
        
        Args:
            session_id: The session's UUID
        
        Returns:
            The session with activity loaded
        
        Raises:
            NotFoundError: If session not found
        """
        query = (
            select(ActivitySession)
            .where(ActivitySession.id == session_id)
            .options(selectinload(ActivitySession.activity))
        )
        
        result = await self.db.execute(query)
        session = result.scalar_one_or_none()
        
        if session is None:
            raise NotFoundError(
                f"Session with ID {session_id} not found"
            )
        
        return session
    
    # =========================================================================
    # VENUE ACTIVITIES
    # =========================================================================
    async def get_venue_activities(
        self,
        venue_id: UUID,
        is_active: bool = True,
    ) -> List[Activity]:
        """
        Get all activities for a specific venue.
        
        Args:
            venue_id: The venue's UUID
            is_active: Filter by active status
        
        Returns:
            List of activities at the venue
        """
        conditions = [Activity.venue_id == venue_id]
        
        if is_active is not None:
            conditions.append(Activity.is_active == is_active)
        
        query = (
            select(Activity)
            .where(and_(*conditions))
            .order_by(Activity.name.asc())
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    # =========================================================================
    # FILTERING HELPERS
    # =========================================================================
    async def get_available_categories(self) -> List[str]:
        """
        Get list of available activity categories.
        
        Returns:
            List of unique category names
        """
        query = (
            select(Activity.category)
            .where(Activity.is_active == True)
            .distinct()
            .order_by(Activity.category)
        )
        
        result = await self.db.execute(query)
        categories = [row[0] for row in result.fetchall()]
        
        return categories
    
    async def get_age_range(self) -> Dict[str, int]:
        """
        Get the range of ages supported by activities.
        
        Returns:
            Dictionary with min_age and max_age
        """
        query = select(
            func.min(Activity.min_age).label("min"),
            func.max(Activity.max_age).label("max")
        ).where(Activity.is_active == True)
        
        result = await self.db.execute(query)
        row = result.fetchone()
        
        return {
            "min_age": row.min or 0,
            "max_age": row.max or 18
        }
    
    # =========================================================================
    # STATISTICS
    # =========================================================================
    async def get_activity_statistics(
        self,
        activity_id: UUID,
    ) -> Dict[str, Any]:
        """
        Get statistics for an activity.
        
        Args:
            activity_id: The activity's UUID
        
        Returns:
            Dictionary with activity statistics
        """
        activity = await self.get_activity_detail(activity_id, include_sessions=False)
        
        # Count upcoming sessions
        today = date.today()
        session_query = select(func.count()).select_from(ActivitySession).where(
            and_(
                ActivitySession.activity_id == activity_id,
                ActivitySession.session_date >= today,
                ActivitySession.is_cancelled == False
            )
        )
        session_result = await self.db.execute(session_query)
        upcoming_sessions = session_result.scalar_one()
        
        return {
            "activity_id": str(activity_id),
            "activity_name": activity.name,
            "venue_name": activity.venue.name if activity.venue else None,
            "category": activity.category,
            "age_range": f"{activity.min_age}-{activity.max_age}",
            "duration_minutes": activity.duration_minutes,
            "credits_required": activity.credits_required,
            "upcoming_sessions": upcoming_sessions,
            "average_rating": activity.average_rating,
            "total_reviews": activity.total_reviews,
            "is_active": activity.is_active,
        }
