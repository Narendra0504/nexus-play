# =============================================================================
# NEXUS FAMILY PASS - QUALITY SCORE AND PRICING MODELS
# =============================================================================
"""
Venue Quality Scores and Mock Pricing Models Module.

This module defines models for:
    - VenueQualityScore: AI-extracted quality metrics from reviews
    - VenueMockPricing: Mock pricing for Phase 1 demo

Phase 1 Implementation:
    - 8 quality subcategories extracted by AI
    - Mock pricing based on venue type and rating
    - Weekly score updates via N8N

Phase 2 Will Add:
    - Integration with booking metrics
    - Real pricing in credits
    - Historical score tracking
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime  # Timestamp handling
from typing import Optional, TYPE_CHECKING  # Type hints
from decimal import Decimal  # Precise decimal handling

# Third-party imports
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    Integer,
    Boolean,
    DateTime,
    Numeric,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB  # PostgreSQL types
from sqlalchemy.orm import relationship, Mapped  # ORM relationships

# Local imports
from app.models.base import Base, UUIDMixin, TimestampMixin

# Type checking imports (avoid circular imports)
if TYPE_CHECKING:
    from app.models.venue import Venue


# =============================================================================
# VENUE QUALITY SCORE MODEL
# =============================================================================
class VenueQualityScore(UUIDMixin, TimestampMixin, Base):
    """
    VenueQualityScore model for AI-extracted quality metrics.
    
    Quality scores are extracted from Google reviews using LangChain + Gemini.
    Each venue has 8 quality subcategories scored on a 1-5 scale.
    
    Quality Subcategories (from PRD v7):
        1. hygiene_score: Cleanliness and hygiene standards
        2. safety_score: Safety measures and protocols
        3. teaching_score: Quality of instruction/coaching
        4. facilities_score: Quality of equipment and facilities
        5. value_score: Value for money perception
        6. ambience_score: Atmosphere and environment
        7. staff_score: Staff behavior and helpfulness
        8. location_score: Accessibility and convenience
    
    Attributes:
        id: UUID primary key (from UUIDMixin)
        created_at: Creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)
        
        # Individual Scores (1-5 scale)
        hygiene_score, safety_score, teaching_score, etc.
        
        # Aggregate
        overall_score: Weighted average of all scores
        confidence: Confidence in the scores (based on review count)
        
        # Metadata
        reviews_analyzed: Number of reviews used
        key_phrases: Extracted phrases per category
        
    Relationships:
        venue: The venue these scores belong to
    
    Example:
        ```python
        scores = VenueQualityScore(
            venue_id=venue.id,
            hygiene_score=4.5,
            safety_score=4.2,
            teaching_score=4.8,
            # ... other scores
        )
        ```
    """
    
    # =========================================================================
    # TABLE CONFIGURATION
    # =========================================================================
    __tablename__ = "venue_quality_scores"
    
    __table_args__ = (
        # Unique constraint - one score record per venue
        Index("idx_quality_scores_venue_id", "venue_id", unique=True),
        
        # Index on overall score for ranking
        Index("idx_quality_scores_overall", "overall_score"),
        
        # Table comment
        {"comment": "AI-extracted quality scores from Google reviews"},
    )
    
    # =========================================================================
    # FOREIGN KEYS
    # =========================================================================
    # Reference to the venue (one-to-one)
    venue_id: Mapped[str] = Column(
        UUID(as_uuid=True),
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="Reference to the venue (one-to-one)",
    )
    
    # =========================================================================
    # QUALITY SUBCATEGORY SCORES (1-5 SCALE)
    # =========================================================================
    # Cleanliness and hygiene standards
    hygiene_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Hygiene/cleanliness score (1-5)",
    )
    
    # Safety measures and protocols
    safety_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Safety standards score (1-5)",
    )
    
    # Quality of instruction/coaching
    teaching_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Teaching/instruction quality score (1-5)",
    )
    
    # Equipment and facilities quality
    facilities_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Facilities/equipment score (1-5)",
    )
    
    # Value for money perception
    value_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Value for money score (1-5)",
    )
    
    # Atmosphere and environment
    ambience_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Ambience/atmosphere score (1-5)",
    )
    
    # Staff behavior and helpfulness
    staff_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Staff quality score (1-5)",
    )
    
    # Accessibility and convenience
    location_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Location/accessibility score (1-5)",
    )
    
    # =========================================================================
    # AGGREGATE SCORES
    # =========================================================================
    # Overall weighted average score
    overall_score: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        index=True,
        comment="Overall weighted average score (1-5)",
    )
    
    # Confidence in the scores (0-1, based on review count and consistency)
    confidence: Mapped[float] = Column(
        Float,
        nullable=False,
        default=0.5,
        comment="Confidence in scores (0-1)",
    )
    
    # =========================================================================
    # METADATA
    # =========================================================================
    # Number of reviews analyzed to generate scores
    reviews_analyzed: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of reviews analyzed",
    )
    
    # Key phrases extracted per category
    # Format: {"hygiene": ["clean", "well-maintained"], "safety": ["secure", "safe"], ...}
    key_phrases = Column(
        JSONB,
        nullable=True,
        default=dict,
        comment="Key phrases per category (JSON)",
    )
    
    # Common positive themes mentioned
    positive_highlights = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="Common positive themes (JSON array)",
    )
    
    # Common negative themes mentioned
    negative_highlights = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="Common negative/improvement areas (JSON array)",
    )
    
    # AI-generated summary of the venue
    ai_summary: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="AI-generated summary of venue quality",
    )
    
    # =========================================================================
    # PROCESSING INFO
    # =========================================================================
    # When scores were last calculated
    last_calculated_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When scores were last calculated",
    )
    
    # AI model version used
    model_version: Mapped[Optional[str]] = Column(
        String(100),
        nullable=True,
        comment="AI model version used for scoring",
    )
    
    # =========================================================================
    # RELATIONSHIPS
    # =========================================================================
    # Venue these scores belong to
    venue: Mapped["Venue"] = relationship(
        "Venue",
        back_populates="quality_score",
    )
    
    # =========================================================================
    # PROPERTIES
    # =========================================================================
    @property
    def all_scores(self) -> dict:
        """
        Get all individual scores as a dictionary.
        
        Returns:
            dict: Dictionary of score name -> value
        """
        return {
            "hygiene": self.hygiene_score,
            "safety": self.safety_score,
            "teaching": self.teaching_score,
            "facilities": self.facilities_score,
            "value": self.value_score,
            "ambience": self.ambience_score,
            "staff": self.staff_score,
            "location": self.location_score,
        }
    
    @property
    def valid_scores(self) -> dict:
        """
        Get only non-null scores.
        
        Returns:
            dict: Dictionary of score name -> value (non-null only)
        """
        return {k: v for k, v in self.all_scores.items() if v is not None}
    
    @property
    def score_count(self) -> int:
        """
        Get count of valid (non-null) scores.
        
        Returns:
            int: Number of valid scores
        """
        return len(self.valid_scores)
    
    def calculate_overall(self) -> Optional[float]:
        """
        Calculate overall score as average of valid scores.
        
        Returns:
            Optional[float]: Average score or None if no valid scores
        """
        scores = list(self.valid_scores.values())
        if not scores:
            return None
        return sum(scores) / len(scores)


# =============================================================================
# VENUE MOCK PRICING MODEL
# =============================================================================
class VenueMockPricing(UUIDMixin, TimestampMixin, Base):
    """
    VenueMockPricing model for Phase 1 mock pricing.
    
    In Phase 1, venues have mock pricing in INR generated algorithmically
    based on venue type, rating, and location. In Phase 2, this will be
    replaced with a credit-based system.
    
    Attributes:
        id: UUID primary key (from UUIDMixin)
        created_at: Creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)
        
        # Pricing
        activity_type: Type of activity (swimming, badminton, etc.)
        weekday_price_inr: Price for weekdays in INR
        weekend_price_inr: Price for weekends in INR
        
        # Metadata
        price_source: How price was determined
        
    Relationships:
        venue: The venue this pricing belongs to
    
    Example:
        ```python
        pricing = VenueMockPricing(
            venue_id=venue.id,
            activity_type="swimming",
            weekday_price_inr=Decimal("400.00"),
            weekend_price_inr=Decimal("500.00"),
        )
        ```
    """
    
    # =========================================================================
    # TABLE CONFIGURATION
    # =========================================================================
    __tablename__ = "venue_mock_pricing"
    
    __table_args__ = (
        # Index for venue's pricing
        Index("idx_mock_pricing_venue_id", "venue_id"),
        
        # Unique constraint - one price per venue per activity type
        Index(
            "idx_mock_pricing_venue_activity",
            "venue_id",
            "activity_type",
            unique=True
        ),
        
        # Table comment
        {"comment": "Mock pricing for Phase 1 demo (INR)"},
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
    # PRICING COLUMNS
    # =========================================================================
    # Type of activity this pricing is for
    activity_type: Mapped[str] = Column(
        String(100),
        nullable=False,
        comment="Activity type (swimming, badminton, etc.)",
    )
    
    # Weekday price in INR
    weekday_price_inr: Mapped[Decimal] = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Weekday price in INR",
    )
    
    # Weekend price in INR (usually 20% higher)
    weekend_price_inr: Mapped[Decimal] = Column(
        Numeric(10, 2),
        nullable=False,
        comment="Weekend price in INR",
    )
    
    # Peak hours surcharge (if applicable)
    peak_hours_surcharge: Mapped[Decimal] = Column(
        Numeric(10, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Additional charge for peak hours",
    )
    
    # =========================================================================
    # METADATA
    # =========================================================================
    # How the price was determined
    price_source: Mapped[str] = Column(
        String(50),
        nullable=False,
        default="algorithm",
        comment="Price source: algorithm, manual, scraped",
    )
    
    # Base price before adjustments (for transparency)
    base_price: Mapped[Optional[Decimal]] = Column(
        Numeric(10, 2),
        nullable=True,
        comment="Base price before adjustments",
    )
    
    # Rating adjustment applied (percentage)
    rating_adjustment_pct: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Rating-based price adjustment (%)",
    )
    
    # Whether this pricing is active
    is_active: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="True if this pricing is active",
    )
    
    # Notes about this pricing
    notes: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="Notes about this pricing",
    )
    
    # =========================================================================
    # RELATIONSHIPS
    # =========================================================================
    # Venue this pricing belongs to
    venue: Mapped["Venue"] = relationship(
        "Venue",
        back_populates="mock_pricing",
    )
    
    # =========================================================================
    # PROPERTIES
    # =========================================================================
    @property
    def average_price(self) -> Decimal:
        """
        Get average of weekday and weekend prices.
        
        Returns:
            Decimal: Average price in INR
        """
        return (self.weekday_price_inr + self.weekend_price_inr) / 2
    
    @property
    def weekend_premium_pct(self) -> float:
        """
        Calculate weekend premium percentage.
        
        Returns:
            float: Weekend premium as percentage
        """
        if self.weekday_price_inr == 0:
            return 0
        return float(
            (self.weekend_price_inr - self.weekday_price_inr) 
            / self.weekday_price_inr * 100
        )
    
    @property
    def price_display(self) -> str:
        """
        Get formatted price for display.
        
        Returns:
            str: Formatted price range (e.g., "₹400 - ₹500")
        """
        return f"₹{self.weekday_price_inr:.0f} - ₹{self.weekend_price_inr:.0f}"
