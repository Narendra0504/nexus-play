# =============================================================================
# NEXUS FAMILY PASS - VENDOR SERVICE
# =============================================================================
"""
Vendor Portal Service Module.

This service handles all business logic related to the vendor portal:
    - Vendor authentication (login/logout)
    - Vendor profile management
    - Venue access for vendors
    - Mock pricing management

Phase 1 Features:
    - Simple email/password authentication
    - Session-based login
    - View venue details
    - View/update mock pricing

Phase 2 Will Add:
    - JWT authentication
    - Full venue management
    - Activity CRUD operations
    - Analytics dashboard
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime, timedelta  # Date handling
from typing import Optional, List, Dict, Any  # Type hints
from uuid import UUID  # UUID type

# Third-party imports
from sqlalchemy import select, and_  # Query building
from sqlalchemy.orm import selectinload  # Eager loading
from sqlalchemy.ext.asyncio import AsyncSession  # Session type

# Local imports
from app.services.base import BaseService  # Base class
from app.models.vendor import VendorCredential  # Vendor model
from app.models.venue import Venue  # Venue model
from app.models.quality_score import VenueMockPricing  # Pricing model
from app.core.security import (  # Security utilities
    hash_password,
    verify_password,
    create_session,
    get_session,
    delete_session,
)
from app.core.logging_config import get_logger  # Logging
from app.core.exceptions import (  # Exceptions
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
)
from app.config import settings  # Configuration

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# VENDOR SERVICE
# =============================================================================
class VendorService(BaseService[VendorCredential]):
    """
    Service class for vendor portal business logic.
    
    This service handles vendor authentication and venue access
    for the vendor portal.
    
    Example:
        ```python
        vendor_service = VendorService(db)
        
        # Authenticate vendor
        result = await vendor_service.authenticate("email@example.com", "password")
        
        # Get vendor's venue
        venue = await vendor_service.get_vendor_venue(vendor_id)
        ```
    """
    
    def __init__(self, db: AsyncSession) -> None:
        """
        Initialize the vendor service.
        
        Args:
            db: The async database session
        """
        # Call parent constructor with VendorCredential model
        super().__init__(db, VendorCredential)
    
    # =========================================================================
    # AUTHENTICATION
    # =========================================================================
    async def authenticate(
        self,
        email: str,
        password: str,
    ) -> Dict[str, Any]:
        """
        Authenticate a vendor with email and password.
        
        Args:
            email: Vendor's email address
            password: Vendor's password
        
        Returns:
            Dictionary with authentication result including:
            - token: Session token
            - vendor_id: Vendor's UUID
            - venue_id: Associated venue's UUID
            - expires_at: Token expiry time
        
        Raises:
            AuthenticationError: If credentials are invalid
        
        Example:
            ```python
            result = await vendor_service.authenticate(
                "vendor@example.com",
                "SecurePassword123!"
            )
            token = result["token"]
            ```
        """
        # Find vendor by email
        vendor = await self._get_vendor_by_email(email)
        
        if vendor is None:
            logger.warning(
                "Login attempt with unknown email",
                extra={"email": email}
            )
            raise AuthenticationError("Invalid email or password")
        
        # Check if account is active
        if not vendor.is_active:
            logger.warning(
                "Login attempt on inactive account",
                extra={"vendor_id": str(vendor.id), "email": email}
            )
            raise AuthenticationError("Account is inactive")
        
        # Verify password
        if not verify_password(password, vendor.password_hash):
            logger.warning(
                "Login attempt with invalid password",
                extra={"vendor_id": str(vendor.id), "email": email}
            )
            raise AuthenticationError("Invalid email or password")
        
        # Create session token
        token = create_session(
            user_id=str(vendor.id),
            user_type="vendor",
            extra_data={
                "venue_id": str(vendor.venue_id),
                "email": vendor.email,
            }
        )
        
        # Update last login
        vendor.last_login_at = datetime.utcnow()
        await self.db.commit()
        
        # Calculate expiry time
        expires_at = datetime.utcnow() + timedelta(hours=settings.SESSION_EXPIRY_HOURS)
        
        logger.info(
            "Vendor logged in successfully",
            extra={
                "vendor_id": str(vendor.id),
                "venue_id": str(vendor.venue_id),
            }
        )
        
        return {
            "token": token,
            "vendor_id": vendor.id,
            "venue_id": vendor.venue_id,
            "vendor_name": vendor.display_name,
            "venue_name": vendor.venue.name if vendor.venue else None,
            "expires_at": expires_at,
        }
    
    async def logout(self, token: str) -> bool:
        """
        Log out a vendor by invalidating their session.
        
        Args:
            token: The session token to invalidate
        
        Returns:
            True if logout successful
        """
        result = delete_session(token)
        
        if result:
            logger.info("Vendor logged out successfully")
        
        return result
    
    async def validate_session(
        self,
        token: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Validate a session token and return session data.
        
        Args:
            token: The session token to validate
        
        Returns:
            Session data if valid, None otherwise
        """
        session = get_session(token)
        
        if session is None:
            return None
        
        # Verify user still exists and is active
        vendor_id = UUID(session["user_id"])
        vendor = await self.get_by_id(vendor_id)
        
        if vendor is None or not vendor.is_active:
            delete_session(token)
            return None
        
        return session
    
    # =========================================================================
    # VENDOR PROFILE
    # =========================================================================
    async def get_vendor_profile(
        self,
        vendor_id: UUID,
    ) -> VendorCredential:
        """
        Get vendor profile with venue information.
        
        Args:
            vendor_id: The vendor's UUID
        
        Returns:
            Vendor with venue loaded
        
        Raises:
            NotFoundError: If vendor not found
        """
        query = (
            select(VendorCredential)
            .where(VendorCredential.id == vendor_id)
            .options(selectinload(VendorCredential.venue))
        )
        
        result = await self.db.execute(query)
        vendor = result.scalar_one_or_none()
        
        if vendor is None:
            raise NotFoundError(f"Vendor with ID {vendor_id} not found")
        
        return vendor
    
    async def update_vendor_profile(
        self,
        vendor_id: UUID,
        display_name: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> VendorCredential:
        """
        Update vendor profile information.
        
        Args:
            vendor_id: The vendor's UUID
            display_name: New display name (optional)
            phone: New phone number (optional)
        
        Returns:
            Updated vendor profile
        
        Raises:
            NotFoundError: If vendor not found
        """
        vendor = await self.get_vendor_profile(vendor_id)
        
        # Update provided fields
        if display_name is not None:
            vendor.display_name = display_name
        
        if phone is not None:
            vendor.phone = phone
        
        await self.db.commit()
        await self.db.refresh(vendor)
        
        logger.info(
            "Vendor profile updated",
            extra={"vendor_id": str(vendor_id)}
        )
        
        return vendor
    
    async def change_password(
        self,
        vendor_id: UUID,
        current_password: str,
        new_password: str,
    ) -> bool:
        """
        Change vendor's password.
        
        Args:
            vendor_id: The vendor's UUID
            current_password: Current password for verification
            new_password: New password to set
        
        Returns:
            True if password changed successfully
        
        Raises:
            NotFoundError: If vendor not found
            AuthenticationError: If current password is wrong
        """
        vendor = await self.get_vendor_profile(vendor_id)
        
        # Verify current password
        if not verify_password(current_password, vendor.password_hash):
            raise AuthenticationError("Current password is incorrect")
        
        # Update password
        vendor.password_hash = hash_password(new_password)
        await self.db.commit()
        
        logger.info(
            "Vendor password changed",
            extra={"vendor_id": str(vendor_id)}
        )
        
        return True
    
    # =========================================================================
    # VENUE ACCESS
    # =========================================================================
    async def get_vendor_venue(
        self,
        vendor_id: UUID,
    ) -> Venue:
        """
        Get the venue associated with a vendor.
        
        Args:
            vendor_id: The vendor's UUID
        
        Returns:
            The vendor's venue with related data
        
        Raises:
            NotFoundError: If vendor or venue not found
        """
        vendor = await self.get_vendor_profile(vendor_id)
        
        if vendor.venue is None:
            raise NotFoundError(
                f"No venue associated with vendor {vendor_id}"
            )
        
        # Load full venue details
        query = (
            select(Venue)
            .where(Venue.id == vendor.venue_id)
            .options(
                selectinload(Venue.quality_score),
                selectinload(Venue.activities),
                selectinload(Venue.mock_pricing),
            )
        )
        
        result = await self.db.execute(query)
        venue = result.scalar_one_or_none()
        
        if venue is None:
            raise NotFoundError("Venue not found")
        
        return venue
    
    async def verify_vendor_venue_access(
        self,
        vendor_id: UUID,
        venue_id: UUID,
    ) -> bool:
        """
        Verify that a vendor has access to a specific venue.
        
        Args:
            vendor_id: The vendor's UUID
            venue_id: The venue's UUID to check access for
        
        Returns:
            True if vendor has access
        
        Raises:
            AuthorizationError: If vendor doesn't have access
        """
        vendor = await self.get_vendor_profile(vendor_id)
        
        if vendor.venue_id != venue_id:
            raise AuthorizationError(
                "You don't have access to this venue"
            )
        
        return True
    
    # =========================================================================
    # MOCK PRICING MANAGEMENT
    # =========================================================================
    async def get_vendor_pricing(
        self,
        vendor_id: UUID,
    ) -> List[VenueMockPricing]:
        """
        Get mock pricing for vendor's venue.
        
        Args:
            vendor_id: The vendor's UUID
        
        Returns:
            List of mock pricing records
        """
        vendor = await self.get_vendor_profile(vendor_id)
        
        query = (
            select(VenueMockPricing)
            .where(VenueMockPricing.venue_id == vendor.venue_id)
            .order_by(VenueMockPricing.activity_type)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def update_vendor_pricing(
        self,
        vendor_id: UUID,
        activity_type: str,
        weekday_price: Optional[float] = None,
        weekend_price: Optional[float] = None,
    ) -> VenueMockPricing:
        """
        Update mock pricing for an activity type.
        
        Args:
            vendor_id: The vendor's UUID
            activity_type: The activity type to update
            weekday_price: New weekday price (optional)
            weekend_price: New weekend price (optional)
        
        Returns:
            Updated pricing record
        
        Raises:
            NotFoundError: If pricing record not found
        """
        vendor = await self.get_vendor_profile(vendor_id)
        
        # Find existing pricing record
        query = select(VenueMockPricing).where(
            and_(
                VenueMockPricing.venue_id == vendor.venue_id,
                VenueMockPricing.activity_type == activity_type
            )
        )
        
        result = await self.db.execute(query)
        pricing = result.scalar_one_or_none()
        
        if pricing is None:
            raise NotFoundError(
                f"Pricing for activity type '{activity_type}' not found"
            )
        
        # Update provided fields
        if weekday_price is not None:
            pricing.weekday_price_inr = weekday_price
            pricing.price_source = "vendor"
        
        if weekend_price is not None:
            pricing.weekend_price_inr = weekend_price
            pricing.price_source = "vendor"
        
        await self.db.commit()
        await self.db.refresh(pricing)
        
        logger.info(
            "Vendor pricing updated",
            extra={
                "vendor_id": str(vendor_id),
                "activity_type": activity_type,
            }
        )
        
        return pricing
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    async def _get_vendor_by_email(
        self,
        email: str,
    ) -> Optional[VendorCredential]:
        """
        Get vendor by email address.
        
        Args:
            email: Email address to search for
        
        Returns:
            Vendor if found, None otherwise
        """
        query = (
            select(VendorCredential)
            .where(VendorCredential.email == email.lower())
            .options(selectinload(VendorCredential.venue))
        )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create_vendor_account(
        self,
        venue_id: UUID,
        email: str,
        password: str,
        name: str,
        phone: Optional[str] = None,
    ) -> VendorCredential:
        """
        Create a new vendor account for a venue.
        
        This is typically called during venue onboarding to create
        the initial vendor credentials.
        
        Args:
            venue_id: The venue's UUID
            email: Vendor's email address
            password: Initial password
            name: Vendor's display name
            phone: Phone number (optional)
        
        Returns:
            Created vendor account
        """
        # Hash the password
        password_hash = hash_password(password)
        
        # Create vendor
        vendor = VendorCredential(
            venue_id=venue_id,
            email=email.lower(),
            password_hash=password_hash,
            display_name=name,
            phone=phone,
            is_active=True,
        )
        
        self.db.add(vendor)
        await self.db.commit()
        await self.db.refresh(vendor)
        
        logger.info(
            "Vendor account created",
            extra={
                "vendor_id": str(vendor.id),
                "venue_id": str(venue_id),
                "email": email,
            }
        )
        
        return vendor
