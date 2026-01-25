# =============================================================================
# NEXUS FAMILY PASS - VENUE MODEL
# =============================================================================
"""
Venue Model Module.

This module defines the Venue model representing activity providers
(gymnasiums, art studios, STEM centers, etc.) in the system.

Phase 1 Implementation:
    - Venues are discovered via Google Places API
    - Basic metadata stored from Google Places
    - pgvector embedding for semantic search
    - Relationships to activities, reviews, and quality scores

Phase 2 Will Add:
    - Full vetting and approval workflow
    - Insurance and compliance tracking
    - Block booking configuration
    - Payout information
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import Optional, List, TYPE_CHECKING  # Type hints

# Third-party imports
from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import JSONB  # PostgreSQL JSON type
from sqlalchemy.orm import relationship, Mapped  # ORM relationships
from pgvector.sqlalchemy import Vector  # pgvector extension

# Local imports
from app.models.base import Base, UUIDMixin, TimestampMixin, ActiveStatusMixin
from app.config import settings  # For embedding dimension

# Type checking imports (avoid circular imports)
if TYPE_CHECKING:
    from app.models.activity import Activity
    from app.models.review import GoogleReview
    from app.models.quality_score import VenueQualityScore, VenueMockPricing
    from app.models.vendor import VendorCredential


# =============================================================================
# VENUE MODEL
# =============================================================================
class Venue(UUIDMixin, TimestampMixin, ActiveStatusMixin, Base):
    """
    Venue model representing activity providers.
    
    Venues are the core entities that offer activities to children.
    In Phase 1, venues are discovered via Google Places API and
    enriched with AI-generated quality scores.
    
    Attributes:
        id: UUID primary key (from UUIDMixin)
        created_at: Creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)
        is_active: Active status flag (from ActiveStatusMixin)
        
        # Core Information
        name: Venue's business name
        slug: URL-friendly identifier
        short_description: Brief description (150 chars)
        full_description: Detailed description
        
        # Google Places Data
        google_place_id: Unique ID from Google Places
        data_source: Origin of data ('google_places', 'manual')
        
        # Location
        address_line1: Street address
        city: City name
        state: State/province
        postal_code: ZIP/postal code
        country: Country name
        latitude: Geographic latitude
        longitude: Geographic longitude
        
        # Contact
        contact_phone: Phone number
        website_url: Website URL
        
        # Ratings
        google_rating: Overall rating from Google (1-5)
        google_review_count: Number of Google reviews
        
        # AI/ML
        description_embedding: Vector embedding for semantic search
        
        # Metadata
        business_hours: Operating hours (JSON)
        google_types: Place types from Google (JSON array)
        photos_urls: Photo URLs (JSON array)
        
    Relationships:
        activities: Activities offered at this venue
        google_reviews: Reviews fetched from Google
        quality_score: AI-generated quality scores
        mock_pricing: Mock pricing for Phase 1
        vendor_credential: Vendor login credentials
    
    Example:
        ```python
        venue = Venue(
            name="ABC Swimming Academy",
            google_place_id="ChIJ...",
            latitude=12.9716,
            longitude=77.5946,
            city="Bangalore",
        )
        ```
    """
    
    # =========================================================================
    # TABLE CONFIGURATION
    # =========================================================================
    __tablename__ = "venues"
    
    # Table-level comment for documentation
    __table_args__ = (
        # Index for geographic queries
        Index("idx_venues_coordinates", "latitude", "longitude"),
        
        # Index for active venues by city
        Index(
            "idx_venues_active_city",
            "city",
            "is_active",
            postgresql_where="is_active = true"
        ),
        
        # Index for Google Place ID lookup
        Index("idx_venues_google_place_id", "google_place_id"),
        
        # Table comment
        {"comment": "Activity provider venues discovered from Google Places or manually added"},
    )
    
    # =========================================================================
    # CORE INFORMATION COLUMNS
    # =========================================================================
    # Venue's business name as displayed to users
    name: Mapped[str] = Column(
        String(255),
        nullable=False,
        comment="Venue's business name",
    )
    
    # URL-friendly identifier for venue pages
    # Generated from name using python-slugify
    slug: Mapped[str] = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="URL-friendly identifier",
    )
    
    # Brief description for venue cards (150 char limit per UI spec)
    short_description: Mapped[Optional[str]] = Column(
        String(150),
        nullable=True,
        comment="Brief description for cards (150 chars max)",
    )
    
    # Full venue description with details
    full_description: Mapped[Optional[str]] = Column(
        Text,
        nullable=True,
        comment="Full description of the venue",
    )
    
    # Primary category of activities offered
    primary_category: Mapped[Optional[str]] = Column(
        String(50),
        nullable=True,
        index=True,
        comment="Primary activity category (stem, arts, sports, etc.)",
    )
    
    # =========================================================================
    # DATA SOURCE TRACKING
    # =========================================================================
    # Unique ID from Google Places API
    google_place_id: Mapped[Optional[str]] = Column(
        String(255),
        unique=True,
        nullable=True,
        comment="Google Places API place_id",
    )
    
    # Origin of this venue's data
    data_source: Mapped[str] = Column(
        String(50),
        nullable=False,
        default="google_places",
        comment="Data source: google_places, manual, partner_api",
    )
    
    # Last sync with Google Places
    last_google_sync: Mapped[Optional[DateTime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last time data was synced from Google Places",
    )
    
    # =========================================================================
    # LOCATION COLUMNS
    # =========================================================================
    # Street address
    address_line1: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Street address line 1",
    )
    
    # Address line 2 (suite, unit, etc.)
    address_line2: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Street address line 2",
    )
    
    # City name
    city: Mapped[Optional[str]] = Column(
        String(100),
        nullable=True,
        index=True,
        comment="City name",
    )
    
    # State or province
    state: Mapped[Optional[str]] = Column(
        String(100),
        nullable=True,
        comment="State or province",
    )
    
    # Postal code
    postal_code: Mapped[Optional[str]] = Column(
        String(20),
        nullable=True,
        comment="ZIP or postal code",
    )
    
    # Country
    country: Mapped[str] = Column(
        String(100),
        nullable=False,
        default="India",
        comment="Country name",
    )
    
    # Geographic coordinates for distance calculations
    latitude: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Geographic latitude (-90 to 90)",
    )
    
    longitude: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Geographic longitude (-180 to 180)",
    )
    
    # =========================================================================
    # CONTACT INFORMATION
    # =========================================================================
    # Phone number
    contact_phone: Mapped[Optional[str]] = Column(
        String(50),
        nullable=True,
        comment="Contact phone number",
    )
    
    # Website URL
    website_url: Mapped[Optional[str]] = Column(
        String(500),
        nullable=True,
        comment="Venue website URL",
    )
    
    # =========================================================================
    # GOOGLE RATINGS
    # =========================================================================
    # Overall Google rating (1-5 scale)
    google_rating: Mapped[Optional[float]] = Column(
        Float,
        nullable=True,
        comment="Google Places overall rating (1-5)",
    )
    
    # Number of reviews on Google
    google_review_count: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Total number of Google reviews",
    )
    
    # =========================================================================
    # AI/ML COLUMNS
    # =========================================================================
    # Vector embedding for semantic search
    # Dimension must match the embedding model (768 for Gemini)
    description_embedding = Column(
        Vector(settings.EMBEDDING_DIMENSION),
        nullable=True,
        comment=f"Vector embedding ({settings.EMBEDDING_DIMENSION}D) for semantic search",
    )
    
    # Flag indicating embedding needs to be regenerated
    embedding_outdated: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="True if embedding needs regeneration",
    )
    
    # =========================================================================
    # METADATA (JSONB)
    # =========================================================================
    # Business hours stored as flexible JSON
    # Format: {"monday": {"open": "09:00", "close": "18:00"}, ...}
    business_hours = Column(
        JSONB,
        nullable=True,
        default=dict,
        comment="Operating hours by day of week (JSON)",
    )
    
    # Google Place types (e.g., ["gym", "health"])
    google_types = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="Google Places types array",
    )
    
    # Photo URLs from Google Places
    photos_urls = Column(
        JSONB,
        nullable=True,
        default=list,
        comment="Array of photo URLs",
    )
    
    # Additional attributes from Google
    google_attributes = Column(
        JSONB,
        nullable=True,
        default=dict,
        comment="Additional Google Places attributes",
    )
    
    # =========================================================================
    # RELATIONSHIPS
    # =========================================================================
    # Activities offered at this venue
    activities: Mapped[List["Activity"]] = relationship(
        "Activity",
        back_populates="venue",
        lazy="selectin",  # Eager load for common access patterns
        cascade="all, delete-orphan",  # Delete activities when venue is deleted
    )
    
    # Reviews from Google Places
    google_reviews: Mapped[List["GoogleReview"]] = relationship(
        "GoogleReview",
        back_populates="venue",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    
    # AI-generated quality scores (one-to-one)
    quality_score: Mapped[Optional["VenueQualityScore"]] = relationship(
        "VenueQualityScore",
        back_populates="venue",
        uselist=False,  # One-to-one relationship
        cascade="all, delete-orphan",
    )
    
    # Mock pricing records (Phase 1)
    mock_pricing: Mapped[List["VenueMockPricing"]] = relationship(
        "VenueMockPricing",
        back_populates="venue",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    
    # Vendor credentials (one-to-one)
    vendor_credential: Mapped[Optional["VendorCredential"]] = relationship(
        "VendorCredential",
        back_populates="venue",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
    # =========================================================================
    # PROPERTIES
    # =========================================================================
    @property
    def full_address(self) -> str:
        """
        Get the full formatted address.
        
        Returns:
            str: Formatted address string
        """
        parts = [
            self.address_line1,
            self.address_line2,
            self.city,
            self.state,
            self.postal_code,
            self.country,
        ]
        return ", ".join(p for p in parts if p)
    
    @property
    def has_quality_scores(self) -> bool:
        """
        Check if venue has AI quality scores.
        
        Returns:
            bool: True if quality scores exist
        """
        return self.quality_score is not None
    
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
