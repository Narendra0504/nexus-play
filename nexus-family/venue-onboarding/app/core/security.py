# =============================================================================
# NEXUS FAMILY PASS - SECURITY UTILITIES
# =============================================================================
"""
Security and Authentication Module.

This module provides security utilities for the application including:
    - Password hashing and verification
    - Simple session-based authentication (Phase 1)
    - JWT token handling (Phase 2 - placeholder)
    - Security helpers

Phase 1 Implementation:
    - Simple password hashing with bcrypt
    - Session token generation for vendor portal
    - Basic authentication dependency

Phase 2 Will Add:
    - JWT token generation and validation
    - OAuth2/OIDC support for corporate SSO
    - Role-based access control (RBAC)
    - API key management
    - Rate limiting

Usage:
    ```python
    from app.core.security import hash_password, verify_password
    
    # Hash a password
    hashed = hash_password("user_password")
    
    # Verify a password
    is_valid = verify_password("user_password", hashed)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import secrets  # Cryptographically secure random generation
from datetime import datetime, timedelta  # Time handling
from typing import Optional, Dict, Any  # Type hints
import hashlib  # For simple token hashing

# Third-party imports
from passlib.context import CryptContext  # Password hashing

# Local imports
from app.config import settings  # Application configuration
from app.core.logging_config import get_logger  # Logging

# =============================================================================
# LOGGING
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# PASSWORD HASHING
# =============================================================================
# Configure the password hashing context
# bcrypt is the recommended algorithm for password hashing
_pwd_context = CryptContext(
    # Use bcrypt as the primary hashing scheme
    schemes=["bcrypt"],
    
    # Automatically upgrade old hashes to the current scheme
    deprecated="auto",
    
    # bcrypt-specific configuration
    # rounds: Number of iterations (higher = more secure but slower)
    # Default is 12, which takes ~250ms on modern hardware
    bcrypt__rounds=12,
)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    This function creates a secure hash of the password that can be
    stored in the database. The hash includes a random salt, so the
    same password will produce different hashes each time.
    
    Args:
        password: The plaintext password to hash
        
    Returns:
        str: The hashed password (includes algorithm, salt, and hash)
        
    Example:
        ```python
        hashed = hash_password("my_secure_password")
        # hashed looks like: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.
        ```
        
    Security Notes:
        - Never log or print the plaintext password
        - Always use this function instead of manual hashing
        - bcrypt automatically handles salting
    """
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    This function checks if a plaintext password matches a stored hash.
    It uses constant-time comparison to prevent timing attacks.
    
    Args:
        plain_password: The plaintext password to verify
        hashed_password: The stored password hash
        
    Returns:
        bool: True if the password matches, False otherwise
        
    Example:
        ```python
        hashed = hash_password("my_password")
        
        # Correct password
        verify_password("my_password", hashed)  # Returns True
        
        # Wrong password
        verify_password("wrong_password", hashed)  # Returns False
        ```
        
    Security Notes:
        - Uses constant-time comparison to prevent timing attacks
        - Never log or expose the comparison result in error messages
    """
    try:
        return _pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        # Log the error but don't expose details
        logger.warning(f"Password verification error: {type(e).__name__}")
        return False


# =============================================================================
# SESSION TOKEN MANAGEMENT (PHASE 1 - SIMPLE)
# =============================================================================
# In-memory session store for Phase 1
# This is NOT suitable for production with multiple workers
# Phase 2 will use JWT tokens or Redis-backed sessions
_sessions: Dict[str, Dict[str, Any]] = {}


def generate_session_token() -> str:
    """
    Generate a cryptographically secure session token.
    
    This function creates a random token for session identification.
    The token is URL-safe and suitable for use in cookies or headers.
    
    Returns:
        str: A 32-character random token
        
    Example:
        ```python
        token = generate_session_token()
        # token looks like: "Drmhze6EPcv0fN_81Bj-nA"
        ```
    """
    return secrets.token_urlsafe(24)


def create_session(
    user_id: str,
    user_type: str,
    extra_data: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a new session for a user.
    
    This function creates a session and returns a token that can be
    used to authenticate subsequent requests.
    
    Args:
        user_id: The unique identifier of the user
        user_type: The type of user (e.g., "vendor", "admin")
        extra_data: Optional additional data to store in the session
        
    Returns:
        str: The session token
        
    Example:
        ```python
        token = create_session(
            user_id="vendor_123",
            user_type="vendor",
            extra_data={"venue_id": "venue_456"}
        )
        ```
        
    Note:
        Phase 1 uses in-memory storage. This will be replaced
        with JWT tokens in Phase 2 for stateless authentication.
    """
    # Generate a new token
    token = generate_session_token()
    
    # Calculate expiry time
    expiry = datetime.utcnow() + timedelta(hours=settings.SESSION_EXPIRY_HOURS)
    
    # Store session data
    _sessions[token] = {
        "user_id": user_id,
        "user_type": user_type,
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": expiry.isoformat(),
        "extra_data": extra_data or {},
    }
    
    logger.debug(
        "Session created",
        extra={
            "user_id": user_id,
            "user_type": user_type,
            "expires_at": expiry.isoformat(),
        }
    )
    
    return token


