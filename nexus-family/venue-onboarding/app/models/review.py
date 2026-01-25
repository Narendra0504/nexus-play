# =============================================================================
# NEXUS FAMILY PASS - GOOGLE REVIEWS MODEL
# =============================================================================
"""
Google Reviews Model Module.

This module defines the GoogleReview model for storing reviews fetched
from the Google Places API. These reviews are used for AI quality scoring.

Phase 1 Implementation:
    - Store raw reviews from Google Places
    - Process with AI for quality scoring
    - Track processing status

Phase 2 Will Add:
    - Integration with platform reviews
    - Review aggregation
    - Sentiment trend analysis
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime  # Timestamp handling
from typing import Optional, TYPE_CHECKING  # Type hints

# Third-party imports
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID  # PostgreSQL UUID type
from sqlalchemy.orm import relationship, Mapped  # ORM relationships

# Local imports
from app.models.base import Base, UUIDMixin, TimestampMixin

# Type checking imports (avoid circular imports)
if TYPE_CHECKING:
    from app.models.venue import Venue


# =============================================================================
# GOOGLE REVIEW MODEL
# =============================================================================
class GoogleReview(UUIDMixin, TimestampMixin, Base):
    """
    GoogleReview model for storing reviews from Google Places API.
    
    Reviews are fetched from Google Places and stored for AI processing.
    The AI extracts quality scores (hygiene, safety, teaching, etc.) from
    the review text using LangChain + Gemini.
    
    Attributes:
        id: UUID primary key (from UUIDMixin)
        created_at: Creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)
        
        # Google Data
        google_review_id: Unique ID from Google
        author_name: Reviewer's name
        rating: Star rating (1-5)
        text: Review text content
        review_time: When review was posted
        language: Review language code
        
        # Processing Status
        is_processed: Whether AI has processed this review
        processed_at: When AI processing completed
        
    Relationships:
        venue: The venue this review belongs to
    
    Example:
        ```python
        review = GoogleReview(
            venue_id=venue.id,
            google_review_id="ChdDSU...",
            author_name="John D.",
            rating=5,
            text="Great swimming lessons for kids!",
            review_time=datetime.utcnow(),
        )
        ```
    """
    
    # =========================================================================
    # TABLE CONFIGURATION
    # =========================================================================
    __tablename__ = "google_reviews"
    
    __table_args__ = (
        # Index for venue's reviews
        Index("idx_google_reviews_venue_id", "venue_id"),
        
        # Index for unprocessed reviews (for AI batch processing)
        Index(
            "idx_google_reviews_unprocessed",
            "is_processed",
            postgresql_where="is_processed = false"
        ),
        
        # Index for review time (ordering)
        Index("idx_google_reviews_time", "review_time"),
        
        # Unique constraint on Google review ID
        Index("idx_google_reviews_google_id", "google_review_id", unique=True),
        
        # Table comment
        {"comment": "Reviews fetched from Google Places API for AI quality scoring"},
    )
    
    # =========================================================================
    # FOREIGN KEYS
    # =========================================================================
    # Reference to the venue
    venue_id: Mapped[str] = Column(
        UUID(as_uuid=True),
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
        comment="Reference to the venue",
    )
    
    # =========================================================================
    # GOOGLE DATA COLUMNS
    # =========================================================================
    # Unique review ID from Google (for deduplication)
    google_review_id: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        unique=True,
        comment="Unique review ID from Google Places",
    )
    
    # Reviewer's display name
    author_name: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Reviewer's display name",
    )
    
    # Author's profile photo URL
    author_photo_url: Mapped[Optional[str]] = Column(
        String(500),
        nullable=True,
        comment="Reviewer's profile photo URL",
    )
    
    # Star rating (1-5)
    rating: Mapped[int] = Column(
        Integer,
        nullable=False,
        comment="Star rating (1-5)",
    )
    
    # Review text content
    text: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="Review text content",
    )
    
    # When the review was posted on Google
    review_time: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When review was posted on Google",
    )
    
    # Relative time description from Google (e.g., "2 months ago")
    relative_time_description: Mapped[Optional[str]] = Column(
        String(100),
        nullable=True,
        comment="Relative time description from Google",
    )
    
    # Review language code (e.g., "en", "hi")
    language: Mapped[str] = Column(
        String(10),
        nullable=False,
        default="en",
        comment="Review language code",
    )
    
    # =========================================================================
    # PROCESSING STATUS
    # =========================================================================
    # Whether AI has processed this review
    is_processed: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
        comment="True if AI has processed this review",
    )
    
    # When AI processing was completed
    processed_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When AI processing was completed",
    )
    
    # AI processing model/version used
    processing_model: Mapped[Optional[str]] = Column(
        String(100),
        nullable=True,
        comment="AI model/version used for processing",
    )
    
    # Error message if processing failed
    processing_error: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="Error message if processing failed",
    )
    
    # =========================================================================
    # AI EXTRACTED DATA
    # =========================================================================
    # Detected sentiment (positive, negative, neutral)
    detected_sentiment: Mapped[Optional[str]] = Column(
        String(20),
        nullable=True,
        comment="AI-detected sentiment: positive, negative, neutral",
    )
    
    # Key phrases extracted by AI
    # Stored as comma-separated text (simple for Phase 1)
    extracted_keywords: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="AI-extracted key phrases (comma-separated)",
    )
    
    # =========================================================================
    # RELATIONSHIPS
    # =========================================================================
    # Venue this review belongs to
    venue: Mapped["Venue"] = relationship(
        "Venue",
        back_populates="google_reviews",
    )
    
    # =========================================================================
    # PROPERTIES
    # =========================================================================
    @property
    def is_positive(self) -> bool:
        """
        Check if review is positive (4-5 stars).
        
        Returns:
            bool: True if rating >= 4
        """
        return self.rating >= 4
    
    @property
    def has_text(self) -> bool:
        """
        Check if review has text content.
        
        Returns:
            bool: True if text is not empty
        """
        return bool(self.text and self.text.strip())
    
    @property
    def text_preview(self) -> str:
        """
        Get truncated preview of review text.
        
        Returns:
            str: First 100 characters with ellipsis if longer
        """
        if not self.text:
            return ""
        if len(self.text) <= 100:
            return self.text
        return self.text[:97] + "..."
