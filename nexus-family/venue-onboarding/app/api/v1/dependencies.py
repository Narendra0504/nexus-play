# =============================================================================
# NEXUS FAMILY PASS - API DEPENDENCIES
# =============================================================================
"""
API Dependency Injection Module.

This module provides FastAPI dependencies for use in route handlers.
Dependencies are used to:
    - Inject database sessions
    - Handle authentication
    - Validate request parameters
    - Provide service instances

Usage:
    ```python
    from app.api.v1.dependencies import get_venue_service
    
    @router.get("/venues")
    async def list_venues(
        venue_service: VenueService = Depends(get_venue_service)
    ):
        return await venue_service.list_venues()
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import Optional  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from fastapi import Depends, Header, HTTPException, status  # FastAPI utilities
from sqlalchemy.ext.asyncio import AsyncSession  # Session type

# Local imports
from app.core.database import get_db  # Database session
from app.core.security import get_session  # Session management
from app.services.venue_service import VenueService  # Services
from app.services.activity_service import ActivityService
from app.services.vendor_service import VendorService
from app.core.exceptions import AuthenticationError  # Exceptions


# =============================================================================
# SERVICE DEPENDENCIES
# =============================================================================
async def get_venue_service(
    db: AsyncSession = Depends(get_db),
) -> VenueService:
    """
    Dependency that provides a VenueService instance.
    
    Args:
        db: Database session (injected)
    
    Returns:
        VenueService: Configured service instance
    
    Example:
        ```python
        @router.get("/venues")
        async def list_venues(
            service: VenueService = Depends(get_venue_service)
        ):
            return await service.list_venues()
        ```
    """
    return VenueService(db)


async def get_activity_service(
    db: AsyncSession = Depends(get_db),
) -> ActivityService:
    """
    Dependency that provides an ActivityService instance.
    
    Args:
        db: Database session (injected)
    
    Returns:
        ActivityService: Configured service instance
    """
    return ActivityService(db)


async def get_vendor_service(
    db: AsyncSession = Depends(get_db),
) -> VendorService:
    """
    Dependency that provides a VendorService instance.
    
    Args:
        db: Database session (injected)
    
    Returns:
        VendorService: Configured service instance
    """
    return VendorService(db)


# =============================================================================
# AUTHENTICATION DEPENDENCIES
# =============================================================================
async def get_current_vendor(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> dict:
    """
    Dependency that validates vendor authentication and returns vendor info.
    
    This dependency extracts the session token from the Authorization header,
    validates it, and returns the vendor's session data.
    
    Args:
        authorization: Authorization header value (Bearer token)
        vendor_service: Vendor service (injected)
    
    Returns:
        dict: Vendor session data including vendor_id and venue_id
    
    Raises:
        HTTPException: If authentication fails
    
    Example:
        ```python
        @router.get("/me")
        async def get_profile(
            current_vendor: dict = Depends(get_current_vendor)
        ):
            vendor_id = current_vendor["user_id"]
            return {"vendor_id": vendor_id}
        ```
    """
    # Check if Authorization header is present
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format. Use 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = parts[1]
    
    # Validate session
    session = await vendor_service.validate_session(token)
    
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return session


async def get_optional_vendor(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> Optional[dict]:
    """
    Optional authentication dependency.
    
    Returns vendor session if authenticated, None otherwise.
    Use this for endpoints that work both with and without authentication.
    
    Args:
        authorization: Authorization header value (optional)
        vendor_service: Vendor service (injected)
    
    Returns:
        Optional[dict]: Vendor session data or None
    """
    if not authorization:
        return None
    
    try:
        return await get_current_vendor(authorization, vendor_service)
    except HTTPException:
        return None


# =============================================================================
# PAGINATION DEPENDENCIES
# =============================================================================
class PaginationParams:
    """
    Pagination parameters dependency.
    
    Provides validated pagination parameters with sensible defaults.
    
    Attributes:
        page: Current page number (1-indexed)
        page_size: Items per page
        skip: Offset for database queries
    
    Example:
        ```python
        @router.get("/items")
        async def list_items(
            pagination: PaginationParams = Depends()
        ):
            return items[pagination.skip:pagination.skip + pagination.page_size]
        ```
    """
    
    def __init__(
        self,
        page: int = 1,
        page_size: int = 20,
    ) -> None:
        """
        Initialize pagination parameters.
        
        Args:
            page: Page number (default: 1, min: 1)
            page_size: Items per page (default: 20, min: 1, max: 100)
        """
        # Validate and set page
        self.page = max(1, page)
        
        # Validate and set page_size (clamp between 1 and 100)
        self.page_size = max(1, min(100, page_size))
        
        # Calculate skip (offset) for database queries
        self.skip = (self.page - 1) * self.page_size


# =============================================================================
# FILTER DEPENDENCIES
# =============================================================================
class VenueFilterParams:
    """
    Venue filtering parameters dependency.
    
    Provides validated filter parameters for venue listing.
    """
    
    def __init__(
        self,
        city: Optional[str] = None,
        category: Optional[str] = None,
        min_rating: Optional[float] = None,
        search: Optional[str] = None,
    ) -> None:
        """
        Initialize venue filter parameters.
        
        Args:
            city: Filter by city name
            category: Filter by primary category
            min_rating: Minimum Google rating
            search: Text search query
        """
        self.city = city
        self.category = category
        self.min_rating = min_rating
        self.search = search


class ActivityFilterParams:
    """
    Activity filtering parameters dependency.
    
    Provides validated filter parameters for activity listing.
    """
    
    def __init__(
        self,
        category: Optional[str] = None,
        age: Optional[int] = None,
        city: Optional[str] = None,
        venue_id: Optional[UUID] = None,
        min_credits: Optional[int] = None,
        max_credits: Optional[int] = None,
        search: Optional[str] = None,
    ) -> None:
        """
        Initialize activity filter parameters.
        
        Args:
            category: Filter by activity category
            age: Filter by child's age
            city: Filter by venue city
            venue_id: Filter by specific venue
            min_credits: Minimum credits required
            max_credits: Maximum credits required
            search: Text search query
        """
        self.category = category
        self.age = age
        self.city = city
        self.venue_id = venue_id
        self.min_credits = min_credits
        self.max_credits = max_credits
        self.search = search
