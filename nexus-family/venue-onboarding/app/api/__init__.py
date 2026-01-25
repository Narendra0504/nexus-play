# =============================================================================
# NEXUS FAMILY PASS - API PACKAGE
# =============================================================================
"""
API Package for Nexus Family Pass Backend.

This package contains the REST API implementation organized by version.
Currently supports API v1.

Package Structure:
    - v1/: API version 1 endpoints
        - endpoints/: Individual endpoint modules
        - router.py: Main router combining all endpoints
        - dependencies.py: Dependency injection utilities
"""

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = ["v1"]
