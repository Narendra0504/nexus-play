# =============================================================================
# NEXUS FAMILY PASS - LANGCHAIN LLM CLIENT
# =============================================================================
"""
LangChain LLM Client Module.

This module provides LangChain-wrapped LLM clients with:
    - LangSmith tracing integration
    - Proper rate limiting
    - Callback handlers for monitoring
    - Support for both chat and completion models

The LLM clients are configured for Google Gemini but can be extended
to support other providers.

Usage:
    ```python
    from app.integrations.ai.langchain.llm import get_chat_model

    llm = get_chat_model()
    response = await llm.ainvoke("What activities are suitable for kids?")
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
import os
from functools import lru_cache
from typing import Optional, List, Any, Dict

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAI
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.outputs import LLMResult

from app.config import settings
from app.core.logging_config import get_logger

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# CALLBACK HANDLERS
# =============================================================================
class NexusCallbackHandler(BaseCallbackHandler):
    """
    Custom callback handler for monitoring LLM calls.

    Logs LLM invocations, token usage, and errors for observability.
    Works alongside LangSmith for comprehensive tracing.
    """

    def __init__(self, component_name: str = "langchain"):
        """Initialize the callback handler."""
        self.component_name = component_name
        self.call_count = 0

    def on_llm_start(
        self,
        serialized: Dict[str, Any],
        prompts: List[str],
        **kwargs: Any,
    ) -> None:
        """Log when LLM starts processing."""
        self.call_count += 1
        logger.debug(
            f"LLM call started",
            extra={
                "component": self.component_name,
                "call_number": self.call_count,
                "prompt_count": len(prompts),
            }
        )

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """Log when LLM completes processing."""
        token_usage = response.llm_output.get("token_usage", {}) if response.llm_output else {}
        logger.debug(
            f"LLM call completed",
            extra={
                "component": self.component_name,
                "generations": len(response.generations),
                "token_usage": token_usage,
            }
        )

    def on_llm_error(self, error: Exception, **kwargs: Any) -> None:
        """Log LLM errors."""
        logger.error(
            f"LLM error in {self.component_name}: {error}",
            extra={"component": self.component_name, "error": str(error)}
        )


# =============================================================================
# LANGSMITH SETUP
# =============================================================================
def setup_langsmith_tracing() -> None:
    """
    Configure LangSmith tracing environment variables.

    This must be called before creating any LangChain components
    to ensure proper tracing is enabled.
    """
    if settings.langsmith_enabled:
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = settings.LANGSMITH_API_KEY
        os.environ["LANGCHAIN_PROJECT"] = settings.LANGSMITH_PROJECT
        os.environ["LANGCHAIN_ENDPOINT"] = settings.LANGCHAIN_ENDPOINT

        logger.info(
            "LangSmith tracing enabled",
            extra={
                "project": settings.LANGSMITH_PROJECT,
                "mode": settings.LANGSMITH_TRACING_ENABLED,
            }
        )
    else:
        os.environ["LANGCHAIN_TRACING_V2"] = "false"
        logger.debug("LangSmith tracing disabled")


# =============================================================================
# LLM FACTORY FUNCTIONS
# =============================================================================
@lru_cache(maxsize=1)
def get_llm(
    model_name: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> GoogleGenerativeAI:
    """
    Get a Google Generative AI LLM instance (completion model).

    This is cached to reuse the same instance across the application.

    Args:
        model_name: Model to use (default: from settings)
        temperature: Creativity level (0-1)
        max_tokens: Maximum output tokens

    Returns:
        GoogleGenerativeAI: Configured LLM instance

    Example:
        ```python
        llm = get_llm()
        result = llm.invoke("Summarize this venue description...")
        ```
    """
    # Setup tracing
    setup_langsmith_tracing()

    model = model_name or settings.GEMINI_MODEL

    llm = GoogleGenerativeAI(
        model=model,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        max_output_tokens=max_tokens,
        callbacks=[NexusCallbackHandler("gemini-completion")],
    )

    logger.info(f"Created GoogleGenerativeAI LLM: {model}")
    return llm


def get_chat_model(
    model_name: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
    streaming: bool = False,
) -> ChatGoogleGenerativeAI:
    """
    Get a Google Generative AI Chat model instance.

    Chat models support multi-turn conversations and are better suited
    for complex reasoning tasks.

    Args:
        model_name: Model to use (default: from settings)
        temperature: Creativity level (0-1)
        max_tokens: Maximum output tokens
        streaming: Enable streaming responses

    Returns:
        ChatGoogleGenerativeAI: Configured chat model instance

    Example:
        ```python
        chat = get_chat_model(temperature=0.3)
        result = await chat.ainvoke([
            SystemMessage(content="You are a venue quality analyzer."),
            HumanMessage(content="Analyze these reviews...")
        ])
        ```
    """
    # Setup tracing
    setup_langsmith_tracing()

    model = model_name or settings.GEMINI_MODEL

    chat_model = ChatGoogleGenerativeAI(
        model=model,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
        max_output_tokens=max_tokens,
        streaming=streaming,
        callbacks=[NexusCallbackHandler("gemini-chat")],
        convert_system_message_to_human=True,  # Gemini doesn't support system messages natively
    )

    logger.info(f"Created ChatGoogleGenerativeAI model: {model}")
    return chat_model


def get_json_chat_model(
    model_name: Optional[str] = None,
    temperature: float = 0.3,
) -> ChatGoogleGenerativeAI:
    """
    Get a chat model configured for JSON output.

    Uses lower temperature for more consistent structured output.

    Args:
        model_name: Model to use
        temperature: Lower default for JSON consistency

    Returns:
        ChatGoogleGenerativeAI: Chat model optimized for JSON output
    """
    return get_chat_model(
        model_name=model_name,
        temperature=temperature,
        max_tokens=2048,  # Higher for complex JSON
    )
