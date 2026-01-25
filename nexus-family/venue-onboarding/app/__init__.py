# =============================================================================
# NEXUS FAMILY PASS - MAIN APPLICATION PACKAGE
# =============================================================================
"""
Nexus Family Pass Backend Application Package.

This is the root package for the Nexus Family Pass backend API.
It provides a B2B2C platform for companies to offer activity subscriptions
to employees with children.

Package Structure:
    - api/: REST API endpoints and routing
    - core/: Core utilities (database, logging, security)
    - models/: SQLAlchemy ORM models
    - schemas/: Pydantic validation schemas
    - services/: Business logic layer
    - integrations/: External service integrations (Google, AI)
    - utils/: Utility functions and helpers

Usage:
    The application is typically started via run.py or directly with uvicorn:
    
    ```python
    # Via run.py
    python run.py
    
    # Via uvicorn
    uvicorn app.main:app --reload
    ```

Author: Nexus Team
Version: 0.1.0
"""

# =============================================================================
# VERSION INFORMATION
# =============================================================================
# Semantic versioning: MAJOR.MINOR.PATCH
# - MAJOR: Breaking changes
# - MINOR: New features, backward compatible
# - PATCH: Bug fixes, backward compatible
__version__ = "0.1.0"

# Application name for logging and identification
__app_name__ = "nexus-backend"

# Author information
__author__ = "Nexus Team"

# =============================================================================
# PACKAGE EXPORTS
# =============================================================================
# Define what is available when someone does `from app import *`
# We intentionally keep this minimal to encourage explicit imports
__all__ = [
    "__version__",
    "__app_name__",
    "__author__",
]
