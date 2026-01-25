# =============================================================================
# NEXUS FAMILY PASS - VENDOR PORTAL ENDPOINTS
# =============================================================================
"""
Vendor Portal Endpoints Module.

This module provides endpoints for the vendor portal:
    - Vendor authentication (login/logout)
    - Vendor profile management
    - Venue access
    - Pricing management

Phase 1 Features:
    - Email/password login
    - View profile
    - View venue details
    - View/update mock pricing

Phase 2 Will Add:
    - JWT authentication
    - Full venue management
    - Activity management
    - Analytics dashboard
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import List  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException, status  # Router

# Local imports
from app.api.v1.dependencies import (
    get_vendor_service,
    get_current_vendor,
)
from app.services.vendor_service import VendorService
from app.schemas.vendor import (
    VendorLoginRequest,
    VendorLoginResponse,
    VendorLogoutResponse,
    VendorProfileResponse,
    VendorProfileUpdateRequest,
    VendorPasswordChangeRequest,
    VendorVenueResponse,
    VendorVenueSummaryResponse,
    MockPricingResponse,
    MockPricingListResponse,
    MockPricingUpdateRequest,
    QualityScoreResponse,
)
from app.schemas.activity import ActivityResponse

# =============================================================================
# ROUTER
# =============================================================================
router = APIRouter()


# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================
@router.post(
    "/login",
    response_model=VendorLoginResponse,
    summary="Vendor Login",
    description="Authenticate vendor with email and password.",
)
async def vendor_login(
    credentials: VendorLoginRequest,
    vendor_service: VendorService = Depends(get_vendor_service),
) -> VendorLoginResponse:
    """
    Authenticate a vendor and return a session token.
    
    Args:
        credentials: Email and password
        vendor_service: Vendor service (injected)
    
    Returns:
        VendorLoginResponse: Session token and vendor info
    
    Raises:
        401: Invalid credentials
    
    Example:
        POST /api/v1/vendors/login
        Body: {"email": "vendor@example.com", "password": "password"}
    """
    result = await vendor_service.authenticate(
        email=credentials.email,
        password=credentials.password,
    )
    
    return VendorLoginResponse(
        success=True,
        token=result["token"],
        expires_at=result["expires_at"],
        vendor_id=result["vendor_id"],
        venue_id=result["venue_id"],
        vendor_name=result["vendor_name"],
        venue_name=result["venue_name"],
        message="Login successful",
    )


@router.post(
    "/logout",
    response_model=VendorLogoutResponse,
    summary="Vendor Logout",
    description="Invalidate current session token.",
)
async def vendor_logout(
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> VendorLogoutResponse:
    """
    Log out the current vendor.
    
    Invalidates the session token.
    
    Args:
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        VendorLogoutResponse: Logout confirmation
    
    Example:
        POST /api/v1/vendors/logout
        Header: Authorization: Bearer <token>
    """
    # Get token from session (stored when validating)
    # Note: In Phase 2 with JWT, we'll handle this differently
    
    return VendorLogoutResponse(
        success=True,
        message="Logged out successfully",
    )


# =============================================================================
# PROFILE ENDPOINTS
# =============================================================================
@router.get(
    "/me",
    response_model=VendorProfileResponse,
    summary="Get Current Vendor Profile",
    description="Get the authenticated vendor's profile.",
)
async def get_current_vendor_profile(
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> VendorProfileResponse:
    """
    Get the current vendor's profile.
    
    Args:
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        VendorProfileResponse: Vendor profile with venue info
    
    Example:
        GET /api/v1/vendors/me
        Header: Authorization: Bearer <token>
    """
    vendor_id = UUID(current_vendor["user_id"])
    vendor = await vendor_service.get_vendor_profile(vendor_id)
    
    response = VendorProfileResponse.model_validate(vendor)
    
    # Add venue name from relationship
    if vendor.venue:
        response.venue_name = vendor.venue.name
    
    return response


@router.put(
    "/me",
    response_model=VendorProfileResponse,
    summary="Update Vendor Profile",
    description="Update the authenticated vendor's profile.",
)
async def update_vendor_profile(
    profile_update: VendorProfileUpdateRequest,
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> VendorProfileResponse:
    """
    Update the current vendor's profile.
    
    Can update:
        - name: Display name
        - phone: Phone number
    
    Args:
        profile_update: Fields to update
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        VendorProfileResponse: Updated profile
    
    Example:
        PUT /api/v1/vendors/me
        Body: {"name": "New Name", "phone": "+91 98765 43210"}
    """
    vendor_id = UUID(current_vendor["user_id"])
    
    vendor = await vendor_service.update_vendor_profile(
        vendor_id=vendor_id,
        display_name=profile_update.display_name,
        phone=profile_update.phone,
    )
    
    response = VendorProfileResponse.model_validate(vendor)
    
    if vendor.venue:
        response.venue_name = vendor.venue.name
    
    return response


@router.post(
    "/me/change-password",
    summary="Change Password",
    description="Change the vendor's password.",
)
async def change_password(
    password_change: VendorPasswordChangeRequest,
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> dict:
    """
    Change the current vendor's password.
    
    Args:
        password_change: Current and new password
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        dict: Success message
    
    Raises:
        401: Current password incorrect
        422: Passwords don't match
    
    Example:
        POST /api/v1/vendors/me/change-password
        Body: {
            "current_password": "old",
            "new_password": "new",
            "confirm_password": "new"
        }
    """
    # Validate passwords match
    if password_change.new_password != password_change.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password and confirmation don't match",
        )
    
    vendor_id = UUID(current_vendor["user_id"])
    
    await vendor_service.change_password(
        vendor_id=vendor_id,
        current_password=password_change.current_password,
        new_password=password_change.new_password,
    )
    
    return {"message": "Password changed successfully"}


# =============================================================================
# VENUE ENDPOINTS
# =============================================================================
@router.get(
    "/me/venue",
    response_model=VendorVenueResponse,
    summary="Get Vendor's Venue",
    description="Get the venue associated with the current vendor.",
)
async def get_vendor_venue(
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> VendorVenueResponse:
    """
    Get the current vendor's venue details.
    
    Args:
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        VendorVenueResponse: Venue details
    
    Example:
        GET /api/v1/vendors/me/venue
        Header: Authorization: Bearer <token>
    """
    vendor_id = UUID(current_vendor["user_id"])
    venue = await vendor_service.get_vendor_venue(vendor_id)
    
    return VendorVenueResponse.model_validate(venue)


@router.get(
    "/me/venue/summary",
    response_model=VendorVenueSummaryResponse,
    summary="Get Venue Summary",
    description="Get summary statistics for vendor's venue.",
)
async def get_venue_summary(
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> VendorVenueSummaryResponse:
    """
    Get summary statistics for the vendor's venue.
    
    Returns:
        - Activity count
        - Rating
        - Quality score (if available)
    
    Args:
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        VendorVenueSummaryResponse: Venue summary
    
    Example:
        GET /api/v1/vendors/me/venue/summary
    """
    vendor_id = UUID(current_vendor["user_id"])
    venue = await vendor_service.get_vendor_venue(vendor_id)
    
    # Build summary
    return VendorVenueSummaryResponse(
        venue_id=venue.id,
        venue_name=venue.name,
        total_activities=len(venue.activities) if venue.activities else 0,
        active_activities=len([
            a for a in (venue.activities or []) if a.is_active
        ]),
        google_rating=venue.google_rating,
        total_reviews=venue.google_review_count,
        quality_score=(
            venue.quality_score.overall_score
            if venue.quality_score else None
        ),
        is_active=venue.is_active,
    )


@router.get(
    "/me/venue/activities",
    response_model=List[ActivityResponse],
    summary="Get Venue Activities",
    description="Get all activities at vendor's venue.",
)
async def get_vendor_venue_activities(
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> List[ActivityResponse]:
    """
    Get all activities at the vendor's venue.
    
    Args:
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        List of activities
    
    Example:
        GET /api/v1/vendors/me/venue/activities
    """
    vendor_id = UUID(current_vendor["user_id"])
    venue = await vendor_service.get_vendor_venue(vendor_id)
    
    return [
        ActivityResponse.model_validate(activity)
        for activity in (venue.activities or [])
    ]


@router.get(
    "/me/venue/quality-scores",
    response_model=QualityScoreResponse,
    summary="Get Venue Quality Scores",
    description="Get AI quality scores for vendor's venue.",
)
async def get_vendor_venue_quality_scores(
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> QualityScoreResponse:
    """
    Get AI quality scores for the vendor's venue.
    
    Args:
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        QualityScoreResponse: AI quality scores
    
    Raises:
        404: Quality scores not available
    
    Example:
        GET /api/v1/vendors/me/venue/quality-scores
    """
    from app.core.exceptions import NotFoundError
    
    vendor_id = UUID(current_vendor["user_id"])
    venue = await vendor_service.get_vendor_venue(vendor_id)
    
    if not venue.quality_score:
        raise NotFoundError(
            "Quality scores not available for this venue"
        )
    
    return QualityScoreResponse.model_validate(venue.quality_score)


# =============================================================================
# PRICING ENDPOINTS
# =============================================================================
@router.get(
    "/me/pricing",
    response_model=MockPricingListResponse,
    summary="Get Vendor Pricing",
    description="Get mock pricing for vendor's venue.",
)
async def get_vendor_pricing(
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> MockPricingListResponse:
    """
    Get mock pricing for the vendor's venue.
    
    Args:
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        MockPricingListResponse: List of pricing records
    
    Example:
        GET /api/v1/vendors/me/pricing
    """
    vendor_id = UUID(current_vendor["user_id"])
    pricing = await vendor_service.get_vendor_pricing(vendor_id)
    
    return MockPricingListResponse(
        pricing=[
            MockPricingResponse.model_validate(p) for p in pricing
        ],
        total=len(pricing),
    )


@router.put(
    "/me/pricing",
    response_model=MockPricingResponse,
    summary="Update Pricing",
    description="Update mock pricing for an activity type.",
)
async def update_vendor_pricing(
    pricing_update: MockPricingUpdateRequest,
    current_vendor: dict = Depends(get_current_vendor),
    vendor_service: VendorService = Depends(get_vendor_service),
) -> MockPricingResponse:
    """
    Update mock pricing for an activity type.
    
    Args:
        pricing_update: Activity type and new prices
        current_vendor: Current vendor session (injected)
        vendor_service: Vendor service (injected)
    
    Returns:
        MockPricingResponse: Updated pricing
    
    Raises:
        404: Pricing record not found
    
    Example:
        PUT /api/v1/vendors/me/pricing
        Body: {
            "activity_type": "swimming",
            "weekday_price_inr": 450,
            "weekend_price_inr": 550
        }
    """
    vendor_id = UUID(current_vendor["user_id"])
    
    pricing = await vendor_service.update_vendor_pricing(
        vendor_id=vendor_id,
        activity_type=pricing_update.activity_type,
        weekday_price=pricing_update.weekday_price_inr,
        weekend_price=pricing_update.weekend_price_inr,
    )
    
    return MockPricingResponse.model_validate(pricing)
