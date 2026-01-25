# =============================================================================
# NEXUS FAMILY PASS - GEMINI CLIENT
# =============================================================================
"""
Google Gemini API Client Module.

This module provides an async client for the Google Gemini API.
It handles:
    - Text generation
    - Structured output extraction
    - Rate limiting (15 RPM free tier)
    - Error handling and retries

Rate Limit Strategy:
    - 4-second minimum delay between requests
    - Exponential backoff on rate limit errors
    - Request queuing for batch operations

Usage:
    ```python
    client = GeminiClient()
    
    response = await client.generate(
        prompt="Analyze these reviews...",
        system_prompt="You are a review analyzer..."
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # Async utilities
import json  # JSON parsing
from typing import Optional, Dict, Any, List  # Type hints

# Third-party imports
import google.generativeai as genai  # Gemini SDK

# Local imports
from app.config import settings  # Configuration
from app.core.logging_config import get_logger, log_external_call  # Logging
from app.core.exceptions import ExternalServiceError  # Exceptions

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# GEMINI CLIENT
# =============================================================================
class GeminiClient:
    """
    Async client for Google Gemini API.
    
    This client wraps the Gemini SDK with async support,
    rate limiting, and structured output extraction.
    
    Attributes:
        model_name: Gemini model to use
        _model: Gemini GenerativeModel instance
        _request_delay: Minimum seconds between requests
    
    Example:
        ```python
        client = GeminiClient()
        
        # Simple generation
        response = await client.generate("Tell me about swimming")
        
        # Structured output
        data = await client.generate_json(
            prompt="Extract key phrases from: ...",
            schema={"positive": ["str"], "negative": ["str"]}
        )
        ```
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-1.5-flash",
    ) -> None:
        """
        Initialize the Gemini client.
        
        Args:
            api_key: Gemini API key (defaults to settings)
            model_name: Model to use (default: gemini-1.5-flash)
        """
        # Configure the Gemini SDK
        genai.configure(api_key=api_key or settings.GEMINI_API_KEY)
        
        # Store model name
        self.model_name = model_name
        
        # Create model instance
        self._model = genai.GenerativeModel(model_name)
        
        # Rate limiting (4 seconds for 15 RPM free tier)
        self._request_delay = 4.0
        self._last_request_time: float = 0
        
        # Lock for thread safety
        self._lock = asyncio.Lock()
    
    # =========================================================================
    # RATE LIMITING
    # =========================================================================
    async def _rate_limit(self) -> None:
        """
        Apply rate limiting delay between requests.
        
        Ensures at least _request_delay seconds between API calls.
        """
        import time
        
        async with self._lock:
            current_time = time.time()
            elapsed = current_time - self._last_request_time
            
            if elapsed < self._request_delay:
                delay = self._request_delay - elapsed
                logger.debug(f"Rate limiting: waiting {delay:.2f}s")
                await asyncio.sleep(delay)
            
            self._last_request_time = time.time()
    
    # =========================================================================
    # TEXT GENERATION
    # =========================================================================
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """
        Generate text using Gemini.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system instruction
            temperature: Creativity (0-1)
            max_tokens: Maximum response tokens
        
        Returns:
            str: Generated text
        
        Raises:
            ExternalServiceError: On API errors
        """
        # Apply rate limiting
        await self._rate_limit()
        
        try:
            # Log the external call
            log_external_call(
                service="gemini",
                method="generate",
                endpoint=self.model_name,
            )
            
            # Build generation config
            config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            
            # Build full prompt with system instruction
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"
            
            # Generate response (sync SDK, but we rate limit async)
            response = await asyncio.to_thread(
                self._model.generate_content,
                full_prompt,
                generation_config=config,
            )
            
            # Extract text
            if response.text:
                return response.text.strip()
            
            logger.warning("Gemini returned empty response")
            return ""
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise ExternalServiceError(
                f"Gemini API error: {e}",
                details={"model": self.model_name}
            )
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
    ) -> Dict[str, Any]:
        """
        Generate JSON-structured output.
        
        Args:
            prompt: User prompt (should request JSON output)
            system_prompt: Optional system instruction
            temperature: Lower for more consistent JSON
        
        Returns:
            dict: Parsed JSON response
        
        Raises:
            ExternalServiceError: On API or JSON parsing errors
        """
        # Add JSON instruction to system prompt
        json_system = (
            "You must respond with valid JSON only. "
            "Do not include any text outside the JSON object."
        )
        if system_prompt:
            json_system = f"{system_prompt}\n\n{json_system}"
        
        # Generate response
        response = await self.generate(
            prompt=prompt,
            system_prompt=json_system,
            temperature=temperature,
        )
        
        # Parse JSON
        try:
            # Handle markdown code blocks
            if response.startswith("```"):
                # Extract JSON from code block
                lines = response.split("\n")
                json_lines = []
                in_block = False
                
                for line in lines:
                    if line.startswith("```"):
                        in_block = not in_block
                        continue
                    if in_block:
                        json_lines.append(line)
                
                response = "\n".join(json_lines)
            
            return json.loads(response)
            
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse Gemini JSON response: {e}",
                extra={"response": response[:200]}
            )
            raise ExternalServiceError(
                "Failed to parse Gemini response as JSON",
                details={"error": str(e)}
            )
    
    # =========================================================================
    # SPECIALIZED METHODS
    # =========================================================================
    async def analyze_reviews(
        self,
        reviews: List[str],
        venue_name: str,
        venue_type: str,
    ) -> Dict[str, Any]:
        """
        Analyze reviews to extract quality scores.
        
        Args:
            reviews: List of review texts
            venue_name: Name of the venue
            venue_type: Type of venue (gym, swimming_pool, etc.)
        
        Returns:
            dict: Quality scores and key phrases
        """
        # Build prompt
        reviews_text = "\n\n".join([
            f"Review {i+1}: {review}"
            for i, review in enumerate(reviews[:10])  # Limit to 10 reviews
        ])
        
        prompt = f"""
Analyze these reviews for "{venue_name}" ({venue_type}) and extract quality scores.

Reviews:
{reviews_text}

Based on these reviews, provide scores (1-5) for each category and extract key phrases.
Categories: hygiene, safety, teaching, facilities, value, ambience, staff, location.

Respond with JSON:
{{
    "scores": {{
        "hygiene": <1-5 or null if not mentioned>,
        "safety": <1-5 or null>,
        "teaching": <1-5 or null>,
        "facilities": <1-5 or null>,
        "value": <1-5 or null>,
        "ambience": <1-5 or null>,
        "staff": <1-5 or null>,
        "location": <1-5 or null>
    }},
    "overall": <1-5>,
    "confidence": <0-1>,
    "key_phrases": {{
        "positive": ["phrase1", "phrase2"],
        "negative": ["phrase1", "phrase2"]
    }},
    "summary": "Brief 1-2 sentence summary"
}}
"""
        
        system_prompt = (
            "You are an expert at analyzing customer reviews for kids activity venues. "
            "Focus on aspects important for parents: safety, cleanliness, teaching quality. "
            "Be objective and only score based on what's mentioned in reviews."
        )
        
        return await self.generate_json(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.3,
        )
    
    async def infer_activities(
        self,
        venue_name: str,
        venue_type: str,
        venue_description: Optional[str] = None,
        reviews: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Infer activities offered at a venue.
        
        Args:
            venue_name: Name of the venue
            venue_type: Type of venue
            venue_description: Optional description
            reviews: Optional review texts for context
        
        Returns:
            List of activity dictionaries
        """
        # Build context
        context_parts = [f"Venue: {venue_name}", f"Type: {venue_type}"]
        
        if venue_description:
            context_parts.append(f"Description: {venue_description}")
        
        if reviews:
            reviews_text = " | ".join(reviews[:5])
            context_parts.append(f"Review snippets: {reviews_text}")
        
        context = "\n".join(context_parts)
        
        prompt = f"""
Based on this venue information, infer what activities they likely offer for children:

{context}

Provide a list of activities with details. Respond with JSON:
{{
    "activities": [
        {{
            "name": "Activity Name",
            "category": "sports|arts|music|dance|stem|other",
            "short_description": "Brief description (max 150 chars)",
            "min_age": <minimum age>,
            "max_age": <maximum age>,
            "duration_minutes": <typical duration>,
            "is_outdoor": <true|false>,
            "is_competitive": <true|false>,
            "is_messy": <true|false>
        }}
    ]
}}
"""
        
        system_prompt = (
            "You are an expert on kids activities. "
            "Infer realistic activities based on the venue type. "
            "Be specific but don't make up activities that are unlikely for this venue type."
        )
        
        result = await self.generate_json(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.5,
        )
        
        return result.get("activities", [])
