# =============================================================================
# NEXUS FAMILY PASS - SLUG GENERATION UTILITIES
# =============================================================================
"""
URL Slug Generation Module.

This module provides utilities for generating URL-friendly slugs
from venue and activity names.

Features:
    - Unicode to ASCII transliteration
    - Special character removal
    - Whitespace normalization
    - Unique slug generation with suffix

Usage:
    ```python
    from app.utils.slug import generate_slug, generate_unique_slug
    
    # Basic slug
    slug = generate_slug("ABC Swimming Academy!")
    # Result: "abc-swimming-academy"
    
    # With max length
    slug = generate_slug("Very Long Venue Name Here", max_length=20)
    # Result: "very-long-venue-nam"
    
    # Unique slug (async)
    slug = await generate_unique_slug(db, Venue, "ABC Swimming")
    # Result: "abc-swimming" or "abc-swimming-2" if exists
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import re  # Regular expressions for pattern matching
import unicodedata  # Unicode character database for transliteration
from typing import Optional, Type, TypeVar  # Type hints

# Third-party imports
from sqlalchemy import select, func  # For database queries
from sqlalchemy.ext.asyncio import AsyncSession  # Async session type

# Local imports
from app.models.base import Base  # Base model class

# =============================================================================
# TYPE VARIABLES
# =============================================================================
# Generic type for models with slug field
ModelType = TypeVar("ModelType", bound=Base)


# =============================================================================
# SLUG GENERATION
# =============================================================================
def generate_slug(
    text: str,
    max_length: int = 255,
    separator: str = "-",
) -> str:
    """
    Generate a URL-friendly slug from text.
    
    This function:
        1. Converts Unicode characters to ASCII equivalents
        2. Converts to lowercase
        3. Removes special characters
        4. Replaces whitespace with separator
        5. Removes duplicate separators
        6. Trims to max length at word boundary
    
    Args:
        text: The text to convert to a slug
        max_length: Maximum length of the slug (default: 255)
        separator: Character to use between words (default: "-")
    
    Returns:
        str: URL-friendly slug
    
    Examples:
        ```python
        generate_slug("Hello World!")
        # Returns: "hello-world"
        
        generate_slug("Café & Résumé")
        # Returns: "cafe-resume"
        
        generate_slug("ABC's Swimming Academy #1")
        # Returns: "abcs-swimming-academy-1"
        ```
    """
    # Handle empty or None input
    if not text:
        return ""
    
    # Step 1: Normalize Unicode characters
    # NFKD decomposition separates base characters from combining marks
    # This allows us to strip accents while keeping base letters
    normalized = unicodedata.normalize("NFKD", text)
    
    # Step 2: Encode to ASCII, ignoring non-ASCII characters
    # This removes accented characters' diacritical marks
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    
    # Step 3: Convert to lowercase
    lowercase = ascii_text.lower()
    
    # Step 4: Replace special characters with spaces
    # Keep only alphanumeric characters and spaces
    # This regex matches anything that's NOT a letter, number, or space
    alphanumeric = re.sub(r"[^a-z0-9\s]", " ", lowercase)
    
    # Step 5: Replace multiple spaces with single space
    # Then strip leading/trailing whitespace
    cleaned = re.sub(r"\s+", " ", alphanumeric).strip()
    
    # Step 6: Replace spaces with separator
    with_separator = cleaned.replace(" ", separator)
    
    # Step 7: Remove duplicate separators
    # This handles cases like "hello---world" -> "hello-world"
    deduped = re.sub(f"{re.escape(separator)}+", separator, with_separator)
    
    # Step 8: Trim to max length at word boundary
    if len(deduped) > max_length:
        # Find the last separator before max_length
        truncated = deduped[:max_length]
        
        # If the truncation point is in the middle of a word,
        # cut at the last separator
        last_sep = truncated.rfind(separator)
        
        if last_sep > 0:
            truncated = truncated[:last_sep]
        
        deduped = truncated
    
    # Step 9: Remove trailing separator
    deduped = deduped.rstrip(separator)
    
    return deduped


async def generate_unique_slug(
    db: AsyncSession,
    model: Type[ModelType],
    text: str,
    max_length: int = 255,
    separator: str = "-",
    existing_id: Optional[str] = None,
) -> str:
    """
    Generate a unique slug by checking against existing slugs in the database.
    
    If the base slug already exists, appends a numeric suffix (-2, -3, etc.)
    until a unique slug is found.
    
    Args:
        db: Database session
        model: SQLAlchemy model class with 'slug' column
        text: The text to convert to a slug
        max_length: Maximum length of the slug
        separator: Character to use between words
        existing_id: If updating, exclude this ID from uniqueness check
    
    Returns:
        str: Unique URL-friendly slug
    
    Examples:
        ```python
        # If "abc-swimming" doesn't exist:
        slug = await generate_unique_slug(db, Venue, "ABC Swimming")
        # Returns: "abc-swimming"
        
        # If "abc-swimming" exists:
        slug = await generate_unique_slug(db, Venue, "ABC Swimming")
        # Returns: "abc-swimming-2"
        
        # If "abc-swimming" and "abc-swimming-2" exist:
        slug = await generate_unique_slug(db, Venue, "ABC Swimming")
        # Returns: "abc-swimming-3"
        ```
    """
    # Generate base slug
    base_slug = generate_slug(text, max_length=max_length, separator=separator)
    
    # If empty, generate a random slug
    if not base_slug:
        import uuid
        base_slug = str(uuid.uuid4())[:8]
    
    # Check if base slug is unique
    slug = base_slug
    counter = 1
    
    while True:
        # Build query to check if slug exists
        query = select(func.count()).select_from(model).where(
            model.slug == slug
        )
        
        # Exclude current record if updating
        if existing_id:
            query = query.where(model.id != existing_id)
        
        # Execute query
        result = await db.execute(query)
        count = result.scalar_one()
        
        # If no match, this slug is unique
        if count == 0:
            return slug
        
        # Otherwise, increment counter and try again
        counter += 1
        
        # Calculate suffix length needed
        suffix = f"{separator}{counter}"
        suffix_length = len(suffix)
        
        # Ensure base slug + suffix fits in max_length
        available_length = max_length - suffix_length
        
        if available_length < len(base_slug):
            # Need to truncate base slug
            truncated_base = generate_slug(
                text,
                max_length=available_length,
                separator=separator
            )
            slug = f"{truncated_base}{suffix}"
        else:
            slug = f"{base_slug}{suffix}"


def slugify_with_id(
    text: str,
    id_value: str,
    max_text_length: int = 50,
) -> str:
    """
    Generate a slug with an ID appended for guaranteed uniqueness.
    
    Useful when you want to ensure uniqueness without a database check.
    
    Args:
        text: The text to convert to a slug
        id_value: ID to append (usually first 8 chars of UUID)
        max_text_length: Maximum length for the text portion
    
    Returns:
        str: Slug in format "text-portion-id"
    
    Examples:
        ```python
        slugify_with_id("ABC Swimming", "a1b2c3d4")
        # Returns: "abc-swimming-a1b2c3d4"
        ```
    """
    # Generate slug from text
    text_slug = generate_slug(text, max_length=max_text_length)
    
    # Combine with ID
    return f"{text_slug}-{id_value}"


def is_valid_slug(slug: str) -> bool:
    """
    Check if a string is a valid slug.
    
    Valid slugs:
        - Contain only lowercase letters, numbers, and hyphens
        - Don't start or end with a hyphen
        - Don't contain consecutive hyphens
    
    Args:
        slug: The string to validate
    
    Returns:
        bool: True if valid slug
    
    Examples:
        ```python
        is_valid_slug("hello-world")  # True
        is_valid_slug("Hello-World")  # False (uppercase)
        is_valid_slug("-hello")       # False (starts with hyphen)
        is_valid_slug("hello--world") # False (consecutive hyphens)
        ```
    """
    if not slug:
        return False
    
    # Check for valid characters only
    if not re.match(r"^[a-z0-9-]+$", slug):
        return False
    
    # Check doesn't start or end with hyphen
    if slug.startswith("-") or slug.endswith("-"):
        return False
    
    # Check for consecutive hyphens
    if "--" in slug:
        return False
    
    return True
