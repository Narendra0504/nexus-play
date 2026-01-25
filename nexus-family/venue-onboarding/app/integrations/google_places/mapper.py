# =============================================================================
# NEXUS FAMILY PASS - GOOGLE PLACES TO VENUE MAPPER
# =============================================================================
"""
Google Places to Internal Model Mapper Module.

This module provides mapping functionality to convert Google Places API
responses to internal database models. It handles:
    - Field mapping and transformation
    - Slug generation
    - Category inference from place types
    - Business hours parsing
    - Review extraction

Usage:
    ```python
    mapper = PlaceToVenueMapper()
    venue_data = mapper.map_to_venue(place_details)
    review_data = mapper.extract_reviews(place_details)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import re  # Regular expressions for slug generation
from typing import Dict, List, Any, Optional  # Type hints
from datetime import datetime  # Timestamps

# Local imports
from app.integrations.google_places.models import PlaceDetails, PlaceReview
from app.core.logging_config import get_logger  # Logging
from app.config import settings  # Configuration

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# CATEGORY MAPPING
# =============================================================================
# Maps Google Place types to Nexus categories
TYPE_TO_CATEGORY = {
    # Sports
    "gym": "sports",
    "fitness_center": "sports",
    "swimming_pool": "sports",
    "sports_club": "sports",
    "sports_complex": "sports",
    "stadium": "sports",
    "tennis_court": "sports",
    "basketball_court": "sports",
    "badminton_court": "sports",
    
    # Arts
    "art_studio": "arts",
    "art_gallery": "arts",
    "art_school": "arts",
    "painting_class": "arts",
    "pottery_class": "arts",
    
    # Music
    "music_school": "music",
    "concert_hall": "music",
    "performing_arts_theater": "music",
    
    # Dance
    "dance_school": "dance",
    "dance_studio": "dance",
    "ballet_school": "dance",
    
    # STEM
    "science_museum": "stem",
    "planetarium": "stem",
    "coding_bootcamp": "stem",
    "robotics_school": "stem",
    
    # Martial Arts
    "martial_arts_school": "sports",
    "karate_school": "sports",
    "taekwondo_school": "sports",
    
    # Yoga
    "yoga_studio": "sports",
    
    # Default
    "point_of_interest": "other",
    "establishment": "other",
}


# =============================================================================
# PLACE TO VENUE MAPPER
# =============================================================================
class PlaceToVenueMapper:
    """
    Mapper class for converting Google Places data to internal models.
    
    This class provides methods to transform API responses into
    dictionaries suitable for creating database models.
    
    Attributes:
        api_key: Google API key (for photo URLs)
    
    Example:
        ```python
        mapper = PlaceToVenueMapper()
        
        # Map place to venue
        venue_data = mapper.map_to_venue(place_details)
        
        # Create venue from data
        venue = Venue(**venue_data)
        ```
    """
    
    def __init__(self, api_key: Optional[str] = None) -> None:
        """
        Initialize the mapper.
        
        Args:
            api_key: Google API key for photo URLs
        """
        self.api_key = api_key or settings.GOOGLE_PLACES_API_KEY
    
    # =========================================================================
    # VENUE MAPPING
    # =========================================================================
    def map_to_venue(
        self,
        place: PlaceDetails,
        include_photos: bool = True,
        max_photos: int = 5,
    ) -> Dict[str, Any]:
        """
        Map a PlaceDetails object to a venue dictionary.
        
        Args:
            place: Google Places details
            include_photos: Whether to include photo URLs
            max_photos: Maximum photos to include
        
        Returns:
            dict: Dictionary suitable for Venue model creation
        
        Example:
            ```python
            venue_data = mapper.map_to_venue(place_details)
            venue = Venue(**venue_data)
            db.add(venue)
            ```
        """
        # Get display name
        name = place.display_name or "Unknown Venue"
        
        # Generate slug
        slug = self._generate_slug(name)
        
        # Determine category from place types
        category = self._infer_category(place.types)
        
        # Parse business hours
        business_hours = self._parse_business_hours(place)
        
        # Get photo URLs
        photo_urls = []
        if include_photos and place.photos:
            photo_urls = [
                self._get_photo_url(photo.name, 800)
                for photo in place.photos[:max_photos]
            ]
        
        # Build venue dictionary
        venue_data = {
            # Google Places identifiers
            "google_place_id": place.id,
            "google_place_name": place.name,
            
            # Basic info
            "name": name,
            "slug": slug,
            "short_description": place.editorial_summary_text,
            "primary_category": category,
            
            # Address
            "address_line1": place.shortFormattedAddress or place.formattedAddress,
            "city": place.city,
            "state": place.state,
            "postal_code": place.postal_code,
            "country": place.country or "India",
            
            # Location
            "latitude": place.location.latitude if place.location else None,
            "longitude": place.location.longitude if place.location else None,
            
            # Contact
            "contact_phone": place.nationalPhoneNumber or place.internationalPhoneNumber,
            "website_url": place.websiteUri,
            
            # Google data
            "google_rating": place.rating,
            "google_review_count": place.userRatingCount or 0,
            "google_types": place.types,
            "google_price_level": place.priceLevel,
            "google_business_status": place.businessStatus,
            
            # Business hours
            "business_hours": business_hours,
            
            # Photos
            "photos_urls": photo_urls,
            
            # Data source
            "data_source": "google_places",
            "google_data_fetched_at": datetime.utcnow(),
            
            # Status
            "is_active": True,
        }
        
        logger.debug(
            f"Mapped place to venue: {name}",
            extra={"place_id": place.id, "category": category}
        )
        
        return venue_data
    
    # =========================================================================
    # REVIEW MAPPING
    # =========================================================================
    def extract_reviews(
        self,
        place: PlaceDetails,
        venue_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Extract reviews from place details.
        
        Args:
            place: Google Places details with reviews
            venue_id: Optional venue UUID to associate reviews with
        
        Returns:
            List of dictionaries suitable for GoogleReview model
        """
        if not place.reviews:
            return []
        
        reviews = []
        for review in place.reviews:
            review_data = self._map_review(review, place.id, venue_id)
            if review_data:
                reviews.append(review_data)
        
        logger.debug(
            f"Extracted {len(reviews)} reviews",
            extra={"place_id": place.id}
        )
        
        return reviews
    
    def _map_review(
        self,
        review: PlaceReview,
        place_id: str,
        venue_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Map a single review to a dictionary.
        
        Args:
            review: Google Places review
            place_id: Google Place ID
            venue_id: Optional venue UUID
        
        Returns:
            dict or None: Review data dictionary
        """
        # Get review text
        review_text = review.review_text
        if not review_text:
            return None
        
        # Parse publish time
        publish_time = None
        if review.publishTime:
            try:
                publish_time = datetime.fromisoformat(
                    review.publishTime.replace("Z", "+00:00")
                )
            except ValueError:
                pass
        
        return {
            # Identifiers
            "google_review_id": review.name,
            "google_place_id": place_id,
            "venue_id": venue_id,
            
            # Review content
            "rating": review.rating,
            "review_text": review_text,
            "review_language": "en",  # Assume English for now
            
            # Author info
            "author_name": review.author_name,
            "author_photo_url": (
                review.authorAttribution.photoUri
                if review.authorAttribution else None
            ),
            
            # Timestamps
            "published_at": publish_time,
            "relative_time": review.relativePublishTimeDescription,
            
            # Processing status
            "is_processed": False,
        }
    
    # =========================================================================
    # HELPER METHODS
    # =========================================================================
    def _generate_slug(self, name: str) -> str:
        """
        Generate a URL-friendly slug from a name.
        
        Args:
            name: Venue name
        
        Returns:
            str: URL slug
        
        Example:
            "ABC Swimming Academy!" -> "abc-swimming-academy"
        """
        # Convert to lowercase
        slug = name.lower()
        
        # Replace non-alphanumeric characters with hyphens
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        
        # Remove leading/trailing hyphens
        slug = slug.strip("-")
        
        # Limit length
        if len(slug) > 100:
            slug = slug[:100].rsplit("-", 1)[0]
        
        return slug
    
    def _infer_category(self, types: List[str]) -> str:
        """
        Infer activity category from Google Place types.
        
        Args:
            types: List of Google Place types
        
        Returns:
            str: Nexus category (sports, arts, music, etc.)
        """
        if not types:
            return "other"
        
        # Check each type against mapping
        for place_type in types:
            if place_type in TYPE_TO_CATEGORY:
                return TYPE_TO_CATEGORY[place_type]
        
        # Default to "other" if no match
        return "other"
    
    def _parse_business_hours(
        self,
        place: PlaceDetails,
    ) -> Dict[str, Any]:
        """
        Parse business hours from place details.
        
        Args:
            place: Google Places details
        
        Returns:
            dict: Business hours in standard format
        """
        hours = {}
        
        # Get regular opening hours
        opening_hours = place.regularOpeningHours or place.currentOpeningHours
        
        if opening_hours and opening_hours.weekdayDescriptions:
            # Parse text descriptions
            days = [
                "monday", "tuesday", "wednesday", "thursday",
                "friday", "saturday", "sunday"
            ]
            
            for i, description in enumerate(opening_hours.weekdayDescriptions):
                if i < len(days):
                    hours[days[i]] = description
        
        # Add current status
        if opening_hours:
            hours["is_open_now"] = opening_hours.openNow
        
        return hours
    
    def _get_photo_url(
        self,
        photo_name: str,
        max_width: int = 800,
    ) -> str:
        """
        Generate a photo URL.
        
        Args:
            photo_name: Photo resource name
            max_width: Maximum width in pixels
        
        Returns:
            str: Photo URL
        """
        return (
            f"https://places.googleapis.com/v1/{photo_name}/media"
            f"?maxWidthPx={max_width}&key={self.api_key}"
        )
    
    # =========================================================================
    # BATCH OPERATIONS
    # =========================================================================
    def map_places_to_venues(
        self,
        places: List[PlaceDetails],
    ) -> List[Dict[str, Any]]:
        """
        Map multiple places to venue dictionaries.
        
        Args:
            places: List of place details
        
        Returns:
            List of venue dictionaries
        """
        venues = []
        
        for place in places:
            try:
                venue_data = self.map_to_venue(place)
                venues.append(venue_data)
            except Exception as e:
                logger.warning(
                    f"Failed to map place {place.id}: {e}"
                )
                continue
        
        return venues
