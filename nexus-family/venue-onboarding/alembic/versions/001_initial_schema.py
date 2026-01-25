"""Initial schema for Nexus Family Pass Phase 1

Revision ID: 001_initial_schema
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
# =============================================================================
# NEXUS FAMILY PASS - INITIAL DATABASE SCHEMA
# =============================================================================
"""
This migration creates the initial database schema for Phase 1.

Tables Created:
    - venues: Activity provider locations from Google Places
    - activities: Activity types offered at venues (AI-inferred)
    - activity_sessions: Scheduled time slots for activities
    - vendor_credentials: Vendor portal login credentials
    - google_reviews: Raw reviews from Google Places
    - venue_quality_scores: AI-generated quality scores
    - venue_mock_pricing: Mock pricing for Phase 1

Extensions:
    - pgvector: For vector embeddings (semantic search)
"""

# =============================================================================
# IMPORTS
# =============================================================================
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# =============================================================================
# REVISION IDENTIFIERS
# =============================================================================
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# =============================================================================
# UPGRADE
# =============================================================================
def upgrade() -> None:
    """
    Create initial database schema.
    
    This creates all tables needed for Phase 1 of Nexus Family Pass.
    """
    
    # =========================================================================
    # ENABLE EXTENSIONS
    # =========================================================================
    # Enable pgvector extension for vector embeddings
    # Required for semantic search functionality
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')
    
    # Enable pg_trgm for fuzzy text search (fallback when Pinecone unavailable)
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
    
    # =========================================================================
    # VENUES TABLE
    # =========================================================================
    op.create_table(
        'venues',
        # Primary key
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        
        # Google Places data
        sa.Column('google_place_id', sa.String(255), nullable=True, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False, unique=True),
        
        # Descriptions
        sa.Column('short_description', sa.String(150), nullable=True),
        sa.Column('full_description', sa.Text(), nullable=True),
        
        # Category
        sa.Column('primary_category', sa.String(50), nullable=True),
        
        # Location
        sa.Column('address_line1', sa.String(255), nullable=True),
        sa.Column('address_line2', sa.String(255), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('country', sa.String(100), nullable=True, server_default='India'),
        
        # Coordinates
        sa.Column('latitude', sa.Numeric(10, 8), nullable=True),
        sa.Column('longitude', sa.Numeric(11, 8), nullable=True),
        
        # Contact
        sa.Column('contact_phone', sa.String(50), nullable=True),
        sa.Column('website_url', sa.String(500), nullable=True),
        
        # Ratings
        sa.Column('google_rating', sa.Numeric(3, 2), nullable=True),
        sa.Column('google_review_count', sa.Integer(), nullable=False, server_default='0'),
        
        # Status
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('data_source', sa.String(50), nullable=False, server_default='google_places'),
        
        # Metadata (JSONB)
        sa.Column('business_hours', postgresql.JSONB(), nullable=True),
        sa.Column('google_types', postgresql.JSONB(), nullable=True),
        sa.Column('photos_urls', postgresql.JSONB(), nullable=True, server_default='[]'),
        
        # Vector embedding for semantic search (768 dimensions for Gemini)
        # Note: Using raw SQL for vector type as SQLAlchemy doesn't support it natively
        
        # Embedding sync tracking
        sa.Column('embedding_outdated', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_embedding_update', sa.DateTime(timezone=True), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        
        # Primary key constraint
        sa.PrimaryKeyConstraint('id'),
    )
    
    # Add vector column using raw SQL (pgvector)
    op.execute('''
        ALTER TABLE venues 
        ADD COLUMN description_embedding vector(768)
    ''')
    
    # Create indexes for venues
    op.create_index('idx_venues_slug', 'venues', ['slug'])
    op.create_index('idx_venues_google_place_id', 'venues', ['google_place_id'])
    op.create_index('idx_venues_city', 'venues', ['city'])
    op.create_index('idx_venues_category', 'venues', ['primary_category'])
    op.create_index('idx_venues_rating', 'venues', ['google_rating'])
    op.create_index('idx_venues_active', 'venues', ['is_active'])
    op.create_index('idx_venues_coordinates', 'venues', ['latitude', 'longitude'])
    
    # =========================================================================
    # ACTIVITIES TABLE
    # =========================================================================
    op.create_table(
        'activities',
        # Primary key
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        
        # Foreign key to venue
        sa.Column('venue_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Basic info
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('short_description', sa.String(150), nullable=True),
        sa.Column('full_description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(50), nullable=False),
        
        # Requirements
        sa.Column('min_age', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('max_age', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('capacity_per_session', sa.Integer(), nullable=False, server_default='15'),
        
        # Pricing
        sa.Column('credits_required', sa.Integer(), nullable=False, server_default='2'),
        
        # Metadata (JSONB)
        sa.Column('activity_tags', postgresql.JSONB(), nullable=True),
        sa.Column('learning_outcomes', postgresql.JSONB(), nullable=True, server_default='[]'),
        sa.Column('what_to_bring', postgresql.JSONB(), nullable=True, server_default='[]'),
        sa.Column('photos_urls', postgresql.JSONB(), nullable=True, server_default='[]'),
        
        # Ratings (denormalized)
        sa.Column('average_rating', sa.Numeric(3, 2), nullable=True),
        sa.Column('total_reviews', sa.Integer(), nullable=False, server_default='0'),
        
        # Status
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        
        # Embedding sync
        sa.Column('embedding_outdated', sa.Boolean(), nullable=False, server_default='true'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['venue_id'], ['venues.id'], ondelete='CASCADE'),
    )
    
    # Add vector column
    op.execute('''
        ALTER TABLE activities 
        ADD COLUMN description_embedding vector(768)
    ''')
    
    # Create indexes for activities
    op.create_index('idx_activities_venue_id', 'activities', ['venue_id'])
    op.create_index('idx_activities_category', 'activities', ['category'])
    op.create_index('idx_activities_age_range', 'activities', ['min_age', 'max_age'])
    op.create_index('idx_activities_active', 'activities', ['is_active'])
    
    # =========================================================================
    # ACTIVITY SESSIONS TABLE
    # =========================================================================
    op.create_table(
        'activity_sessions',
        # Primary key
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        
        # Foreign key to activity
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Schedule
        sa.Column('session_date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('timezone', sa.String(50), nullable=False, server_default='Asia/Kolkata'),
        
        # Capacity
        sa.Column('total_capacity', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('booked_count', sa.Integer(), nullable=False, server_default='0'),
        
        # Status
        sa.Column('is_cancelled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        
        # Instructor
        sa.Column('instructor_name', sa.String(255), nullable=True),
        sa.Column('session_notes', sa.Text(), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['activity_id'], ['activities.id'], ondelete='CASCADE'),
    )
    
    # Create indexes for sessions
    op.create_index('idx_sessions_activity_id', 'activity_sessions', ['activity_id'])
    op.create_index('idx_sessions_date', 'activity_sessions', ['session_date'])
    op.create_index('idx_sessions_available', 'activity_sessions', 
                    ['activity_id', 'session_date', 'is_cancelled'])
    
    # =========================================================================
    # VENDOR CREDENTIALS TABLE
    # =========================================================================
    op.create_table(
        'vendor_credentials',
        # Primary key
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        
        # Foreign key to venue
        sa.Column('venue_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Authentication
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        
        # Profile
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        
        # Status
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        
        # Login tracking
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login_ip', postgresql.INET(), nullable=True),
        
        # Password reset
        sa.Column('password_reset_token', sa.String(255), nullable=True),
        sa.Column('password_reset_expires_at', sa.DateTime(timezone=True), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['venue_id'], ['venues.id'], ondelete='CASCADE'),
    )
    
    # Create indexes for vendor credentials
    op.create_index('idx_vendor_creds_email', 'vendor_credentials', ['email'])
    op.create_index('idx_vendor_creds_venue_id', 'vendor_credentials', ['venue_id'])
    
    # =========================================================================
    # GOOGLE REVIEWS TABLE
    # =========================================================================
    op.create_table(
        'google_reviews',
        # Primary key
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        
        # Foreign key to venue
        sa.Column('venue_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Google data
        sa.Column('google_review_id', sa.String(255), nullable=True, unique=True),
        sa.Column('author_name', sa.String(255), nullable=True),
        sa.Column('author_url', sa.String(500), nullable=True),
        sa.Column('profile_photo_url', sa.String(500), nullable=True),
        
        # Review content
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=True),
        sa.Column('language', sa.String(10), nullable=True),
        sa.Column('relative_time_description', sa.String(100), nullable=True),
        sa.Column('review_time', sa.DateTime(timezone=True), nullable=True),
        
        # Processing status
        sa.Column('is_processed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['venue_id'], ['venues.id'], ondelete='CASCADE'),
    )
    
    # Create indexes for reviews
    op.create_index('idx_google_reviews_venue_id', 'google_reviews', ['venue_id'])
    op.create_index('idx_google_reviews_processed', 'google_reviews', ['is_processed'])
    
    # =========================================================================
    # VENUE QUALITY SCORES TABLE
    # =========================================================================
    op.create_table(
        'venue_quality_scores',
        # Primary key
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        
        # Foreign key to venue (one-to-one)
        sa.Column('venue_id', postgresql.UUID(as_uuid=True), nullable=False, unique=True),
        
        # Individual quality scores (1-5 scale)
        sa.Column('hygiene_score', sa.Numeric(3, 2), nullable=True),
        sa.Column('safety_score', sa.Numeric(3, 2), nullable=True),
        sa.Column('teaching_score', sa.Numeric(3, 2), nullable=True),
        sa.Column('facilities_score', sa.Numeric(3, 2), nullable=True),
        sa.Column('value_score', sa.Numeric(3, 2), nullable=True),
        sa.Column('ambience_score', sa.Numeric(3, 2), nullable=True),
        sa.Column('staff_score', sa.Numeric(3, 2), nullable=True),
        sa.Column('location_score', sa.Numeric(3, 2), nullable=True),
        
        # Composite score
        sa.Column('overall_score', sa.Numeric(3, 2), nullable=True),
        
        # Confidence and metadata
        sa.Column('confidence', sa.Numeric(4, 3), nullable=True),
        sa.Column('review_count_analyzed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('key_phrases', postgresql.JSONB(), nullable=True),
        
        # Processing info
        sa.Column('model_version', sa.String(50), nullable=True),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['venue_id'], ['venues.id'], ondelete='CASCADE'),
    )
    
    # Create indexes for quality scores
    op.create_index('idx_quality_scores_venue_id', 'venue_quality_scores', ['venue_id'])
    op.create_index('idx_quality_scores_overall', 'venue_quality_scores', ['overall_score'])
    
    # =========================================================================
    # VENUE MOCK PRICING TABLE
    # =========================================================================
    op.create_table(
        'venue_mock_pricing',
        # Primary key
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False,
                  server_default=sa.text('gen_random_uuid()')),
        
        # Foreign key to venue
        sa.Column('venue_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Activity type
        sa.Column('activity_type', sa.String(50), nullable=False),
        
        # Prices in INR
        sa.Column('weekday_price_inr', sa.Numeric(10, 2), nullable=False),
        sa.Column('weekend_price_inr', sa.Numeric(10, 2), nullable=False),
        
        # Source
        sa.Column('price_source', sa.String(50), nullable=False, server_default='algorithm'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text('CURRENT_TIMESTAMP')),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['venue_id'], ['venues.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('venue_id', 'activity_type', name='uq_venue_activity_pricing'),
    )
    
    # Create indexes for mock pricing
    op.create_index('idx_mock_pricing_venue_id', 'venue_mock_pricing', ['venue_id'])


# =============================================================================
# DOWNGRADE
# =============================================================================
def downgrade() -> None:
    """
    Drop all tables created in this migration.
    
    WARNING: This will delete all data! Use with caution.
    """
    # Drop tables in reverse order (to handle foreign key constraints)
    op.drop_table('venue_mock_pricing')
    op.drop_table('venue_quality_scores')
    op.drop_table('google_reviews')
    op.drop_table('vendor_credentials')
    op.drop_table('activity_sessions')
    op.drop_table('activities')
    op.drop_table('venues')
    
    # Note: Extensions are not dropped as they may be used by other applications
