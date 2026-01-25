# =============================================================================
# NEXUS FAMILY PASS - LANGCHAIN TOOLS
# =============================================================================
"""
LangChain Tools Module.

This module defines tools that can be used by LangChain agents:
    - VenueSearchTool: Search for venues via Google Places
    - ReviewAnalysisTool: Analyze venue reviews
    - EmbeddingGenerationTool: Generate text embeddings

Tools are designed to be used standalone or composed into agents.
All tools are fully traced via LangSmith.
"""

# =============================================================================
# IMPORTS
# =============================================================================
from typing import Optional, List, Dict, Any, Type
from pydantic import BaseModel, Field

from langchain_core.tools import BaseTool, StructuredTool, tool
from langchain_core.callbacks import CallbackManagerForToolRun
from langsmith import traceable

from app.core.logging_config import get_logger
from app.core.exceptions import ExternalServiceError

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# TOOL INPUT SCHEMAS
# =============================================================================
class VenueSearchInput(BaseModel):
    """Input schema for venue search tool."""

    query: str = Field(description="Search query for venues")
    city: str = Field(default="Bangalore", description="City to search in")
    category: Optional[str] = Field(
        default=None,
        description="Venue category filter (e.g., swimming_pool, dance_school)"
    )
    max_results: int = Field(
        default=10,
        description="Maximum number of results to return"
    )


class ReviewAnalysisInput(BaseModel):
    """Input schema for review analysis tool."""

    venue_name: str = Field(description="Name of the venue")
    venue_type: str = Field(description="Type of venue")
    reviews: List[str] = Field(description="List of review texts")


class EmbeddingInput(BaseModel):
    """Input schema for embedding generation tool."""

    text: str = Field(description="Text to generate embedding for")
    task_type: str = Field(
        default="RETRIEVAL_DOCUMENT",
        description="Embedding task type"
    )


