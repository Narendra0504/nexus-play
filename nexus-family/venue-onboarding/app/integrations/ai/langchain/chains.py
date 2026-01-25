# =============================================================================
# NEXUS FAMILY PASS - LANGCHAIN CHAINS
# =============================================================================
"""
LangChain Chains Module.

This module provides reusable LangChain chains for:
    - Quality scoring from venue reviews
    - Activity inference from venue data
    - Venue analysis and categorization

Each chain is designed as a class for better state management and
configuration. Chains are fully traced via LangSmith when enabled.

Usage:
    ```python
    from app.integrations.ai.langchain.chains import QualityScoringChain

    chain = QualityScoringChain()
    result = await chain.run(
        venue_name="ABC Swimming",
        venue_type="swimming_pool",
        reviews=["Great place!", "Clean and safe"]
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime

from langchain_core.runnables import RunnableSequence, RunnablePassthrough
from langchain_core.output_parsers import JsonOutputParser
from langsmith import traceable

from app.integrations.ai.langchain.llm import get_chat_model
from app.integrations.ai.langchain.prompts import (
    QUALITY_SCORING_PROMPT,
    ACTIVITY_INFERENCE_PROMPT,
    VENUE_ANALYSIS_PROMPT,
    quality_score_parser,
    activity_inference_parser,
    venue_analysis_parser,
)
from app.core.logging_config import get_logger
from app.core.exceptions import ExternalServiceError

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# QUALITY SCORING CHAIN
# =============================================================================
class QualityScoringChain:
    """
    LangChain chain for scoring venue quality from reviews.

    This chain takes venue reviews and extracts quality scores
    across 8 categories using structured prompts and output parsing.

    Features:
        - LangSmith tracing for all invocations
        - Structured JSON output with validation
        - Error handling with fallback to empty scores
        - Rate limiting respect via async design

    Attributes:
        chain: The LangChain runnable sequence
        min_reviews: Minimum reviews required for scoring

    Example:
        ```python
        scorer = QualityScoringChain()
        result = await scorer.run(
            venue_name="ABC Pool",
            venue_type="swimming_pool",
            reviews=["Great instructors!", "Very clean"]
        )
        print(result["overall_score"])  # 4.5
        ```
    """

    def __init__(self, min_reviews: int = 3):
        """
        Initialize the quality scoring chain.

        Args:
            min_reviews: Minimum reviews required for scoring
        """
        self.min_reviews = min_reviews
        self._llm = get_chat_model(temperature=0.3)
        self._build_chain()

    def _build_chain(self) -> None:
        """Build the LangChain runnable sequence."""
        self.chain = (
            QUALITY_SCORING_PROMPT
            | self._llm
            | quality_score_parser
        )

    def _format_reviews(self, reviews: List[str]) -> str:
        """Format reviews for the prompt."""
        return "\n\n".join([
            f"Review {i+1}: {review}"
            for i, review in enumerate(reviews[:10])
        ])

    @traceable(name="quality_scoring", run_type="chain")
    async def run(
        self,
        venue_name: str,
        venue_type: str,
        reviews: List[str],
    ) -> Dict[str, Any]:
        """
        Score a venue's quality based on reviews.

        Args:
            venue_name: Name of the venue
            venue_type: Type of venue (gym, swimming_pool, etc.)
            reviews: List of review texts

        Returns:
            dict: Quality scores and metadata

        Raises:
            ExternalServiceError: On chain execution failure
        """
        # Check minimum reviews
        if len(reviews) < self.min_reviews:
            logger.warning(
                f"Insufficient reviews for {venue_name}: {len(reviews)}"
            )
            return self._create_empty_result(
                reason="Insufficient reviews",
                review_count=len(reviews)
            )

        try:
            # Prepare input
            input_data = {
                "venue_name": venue_name,
                "venue_type": venue_type,
                "reviews": self._format_reviews(reviews),
                "format_instructions": quality_score_parser.get_format_instructions(),
            }

            # Execute chain asynchronously
            result = await self.chain.ainvoke(input_data)

            # Process and validate result
            processed = self._process_result(result, len(reviews))

            logger.info(
                f"Scored {venue_name}: overall={processed['overall_score']:.2f}",
                extra={"venue_name": venue_name, "confidence": processed["confidence"]}
            )

            return processed

        except Exception as e:
            logger.error(f"Quality scoring failed for {venue_name}: {e}")
            raise ExternalServiceError(
                f"Quality scoring chain failed: {e}",
                details={"venue_name": venue_name}
            )

    def _process_result(
        self,
        result: Dict[str, Any],
        review_count: int,
    ) -> Dict[str, Any]:
        """Process and validate chain output."""
        scores = result.get("scores", {})

        # Clamp scores to valid range
        for key, value in scores.items():
            if value is not None:
                scores[key] = max(1.0, min(5.0, float(value)))

        return {
            "scores": scores,
            "overall_score": max(1.0, min(5.0, float(result.get("overall_score", 3.0)))),
            "confidence": max(0.0, min(1.0, float(result.get("confidence", 0.5)))),
            "key_phrases": result.get("key_phrases", {"positive": [], "negative": []}),
            "summary": result.get("summary", ""),
            "review_count_analyzed": review_count,
            "processed_at": datetime.utcnow().isoformat(),
        }

    def _create_empty_result(
        self,
        reason: str,
        review_count: int,
    ) -> Dict[str, Any]:
        """Create empty result when scoring isn't possible."""
        categories = ["hygiene", "safety", "teaching", "facilities",
                      "value", "ambience", "staff", "location"]
        return {
            "scores": {cat: None for cat in categories},
            "overall_score": None,
            "confidence": 0.0,
            "key_phrases": {"positive": [], "negative": []},
            "summary": reason,
            "review_count_analyzed": review_count,
            "processed_at": datetime.utcnow().isoformat(),
            "error": reason,
        }


