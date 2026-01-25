# =============================================================================
# NEXUS FAMILY PASS - BASE SERVICE CLASS
# =============================================================================
"""
Base Service Class Module.

This module provides an abstract base class for all services in the application.
It includes common functionality like:
    - Database session management
    - Logging configuration
    - Pagination helpers
    - Common query patterns

All service classes should inherit from BaseService to ensure consistent
behavior across the application.

Design Pattern: Template Method Pattern
    - BaseService defines the skeleton of operations
    - Subclasses implement specific business logic
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from abc import ABC  # Abstract base class support
from typing import TypeVar, Generic, Type, Optional, List, Tuple, Any  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from sqlalchemy import select, func  # SQLAlchemy query building
from sqlalchemy.ext.asyncio import AsyncSession  # Async session type
from sqlalchemy.orm import selectinload  # Eager loading

# Local imports
from app.models.base import Base  # Base model class
from app.core.logging_config import get_logger  # Logging
from app.core.exceptions import NotFoundError, DatabaseError  # Exceptions

# =============================================================================
# TYPE VARIABLES
# =============================================================================
# Generic type for model classes
ModelType = TypeVar("ModelType", bound=Base)


# =============================================================================
# BASE SERVICE CLASS
# =============================================================================
class BaseService(ABC, Generic[ModelType]):
    """
    Abstract base class for all services.
    
    This class provides common functionality for database operations
    and serves as a foundation for all service classes.
    
    Type Parameters:
        ModelType: The SQLAlchemy model class this service manages
    
    Attributes:
        db: AsyncSession - The database session
        model: Type[ModelType] - The model class
        logger: Logger - Logging instance for this service
    
    Example:
        ```python
        class VenueService(BaseService[Venue]):
            def __init__(self, db: AsyncSession):
                super().__init__(db, Venue)
            
            async def get_active_venues(self):
                return await self.list_by_filters(is_active=True)
        ```
    """
    
    def __init__(
        self,
        db: AsyncSession,
        model: Type[ModelType],
    ) -> None:
        """
        Initialize the base service.
        
        Args:
            db: The async database session
            model: The SQLAlchemy model class this service manages
        """
        # Store the database session
        # This session is used for all database operations
        self.db = db
        
        # Store the model class
        # Used for query building and type checking
        self.model = model
        
        # Create a logger instance for this service
        # Using the module name + class name for clear identification
        self.logger = get_logger(f"{__name__}.{self.__class__.__name__}")
    
    # =========================================================================
    # CRUD OPERATIONS
    # =========================================================================
    async def get_by_id(
        self,
        id: UUID,
        load_relations: Optional[List[str]] = None,
    ) -> Optional[ModelType]:
        """
        Get a single record by its ID.
        
        Args:
            id: The UUID of the record to retrieve
            load_relations: Optional list of relationship names to eager load
        
        Returns:
            The model instance if found, None otherwise
        
        Example:
            ```python
            venue = await venue_service.get_by_id(venue_id)
            venue_with_activities = await venue_service.get_by_id(
                venue_id, 
                load_relations=["activities"]
            )
            ```
        """
        try:
            # Build the base query
            query = select(self.model).where(self.model.id == id)
            
            # Add eager loading for specified relationships
            if load_relations:
                for relation in load_relations:
                    # Get the relationship attribute from the model
                    if hasattr(self.model, relation):
                        query = query.options(
                            selectinload(getattr(self.model, relation))
                        )
            
            # Execute the query
            result = await self.db.execute(query)
            
            # Return the single result or None
            return result.scalar_one_or_none()
            
        except Exception as e:
            self.logger.error(
                f"Error fetching {self.model.__name__} by ID: {e}",
                extra={"id": str(id)}
            )
            raise DatabaseError(f"Failed to fetch {self.model.__name__}")
    
    async def get_by_id_or_raise(
        self,
        id: UUID,
        load_relations: Optional[List[str]] = None,
    ) -> ModelType:
        """
        Get a single record by ID, raising NotFoundError if not found.
        
        Args:
            id: The UUID of the record to retrieve
            load_relations: Optional list of relationships to eager load
        
        Returns:
            The model instance
        
        Raises:
            NotFoundError: If no record with the given ID exists
        
        Example:
            ```python
            # Will raise NotFoundError if venue doesn't exist
            venue = await venue_service.get_by_id_or_raise(venue_id)
            ```
        """
        record = await self.get_by_id(id, load_relations)
        
        if record is None:
            raise NotFoundError(
                f"{self.model.__name__} with ID {id} not found",
                details={"id": str(id)}
            )
        
        return record
    
    async def get_by_slug(
        self,
        slug: str,
        load_relations: Optional[List[str]] = None,
    ) -> Optional[ModelType]:
        """
        Get a single record by its slug (URL-friendly identifier).
        
        Args:
            slug: The URL slug of the record
            load_relations: Optional list of relationships to eager load
        
        Returns:
            The model instance if found, None otherwise
        
        Note:
            Only works for models that have a 'slug' column.
        """
        # Check if model has slug attribute
        if not hasattr(self.model, "slug"):
            raise AttributeError(f"{self.model.__name__} does not have a slug column")
        
        try:
            # Build the query
            query = select(self.model).where(self.model.slug == slug)
            
            # Add eager loading
            if load_relations:
                for relation in load_relations:
                    if hasattr(self.model, relation):
                        query = query.options(
                            selectinload(getattr(self.model, relation))
                        )
            
            # Execute
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
            
        except Exception as e:
            self.logger.error(
                f"Error fetching {self.model.__name__} by slug: {e}",
                extra={"slug": slug}
            )
            raise DatabaseError(f"Failed to fetch {self.model.__name__}")
    
    async def list_all(
        self,
        page: int = 1,
        page_size: int = 20,
        load_relations: Optional[List[str]] = None,
    ) -> Tuple[List[ModelType], int]:
        """
        List all records with pagination.
        
        Args:
            page: Page number (1-indexed)
            page_size: Number of items per page
            load_relations: Optional list of relationships to eager load
        
        Returns:
            Tuple of (list of records, total count)
        
        Example:
            ```python
            venues, total = await venue_service.list_all(page=1, page_size=20)
            ```
        """
        try:
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Build the query for records
            query = select(self.model).offset(offset).limit(page_size)
            
            # Add eager loading
            if load_relations:
                for relation in load_relations:
                    if hasattr(self.model, relation):
                        query = query.options(
                            selectinload(getattr(self.model, relation))
                        )
            
            # Execute main query
            result = await self.db.execute(query)
            records = list(result.scalars().all())
            
            # Get total count
            count_query = select(func.count()).select_from(self.model)
            count_result = await self.db.execute(count_query)
            total = count_result.scalar_one()
            
            return records, total
            
        except Exception as e:
            self.logger.error(f"Error listing {self.model.__name__}: {e}")
            raise DatabaseError(f"Failed to list {self.model.__name__}")
    
    async def create(self, obj_in: dict) -> ModelType:
        """
        Create a new record.
        
        Args:
            obj_in: Dictionary of field values for the new record
        
        Returns:
            The created model instance
        
        Example:
            ```python
            venue = await venue_service.create({
                "name": "Swimming Academy",
                "city": "Bangalore",
            })
            ```
        """
        try:
            # Create model instance from dictionary
            db_obj = self.model(**obj_in)
            
            # Add to session
            self.db.add(db_obj)
            
            # Commit the transaction
            await self.db.commit()
            
            # Refresh to get generated values (like ID, timestamps)
            await self.db.refresh(db_obj)
            
            self.logger.info(
                f"Created {self.model.__name__}",
                extra={"id": str(db_obj.id)}
            )
            
            return db_obj
            
        except Exception as e:
            # Rollback on error
            await self.db.rollback()
            self.logger.error(f"Error creating {self.model.__name__}: {e}")
            raise DatabaseError(f"Failed to create {self.model.__name__}")
    
    async def update(
        self,
        id: UUID,
        obj_in: dict,
    ) -> ModelType:
        """
        Update an existing record.
        
        Args:
            id: The UUID of the record to update
            obj_in: Dictionary of fields to update
        
        Returns:
            The updated model instance
        
        Raises:
            NotFoundError: If record not found
        
        Example:
            ```python
            venue = await venue_service.update(venue_id, {"name": "New Name"})
            ```
        """
        # Get existing record
        db_obj = await self.get_by_id_or_raise(id)
        
        try:
            # Update fields
            for field, value in obj_in.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)
            
            # Commit changes
            await self.db.commit()
            
            # Refresh to get any computed values
            await self.db.refresh(db_obj)
            
            self.logger.info(
                f"Updated {self.model.__name__}",
                extra={"id": str(id)}
            )
            
            return db_obj
            
        except Exception as e:
            await self.db.rollback()
            self.logger.error(
                f"Error updating {self.model.__name__}: {e}",
                extra={"id": str(id)}
            )
            raise DatabaseError(f"Failed to update {self.model.__name__}")
    
    async def delete(self, id: UUID) -> bool:
        """
        Delete a record by ID.
        
        Args:
            id: The UUID of the record to delete
        
        Returns:
            True if deleted successfully
        
        Raises:
            NotFoundError: If record not found
        
        Example:
            ```python
            await venue_service.delete(venue_id)
            ```
        """
        # Get existing record
        db_obj = await self.get_by_id_or_raise(id)
        
        try:
            # Delete the record
            await self.db.delete(db_obj)
            
            # Commit the deletion
            await self.db.commit()
            
            self.logger.info(
                f"Deleted {self.model.__name__}",
                extra={"id": str(id)}
            )
            
            return True
            
        except Exception as e:
            await self.db.rollback()
            self.logger.error(
                f"Error deleting {self.model.__name__}: {e}",
                extra={"id": str(id)}
            )
            raise DatabaseError(f"Failed to delete {self.model.__name__}")
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    async def exists(self, id: UUID) -> bool:
        """
        Check if a record with the given ID exists.
        
        Args:
            id: The UUID to check
        
        Returns:
            True if exists, False otherwise
        """
        query = select(func.count()).select_from(self.model).where(
            self.model.id == id
        )
        result = await self.db.execute(query)
        count = result.scalar_one()
        return count > 0
    
    async def count(self) -> int:
        """
        Get the total count of records.
        
        Returns:
            Total number of records
        """
        query = select(func.count()).select_from(self.model)
        result = await self.db.execute(query)
        return result.scalar_one()
    
    def calculate_pagination(
        self,
        total: int,
        page: int,
        page_size: int,
    ) -> dict:
        """
        Calculate pagination metadata.
        
        Args:
            total: Total number of records
            page: Current page number
            page_size: Items per page
        
        Returns:
            Dictionary with pagination info
        """
        total_pages = max(1, (total + page_size - 1) // page_size)
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        }
