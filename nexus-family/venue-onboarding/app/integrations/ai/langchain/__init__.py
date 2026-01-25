# =============================================================================
# NEXUS FAMILY PASS - LANGCHAIN INTEGRATION PACKAGE
# =============================================================================
"""
LangChain Integration Package.

This package provides LangChain-based AI components for:
    - Structured LLM chains with proper prompting
    - Tool definitions for agent capabilities
    - LangSmith tracing integration
    - Reusable chain components

Components:
    - llm: LLM client with LangSmith tracing
    - chains: Reusable LangChain chains
    - tools: LangChain tool definitions
    - prompts: Prompt templates
"""

from app.integrations.ai.langchain.llm import get_llm, get_chat_model
from app.integrations.ai.langchain.chains import (
    QualityScoringChain,
    ActivityInferenceChain,
    VenueAnalysisChain,
)
from app.integrations.ai.langchain.tools import (
    VenueSearchTool,
    ReviewAnalysisTool,
    EmbeddingGenerationTool,
)

__all__ = [
    "get_llm",
    "get_chat_model",
    "QualityScoringChain",
    "ActivityInferenceChain",
    "VenueAnalysisChain",
    "VenueSearchTool",
    "ReviewAnalysisTool",
    "EmbeddingGenerationTool",
]