def get_session(token: str) -> Optional[Dict[str, Any]]:
    """
    Get session data for a token.
    
    This function retrieves the session data associated with a token,
    if the session exists and has not expired.
    
    Args:
        token: The session token
        
    Returns:
        Optional[Dict]: Session data if valid, None otherwise
        
    Example:
        ```python
        session = get_session(token)
        if session:
            user_id = session["user_id"]
        ```
    """
    # Check if token exists
    if token not in _sessions:
        return None
    
    session = _sessions[token]
    
    # Check if session has expired
    expires_at = datetime.fromisoformat(session["expires_at"])
    if datetime.utcnow() > expires_at:
        # Remove expired session
        del _sessions[token]
        logger.debug("Session expired", extra={"user_id": session["user_id"]})
        return None
    
    return session


def delete_session(token: str) -> bool:
    """
    Delete a session (logout).
    
    This function removes a session, effectively logging out the user.
    
    Args:
        token: The session token to delete
        
    Returns:
        bool: True if session was deleted, False if it didn't exist
        
    Example:
        ```python
        delete_session(token)  # User is now logged out
        ```
    """
    if token in _sessions:
        user_id = _sessions[token]["user_id"]
        del _sessions[token]
        logger.debug("Session deleted", extra={"user_id": user_id})
        return True
    return False


def cleanup_expired_sessions() -> int:
    """
    Remove all expired sessions.
    
    This function should be called periodically to clean up
    expired sessions and free memory.
    
    Returns:
        int: Number of sessions removed
        
    Example:
        ```python
        # Call periodically (e.g., in a background task)
        removed = cleanup_expired_sessions()
        logger.info(f"Cleaned up {removed} expired sessions")
        ```
    """
    now = datetime.utcnow()
    expired_tokens = []
    
    for token, session in _sessions.items():
        expires_at = datetime.fromisoformat(session["expires_at"])
        if now > expires_at:
            expired_tokens.append(token)
    
    for token in expired_tokens:
        del _sessions[token]
    
    if expired_tokens:
        logger.debug(f"Cleaned up {len(expired_tokens)} expired sessions")
    
    return len(expired_tokens)


# =============================================================================
# API KEY UTILITIES (FOR FUTURE USE)
# =============================================================================
def generate_api_key() -> str:
    """
    Generate a new API key.
    
    API keys are used for server-to-server authentication,
    such as webhook verification or external integrations.
    
    Returns:
        str: A 32-character API key prefixed with "nfp_"
        
    Example:
        ```python
        api_key = generate_api_key()
        # api_key looks like: "nfp_Drmhze6EPcv0fN_81Bj-nA..."
        ```
    """
    # Generate random bytes and encode
    key = secrets.token_urlsafe(24)
    # Add prefix for easy identification
    return f"nfp_{key}"


def hash_api_key(api_key: str) -> str:
    """
    Hash an API key for storage.
    
    API keys should be hashed before storage (like passwords).
    This uses SHA-256 which is fast but secure enough for API keys.
    
    Args:
        api_key: The API key to hash
        
    Returns:
        str: The hashed API key
        
    Example:
        ```python
        key = generate_api_key()
        hashed = hash_api_key(key)
        # Store hashed in database, return key to user once
        ```
    """
    return hashlib.sha256(api_key.encode()).hexdigest()


# =============================================================================
# SECURITY HELPERS
# =============================================================================
def generate_random_password(length: int = 16) -> str:
    """
    Generate a random password.
    
    This function creates a cryptographically secure random password.
    Useful for auto-generating vendor account passwords.
    
    Args:
        length: Password length (default: 16)
        
    Returns:
        str: Random password with mixed characters
        
    Example:
        ```python
        password = generate_random_password()
        # password looks like: "Xk9#mP2$nL5@wQ8!"
        ```
    """
    # Use URL-safe characters for simplicity
    return secrets.token_urlsafe(length)[:length]


def constant_time_compare(val1: str, val2: str) -> bool:
    """
    Compare two strings in constant time.
    
    This function compares strings in a way that prevents
    timing attacks by always taking the same amount of time
    regardless of where the strings differ.
    
    Args:
        val1: First string to compare
        val2: Second string to compare
        
    Returns:
        bool: True if strings are equal, False otherwise
        
    Example:
        ```python
        # Safe comparison for tokens
        if constant_time_compare(provided_token, stored_token):
            # Token is valid
            pass
        ```
    """
    return secrets.compare_digest(val1.encode(), val2.encode())


# =============================================================================
# PHASE 2 PLACEHOLDERS
# =============================================================================
# These functions will be implemented in Phase 2

def create_jwt_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT token (Phase 2).
    
    This is a placeholder for JWT token generation that will be
    implemented in Phase 2.
    
    Args:
        data: Payload data to encode in the token
        expires_delta: Token expiry time
        
    Returns:
        str: The JWT token
        
    Raises:
        NotImplementedError: Until Phase 2 implementation
    """
    raise NotImplementedError("JWT tokens will be implemented in Phase 2")


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token (Phase 2).
    
    This is a placeholder for JWT token verification that will be
    implemented in Phase 2.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        Optional[Dict]: The decoded payload if valid, None otherwise
        
    Raises:
        NotImplementedError: Until Phase 2 implementation
    """
    raise NotImplementedError("JWT tokens will be implemented in Phase 2")
