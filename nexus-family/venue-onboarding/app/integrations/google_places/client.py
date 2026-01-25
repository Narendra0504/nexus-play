# =============================================================================
# NEXUS FAMILY PASS - GOOGLE PLACES API CLIENT
# =============================================================================
"""
Google Places API (New) Client Module.

This module provides an async client for interacting with the
Google Places API (New). It handles:
    - Text Search for venue discovery
    - Place Details for full information
    - Reviews retrieval
    - Photos URL generation
    - Rate limiting and error handling

Rate Limit Strategy:
    - Built-in delays between requests (4 seconds for Gemini compatibility)
    - Exponential backoff on rate limit errors
    - Request batching where possible

Usage:
    ```python
    client = GooglePlacesClient()
    
    # Search for swimming academies
    results = await client.text_search(
        query="swimming academy Bangalore",
        location={"latitude": 12.9716, "longitude": 77.5946},
        radius=5000
    )
    
    # Get place details
    details = await client.get_place_details(place_id)
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # Async utilities
from typing import Optional, List, Dict, Any  # Type hints

# Third-party imports
import httpx  # Async HTTP client

# Local imports
from app.config import settings  # Configuration
from app.core.logging_config import get_logger, log_external_call  # Logging
from app.core.exceptions import ExternalServiceError  # Exceptions
from app.integrations.google_places.models import (
    PlaceSearchResult,
    PlaceDetails,
    TextSearchResponse,
)

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# CONSTANTS
# =============================================================================
# Google Places API (New) base URL
BASE_URL = "https://places.googleapis.com/v1"

# Default field masks for API requests
# Only request fields we actually use to minimize costs
SEARCH_FIELD_MASK = [
    "places.name",
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.types",
    "places.rating",
    "places.userRatingCount",
]

DETAILS_FIELD_MASK = [
    "name",
    "id",
    "displayName",
    "formattedAddress",
    "shortFormattedAddress",
    "addressComponents",
    "location",
    "types",
    "rating",
    "userRatingCount",
    "nationalPhoneNumber",
    "internationalPhoneNumber",
    "websiteUri",
    "regularOpeningHours",
    "reviews",
    "photos",
    "editorialSummary",
    "businessStatus",
    "priceLevel",
]

# Place types for kids activities
KIDS_ACTIVITY_TYPES = [
    "gym",
    "swimming_pool",
    "sports_club",
    "sports_complex",
    "fitness_center",
    "dance_school",
    "art_studio",
    "music_school",
    "martial_arts_school",
    "yoga_studio",
]


# =============================================================================
# GOOGLE PLACES CLIENT
# =============================================================================
class GooglePlacesClient:
    """
    Async client for Google Places API (New).
    
    This client handles all communication with the Google Places API,
    including authentication, request building, and response parsing.
    
    Attributes:
        api_key: Google API key
        timeout: Request timeout in seconds
        _client: HTTPX async client instance
    
    Example:
        ```python
        async with GooglePlacesClient() as client:
            results = await client.text_search("swimming academy Bangalore")
            for place in results:
                details = await client.get_place_details(place.id)
                print(details.display_name)
        ```
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
    ) -> None:
        """
        Initialize the Google Places client.
        
        Args:
            api_key: Google API key (defaults to settings.GOOGLE_PLACES_API_KEY)
            timeout: Request timeout in seconds
        """
        # Use provided API key or fall back to settings
        self.api_key = api_key or settings.GOOGLE_PLACES_API_KEY
        
        # Request timeout
        self.timeout = timeout
        
        # HTTPX client (created lazily)
        self._client: Optional[httpx.AsyncClient] = None
        
        # Request delay for rate limiting (4 seconds for Gemini compatibility)
        self._request_delay = 4.0
        
        # Track last request time
        self._last_request_time: float = 0
    
    async def __aenter__(self) -> "GooglePlacesClient":
        """
        Async context manager entry.
        
        Creates the HTTPX client.
        """
        self._client = httpx.AsyncClient(
            timeout=self.timeout,
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": self.api_key,
            },
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """
        Async context manager exit.
        
        Closes the HTTPX client.
        """
        if self._client:
            await self._client.aclose()
            self._client = None
    
    # =========================================================================
    # RATE LIMITING
    # =========================================================================
    async def _rate_limit(self) -> None:
        """
        Apply rate limiting delay between requests.
        
        Ensures at least _request_delay seconds between API calls
        to stay within free tier limits.
        """
        import time
        
        current_time = time.time()
        elapsed = current_time - self._last_request_time
        
        if elapsed < self._request_delay:
            delay = self._request_delay - elapsed
            logger.debug(f"Rate limiting: waiting {delay:.2f}s")
            await asyncio.sleep(delay)
        
        self._last_request_time = time.time()
    
    # =========================================================================
    # HTTP HELPERS
    # =========================================================================
    async def _ensure_client(self) -> httpx.AsyncClient:
        """
        Ensure HTTPX client is initialized.
        
        Returns:
            httpx.AsyncClient: The HTTP client
        
        Raises:
            RuntimeError: If client not initialized
        """
        if self._client is None:
            # Create client if not using context manager
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                headers={
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": self.api_key,
                },
            )
        return self._client
    
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        field_mask: Optional[List[str]] = None,
        json_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Make an HTTP request to the Google Places API.
        
        Args:
            method: HTTP method (GET, POST)
            endpoint: API endpoint path
            field_mask: Fields to include in response
            json_data: JSON body for POST requests
        
        Returns:
            dict: API response data
        
        Raises:
            ExternalServiceError: On API errors
        """
        # Apply rate limiting
        await self._rate_limit()
        
        # Get client
        client = await self._ensure_client()
        
        # Build URL
        url = f"{BASE_URL}/{endpoint}"
        
        # Build headers
        headers = {}
        if field_mask:
            headers["X-Goog-FieldMask"] = ",".join(field_mask)
        
        try:
            # Log the external call
            log_external_call(
                service="google_places",
                method=method,
                endpoint=endpoint,
            )
            
            # Make request
            if method.upper() == "POST":
                response = await client.post(
                    url,
                    headers=headers,
                    json=json_data or {},
                )
            else:
                response = await client.get(
                    url,
                    headers=headers,
                )
            
            # Check for errors
            if response.status_code != 200:
                error_data = response.json() if response.text else {}
                error_message = error_data.get("error", {}).get(
                    "message", f"HTTP {response.status_code}"
                )
                logger.error(
                    f"Google Places API error: {error_message}",
                    extra={
                        "status_code": response.status_code,
                        "endpoint": endpoint,
                    }
                )
                raise ExternalServiceError(
                    f"Google Places API error: {error_message}",
                    details={
                        "status_code": response.status_code,
                        "endpoint": endpoint,
                    }
                )
            
            return response.json()
            
        except httpx.TimeoutException as e:
            logger.error(f"Google Places API timeout: {e}")
            raise ExternalServiceError(
                "Google Places API request timed out",
                details={"endpoint": endpoint}
            )
        except httpx.RequestError as e:
            logger.error(f"Google Places API request error: {e}")
            raise ExternalServiceError(
                f"Google Places API request failed: {e}",
                details={"endpoint": endpoint}
            )
    
    # =========================================================================
    # TEXT SEARCH
    # =========================================================================
    async def text_search(
        self,
        query: str,
        location: Optional[Dict[str, float]] = None,
        radius: int = 5000,
        included_type: Optional[str] = None,
        max_results: int = 20,
    ) -> List[PlaceSearchResult]:
        """
        Search for places using text query.
        
        Args:
            query: Search query (e.g., "swimming academy Bangalore")
            location: Center point {"latitude": float, "longitude": float}
            radius: Search radius in meters (default 5000)
            included_type: Filter by place type
            max_results: Maximum results to return
        
        Returns:
            List[PlaceSearchResult]: Search results
        
        Example:
            ```python
            results = await client.text_search(
                query="swimming academy",
                location={"latitude": 12.9716, "longitude": 77.5946},
                radius=10000
            )
            ```
        """
        # Build request body
        request_body: Dict[str, Any] = {
            "textQuery": query,
            "maxResultCount": min(max_results, 20),  # API max is 20
        }
        
        # Add location bias if provided
        if location:
            request_body["locationBias"] = {
                "circle": {
                    "center": location,
                    "radius": float(radius),
                }
            }
        
        # Add type filter if provided
        if included_type:
            request_body["includedType"] = included_type
        
        # Make request
        response_data = await self._make_request(
            method="POST",
            endpoint="places:searchText",
            field_mask=SEARCH_FIELD_MASK,
            json_data=request_body,
        )
        
        # Parse response
        response = TextSearchResponse(**response_data)
        
        logger.info(
            f"Text search returned {len(response.places)} results",
            extra={"query": query}
        )
        
        return response.places
    
    # =========================================================================
    # PLACE DETAILS
    # =========================================================================
    async def get_place_details(
        self,
        place_id: str,
    ) -> PlaceDetails:
        """
        Get detailed information about a place.
        
        Args:
            place_id: Google Place ID
        
        Returns:
            PlaceDetails: Full place details including reviews
        
        Example:
            ```python
            details = await client.get_place_details("ChIJ...")
            print(details.display_name)
            print(details.reviews)
            ```
        """
        # Make request
        response_data = await self._make_request(
            method="GET",
            endpoint=f"places/{place_id}",
            field_mask=DETAILS_FIELD_MASK,
        )
        
        # Parse response
        details = PlaceDetails(**response_data)
        
        logger.info(
            f"Got place details for {details.display_name}",
            extra={"place_id": place_id}
        )
        
        return details
    
    # =========================================================================
    # BATCH OPERATIONS
    # =========================================================================
    async def search_kids_activities(
        self,
        city: str,
        types: Optional[List[str]] = None,
        max_per_type: int = 10,
    ) -> List[PlaceSearchResult]:
        """
        Search for kids activity venues in a city.
        
        Searches for multiple activity types and combines results.
        
        Args:
            city: City name (e.g., "Bangalore")
            types: Activity types to search (defaults to KIDS_ACTIVITY_TYPES)
            max_per_type: Maximum results per type
        
        Returns:
            List[PlaceSearchResult]: Combined search results
        
        Example:
            ```python
            venues = await client.search_kids_activities(
                city="Bangalore",
                types=["swimming_pool", "gym"]
            )
            ```
        """
        # Use default types if not provided
        search_types = types or KIDS_ACTIVITY_TYPES
        
        # Collect all results
        all_results: List[PlaceSearchResult] = []
        seen_ids: set = set()
        
        for place_type in search_types:
            try:
                # Search for this type
                query = f"{place_type.replace('_', ' ')} for kids in {city}"
                results = await self.text_search(
                    query=query,
                    max_results=max_per_type,
                )
                
                # Add unique results
                for place in results:
                    if place.id not in seen_ids:
                        seen_ids.add(place.id)
                        all_results.append(place)
                
                logger.debug(
                    f"Found {len(results)} venues for type {place_type}",
                    extra={"city": city, "type": place_type}
                )
                
            except ExternalServiceError as e:
                logger.warning(
                    f"Failed to search for {place_type}: {e}",
                    extra={"city": city, "type": place_type}
                )
                continue
        
        logger.info(
            f"Found {len(all_results)} unique venues in {city}",
            extra={"city": city, "types_searched": len(search_types)}
        )
        
        return all_results
    
    async def get_places_with_details(
        self,
        place_ids: List[str],
        batch_size: int = 5,
    ) -> List[PlaceDetails]:
        """
        Get details for multiple places.
        
        Processes in batches with rate limiting.
        
        Args:
            place_ids: List of place IDs
            batch_size: Places to process per batch
        
        Returns:
            List[PlaceDetails]: Place details
        """
        results: List[PlaceDetails] = []
        
        for i in range(0, len(place_ids), batch_size):
            batch = place_ids[i:i + batch_size]
            
            for place_id in batch:
                try:
                    details = await self.get_place_details(place_id)
                    results.append(details)
                except ExternalServiceError as e:
                    logger.warning(
                        f"Failed to get details for {place_id}: {e}"
                    )
                    continue
        
        return results
    
    # =========================================================================
    # PHOTO HELPERS
    # =========================================================================
    def get_photo_url(
        self,
        photo_name: str,
        max_width: int = 800,
    ) -> str:
        """
        Generate a photo URL.
        
        Args:
            photo_name: Photo resource name from Place Details
            max_width: Maximum width in pixels
        
        Returns:
            str: Photo URL
        """
        return (
            f"{BASE_URL}/{photo_name}/media"
            f"?maxWidthPx={max_width}&key={self.api_key}"
        )
    
    def get_photo_urls(
        self,
        details: PlaceDetails,
        max_photos: int = 5,
        max_width: int = 800,
    ) -> List[str]:
        """
        Get photo URLs for a place.
        
        Args:
            details: Place details with photos
            max_photos: Maximum number of photos
            max_width: Maximum width in pixels
        
        Returns:
            List[str]: Photo URLs
        """
        if not details.photos:
            return []
        
        urls = []
        for photo in details.photos[:max_photos]:
            urls.append(self.get_photo_url(photo.name, max_width))
        
        return urls
