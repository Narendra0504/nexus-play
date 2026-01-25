# =============================================================================
# NEXUS FAMILY PASS - AI INTEGRATION PACKAGE
# =============================================================================
"""
AI/ML Integration Package.

This package provides AI capabilities using:
    - Google Gemini for LLM inference
    - LangChain for orchestration
    - LangSmith for tracing (optional)

Components:
    - gemini_client: Direct Gemini API client
    - quality_scorer: AI quality scoring from reviews
    - activity_inferrer: Infer activities from venue data
    - embeddings: Generate text embeddings

Rate Limits (Free Tier):
    - Gemini: 15 RPM, 32,000 TPM
    - 4-second delays between requests

Usage:
    ```python
    from app.integrations.ai import QualityScorer
    
    scorer = QualityScorer()
    scores = await scorer.score_venue(reviews)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
from app.integrations.ai.gemini_client import GeminiClient
from app.integrations.ai.quality_scorer import QualityScorer
from app.integrations.ai.activity_inferrer import ActivityInferrer
from app.integrations.ai.embeddings import EmbeddingsGenerator

# =============================================================================
# EXPORTS
# =============================================================================
__all__ = [
    "GeminiClient",
    "QualityScorer",
    "ActivityInferrer",
    "EmbeddingsGenerator",
]
