# =============================================================================
# NEXUS FAMILY PASS - ACTIVITY INFERRER
# =============================================================================
"""
AI Activity Inference Module.

This module uses AI to infer activities offered at venues based on:
    - Venue type and category
    - Venue description
    - Review content

This is used in Phase 1 where venues don't manage their own activities.
The AI infers likely activities and creates mock listings.

Usage:
    ```python
    inferrer = ActivityInferrer()
    
    activities = await inferrer.infer_activities(
        venue_name="ABC Swimming Academy",
        venue_type="swimming_pool",
        venue_description="Learn to swim with certified instructors"
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import re  # Regular expressions
from typing import Optional, List, Dict, Any  # Type hints
from datetime import datetime  # Timestamps

# Local imports
from app.integrations.ai.gemini_client import GeminiClient
from app.core.logging_config import get_logger  # Logging
from app.core.exceptions import ExternalServiceError  # Exceptions

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# DEFAULT ACTIVITIES BY VENUE TYPE
# =============================================================================
# Fallback activities when AI inference fails or isn't needed
DEFAULT_ACTIVITIES = {
    "swimming_pool": [
        {
            "name": "Swimming Lessons",
            "category": "sports",
            "short_description": "Learn to swim with certified instructors",
            "min_age": 4,
            "max_age": 15,
            "duration_minutes": 45,
            "is_outdoor": False,
            "is_competitive": False,
            "is_messy": False,
        },
        {
            "name": "Advanced Swimming",
            "category": "sports",
            "short_description": "Improve strokes and build stamina",
            "min_age": 8,
            "max_age": 16,
            "duration_minutes": 60,
            "is_outdoor": False,
            "is_competitive": True,
            "is_messy": False,
        },
    ],
    "gym": [
        {
            "name": "Kids Fitness",
            "category": "sports",
            "short_description": "Fun fitness activities for children",
            "min_age": 6,
            "max_age": 14,
            "duration_minutes": 45,
            "is_outdoor": False,
            "is_competitive": False,
            "is_messy": False,
        },
    ],
    "dance_school": [
        {
            "name": "Dance Classes",
            "category": "dance",
            "short_description": "Learn various dance styles",
            "min_age": 4,
            "max_age": 16,
            "duration_minutes": 60,
            "is_outdoor": False,
            "is_competitive": False,
            "is_messy": False,
        },
    ],
    "art_studio": [
        {
            "name": "Art Classes",
            "category": "arts",
            "short_description": "Creative art workshops for kids",
            "min_age": 4,
            "max_age": 14,
            "duration_minutes": 90,
            "is_outdoor": False,
            "is_competitive": False,
            "is_messy": True,
        },
    ],
    "music_school": [
        {
            "name": "Music Lessons",
            "category": "music",
            "short_description": "Learn instruments and music theory",
            "min_age": 5,
            "max_age": 16,
            "duration_minutes": 60,
            "is_outdoor": False,
            "is_competitive": False,
            "is_messy": False,
        },
    ],
    "martial_arts_school": [
        {
            "name": "Martial Arts Training",
            "category": "sports",
            "short_description": "Learn discipline and self-defense",
            "min_age": 5,
            "max_age": 16,
            "duration_minutes": 60,
            "is_outdoor": False,
            "is_competitive": True,
            "is_messy": False,
        },
    ],
}


# =============================================================================
# ACTIVITY INFERRER
# =============================================================================
class ActivityInferrer:
    """
    AI-powered activity inferrer for venues.
    
    Uses Gemini to infer activities based on venue data,
    with fallbacks to default activities by venue type.
    
    Attributes:
        client: GeminiClient instance
        use_ai: Whether to use AI inference or just defaults
    
    Example:
        ```python
        inferrer = ActivityInferrer()
        
        activities = await inferrer.infer_activities(
            venue_name="ABC Academy",
            venue_type="swimming_pool"
        )
        
        for activity in activities:
            print(activity["name"])
        ```
    """
    
    def __init__(
        self,
        client: Optional[GeminiClient] = None,
        use_ai: bool = True,
    ) -> None:
        """
        Initialize the activity inferrer.
        
        Args:
            client: Optional GeminiClient (creates new if not provided)
            use_ai: Whether to use AI inference (set False to use defaults only)
        """
        self.client = client or GeminiClient() if use_ai else None
        self.use_ai = use_ai
    
    # =========================================================================
    # ACTIVITY INFERENCE
    # =========================================================================
    async def infer_activities(
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
            venue_type: Type of venue (gym, swimming_pool, etc.)
            venue_description: Optional venue description
            reviews: Optional review texts for context
        
        Returns:
            List of activity dictionaries
        """
        activities = []
        
        # Try AI inference if enabled
        if self.use_ai and self.client:
            try:
                ai_activities = await self.client.infer_activities(
                    venue_name=venue_name,
                    venue_type=venue_type,
                    venue_description=venue_description,
                    reviews=reviews,
                )
                
                # Validate and process AI results
                activities = [
                    self._process_activity(a, venue_type)
                    for a in ai_activities
                    if self._is_valid_activity(a)
                ]
                
                if activities:
                    logger.info(
                        f"AI inferred {len(activities)} activities for {venue_name}",
                        extra={"venue_type": venue_type}
                    )
                    return activities
                    
            except ExternalServiceError as e:
                logger.warning(
                    f"AI inference failed, using defaults: {e}",
                    extra={"venue_name": venue_name}
                )
        
        # Fall back to defaults
        activities = self._get_default_activities(venue_type)
        
        logger.info(
            f"Using {len(activities)} default activities for {venue_name}",
            extra={"venue_type": venue_type}
        )
        
        return activities
    
    # =========================================================================
    # ACTIVITY PROCESSING
    # =========================================================================
    def _process_activity(
        self,
        activity: Dict[str, Any],
        venue_type: str,
    ) -> Dict[str, Any]:
        """
        Process and validate an activity dictionary.
        
        Args:
            activity: Raw activity data
            venue_type: Venue type for context
        
        Returns:
            dict: Processed activity with all required fields
        """
        # Generate slug from name
        name = activity.get("name", "Activity")
        slug = self._generate_slug(name)
        
        # Determine category
        category = activity.get("category", "other")
        if category not in ["sports", "arts", "music", "dance", "stem", "other"]:
            category = self._infer_category_from_venue_type(venue_type)
        
        # Process age range
        min_age = max(3, min(16, activity.get("min_age", 4)))
        max_age = max(min_age, min(18, activity.get("max_age", 14)))
        
        # Process duration
        duration = activity.get("duration_minutes", 60)
        duration = max(30, min(180, duration))
        
        return {
            "name": name,
            "slug": slug,
            "category": category,
            "short_description": activity.get(
                "short_description",
                f"{name} for kids"
            )[:150],
            "min_age": min_age,
            "max_age": max_age,
            "duration_minutes": duration,
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
        """
        Check if an activity dict has required fields.
        
        Args:
            activity: Activity data to validate
        
        Returns:
            bool: True if valid
        """
        return (
            isinstance(activity, dict) and
            "name" in activity and
            len(activity.get("name", "")) > 0
        )
    
    def _get_default_activities(
        self,
        venue_type: str,
    ) -> List[Dict[str, Any]]:
        """
        Get default activities for a venue type.
        
        Args:
            venue_type: Type of venue
        
        Returns:
            List of processed default activities
        """
        # Find matching defaults
        defaults = DEFAULT_ACTIVITIES.get(venue_type)
        
        if not defaults:
            # Try to find partial match
            for key, activities in DEFAULT_ACTIVITIES.items():
                if key in venue_type or venue_type in key:
                    defaults = activities
                    break
        
        # Still no match, use generic
        if not defaults:
            defaults = [
                {
                    "name": "Kids Activity Session",
                    "category": self._infer_category_from_venue_type(venue_type),
                    "short_description": "Fun activities for children",
                    "min_age": 5,
                    "max_age": 14,
                    "duration_minutes": 60,
                    "is_outdoor": False,
                    "is_competitive": False,
                    "is_messy": False,
                }
            ]
        
        return [
            self._process_activity(a, venue_type)
            for a in defaults
        ]
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    def _generate_slug(self, name: str) -> str:
        """
        Generate URL-friendly slug from name.
        
        Args:
            name: Activity name
        
        Returns:
            str: URL slug
        """
        slug = name.lower()
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        slug = slug.strip("-")
        return slug[:100]
    
    def _infer_category_from_venue_type(
        self,
        venue_type: str,
    ) -> str:
        """
        Infer activity category from venue type.
        
        Args:
            venue_type: Google Place type
        
        Returns:
            str: Activity category
        """
        venue_type_lower = venue_type.lower()
        
        if any(s in venue_type_lower for s in ["gym", "fitness", "sports", "swim", "martial"]):
            return "sports"
        elif any(s in venue_type_lower for s in ["art", "craft", "paint"]):
            return "arts"
        elif any(s in venue_type_lower for s in ["music", "instrument"]):
            return "music"
        elif any(s in venue_type_lower for s in ["dance", "ballet"]):
            return "dance"
        elif any(s in venue_type_lower for s in ["science", "coding", "robot"]):
            return "stem"
        
        return "other"
    
    # =========================================================================
    # DATABASE INTEGRATION
    # =========================================================================
    def to_activity_dicts(
        self,
        activities: List[Dict[str, Any]],
        venue_id: str,
    ) -> List[Dict[str, Any]]:
        """
        Convert activity list to database-ready dicts.
        
        Args:
            activities: List of activity dicts
            venue_id: UUID of the venue
        
        Returns:
            List ready for Activity model creation
        """
        return [
            {
                **activity,
                "venue_id": venue_id,
                "is_ai_inferred": True,
                "embedding_outdated": True,
            }
            for activity in activities
        ]
