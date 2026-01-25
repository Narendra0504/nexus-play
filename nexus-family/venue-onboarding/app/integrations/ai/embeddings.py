# =============================================================================
# NEXUS FAMILY PASS - TEXT EMBEDDINGS GENERATOR
# =============================================================================
"""
Text Embeddings Generator Module.

This module provides text embedding generation for:
    - Activity descriptions (for semantic search)
    - Venue descriptions
    - Review text

Embeddings are stored in PostgreSQL using pgvector extension.
Dimension: 768 (Gemini embedding model)

Usage:
    ```python
    generator = EmbeddingsGenerator()
    
    embedding = await generator.generate_embedding(
        "Swimming lessons for kids aged 5-12"
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # Async utilities
from typing import Optional, List  # Type hints

# Third-party imports
import google.generativeai as genai  # Gemini SDK

# Local imports
from app.config import settings  # Configuration
from app.core.logging_config import get_logger  # Logging
from app.core.exceptions import ExternalServiceError  # Exceptions

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# EMBEDDINGS GENERATOR
# =============================================================================
class EmbeddingsGenerator:
    """
    Text embeddings generator using Gemini.
    
    Generates 768-dimensional embeddings for semantic search
    and similarity matching.
    
    Attributes:
        model_name: Gemini embedding model name
        dimension: Embedding dimension (768)
    
    Example:
        ```python
        generator = EmbeddingsGenerator()
        
        # Single embedding
        embedding = await generator.generate_embedding("Swimming lessons")
        
        # Batch embeddings
        embeddings = await generator.generate_embeddings([
            "Swimming lessons",
            "Art classes",
            "Music training"
        ])
        ```
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "models/text-embedding-004",
    ) -> None:
        """
        Initialize the embeddings generator.
        
        Args:
            api_key: Gemini API key (defaults to settings)
            model_name: Embedding model name
        """
        # Configure Gemini SDK
        genai.configure(api_key=api_key or settings.GEMINI_API_KEY)
        
        # Store model name
        self.model_name = model_name
        
        # Embedding dimension (Gemini text-embedding-004 produces 768D)
        self.dimension = settings.EMBEDDING_DIMENSION
        
        # Rate limiting
        self._request_delay = 4.0  # 4 seconds for free tier
        self._last_request_time: float = 0
        self._lock = asyncio.Lock()
    
    # =========================================================================
    # RATE LIMITING
    # =========================================================================
    async def _rate_limit(self) -> None:
        """
        Apply rate limiting delay between requests.
        """
        import time
        
        async with self._lock:
            current_time = time.time()
            elapsed = current_time - self._last_request_time
            
            if elapsed < self._request_delay:
                delay = self._request_delay - elapsed
                logger.debug(f"Rate limiting embeddings: waiting {delay:.2f}s")
                await asyncio.sleep(delay)
            
            self._last_request_time = time.time()
    
    # =========================================================================
    # EMBEDDING GENERATION
    # =========================================================================
    async def generate_embedding(
        self,
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
    ) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            task_type: Embedding task type
                - RETRIEVAL_DOCUMENT: For storing documents
                - RETRIEVAL_QUERY: For search queries
                - SEMANTIC_SIMILARITY: For similarity comparison
        
        Returns:
            List[float]: 768-dimensional embedding
        
        Raises:
            ExternalServiceError: On API errors
        """
        # Apply rate limiting
        await self._rate_limit()
        
        try:
            # Generate embedding
            result = await asyncio.to_thread(
                genai.embed_content,
                model=self.model_name,
                content=text,
                task_type=task_type,
            )
            
            embedding = result["embedding"]
            
            # Validate dimension
            if len(embedding) != self.dimension:
                logger.warning(
                    f"Unexpected embedding dimension: {len(embedding)} vs {self.dimension}"
                )
            
            return embedding
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise ExternalServiceError(
                f"Failed to generate embedding: {e}",
                details={"model": self.model_name}
            )
    
    async def generate_embeddings(
        self,
        texts: List[str],
        task_type: str = "RETRIEVAL_DOCUMENT",
    ) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Processes sequentially with rate limiting.
        
        Args:
            texts: List of texts to embed
            task_type: Embedding task type
        
        Returns:
            List of embeddings
        """
        embeddings = []
        
        for i, text in enumerate(texts):
            try:
                embedding = await self.generate_embedding(text, task_type)
                embeddings.append(embedding)
                
                logger.debug(
                    f"Generated embedding {i+1}/{len(texts)}",
                    extra={"text_length": len(text)}
                )
                
            except ExternalServiceError as e:
                logger.warning(f"Failed to embed text {i}: {e}")
                # Add zero vector as placeholder
                embeddings.append([0.0] * self.dimension)
        
        return embeddings
    
    async def generate_query_embedding(
        self,
        query: str,
    ) -> List[float]:
        """
        Generate embedding for a search query.
        
        Uses RETRIEVAL_QUERY task type optimized for queries.
        
        Args:
            query: Search query text
        
        Returns:
            List[float]: Query embedding
        """
        return await self.generate_embedding(
            text=query,
            task_type="RETRIEVAL_QUERY",
        )
    
    # =========================================================================
    # ACTIVITY EMBEDDINGS
    # =========================================================================
    async def generate_activity_embedding(
        self,
        name: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[dict] = None,
    ) -> List[float]:
        """
        Generate embedding for an activity.
        
        Combines activity metadata into a single text for embedding.
        
        Args:
            name: Activity name
            description: Activity description
            category: Activity category
            tags: Activity tags dict
        
        Returns:
            List[float]: Activity embedding
        """
        # Build combined text
        parts = [name]
        
        if description:
            parts.append(description)
        
        if category:
            parts.append(f"Category: {category}")
        
        if tags:
            # Convert tags to text
            tag_texts = []
            for key, value in tags.items():
                if value is True:
                    tag_texts.append(key.replace("_", " "))
            if tag_texts:
                parts.append(f"Features: {', '.join(tag_texts)}")
        
        text = ". ".join(parts)
        
        return await self.generate_embedding(text)
    
    async def generate_venue_embedding(
        self,
        name: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        city: Optional[str] = None,
    ) -> List[float]:
        """
        Generate embedding for a venue.
        
        Args:
            name: Venue name
            description: Venue description
            category: Primary category
            city: City location
        
        Returns:
            List[float]: Venue embedding
        """
        # Build combined text
        parts = [name]
        
        if description:
            parts.append(description)
        
        if category:
            parts.append(f"Type: {category}")
        
        if city:
            parts.append(f"Location: {city}")
        
        text = ". ".join(parts)
        
        return await self.generate_embedding(text)
    
    # =========================================================================
    # UTILITY METHODS
    # =========================================================================
    def get_zero_embedding(self) -> List[float]:
        """
        Get a zero embedding (placeholder).
        
        Returns:
            List[float]: Zero vector of correct dimension
        """
        return [0.0] * self.dimension
    
    async def test_connection(self) -> bool:
        """
        Test that embeddings can be generated.
        
        Returns:
            bool: True if working
        """
        try:
            embedding = await self.generate_embedding("test")
            return len(embedding) == self.dimension
        except Exception:
            return False
