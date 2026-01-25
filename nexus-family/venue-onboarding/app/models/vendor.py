# =============================================================================
# NEXUS FAMILY PASS - VENDOR CREDENTIALS MODEL
# =============================================================================
"""
Vendor Credentials Model Module.

This module defines the VendorCredential model for vendor portal authentication.
In Phase 1, each venue gets auto-generated credentials for demo purposes.

Phase 1 Implementation:
    - Simple email/password authentication
    - Auto-generated credentials during venue ingestion
    - Basic session management

Phase 2 Will Add:
    - Integration with main Users table
    - OAuth2/SSO support
    - Role-based permissions
    - Multi-user per venue
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from datetime import datetime  # Timestamp handling
from typing import Optional, TYPE_CHECKING  # Type hints

# Third-party imports
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Integer,
    ForeignKey,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID  # PostgreSQL UUID type
from sqlalchemy.orm import relationship, Mapped  # ORM relationships

# Local imports
from app.models.base import Base, UUIDMixin, TimestampMixin

# Type checking imports (avoid circular imports)
if TYPE_CHECKING:
    from app.models.venue import Venue


# =============================================================================
# VENDOR CREDENTIAL MODEL
# =============================================================================
class VendorCredential(UUIDMixin, TimestampMixin, Base):
    """
    VendorCredential model for vendor portal authentication.
    
    This model stores login credentials for venue administrators.
    In Phase 1, credentials are auto-generated for each venue discovered
    via Google Places. In Phase 2, this will be integrated with the
    main Users table.
    
    Attributes:
        id: UUID primary key (from UUIDMixin)
        created_at: Creation timestamp (from TimestampMixin)
        updated_at: Last update timestamp (from TimestampMixin)
        
        # Authentication
        email: Login email (unique)
        password_hash: Bcrypt hashed password
        
        # Account Status
        is_active: Whether account is active
        is_email_verified: Email verification status
        
        # Login Tracking
        last_login_at: Last login timestamp
        login_count: Total login count
        
        # Password Reset
        password_reset_token: Token for password reset
        password_reset_expires: Token expiry time
        
    Relationships:
        venue: The venue this credential belongs to
    
    Example:
        ```python
        credential = VendorCredential(
            venue_id=venue.id,
            email="admin@swimming-academy.com",
            password_hash=hash_password("secure_password"),
        )
        ```
    """
    
    # =========================================================================
    # TABLE CONFIGURATION
    # =========================================================================
    __tablename__ = "vendor_credentials"
    
    __table_args__ = (
        # Index for email lookup (login)
        Index("idx_vendor_creds_email", "email"),
        
        # Index for venue lookup
        Index("idx_vendor_creds_venue_id", "venue_id"),
        
        # Table comment
        {"comment": "Vendor portal login credentials (Phase 1: auto-generated)"},
    )
    
    # =========================================================================
    # FOREIGN KEYS
    # =========================================================================
    # Reference to the venue (one-to-one relationship)
    venue_id: Mapped[str] = Column(
        UUID(as_uuid=True),
        ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # One credential per venue
        comment="Reference to the venue",
    )
    
    # =========================================================================
    # AUTHENTICATION COLUMNS
    # =========================================================================
    # Login email address (must be unique)
    email: Mapped[str] = Column(
        String(255),
        nullable=False,
        unique=True,
        comment="Login email address",
    )
    
    # Bcrypt hashed password
    # NULL for accounts that haven't set a password yet
    password_hash: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Bcrypt hashed password",
    )
    
    # Display name for the vendor admin
    display_name: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Display name for the vendor admin",
    )
    
    # Contact phone (optional)
    phone: Mapped[Optional[str]] = Column(
        String(50),
        nullable=True,
        comment="Contact phone number",
    )
    
    # =========================================================================
    # ACCOUNT STATUS
    # =========================================================================
    # Account active status
    is_active: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="True if account is active",
    )
    
    # Email verification status (Phase 1: auto-verified)
    is_email_verified: Mapped[bool] = Column(
        Boolean,
        nullable=False,
        default=True,  # Auto-verified in Phase 1
        comment="True if email is verified",
    )
    
    # Email verification timestamp
    email_verified_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when email was verified",
    )
    
    # =========================================================================
    # LOGIN TRACKING
    # =========================================================================
    # Last login timestamp
    last_login_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Last successful login timestamp",
    )
    
    # Last login IP address
    last_login_ip: Mapped[Optional[str]] = Column(
        String(45),  # IPv6 max length
        nullable=True,
        comment="IP address of last login",
    )
    
    # Total login count
    login_count: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Total number of successful logins",
    )
    
    # Failed login attempts (for rate limiting)
    failed_login_count: Mapped[int] = Column(
        Integer,
        nullable=False,
        default=0,
        comment="Consecutive failed login attempts",
    )
    
    # Account locked timestamp (if too many failed attempts)
    locked_until: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Account locked until this time",
    )
    
    # =========================================================================
    # PASSWORD RESET
    # =========================================================================
    # Password reset token (hashed)
    password_reset_token: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Hashed password reset token",
    )
    
    # Token expiry time
    password_reset_expires: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Password reset token expiry time",
    )
    
    # =========================================================================
    # SESSION MANAGEMENT (PHASE 1 SIMPLE)
    # =========================================================================
    # Current session token (Phase 1 simple auth)
    current_session_token: Mapped[Optional[str]] = Column(
        String(255),
        nullable=True,
        comment="Current active session token (Phase 1)",
    )
    
    # Session expiry
    session_expires_at: Mapped[Optional[datetime]] = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Current session expiry time",
    )
    
    # =========================================================================
    # RELATIONSHIPS
    # =========================================================================
    # Venue this credential belongs to
    venue: Mapped["Venue"] = relationship(
        "Venue",
        back_populates="vendor_credential",
    )
    
    # =========================================================================
    # PROPERTIES
    # =========================================================================
    @property
    def is_locked(self) -> bool:
        """
        Check if the account is locked.
        
        Returns:
            bool: True if account is locked
        """
        if self.locked_until is None:
            return False
        return datetime.utcnow() < self.locked_until.replace(tzinfo=None)
    
    @property
    def has_valid_session(self) -> bool:
        """
        Check if there's a valid active session.
        
        Returns:
            bool: True if session is valid
        """
        if self.current_session_token is None:
            return False
        if self.session_expires_at is None:
            return False
        return datetime.utcnow() < self.session_expires_at.replace(tzinfo=None)
    
    # =========================================================================
    # METHODS
    # =========================================================================
    def record_login(self, ip_address: Optional[str] = None) -> None:
        """
        Record a successful login.
        
        Updates login timestamp, count, and resets failed attempts.
        
        Args:
            ip_address: IP address of the login request
        """
        self.last_login_at = datetime.utcnow()
        self.last_login_ip = ip_address
        self.login_count += 1
        self.failed_login_count = 0
        self.locked_until = None
    
    def record_failed_login(self, max_attempts: int = 5, lockout_minutes: int = 15) -> None:
        """
        Record a failed login attempt.
        
        Increments failed count and locks account if too many attempts.
        
        Args:
            max_attempts: Maximum allowed failed attempts
            lockout_minutes: Minutes to lock account
        """
        self.failed_login_count += 1
        
        if self.failed_login_count >= max_attempts:
            from datetime import timedelta
            self.locked_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)

