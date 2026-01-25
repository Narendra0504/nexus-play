# =============================================================================
# NEXUS FAMILY PASS - COMMON SCHEMAS
# =============================================================================
"""
Common/Shared Pydantic Schemas Module.

This module contains schemas that are used across multiple modules,
including pagination, error responses, and health checks.
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime  # Timestamp handling
from typing import Any, Generic, List, Optional, TypeVar  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from pydantic import BaseModel, Field, ConfigDict  # Pydantic v2


# =============================================================================
# TYPE VARIABLES
# =============================================================================
# Generic type for paginated responses
T = TypeVar("T")


# =============================================================================
# BASE SCHEMA
# =============================================================================
class BaseSchema(BaseModel):
    """
    Base schema with common configuration.
    
    All schemas should inherit from this class to ensure
    consistent behavior and configuration.
    """
    
    # Pydantic v2 configuration
    model_config = ConfigDict(
        # Allow creating from ORM objects
        from_attributes=True,
        
        # Validate field values on assignment
        validate_assignment=True,
        
        # Use enum values instead of enum objects
        use_enum_values=True,
        
        # Populate by field name (not alias)
        populate_by_name=True,
        
        # Strip whitespace from strings
        str_strip_whitespace=True,
    )


# =============================================================================
# PAGINATION SCHEMAS
# =============================================================================
class PaginationParams(BaseModel):
    """
    Pagination query parameters.
    
    Used as a dependency in endpoints that support pagination.
    
    Attributes:
        page: Current page number (1-indexed)
        page_size: Number of items per page
        
    Example:
        ```python
        @router.get("/venues")
        async def list_venues(pagination: PaginationParams = Depends()):
            skip = (pagination.page - 1) * pagination.page_size
            limit = pagination.page_size
        ```
    """
    
    # Current page number (1-indexed for user-friendliness)
    page: int = Field(
        default=1,
        ge=1,
        le=1000,
        description="Page number (1-indexed)",
    )
    
    # Items per page
    page_size: int = Field(
        default=20,
        ge=1,
        le=100,
        description="Number of items per page",
    )
    
    @property
    def offset(self) -> int:
        """
        Calculate the offset for database queries.
        
        Returns:
            int: Number of items to skip
        """
        return (self.page - 1) * self.page_size
    
    @property
    def limit(self) -> int:
        """
        Get the limit for database queries.
        
        Returns:
            int: Maximum items to return
        """
        return self.page_size


class PaginatedResponse(BaseSchema, Generic[T]):
    """
    Generic paginated response wrapper.
    
    Wraps a list of items with pagination metadata.
    
    Attributes:
        items: List of items for the current page
        total: Total number of items across all pages
        page: Current page number
        page_size: Items per page
        total_pages: Total number of pages
        has_next: Whether there are more pages
        has_prev: Whether there are previous pages
    
    Example:
        ```python
        return PaginatedResponse(
            items=venues,
            total=100,
            page=1,
            page_size=20,
        )
        ```
    """
    
    # List of items for this page
    items: List[T] = Field(
        ...,
        description="List of items for the current page",
    )
    
    # Total number of items
    total: int = Field(
        ...,
        ge=0,
        description="Total number of items",
    )
    
    # Current page number
    page: int = Field(
        ...,
        ge=1,
        description="Current page number",
    )
    
    # Items per page
    page_size: int = Field(
        ...,
        ge=1,
        description="Items per page",
    )
    
    @property
    def total_pages(self) -> int:
        """
        Calculate total number of pages.
        
        Returns:
            int: Total pages
        """
        if self.total == 0:
            return 1
        return (self.total + self.page_size - 1) // self.page_size
    
    @property
    def has_next(self) -> bool:
        """
        Check if there are more pages.
        
        Returns:
            bool: True if more pages exist
        """
        return self.page < self.total_pages
    
    @property
    def has_prev(self) -> bool:
        """
        Check if there are previous pages.
        
        Returns:
            bool: True if previous pages exist
        """
        return self.page > 1


# =============================================================================
# HEALTH CHECK SCHEMAS
# =============================================================================
class ServiceHealth(BaseSchema):
    """
    Health status of a single service/dependency.
    
    Attributes:
        name: Service name
        status: Health status (healthy, unhealthy, degraded)
        latency_ms: Response time in milliseconds
        message: Additional status message
    """
    
    name: str = Field(..., description="Service name")
    status: str = Field(..., description="Status: healthy, unhealthy, degraded")
    latency_ms: Optional[float] = Field(None, description="Response time in ms")
    message: Optional[str] = Field(None, description="Status message")


class HealthResponse(BaseSchema):
    """
    Application health check response.
    
    Attributes:
        status: Overall health status
        version: Application version
        environment: Current environment
        timestamp: When health was checked
        services: Status of individual services
    """
    
    status: str = Field(
        ...,
        description="Overall status: healthy, unhealthy, degraded",
    )
    version: str = Field(
        ...,
        description="Application version",
    )
    environment: str = Field(
        ...,
        description="Current environment",
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="Health check timestamp",
    )
    services: List[ServiceHealth] = Field(
        default_factory=list,
        description="Status of individual services",
    )


# =============================================================================
# ERROR RESPONSE SCHEMAS
# =============================================================================
class ErrorDetail(BaseSchema):
    """
    Detailed error information.
    
    Attributes:
        field: Field that caused the error (if applicable)
        message: Error message
        code: Error code
    """
    
    field: Optional[str] = Field(None, description="Field name")
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class ErrorResponse(BaseSchema):
    """
    Standard error response format.
    
    All API errors return this format for consistency.
    
    Attributes:
        error: Error type/code
        message: Human-readable error message
        details: Additional error details
        request_id: Request ID for tracing
    """
    
    error: str = Field(
        ...,
        description="Error type/code",
    )
    message: str = Field(
        ...,
        description="Human-readable error message",
    )
    details: Optional[List[ErrorDetail]] = Field(
        None,
        description="Additional error details",
    )
    request_id: Optional[str] = Field(
        None,
        description="Request ID for tracing",
    )


# =============================================================================
# SUCCESS RESPONSE SCHEMAS
# =============================================================================
class SuccessResponse(BaseSchema):
    """
    Standard success response for actions.
    
    Used for operations that don't return data (e.g., delete).
    
    Attributes:
        success: Whether operation succeeded
        message: Success message
        data: Optional additional data
    """
    
    success: bool = Field(
        default=True,
        description="Whether operation succeeded",
    )
    message: str = Field(
        ...,
        description="Success message",
    )
    data: Optional[dict] = Field(
        None,
        description="Optional additional data",
    )


# =============================================================================
# ID SCHEMAS
# =============================================================================
class IDResponse(BaseSchema):
    """
    Response containing just an ID.
    
    Used after creating resources.
    """
    
    id: UUID = Field(..., description="Resource ID")


# =============================================================================
# TIMESTAMP SCHEMAS
# =============================================================================
class TimestampMixin(BaseSchema):
    """
    Mixin for schemas with timestamps.
    
    Provides created_at and updated_at fields.
    """
    
    created_at: datetime = Field(
        ...,
        description="When the record was created",
    )
    updated_at: datetime = Field(
        ...,
        description="When the record was last updated",
    )
