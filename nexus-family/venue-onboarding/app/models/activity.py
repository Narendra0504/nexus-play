# =============================================================================
# NEXUS FAMILY PASS - ACTIVITY MODELS
# =============================================================================
"""
Activity and ActivitySession Models Module.

This module defines the Activity and ActivitySession models representing
activities offered at venues and their scheduled time slots.

Phase 1 Implementation:
    - Activities are inferred from venue data and reviews
    - ActivitySessions are generated with mock schedules
    - Basic metadata for display and filtering

Phase 2 Will Add:
    - Full activity management by venue admins
    - Real session scheduling
    - Capacity management
    - Booking integration
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import time, date  # Time handling
from typing import Optional, List, TYPE_CHECKING  # Type hints

# Third-party imports
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    Integer,
    Boolean,
    Date,
    Time,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB  # PostgreSQL types
from sqlalchemy.orm import relationship, Mapped  # ORM relationships
from pgvector.sqlalchemy import Vector  # pgvector extension

# Local imports
from app.models.base import Base, UUIDMixin, TimestampMixin, ActiveStatusMixin
from app.config import settings  # For embedding dimension

# Type checking imports (avoid circular imports)
if TYPE_CHECKING:
    from app.models.venue import Venue


# =============================================================================
# ACTIVITY MODEL
# =============================================================================
class Activity(UUIDMixin, TimestampMixin, ActiveStatusMixin, Base):
    """
    Activity model representing activity types offered at venues.
    
    Activities are the core offerings that children can book.
    In Phase 1, activities are inferred from venue type and reviews
    using AI. In Phase 2, venues will manage their own activities.
    
    Attributes:
        id: UUID primary key (from UUIDMixin)
        created_at: Creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)
        is_active: Active status flag (from ActiveStatusMixin)
        
        # Core Information
        name: Activity name
        slug: URL-friendly identifier
        short_description: Brief description (150 chars)
        full_description: Detailed description
        category: Activity category (stem, arts, sports, etc.)
        
        # Requirements
        min_age: Minimum age requirement
        max_age: Maximum age requirement
        duration_minutes: Session duration
        
        # Pricing (Phase 1: mock, Phase 2: credits)
        credits_required: Credits needed to book
        
        # AI/ML
        description_embedding: Vector embedding for semantic search
        
        # Metadata
        activity_tags: Tags for filtering (JSON)
        learning_outcomes: What children learn (JSON array)
        what_to_bring: Items to bring (JSON array)
        
    Relationships:
        venue: The venue offering this activity
        sessions: Scheduled sessions for this activity
    
    Example:
        ```python
        activity = Activity(
            name="Swimming Lessons",
            venue_id=venue.id,
            category="sports",
            min_age=5,
            max_age=12,
            duration_minutes=60,
            credits_required=2,
        )
        ```
    """
    
    # =========================================================================
    # TABLE CONFIGURATION
    # =========================================================================
    __tablename__ = "activities"
    
    __table_args__ = (
        # Index for venue's activities
        Index("idx_activities_venue_id", "venue_id"),
        
        # Index for category filtering
        Index("idx_activities_category", "category"),
        
        # Index for age range filtering
        Index("idx_activities_age_range", "min_age", "max_age"),
        
        # Composite index for active activities by category
        Index(
            "idx_activities_active_category",
            "category",
            "is_active",
            postgresql_where="is_active = true"
        ),
        
        # Table comment
        {"comment": "Activities offered at venues, inferred by AI in Phase 1"},
    )
    
    # =========================================================================
    # FOREIGN KEYS
    # =========================================================================
    # Reference to the venue offering this activity
    venue_id: Mapped[str] = Column(
        UUID(as_uuid=True),
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to the venue offering this activity",
    )
    
    # =========================================================================
    # CORE INFORMATION COLUMNS
    # =========================================================================
    # Activity name as displayed to users
    name: Mapped[str] = Column(
        String(255),
        nullable=False,
        comment="Activity name",
    )
    
    # URL-friendly identifier
    slug: Mapped[str] = Column(
        String(255),
        nullable=False,
        comment="URL-friendly identifier",
    )
    
    # Brief description for cards (150 char limit)
    short_description: Mapped[Optional[str]] = Column(
        String(150),
        nullable=True,
        comment="Brief description for cards (150 chars max)",
    )
    
    # Full activity description
    full_description: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="Full description of the activity",
    )
    
    # Activity category for filtering
    category: Mapped[str] = Column(
        String(50),
        nullable=False,
        index=True,
        comment="Activity category (stem, arts, sports, etc.)",
    )
    
    # =========================================================================
    # REQUIREMENTS
    # =========================================================================
    # Minimum age requirement
    min_age: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=3,
        comment="Minimum age requirement",
    )
    
    # Maximum age requirement
    max_age: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=15,
        comment="Maximum age requirement",
    )
    
    # Session duration in minutes
    duration_minutes: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=60,
        comment="Session duration in minutes",
    )
    
    # Maximum participants per session
    capacity_per_session: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=15,
        comment="Maximum participants per session",
    )
    
    # =========================================================================
    # PRICING (PHASE 1: MOCK)
    # =========================================================================
    # Credits required to book (Phase 2 integration)
    credits_required: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=2,
        comment="Credits required to book this activity",
    )
    
    # =========================================================================
    # AI/ML COLUMNS
    # =========================================================================
    # Vector embedding for semantic search
    description_embedding = Column(
        Vector(settings.EMBEDDING_DIMENSION),
        nullable=True,
        comment=f"Vector embedding ({settings.EMBEDDING_DIMENSION}D) for semantic search",
    )
    
    # Flag indicating embedding needs regeneration
    embedding_outdated: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="True if embedding needs regeneration",
    )
    
    # =========================================================================
    # METADATA (JSONB)
    # =========================================================================
    # Activity tags for filtering
    # Format: {"indoor": true, "messy": false, "competitive": false, ...}
    activity_tags = Column(
        JSONB,
        nullable=True,
        default=dict,
        comment="Activity tags for filtering (JSON)",
    )
    
    # Learning outcomes
    # Format: ["Learn basic coding", "Build a robot", ...]
    learning_outcomes = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="What children will learn (JSON array)",
    )
    
    # Items to bring
    # Format: ["Comfortable clothes", "Water bottle", ...]
    what_to_bring = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="Items participants should bring (JSON array)",
    )
    
    # Accessibility features
    accessibility_features = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="Accessibility features available (JSON array)",
    )
    
    # Photo URLs
    photos_urls = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="Array of photo URLs",
    )
    
    # =========================================================================
    # SKILL LEVEL
    # =========================================================================
    skill_level: Mapped[str] = Column(
        String(20),
        nullable=False,
        default="beginner",
        comment="Skill level: beginner, intermediate, advanced",
    )
    
    # Whether parent must attend
    parent_attendance_required: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="True if parent must attend with child",
    )
    
    # =========================================================================
    # DENORMALIZED METRICS
    # =========================================================================
    # Average rating (computed from reviews)
    average_rating: Mapped[float] = Column(
        Float,
        nullable=False,
        default=0.0,
        comment="Average rating from reviews (1-5)",
    )
    
    # Total number of reviews
    total_reviews: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Total number of reviews",
    )
    
    # Total bookings count
    total_bookings: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Total number of bookings",
    )
    
    # =========================================================================
    # RELATIONSHIPS
    # =========================================================================
    # Venue offering this activity
    venue: Mapped["Venue"] = relationship(
        "Venue",
        back_populates="activities",
    )
    
    # Scheduled sessions
    sessions: Mapped[List["ActivitySession"]] = relationship(
        "ActivitySession",
        back_populates="activity",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    
    # =========================================================================
    # PROPERTIES
    # =========================================================================
    @property
    def age_range_display(self) -> str:
        """
        Get formatted age range for display.
        
        Returns:
            str: Formatted age range (e.g., "Ages 5-12")
        """
        return f"Ages {self.min_age}-{self.max_age}"
    
    @property
    def duration_display(self) -> str:
        """
        Get formatted duration for display.
        
        Returns:
            str: Formatted duration (e.g., "1 hour", "90 mins")
        """
        if self.duration_minutes >= 60:
            hours = self.duration_minutes // 60
            mins = self.duration_minutes % 60
            if mins == 0:
                return f"{hours} hour{'s' if hours > 1 else ''}"
            return f"{hours}h {mins}m"
        return f"{self.duration_minutes} mins"
    
    @property
    def primary_photo_url(self) -> Optional[str]:
        """
        Get the primary (first) photo URL.
        
        Returns:
            Optional[str]: First photo URL or None
        """
        if self.photos_urls and len(self.photos_urls) > 0:
            return self.photos_urls[0]
        return None


# =============================================================================
# ACTIVITY SESSION MODEL
# =============================================================================
class ActivitySession(UUIDMixin, TimestampMixin, Base):
    """
    ActivitySession model representing scheduled time slots for activities.
    
    Sessions are specific instances of an activity at a particular date/time.
    In Phase 1, sessions are generated with mock schedules.
    In Phase 2, venues will manage real schedules.
    
    Attributes:
        id: UUID primary key (from UUIDMixin)
        created_at: Creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)
        
        # Schedule
        session_date: Date of the session
        start_time: Session start time
        end_time: Session end time
        
        # Capacity
        total_capacity: Maximum participants
        booked_count: Current bookings
        
        # Status
        is_cancelled: Whether session is cancelled
        
    Relationships:
        activity: The activity this session belongs to
    
    Example:
        ```python
        session = ActivitySession(
            activity_id=activity.id,
            session_date=date(2024, 2, 15),
            start_time=time(10, 0),
            end_time=time(11, 0),
            total_capacity=15,
        )
        ```
    """
    
    # =========================================================================
    # TABLE CONFIGURATION
    # =========================================================================
    __tablename__ = "activity_sessions"
    
    __table_args__ = (
        # Index for activity's sessions
        Index("idx_sessions_activity_id", "activity_id"),
        
        # Index for date range queries
        Index("idx_sessions_date", "session_date"),
        
        # Composite index for available sessions
        Index(
            "idx_sessions_available",
            "activity_id",
            "session_date",
            "is_cancelled",
            postgresql_where="is_cancelled = false"
        ),
        
        # Table comment
        {"comment": "Scheduled time slots for activities"},
    )
    
    # =========================================================================
    # FOREIGN KEYS
    # =========================================================================
    # Reference to the activity
    activity_id: Mapped[str] = Column(
        UUID(as_uuid=True),
        ForeignKey("activities.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to the activity",
    )
    
    # =========================================================================
    # SCHEDULE COLUMNS
    # =========================================================================
    # Session date
    session_date: Mapped[date] = Column(
        Date,
        nullable=False,
        comment="Date of the session",
    )
    
    # Start time
    start_time: Mapped[time] = Column(
        Time,
        nullable=False,
        comment="Session start time",
    )
    
    # End time
    end_time: Mapped[time] = Column(
        Time,
        nullable=False,
        comment="Session end time",
    )
    
    # Timezone (inherited from venue but can be overridden)
    timezone: Mapped[str] = Column(
        String(50),
        nullable=False,
        default="Asia/Kolkata",
        comment="Timezone for this session",
    )
    
    # =========================================================================
    # CAPACITY
    # =========================================================================
    # Total capacity
    total_capacity: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=15,
        comment="Maximum participants",
    )
    
    # Current bookings count
    booked_count: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Current number of bookings",
    )
    
    # =========================================================================
    # STATUS
    # =========================================================================
    # Cancellation status
    is_cancelled: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="True if session is cancelled",
    )
    
    # Cancellation reason
    cancellation_reason: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="Reason for cancellation",
    )
    
    # Session completion status
    is_completed: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=False,
        comment="True if session has completed",
    )
    
    # =========================================================================
    # INSTRUCTOR (OPTIONAL)
    # =========================================================================
    instructor_name: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Instructor name (if assigned)",
    )
    
    # Session notes
    session_notes: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="Notes for this session",
    )
    
    # =========================================================================
    # RELATIONSHIPS
    # =========================================================================
    # Activity this session belongs to
    activity: Mapped["Activity"] = relationship(
        "Activity",
        back_populates="sessions",
    )
    
    # =========================================================================
    # PROPERTIES
    # =========================================================================
    @property
    def available_spots(self) -> int:
        """
        Get the number of available spots.
        
        Returns:
            int: Available spots (capacity - booked)
        """
        return max(0, self.total_capacity - self.booked_count)
    
    @property
    def is_full(self) -> bool:
        """
        Check if session is fully booked.
        
        Returns:
            bool: True if no spots available
        """
        return self.available_spots == 0
    
    @property
    def time_display(self) -> str:
        """
        Get formatted time range for display.
        
        Returns:
            str: Formatted time (e.g., "10:00 AM - 11:00 AM")
        """
        start = self.start_time.strftime("%I:%M %p")
        end = self.end_time.strftime("%I:%M %p")
        return f"{start} - {end}"