# =============================================================================
# ACTIVITY INFERENCE CHAIN
# =============================================================================
class ActivityInferenceChain:
    """
    LangChain chain for inferring activities from venue data.

    This chain analyzes venue type, description, and reviews to
    infer what activities the venue likely offers.

    Features:
        - AI-powered activity inference
        - Fallback to default activities
        - Structured output with validation
        - LangSmith tracing

    Example:
        ```python
        inferrer = ActivityInferenceChain()
        activities = await inferrer.run(
            venue_name="ABC Dance Academy",
            venue_type="dance_school",
            venue_description="Classical and modern dance training"
        )
        ```
    """

    def __init__(self, use_fallback: bool = True):
        """
        Initialize the activity inference chain.

        Args:
            use_fallback: Use default activities if AI fails
        """
        self.use_fallback = use_fallback
        self._llm = get_chat_model(temperature=0.5)
        self._build_chain()

    def _build_chain(self) -> None:
        """Build the LangChain runnable sequence."""
        self.chain = (
            ACTIVITY_INFERENCE_PROMPT
            | self._llm
            | activity_inference_parser
        )

    @traceable(name="activity_inference", run_type="chain")
    async def run(
        self,
        venue_name: str,
        venue_type: str,
        venue_description: Optional[str] = None,
        reviews: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Infer activities for a venue.

        Args:
            venue_name: Name of the venue
            venue_type: Type of venue
            venue_description: Optional venue description
            reviews: Optional review texts for context

        Returns:
            List of activity dictionaries
        """
        try:
            # Prepare input
            review_insights = ""
            if reviews:
                review_insights = " | ".join(reviews[:5])

            input_data = {
                "venue_name": venue_name,
                "venue_type": venue_type,
                "venue_description": venue_description or "Not provided",
                "review_insights": review_insights or "No reviews available",
                "format_instructions": activity_inference_parser.get_format_instructions(),
            }

            # Execute chain
            result = await self.chain.ainvoke(input_data)

            # Extract and validate activities
            activities = result.get("activities", [])
            processed = [
                self._process_activity(a, venue_type)
                for a in activities
                if self._is_valid_activity(a)
            ]

            if processed:
                logger.info(
                    f"Inferred {len(processed)} activities for {venue_name}"
                )
                return processed

            # Fallback if no valid activities
            if self.use_fallback:
                return self._get_default_activities(venue_type)

            return []

        except Exception as e:
            logger.warning(f"Activity inference failed for {venue_name}: {e}")

            if self.use_fallback:
                return self._get_default_activities(venue_type)

            raise ExternalServiceError(
                f"Activity inference chain failed: {e}",
                details={"venue_name": venue_name}
            )

    def _process_activity(
        self,
        activity: Dict[str, Any],
        venue_type: str,
    ) -> Dict[str, Any]:
        """Process and validate an activity."""
        name = activity.get("name", "Activity")

        return {
            "name": name,
            "slug": self._generate_slug(name),
            "category": activity.get("category", "other"),
            "short_description": str(activity.get("short_description", ""))[:150],
            "min_age": max(3, min(16, activity.get("min_age", 4))),
            "max_age": max(4, min(18, activity.get("max_age", 14))),
            "duration_minutes": max(30, min(180, activity.get("duration_minutes", 60))),
            "capacity_per_session": 15,
            "credits_required": 2,
            "is_active": True,
            "activity_tags": {
                "indoor": not activity.get("is_outdoor", False),
                "outdoor": activity.get("is_outdoor", False),
                "competitive": activity.get("is_competitive", False),
                "messy": activity.get("is_messy", False),
            },
        }

    def _is_valid_activity(self, activity: Dict[str, Any]) -> bool:
        """Check if activity has required fields."""
        return isinstance(activity, dict) and bool(activity.get("name"))

    def _generate_slug(self, name: str) -> str:
        """Generate URL-friendly slug."""
        import re
        slug = name.lower()
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        return slug.strip("-")[:100]

    def _get_default_activities(self, venue_type: str) -> List[Dict[str, Any]]:
        """Get default activities for a venue type."""
        defaults = {
            "swimming_pool": [
                {"name": "Swimming Lessons", "category": "sports",
                 "short_description": "Learn to swim with certified instructors",
                 "min_age": 4, "max_age": 15, "duration_minutes": 45,
                 "is_outdoor": False, "is_competitive": False, "is_messy": False},
            ],
            "dance_school": [
                {"name": "Dance Classes", "category": "dance",
                 "short_description": "Learn various dance styles",
                 "min_age": 4, "max_age": 16, "duration_minutes": 60,
                 "is_outdoor": False, "is_competitive": False, "is_messy": False},
            ],
            "art_studio": [
                {"name": "Art Classes", "category": "arts",
                 "short_description": "Creative art workshops for kids",
                 "min_age": 4, "max_age": 14, "duration_minutes": 90,
                 "is_outdoor": False, "is_competitive": False, "is_messy": True},
            ],
        }

        venue_defaults = defaults.get(venue_type, [
            {"name": "Kids Activity Session", "category": "other",
             "short_description": "Fun activities for children",
             "min_age": 5, "max_age": 14, "duration_minutes": 60,
             "is_outdoor": False, "is_competitive": False, "is_messy": False},
        ])

        return [self._process_activity(a, venue_type) for a in venue_defaults]


# =============================================================================
# VENUE ANALYSIS CHAIN
# =============================================================================
class VenueAnalysisChain:
    """
    LangChain chain for analyzing venue suitability.

    This chain determines if a venue is suitable for kids activities
    and provides recommendations.

    Example:
        ```python
        analyzer = VenueAnalysisChain()
        result = await analyzer.run(
            venue_name="ABC Gym",
            google_types=["gym", "health"],
            description="Fitness center with kids programs"
        )
        ```
    """

    def __init__(self):
        """Initialize the venue analysis chain."""
        self._llm = get_chat_model(temperature=0.3)
        self._build_chain()

    def _build_chain(self) -> None:
        """Build the LangChain runnable sequence."""
        self.chain = (
            VENUE_ANALYSIS_PROMPT
            | self._llm
            | venue_analysis_parser
        )

    @traceable(name="venue_analysis", run_type="chain")
    async def run(
        self,
        venue_name: str,
        google_types: List[str],
        description: Optional[str] = None,
        rating: Optional[float] = None,
        review_count: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a venue for kids activity suitability.

        Args:
            venue_name: Name of the venue
            google_types: Google Place types
            description: Venue description
            rating: Google rating
            review_count: Number of reviews

        Returns:
            dict: Venue analysis results
        """
        try:
            input_data = {
                "venue_name": venue_name,
                "google_types": ", ".join(google_types),
                "description": description or "Not provided",
                "rating": rating or "Not available",
                "review_count": review_count or 0,
                "format_instructions": venue_analysis_parser.get_format_instructions(),
            }

            result = await self.chain.ainvoke(input_data)

            logger.info(
                f"Analyzed venue {venue_name}: suitable={result.get('suitable_for_kids')}"
            )

            return result

        except Exception as e:
            logger.error(f"Venue analysis failed for {venue_name}: {e}")
            raise ExternalServiceError(
                f"Venue analysis chain failed: {e}",
                details={"venue_name": venue_name}
            )
