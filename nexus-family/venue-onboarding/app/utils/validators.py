# =============================================================================
# NEXUS FAMILY PASS - INPUT VALIDATION UTILITIES
# =============================================================================
"""
Input Validation Utilities Module.

This module provides validation functions for common input types
used throughout the application.

Features:
    - Email validation
    - Phone number validation (Indian format)
    - Age validation for children
    - Password strength validation
    - Coordinate validation

Usage:
    ```python
    from app.utils.validators import validate_email, validate_phone
    
    if not validate_email("test@example.com"):
        raise ValueError("Invalid email")
    
    if not validate_phone("+91 98765 43210"):
        raise ValueError("Invalid phone number")
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import re  # Regular expressions for pattern matching
from typing import Optional, Tuple  # Type hints


# =============================================================================
# EMAIL VALIDATION
# =============================================================================
# RFC 5322 compliant email regex (simplified version)
# This pattern covers most common email formats
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)


def validate_email(email: str) -> bool:
    """
    Validate an email address format.
    
    Uses a simplified RFC 5322 compliant regex pattern.
    Does not verify if the email actually exists.
    
    Args:
        email: Email address to validate
    
    Returns:
        bool: True if email format is valid
    
    Examples:
        ```python
        validate_email("test@example.com")     # True
        validate_email("user.name@domain.co")  # True
        validate_email("invalid@")             # False
        validate_email("no-at-sign.com")       # False
        validate_email("")                     # False
        ```
    """
    # Handle None or empty string
    if not email:
        return False
    
    # Strip whitespace
    email = email.strip()
    
    # Check length constraints (max 254 chars per RFC)
    if len(email) > 254:
        return False
    
    # Match against regex pattern
    return bool(EMAIL_REGEX.match(email))


def normalize_email(email: str) -> str:
    """
    Normalize an email address.
    
    - Converts to lowercase
    - Strips whitespace
    
    Args:
        email: Email address to normalize
    
    Returns:
        str: Normalized email address
    
    Examples:
        ```python
        normalize_email("  User@Example.COM  ")
        # Returns: "user@example.com"
        ```
    """
    if not email:
        return ""
    
    return email.strip().lower()


# =============================================================================
# PHONE VALIDATION
# =============================================================================
# Indian phone number patterns
# Supports formats:
# - 10 digit: 9876543210
# - With country code: +919876543210, +91 9876543210
# - With spaces/dashes: 98765-43210, 98765 43210
INDIAN_PHONE_REGEX = re.compile(
    r"^(?:\+91[\s-]?)?[6-9]\d{9}$"
)


def validate_phone(
    phone: str,
    country_code: str = "IN",
) -> bool:
    """
    Validate a phone number.
    
    Currently supports Indian phone numbers.
    
    Args:
        phone: Phone number to validate
        country_code: ISO country code (default: "IN" for India)
    
    Returns:
        bool: True if phone number is valid
    
    Examples:
        ```python
        validate_phone("9876543210")          # True
        validate_phone("+91 9876543210")      # True
        validate_phone("98765-43210")         # True
        validate_phone("1234567890")          # False (doesn't start with 6-9)
        validate_phone("12345")               # False (too short)
        ```
    """
    # Handle None or empty string
    if not phone:
        return False
    
    # Remove spaces, dashes, and parentheses
    cleaned = re.sub(r"[\s\-\(\)]", "", phone)
    
    # Validate based on country
    if country_code.upper() == "IN":
        return bool(INDIAN_PHONE_REGEX.match(cleaned))
    
    # For other countries, just check if it's numeric and reasonable length
    # Remove + from country code
    if cleaned.startswith("+"):
        cleaned = cleaned[1:]
    
    return cleaned.isdigit() and 8 <= len(cleaned) <= 15


def normalize_phone(phone: str) -> str:
    """
    Normalize a phone number to consistent format.
    
    Removes spaces, dashes, and standardizes country code format.
    
    Args:
        phone: Phone number to normalize
    
    Returns:
        str: Normalized phone number (e.g., "+919876543210")
    
    Examples:
        ```python
        normalize_phone("98765 43210")
        # Returns: "+919876543210"
        
        normalize_phone("+91-9876-543210")
        # Returns: "+919876543210"
        ```
    """
    if not phone:
        return ""
    
    # Remove spaces, dashes, parentheses
    cleaned = re.sub(r"[\s\-\(\)]", "", phone)
    
    # If starts with +91, keep it
    if cleaned.startswith("+91"):
        return cleaned
    
    # If starts with 91, add +
    if cleaned.startswith("91") and len(cleaned) == 12:
        return f"+{cleaned}"
    
    # If 10 digits starting with 6-9, add +91
    if len(cleaned) == 10 and cleaned[0] in "6789":
        return f"+91{cleaned}"
    
    # Return as-is if can't normalize
    return cleaned


# =============================================================================
# AGE VALIDATION
# =============================================================================
# Age constraints for children on the platform
MIN_CHILD_AGE = 0  # Infants allowed
MAX_CHILD_AGE = 18  # Up to 18 years


def validate_age(age: int) -> bool:
    """
    Validate a child's age for the platform.
    
    Children must be between 0 and 18 years old.
    
    Args:
        age: Age in years
    
    Returns:
        bool: True if age is valid for the platform
    
    Examples:
        ```python
        validate_age(7)   # True
        validate_age(0)   # True (infants allowed)
        validate_age(18)  # True
        validate_age(-1)  # False
        validate_age(19)  # False
        ```
    """
    return MIN_CHILD_AGE <= age <= MAX_CHILD_AGE


def validate_age_range(
    min_age: int,
    max_age: int,
) -> Tuple[bool, Optional[str]]:
    """
    Validate an age range for activities.
    
    Args:
        min_age: Minimum age for the activity
        max_age: Maximum age for the activity
    
    Returns:
        Tuple of (is_valid, error_message)
    
    Examples:
        ```python
        validate_age_range(5, 12)   # (True, None)
        validate_age_range(12, 5)   # (False, "min_age cannot be greater than max_age")
        validate_age_range(-1, 10)  # (False, "min_age must be between 0 and 18")
        ```
    """
    # Check min_age bounds
    if not validate_age(min_age):
        return (False, f"min_age must be between {MIN_CHILD_AGE} and {MAX_CHILD_AGE}")
    
    # Check max_age bounds
    if not validate_age(max_age):
        return (False, f"max_age must be between {MIN_CHILD_AGE} and {MAX_CHILD_AGE}")
    
    # Check min <= max
    if min_age > max_age:
        return (False, "min_age cannot be greater than max_age")
    
    return (True, None)


# =============================================================================
# PASSWORD VALIDATION
# =============================================================================
# Password requirements
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128


def validate_password(
    password: str,
    require_uppercase: bool = True,
    require_lowercase: bool = True,
    require_digit: bool = True,
    require_special: bool = False,
) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        require_uppercase: Require at least one uppercase letter
        require_lowercase: Require at least one lowercase letter
        require_digit: Require at least one digit
        require_special: Require at least one special character
    
    Returns:
        Tuple of (is_valid, error_message)
    
    Examples:
        ```python
        validate_password("SecurePass1")
        # (True, None)
        
        validate_password("weak")
        # (False, "Password must be at least 8 characters")
        
        validate_password("alllowercase1")
        # (False, "Password must contain at least one uppercase letter")
        ```
    """
    # Check length
    if not password or len(password) < MIN_PASSWORD_LENGTH:
        return (False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    
    if len(password) > MAX_PASSWORD_LENGTH:
        return (False, f"Password must be at most {MAX_PASSWORD_LENGTH} characters")
    
    # Check uppercase
    if require_uppercase and not any(c.isupper() for c in password):
        return (False, "Password must contain at least one uppercase letter")
    
    # Check lowercase
    if require_lowercase and not any(c.islower() for c in password):
        return (False, "Password must contain at least one lowercase letter")
    
    # Check digit
    if require_digit and not any(c.isdigit() for c in password):
        return (False, "Password must contain at least one digit")
    
    # Check special character
    if require_special:
        special_chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?"
        if not any(c in special_chars for c in password):
            return (False, "Password must contain at least one special character")
    
    return (True, None)


def get_password_strength(password: str) -> str:
    """
    Get password strength rating.
    
    Args:
        password: Password to evaluate
    
    Returns:
        str: "weak", "medium", "strong", or "very_strong"
    
    Examples:
        ```python
        get_password_strength("12345678")     # "weak"
        get_password_strength("Password1")    # "medium"
        get_password_strength("P@ssw0rd123")  # "strong"
        get_password_strength("C0mpl3x!P@ssw0rd")  # "very_strong"
        ```
    """
    if not password:
        return "weak"
    
    score = 0
    
    # Length scoring
    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
    if len(password) >= 16:
        score += 1
    
    # Character variety scoring
    if any(c.isupper() for c in password):
        score += 1
    if any(c.islower() for c in password):
        score += 1
    if any(c.isdigit() for c in password):
        score += 1
    if any(c in "!@#$%^&*()_+-=[]{}|;':\",./<>?" for c in password):
        score += 1
    
    # Map score to strength
    if score <= 2:
        return "weak"
    elif score <= 4:
        return "medium"
    elif score <= 6:
        return "strong"
    else:
        return "very_strong"


# =============================================================================
# COORDINATE VALIDATION
# =============================================================================
def validate_coordinates(
    latitude: float,
    longitude: float,
) -> bool:
    """
    Validate geographic coordinates.
    
    Args:
        latitude: Latitude (-90 to +90)
        longitude: Longitude (-180 to +180)
    
    Returns:
        bool: True if coordinates are valid
    
    Examples:
        ```python
        validate_coordinates(12.9716, 77.5946)  # True (Bangalore)
        validate_coordinates(0, 0)               # True (Gulf of Guinea)
        validate_coordinates(91, 0)              # False (invalid latitude)
        validate_coordinates(0, 181)             # False (invalid longitude)
        ```
    """
    # Validate latitude range
    if not (-90 <= latitude <= 90):
        return False
    
    # Validate longitude range
    if not (-180 <= longitude <= 180):
        return False
    
    return True


def validate_indian_coordinates(
    latitude: float,
    longitude: float,
) -> bool:
    """
    Validate that coordinates are within India's bounding box.
    
    Approximate bounds:
        - Latitude: 8°N to 37°N
        - Longitude: 68°E to 97°E
    
    Args:
        latitude: Latitude
        longitude: Longitude
    
    Returns:
        bool: True if coordinates are within India
    
    Examples:
        ```python
        validate_indian_coordinates(12.9716, 77.5946)  # True (Bangalore)
        validate_indian_coordinates(51.5074, -0.1278) # False (London)
        ```
    """
    # India's approximate bounding box
    MIN_LAT, MAX_LAT = 8.0, 37.0
    MIN_LON, MAX_LON = 68.0, 97.0
    
    return (MIN_LAT <= latitude <= MAX_LAT and 
            MIN_LON <= longitude <= MAX_LON)


# =============================================================================
# GENERAL VALIDATION HELPERS
# =============================================================================
def is_not_empty(value: Optional[str]) -> bool:
    """
    Check if a string value is not None and not empty after stripping.
    
    Args:
        value: String to check
    
    Returns:
        bool: True if value has content
    """
    return bool(value and value.strip())


def validate_length(
    value: str,
    min_length: int = 0,
    max_length: int = 255,
    field_name: str = "Value",
) -> Tuple[bool, Optional[str]]:
    """
    Validate string length.
    
    Args:
        value: String to validate
        min_length: Minimum allowed length
        max_length: Maximum allowed length
        field_name: Name of field for error message
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not value:
        if min_length > 0:
            return (False, f"{field_name} is required")
        return (True, None)
    
    if len(value) < min_length:
        return (False, f"{field_name} must be at least {min_length} characters")
    
    if len(value) > max_length:
        return (False, f"{field_name} must be at most {max_length} characters")
    
    return (True, None)