# =============================================================================
# VENUE SEARCH TOOL
# =============================================================================
class VenueSearchTool(BaseTool):
    """
    Tool for searching venues via Google Places API.

    This tool allows agents to search for kids activity venues
    and retrieve their basic information.

    Example:
        ```python
        tool = VenueSearchTool()
        result = await tool._arun(
            query="swimming pools for kids",
            city="Bangalore"
        )
        ```
    """

    name: str = "venue_search"
    description: str = """Search for kids activity venues in a city.
    Use this when you need to find venues offering specific activities.
    Input should include the search query and optionally the city and category."""
    args_schema: Type[BaseModel] = VenueSearchInput

    def _run(
        self,
        query: str,
        city: str = "Bangalore",
        category: Optional[str] = None,
        max_results: int = 10,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Synchronous run - not recommended for async operations."""
        import asyncio
        return asyncio.run(self._arun(query, city, category, max_results))

    @traceable(name="venue_search_tool", run_type="tool")
    async def _arun(
        self,
        query: str,
        city: str = "Bangalore",
        category: Optional[str] = None,
        max_results: int = 10,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """
        Async search for venues.

        Returns formatted string with venue information.
        """
        try:
            from app.integrations.google_places.client import GooglePlacesClient
            from app.config import settings

            client = GooglePlacesClient(api_key=settings.GOOGLE_PLACES_API_KEY)

            # Get city coordinates
            city_coords = {
                "bangalore": (12.9716, 77.5946),
                "mumbai": (19.0760, 72.8777),
                "delhi": (28.6139, 77.2090),
            }

            lat, lng = city_coords.get(city.lower(), (12.9716, 77.5946))

            # Search venues
            places = await client.search_text_query(
                query=f"{query} for kids in {city}",
                latitude=lat,
                longitude=lng,
                max_results=max_results,
            )

            # Format results
            if not places:
                return f"No venues found for '{query}' in {city}"

            results = []
            for place in places[:max_results]:
                result = f"- {place.get('name', 'Unknown')}"
                if place.get("rating"):
                    result += f" (Rating: {place['rating']})"
                if place.get("address"):
                    result += f"\n  Address: {place['address']}"
                results.append(result)

            return f"Found {len(results)} venues:\n" + "\n".join(results)

        except Exception as e:
            logger.error(f"Venue search failed: {e}")
            return f"Search failed: {e}"


# =============================================================================
# REVIEW ANALYSIS TOOL
# =============================================================================
class ReviewAnalysisTool(BaseTool):
    """
    Tool for analyzing venue reviews.

    This tool uses AI to extract quality scores and insights
    from customer reviews.
    """

    name: str = "review_analysis"
    description: str = """Analyze venue reviews to extract quality scores.
    Use this to understand the quality of a venue based on customer feedback.
    Input should include venue name, type, and list of reviews."""
    args_schema: Type[BaseModel] = ReviewAnalysisInput

    def _run(
        self,
        venue_name: str,
        venue_type: str,
        reviews: List[str],
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Synchronous run."""
        import asyncio
        return asyncio.run(self._arun(venue_name, venue_type, reviews))

    @traceable(name="review_analysis_tool", run_type="tool")
    async def _arun(
        self,
        venue_name: str,
        venue_type: str,
        reviews: List[str],
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """
        Async review analysis.

        Returns formatted analysis results.
        """
        try:
            from app.integrations.ai.langchain.chains import QualityScoringChain

            chain = QualityScoringChain()
            result = await chain.run(
                venue_name=venue_name,
                venue_type=venue_type,
                reviews=reviews,
            )

            # Format output
            output_parts = [
                f"Quality Analysis for {venue_name}:",
                f"Overall Score: {result.get('overall_score', 'N/A')}/5",
                f"Confidence: {result.get('confidence', 0):.0%}",
                "\nCategory Scores:",
            ]

            scores = result.get("scores", {})
            for category, score in scores.items():
                if score is not None:
                    output_parts.append(f"  - {category.title()}: {score}/5")

            key_phrases = result.get("key_phrases", {})
            if key_phrases.get("positive"):
                output_parts.append(
                    f"\nPositive: {', '.join(key_phrases['positive'][:5])}"
                )
            if key_phrases.get("negative"):
                output_parts.append(
                    f"Negative: {', '.join(key_phrases['negative'][:5])}"
                )

            return "\n".join(output_parts)

        except Exception as e:
            logger.error(f"Review analysis failed: {e}")
            return f"Analysis failed: {e}"


# =============================================================================
# EMBEDDING GENERATION TOOL
# =============================================================================
class EmbeddingGenerationTool(BaseTool):
    """
    Tool for generating text embeddings.

    This tool generates vector embeddings for semantic search
    and similarity matching.
    """

    name: str = "generate_embedding"
    description: str = """Generate a vector embedding for text.
    Use this for semantic search or similarity matching.
    Returns the embedding vector dimension."""
    args_schema: Type[BaseModel] = EmbeddingInput

    def _run(
        self,
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """Synchronous run."""
        import asyncio
        return asyncio.run(self._arun(text, task_type))

    @traceable(name="embedding_tool", run_type="tool")
    async def _arun(
        self,
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        """
        Async embedding generation.

        Returns embedding metadata (not the full vector for readability).
        """
        try:
            from app.integrations.ai.embeddings import EmbeddingsGenerator

            generator = EmbeddingsGenerator()
            embedding = await generator.generate_embedding(text, task_type)

            return (
                f"Generated {len(embedding)}-dimensional embedding for "
                f"'{text[:50]}{'...' if len(text) > 50 else ''}'"
            )

        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return f"Embedding failed: {e}"


# =============================================================================
# TOOL FACTORY
# =============================================================================
def get_all_tools() -> List[BaseTool]:
    """
    Get all available LangChain tools.

    Returns:
        List of initialized tool instances
    """
    return [
        VenueSearchTool(),
        ReviewAnalysisTool(),
        EmbeddingGenerationTool(),
    ]


def get_venue_tools() -> List[BaseTool]:
    """
    Get tools related to venue operations.

    Returns:
        List of venue-related tools
    """
    return [
        VenueSearchTool(),
        ReviewAnalysisTool(),
    ]
