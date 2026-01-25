# =============================================================================
# NEXUS FAMILY PASS - INTEGRATIONS PACKAGE
# =============================================================================
"""
External Integrations Package.

This package contains modules for integrating with external services:
    - google_places: Google Places API for venue discovery
    - ai: AI/ML integrations (Gemini, LangChain)

Each integration module is designed to be:
    - Isolated: Changes to one don't affect others
    - Testable: Easy to mock for unit tests
    - Rate-limit aware: Respects API quotas

Usage:
    ```python
    from app.integrations.google_places import GooglePlacesClient
    from app.integrations.ai import QualityScorer
    ```
"""

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = [
    "google_places",
    "ai",
]
