# =============================================================================
# NEXUS FAMILY PASS - UTILITIES PACKAGE
# =============================================================================
"""
Utility Functions Package.

This package contains helper functions and utilities used throughout
the application:
    - slug: URL slug generation
    - pricing: Mock pricing calculation
    - validators: Input validation helpers

Usage:
    ```python
    from app.utils import generate_slug, calculate_mock_price
    
    slug = generate_slug("ABC Swimming Academy")
    price = calculate_mock_price("swimming", "Bangalore", is_weekend=True)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
from app.utils.slug import generate_slug, generate_unique_slug
from app.utils.pricing import (
    calculate_mock_price,
    generate_venue_pricing,
)
from app.utils.validators import (
    validate_email,
    validate_phone,
    validate_age,
)

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = [
    # Slug
    "generate_slug",
    "generate_unique_slug",
    
    # Pricing
    "calculate_mock_price",
    "generate_venue_pricing",
    
    # Validators
    "validate_email",
    "validate_phone",
    "validate_age",
]
