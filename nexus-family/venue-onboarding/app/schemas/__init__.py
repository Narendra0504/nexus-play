# =============================================================================
# NEXUS FAMILY PASS - PYDANTIC SCHEMAS PACKAGE
# =============================================================================
"""
Pydantic Schemas Package.

This package contains all Pydantic schema definitions for the application.
Schemas are used for:
    - Request body validation
    - Response serialization
    - API documentation generation
    - Data transfer objects (DTOs)

Schemas follow a naming convention:
    - *Create: For creating new records
    - *Update: For updating existing records
    - *Response: For API responses
    - *InDB: For internal database representation

Usage:
    ```python
    from app.schemas import VenueCreate, VenueResponse
    
    # Validate request data
    venue_data = VenueCreate(**request_body)
    
    # Serialize response
    return VenueResponse.model_validate(venue_orm_object)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Import all schemas for convenient access
from app.schemas.common import (
    PaginationParams,
    PaginatedResponse,
    HealthResponse,
    ErrorResponse,
    SuccessResponse,
)
from app.schemas.venue import (
    VenueBase,
    VenueCreate,
    VenueUpdate,
    VenueResponse,
    VenueListResponse,
    VenueDetailResponse,
    VenueSearchParams,
)
from app.schemas.activity import (
    ActivityBase,
    ActivityCreate,
    ActivityResponse,
    ActivitySessionResponse,
)
from app.schemas.vendor import (
    VendorLoginRequest,
    VendorLoginResponse,
    VendorProfileResponse,
    QualityScoreResponse,
    MockPricingResponse,
)

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = [
    # Common
    "PaginationParams",
    "PaginatedResponse",
    "HealthResponse",
    "ErrorResponse",
    "SuccessResponse",
    
    # Venue
    "VenueBase",
    "VenueCreate",
    "VenueUpdate",
    "VenueResponse",
    "VenueListResponse",
    "VenueDetailResponse",
    "VenueSearchParams",
    
    # Activity
    "ActivityBase",
    "ActivityCreate",
    "ActivityResponse",
    "ActivitySessionResponse",
    
    # Vendor
    "VendorLoginRequest",
    "VendorLoginResponse",
    "VendorProfileResponse",
    
    # Quality Scores
    "QualityScoreResponse",
    "MockPricingResponse",
]
