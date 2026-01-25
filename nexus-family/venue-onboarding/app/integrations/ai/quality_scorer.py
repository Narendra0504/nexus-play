# =============================================================================
# NEXUS FAMILY PASS - AI QUALITY SCORER
# =============================================================================
"""
AI Quality Scoring Module.

This module provides AI-powered quality scoring for venues based on
their Google reviews. It extracts scores for 8 quality categories:
    1. Hygiene/cleanliness
    2. Safety
    3. Teaching quality
    4. Facilities
    5. Value for money
    6. Ambience
    7. Staff friendliness
    8. Location convenience

The scorer uses Google Gemini to analyze reviews and extract
structured quality data.

Usage:
    ```python
    scorer = QualityScorer()
    
    scores = await scorer.score_venue_reviews(
        reviews=["Great place!", "Clean and safe"],
        venue_name="ABC Swimming Academy",
        venue_type="swimming_pool"
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import Optional, List, Dict, Any  # Type hints
from datetime import datetime  # Timestamps

# Local imports
from app.integrations.ai.gemini_client import GeminiClient
from app.core.logging_config import get_logger  # Logging
from app.core.exceptions import ExternalServiceError  # Exceptions
from app.config import settings  # Configuration

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# QUALITY CATEGORIES
# =============================================================================
QUALITY_CATEGORIES = [
    "hygiene",      # Cleanliness, sanitation
    "safety",       # Child safety, supervision
    "teaching",     # Instructor quality, pedagogy
    "facilities",   # Equipment, space, amenities
    "value",        # Value for money
    "ambience",     # Atmosphere, environment
    "staff",        # Staff friendliness, helpfulness
    "location",     # Accessibility, convenience
]


# =============================================================================
# QUALITY SCORER
# =============================================================================
class QualityScorer:
    """
    AI-powered quality scorer for venues.
    
    Uses Gemini to analyze reviews and extract quality scores
    across multiple categories.
    
    Attributes:
        client: GeminiClient instance
        min_reviews: Minimum reviews needed for scoring
    
    Example:
        ```python
        scorer = QualityScorer()
        
        result = await scorer.score_venue_reviews(
            reviews=["Excellent swimming pool!", "Great instructors"],
            venue_name="ABC Swimming",
            venue_type="swimming_pool"
        )
        
        print(result["scores"]["teaching"])  # 4.5
        ```
    """
    
    def __init__(
        self,
        client: Optional[GeminiClient] = None,
        min_reviews: int = 3,
    ) -> None:
        """
        Initialize the quality scorer.
        
        Args:
            client: Optional GeminiClient (creates new if not provided)
            min_reviews: Minimum reviews required for scoring
        """
        # Use provided client or create new
        self.client = client or GeminiClient()
        
        # Minimum reviews for meaningful scores
        self.min_reviews = min_reviews
    
    # =========================================================================
    # SCORING METHODS
    # =========================================================================
    async def score_venue_reviews(
        self,
        reviews: List[str],
        venue_name: str,
        venue_type: str,
    ) -> Dict[str, Any]:
        """
        Score a venue based on its reviews.
        
        Args:
            reviews: List of review texts
            venue_name: Name of the venue
            venue_type: Type of venue (gym, swimming_pool, etc.)
        
        Returns:
            dict: Quality scores and metadata
            {
                "scores": {
                    "hygiene": 4.2,
                    "safety": 4.5,
                    ...
                },
                "overall_score": 4.3,
                "confidence": 0.85,
                "key_phrases": {...},
                "review_count_analyzed": 10,
                "processed_at": "2024-01-15T10:30:00Z"
            }
        
        Raises:
            ExternalServiceError: On AI processing errors
        """
        # Check minimum reviews
        if len(reviews) < self.min_reviews:
            logger.warning(
                f"Insufficient reviews for scoring: {len(reviews)} < {self.min_reviews}",
                extra={"venue_name": venue_name}
            )
            return self._create_empty_result(
                reason="Insufficient reviews",
                review_count=len(reviews)
            )
        
        try:
            # Use Gemini to analyze reviews
            result = await self.client.analyze_reviews(
                reviews=reviews,
                venue_name=venue_name,
                venue_type=venue_type,
            )
            
            # Process and validate the result
            processed = self._process_ai_result(result, len(reviews))
            
            logger.info(
                f"Scored venue {venue_name}: overall={processed['overall_score']:.2f}",
                extra={
                    "venue_name": venue_name,
                    "review_count": len(reviews),
                    "confidence": processed["confidence"],
                }
            )
            
            return processed
            
        except ExternalServiceError:
            raise
        except Exception as e:
            logger.error(
                f"Error scoring venue {venue_name}: {e}",
                extra={"venue_name": venue_name}
            )
            raise ExternalServiceError(
                f"Failed to score venue: {e}",
                details={"venue_name": venue_name}
            )
    
    # =========================================================================
    # RESULT PROCESSING
    # =========================================================================
    def _process_ai_result(
        self,
        result: Dict[str, Any],
        review_count: int,
    ) -> Dict[str, Any]:
        """
        Process and validate AI scoring result.
        
        Args:
            result: Raw AI result
            review_count: Number of reviews analyzed
        
        Returns:
            dict: Processed and validated result
        """
        # Extract scores with validation
        raw_scores = result.get("scores", {})
        scores = {}
        
        for category in QUALITY_CATEGORIES:
            score = raw_scores.get(category)
            
            if score is not None:
                # Clamp to valid range
                score = max(1.0, min(5.0, float(score)))
                scores[category] = round(score, 2)
            else:
                scores[category] = None
        
        # Calculate overall score
        valid_scores = [s for s in scores.values() if s is not None]
        
        if valid_scores:
            overall = sum(valid_scores) / len(valid_scores)
        else:
            overall = result.get("overall", 3.0)
        
        overall = max(1.0, min(5.0, float(overall)))
        
        # Extract confidence
        confidence = result.get("confidence", 0.5)
        confidence = max(0.0, min(1.0, float(confidence)))
        
        # Extract key phrases
        key_phrases = result.get("key_phrases", {})
        
        # Build final result
        return {
            "scores": scores,
            "overall_score": round(overall, 2),
            "confidence": round(confidence, 2),
            "key_phrases": {
                "positive": key_phrases.get("positive", [])[:10],
                "negative": key_phrases.get("negative", [])[:10],
            },
            "summary": result.get("summary", ""),
            "review_count_analyzed": review_count,
            "processed_at": datetime.utcnow().isoformat(),
        }
    
    def _create_empty_result(
        self,
        reason: str,
        review_count: int,
    ) -> Dict[str, Any]:
        """
        Create an empty result when scoring isn't possible.
        
        Args:
            reason: Why scoring wasn't possible
            review_count: Number of reviews available
        
        Returns:
            dict: Empty result with metadata
        """
        return {
            "scores": {cat: None for cat in QUALITY_CATEGORIES},
            "overall_score": None,
            "confidence": 0.0,
            "key_phrases": {"positive": [], "negative": []},
            "summary": reason,
            "review_count_analyzed": review_count,
            "processed_at": datetime.utcnow().isoformat(),
            "error": reason,
        }
    
    # =========================================================================
    # DATABASE INTEGRATION
    # =========================================================================
    def to_quality_score_dict(
        self,
        result: Dict[str, Any],
        venue_id: str,
    ) -> Dict[str, Any]:
        """
        Convert scoring result to VenueQualityScore model dict.
        
        Args:
            result: Scoring result from score_venue_reviews
            venue_id: UUID of the venue
        
        Returns:
            dict: Ready for VenueQualityScore model creation
        """
        scores = result.get("scores", {})
        
        return {
            "venue_id": venue_id,
            
            # Individual scores
            "hygiene_score": scores.get("hygiene"),
            "safety_score": scores.get("safety"),
            "teaching_score": scores.get("teaching"),
            "facilities_score": scores.get("facilities"),
            "value_score": scores.get("value"),
            "ambience_score": scores.get("ambience"),
            "staff_score": scores.get("staff"),
            "location_score": scores.get("location"),
            
            # Overall
            "overall_score": result.get("overall_score"),
            "confidence": result.get("confidence"),
            
            # Metadata
            "review_count_analyzed": result.get("review_count_analyzed", 0),
            "key_phrases": result.get("key_phrases", {}),
            
            # Timestamps
            "processed_at": datetime.utcnow(),
        }
    
    # =========================================================================
    # BATCH PROCESSING
    # =========================================================================
    async def score_multiple_venues(
        self,
        venues_data: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Score multiple venues (with rate limiting).
        
        Args:
            venues_data: List of dicts with:
                - venue_id: UUID
                - venue_name: str
                - venue_type: str
                - reviews: List[str]
        
        Returns:
            List of scoring results with venue_id
        """
        results = []
        
        for venue in venues_data:
            try:
                result = await self.score_venue_reviews(
                    reviews=venue["reviews"],
                    venue_name=venue["venue_name"],
                    venue_type=venue["venue_type"],
                )
                
                result["venue_id"] = venue["venue_id"]
                results.append(result)
                
            except ExternalServiceError as e:
                logger.warning(
                    f"Failed to score venue {venue['venue_name']}: {e}"
                )
                # Add error result
                error_result = self._create_empty_result(
                    reason=str(e),
                    review_count=len(venue.get("reviews", []))
                )
                error_result["venue_id"] = venue["venue_id"]
                results.append(error_result)
        
        return results
