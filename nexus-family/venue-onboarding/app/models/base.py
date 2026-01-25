# =============================================================================
# NEXUS FAMILY PASS - BASE MODEL CLASSES
# =============================================================================
"""
Base Model Classes and Mixins Module.

This module provides the foundational classes for all SQLAlchemy models
in the application. It includes:
    - Base: The declarative base class
    - UUIDMixin: Adds UUID primary key
    - TimestampMixin: Adds created_at/updated_at timestamps

Using mixins allows for consistent behavior across all models while
keeping the code DRY (Don't Repeat Yourself).

Usage:
    ```python
    from app.models.base import Base, UUIDMixin, TimestampMixin
    
    class MyModel(UUIDMixin, TimestampMixin, Base):
        __tablename__ = "my_table"
        name = Column(String(255), nullable=False)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import uuid  # UUID generation
from datetime import datetime  # Timestamp handling
from typing import Any  # Type hints

# Third-party imports
from sqlalchemy import Column, DateTime, String, event
from sqlalchemy.dialects.postgresql import UUID  # PostgreSQL UUID type
from sqlalchemy.orm import DeclarativeBase, declared_attr  # ORM utilities


# =============================================================================
# DECLARATIVE BASE CLASS
# =============================================================================
class Base(DeclarativeBase):
    """
    SQLAlchemy Declarative Base Class.
    
    This is the base class for all SQLAlchemy models in the application.
    All models should inherit from this class (directly or via mixins).
    
    The class provides:
        - Type annotations for mapped columns
        - Registry for all models
        - Metadata for migrations
    
    Example:
        ```python
        class User(Base):
            __tablename__ = "users"
            id = Column(Integer, primary_key=True)
            name = Column(String(100))
        ```
    """
    
    # Type annotation map for SQLAlchemy 2.0
    # This allows using Python types in column definitions
    type_annotation_map = {
        str: String(255),  # Default string length
    }
    
    def to_dict(self) -> dict[str, Any]:
        """
        Convert model instance to dictionary.
        
        This is useful for serialization and debugging.
        Excludes SQLAlchemy internal attributes.
        
        Returns:
            dict: Dictionary representation of the model
            
        Example:
            ```python
            venue = await db.get(Venue, venue_id)
            venue_dict = venue.to_dict()
            ```
        """
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
    
    def __repr__(self) -> str:
        """
        String representation of the model.
        
        Returns a readable string showing the class name and primary key.
        
        Returns:
            str: Representation string
        """
        # Get primary key columns
        pk_columns = [col.name for col in self.__table__.primary_key.columns]
        pk_values = [getattr(self, col, None) for col in pk_columns]
        
        # Format as "ClassName(pk1=value1, pk2=value2)"
        pk_str = ", ".join(f"{k}={v}" for k, v in zip(pk_columns, pk_values))
        return f"{self.__class__.__name__}({pk_str})"


# =============================================================================
# UUID MIXIN
# =============================================================================
class UUIDMixin:
    """
    Mixin that adds a UUID primary key to models.
    
    This mixin adds an `id` column that uses PostgreSQL's UUID type.
    UUIDs are generated automatically using Python's uuid4().
    
    Benefits of UUIDs:
        - Globally unique across all tables and databases
        - Can be generated client-side (no round-trip to DB)
        - No sequential guessing (security benefit)
        - Safe for distributed systems
    
    Example:
        ```python
        class Venue(UUIDMixin, Base):
            __tablename__ = "venues"
            name = Column(String(255))
        
        # id is automatically added as UUID primary key
        venue = Venue(name="Swimming Pool")
        # venue.id is auto-generated UUID
        ```
    """
    
    @declared_attr
    def id(cls) -> Column:
        """
        UUID primary key column.
        
        Uses PostgreSQL's native UUID type for efficient storage
        and indexing. Default value is generated using uuid4().
        
        Returns:
            Column: UUID primary key column definition
        """
        return Column(
            # Use PostgreSQL's native UUID type
            UUID(as_uuid=True),
            
            # This is the primary key
            primary_key=True,
            
            # Generate UUID automatically if not provided
            default=uuid.uuid4,
            
            # Don't allow NULL values
            nullable=False,
            
            # Add a comment for documentation
            comment="Unique identifier (UUID v4)",
        )


# =============================================================================
# TIMESTAMP MIXIN
# =============================================================================
class TimestampMixin:
    """
    Mixin that adds created_at and updated_at timestamps to models.
    
    This mixin adds automatic timestamp tracking:
        - created_at: Set once when the record is created
        - updated_at: Updated automatically on every modification
    
    The timestamps use timezone-aware UTC datetime for consistency
    across different server locations.
    
    Example:
        ```python
        class Venue(TimestampMixin, Base):
            __tablename__ = "venues"
            name = Column(String(255))
        
        venue = Venue(name="Pool")
        # venue.created_at and venue.updated_at are auto-set
        ```
    """
    
    @declared_attr
    def created_at(cls) -> Column:
        """
        Timestamp for record creation.
        
        This column is set automatically when the record is first
        inserted into the database. It's never updated after that.
        
        Returns:
            Column: DateTime column with creation timestamp
        """
        return Column(
            # Use DateTime with timezone awareness
            DateTime(timezone=True),
            
            # Set to current UTC time on insert
            default=datetime.utcnow,
            
            # Don't allow NULL values
            nullable=False,
            
            # Documentation comment
            comment="Timestamp when record was created (UTC)",
        )
    
    @declared_attr
    def updated_at(cls) -> Column:
        """
        Timestamp for last record update.
        
        This column is set on insert and updated automatically
        every time the record is modified.
        
        Returns:
            Column: DateTime column with update timestamp
        """
        return Column(
            # Use DateTime with timezone awareness
            DateTime(timezone=True),
            
            # Set to current UTC time on insert
            default=datetime.utcnow,
            
            # Update to current UTC time on every update
            onupdate=datetime.utcnow,
            
            # Don't allow NULL values
            nullable=False,
            
            # Documentation comment
            comment="Timestamp when record was last updated (UTC)",
        )


# =============================================================================
# SOFT DELETE MIXIN (OPTIONAL)
# =============================================================================
class SoftDeleteMixin:
    """
    Mixin that adds soft delete functionality to models.
    
    Instead of permanently deleting records, soft delete marks them
    as deleted while keeping the data in the database. This is useful
    for audit trails and data recovery.
    
    Usage:
        - Set is_deleted=True instead of deleting
        - Filter by is_deleted=False in queries
        - Use deleted_at to track when deletion occurred
    
    Example:
        ```python
        class Venue(SoftDeleteMixin, Base):
            __tablename__ = "venues"
        
        # Soft delete
        venue.is_deleted = True
        venue.deleted_at = datetime.utcnow()
        await db.commit()
        
        # Query only active records
        query = select(Venue).where(Venue.is_deleted == False)
        ```
    """
    
    @declared_attr
    def is_deleted(cls) -> Column:
        """
        Boolean flag indicating if the record is soft-deleted.
        
        Returns:
            Column: Boolean column for soft delete flag
        """
        from sqlalchemy import Boolean
        return Column(
            Boolean,
            default=False,
            nullable=False,
            index=True,  # Index for efficient filtering
            comment="True if record is soft-deleted",
        )
    
    @declared_attr
    def deleted_at(cls) -> Column:
        """
        Timestamp when the record was soft-deleted.
        
        Returns:
            Column: DateTime column for deletion timestamp
        """
        return Column(
            DateTime(timezone=True),
            nullable=True,  # NULL until deleted
            comment="Timestamp when record was soft-deleted (UTC)",
        )


# =============================================================================
# ACTIVE STATUS MIXIN
# =============================================================================
class ActiveStatusMixin:
    """
    Mixin that adds an is_active flag to models.
    
    This is useful for enabling/disabling records without deleting them.
    Common use cases: pausing venues, disabling activities, etc.
    
    Example:
        ```python
        class Venue(ActiveStatusMixin, Base):
            __tablename__ = "venues"
        
        # Disable a venue
        venue.is_active = False
        await db.commit()
        
        # Query only active venues
        query = select(Venue).where(Venue.is_active == True)
        ```
    """
    
    @declared_attr
    def is_active(cls) -> Column:
        """
        Boolean flag indicating if the record is active.
        
        Returns:
            Column: Boolean column for active status
        """
        from sqlalchemy import Boolean
        return Column(
            Boolean,
            default=True,
            nullable=False,
            index=True,  # Index for efficient filtering
            comment="True if record is active and visible",
        )
