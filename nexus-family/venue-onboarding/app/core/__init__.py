# =============================================================================
# NEXUS FAMILY PASS - CORE MODULE
# =============================================================================
"""
Core Module for Nexus Family Pass Backend.

This module contains core utilities and infrastructure components that are
used throughout the application. These are foundational components that
don't contain business logic but provide essential functionality.

Components:
    - database: Database connection and session management
    - exceptions: Custom exception classes and handlers
    - logging_config: Structured logging configuration
    - security: Authentication and authorization utilities

Usage:
    ```python
    from app.core.database import get_db
    from app.core.exceptions import NotFoundError
    from app.core.logging_config import get_logger
    ```
"""

# =============================================================================
# EXPORTS
# =============================================================================
# Define what is available when someone does `from app.core import *`
__all__ = [
    "database",
    "exceptions",
    "logging_config",
    "security",
]
