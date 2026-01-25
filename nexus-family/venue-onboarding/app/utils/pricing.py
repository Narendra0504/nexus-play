# =============================================================================
# NEXUS FAMILY PASS - MOCK PRICING UTILITIES
# =============================================================================
"""
Mock Pricing Calculation Module.

This module provides utilities for generating mock pricing for venues
and activities in Phase 1. Prices are calculated based on:
    - Activity type (swimming, sports, arts, etc.)
    - Location (city-based price adjustment)
    - Day of week (weekend premium)
    - Venue rating (quality premium)

Phase 2 Note:
    In Phase 2, these mock prices will be converted to credits
    based on a configurable credit-to-INR ratio.

Usage:
    ```python
    from app.utils.pricing import calculate_mock_price, generate_venue_pricing
    
    # Single price calculation
    price = calculate_mock_price(
        activity_type="swimming",
        city="Bangalore",
        is_weekend=True,
        rating=4.5
    )
    # Result: 550 (INR)
    
    # Generate all pricing for a venue
    pricing = generate_venue_pricing(
        venue_types=["swimming_pool", "sports_complex"],
        city="Bangalore",
        rating=4.5
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import Dict, List, Optional, Tuple  # Type hints
from dataclasses import dataclass  # Data classes
import random  # For slight price variation

# =============================================================================
# CONSTANTS
# =============================================================================
# Base prices by activity type (in INR)
# These are baseline weekday prices for a Tier-1 city
BASE_PRICES: Dict[str, int] = {
    # Sports
    "swimming": 400,
    "badminton": 300,
    "tennis": 500,
    "basketball": 350,
    "football": 300,
    "cricket": 400,
    "gymnastics": 450,
    "martial_arts": 400,
    "yoga": 300,
    "skating": 350,
    
    # Arts & Creative
    "art_class": 400,
    "pottery": 500,
    "music": 450,
    "dance": 400,
    "drama": 400,
    "photography": 500,
    
    # STEM
    "coding": 600,
    "robotics": 700,
    "science": 500,
    "math": 450,
    
    # General
    "general": 350,
    "workshop": 400,
    "camp": 800,
}

# City-based price multipliers
# 1.0 = baseline (Tier-1 metro)
# < 1.0 = discount for smaller cities
# > 1.0 = premium for expensive cities
CITY_MULTIPLIERS: Dict[str, float] = {
    # Tier-1 Metros (baseline)
    "bangalore": 1.0,
    "bengaluru": 1.0,
    "mumbai": 1.15,  # Premium market
    "delhi": 1.1,
    "new delhi": 1.1,
    "chennai": 0.95,
    "hyderabad": 0.95,
    "kolkata": 0.90,
    
    # Tier-2 Cities
    "pune": 0.90,
    "ahmedabad": 0.85,
    "jaipur": 0.80,
    "lucknow": 0.75,
    "chandigarh": 0.85,
    "kochi": 0.85,
    "coimbatore": 0.80,
    
    # Default for unknown cities
    "default": 0.85,
}

# Weekend premium percentage
WEEKEND_PREMIUM_PERCENT: int = 20

# Rating-based price adjustment
# Higher rated venues can charge more
# Rating 4.5+ gets 10% premium, 4.0-4.5 gets 5%, below 4.0 gets no premium
RATING_PREMIUM_THRESHOLDS: List[Tuple[float, float]] = [
    (4.5, 0.10),  # 10% premium for 4.5+
    (4.0, 0.05),  # 5% premium for 4.0-4.5
    (0.0, 0.00),  # No premium below 4.0
]


# =============================================================================
# DATA CLASSES
# =============================================================================
@dataclass
class PricingResult:
    """
    Result of a price calculation.
    
    Attributes:
        activity_type: Type of activity
        weekday_price: Price for weekdays (INR)
        weekend_price: Price for weekends (INR)
        city: City used for calculation
        rating_premium_applied: Whether rating premium was applied
    """
    activity_type: str
    weekday_price: int
    weekend_price: int
    city: str
    rating_premium_applied: bool = False


# =============================================================================
# PRICE CALCULATION
# =============================================================================
def calculate_mock_price(
    activity_type: str,
    city: str = "bangalore",
    is_weekend: bool = False,
    rating: Optional[float] = None,
    add_variation: bool = True,
) -> int:
    """
    Calculate mock price for an activity.
    
    The calculation follows these steps:
        1. Get base price for activity type
        2. Apply city multiplier
        3. Apply rating premium (if applicable)
        4. Apply weekend premium (if applicable)
        5. Add slight random variation (optional)
        6. Round to nearest 50
    
    Args:
        activity_type: Type of activity (e.g., "swimming", "coding")
        city: City name for price adjustment
        is_weekend: Whether this is a weekend price
        rating: Venue's Google rating (1-5) for premium calculation
        add_variation: Add ±5% random variation for realism
    
    Returns:
        int: Calculated price in INR (rounded to nearest 50)
    
    Examples:
        ```python
        # Basic calculation
        price = calculate_mock_price("swimming", "bangalore")
        # Returns: ~400 (base price for swimming)
        
        # Weekend in Mumbai with high rating
        price = calculate_mock_price(
            "swimming",
            city="mumbai",
            is_weekend=True,
            rating=4.7
        )
        # Returns: ~550 (400 * 1.15 * 1.10 * 1.20)
        ```
    """
    # Step 1: Get base price
    # Normalize activity type to lowercase
    activity_key = activity_type.lower().replace(" ", "_")
    
    # Look up base price, default to "general" if not found
    base_price = BASE_PRICES.get(activity_key, BASE_PRICES["general"])
    
    # Step 2: Apply city multiplier
    # Normalize city name to lowercase
    city_key = city.lower().strip()
    
    # Get multiplier, default to "default" if city not found
    city_multiplier = CITY_MULTIPLIERS.get(
        city_key,
        CITY_MULTIPLIERS["default"]
    )
    
    price = base_price * city_multiplier
    
    # Step 3: Apply rating premium
    if rating is not None:
        for threshold, premium in RATING_PREMIUM_THRESHOLDS:
            if rating >= threshold:
                price *= (1 + premium)
                break
    
    # Step 4: Apply weekend premium
    if is_weekend:
        weekend_multiplier = 1 + (WEEKEND_PREMIUM_PERCENT / 100)
        price *= weekend_multiplier
    
    # Step 5: Add random variation (±5%)
    if add_variation:
        variation = random.uniform(-0.05, 0.05)
        price *= (1 + variation)
    
    # Step 6: Round to nearest 50
    price = round(price / 50) * 50
    
    # Ensure minimum price
    price = max(100, price)
    
    return int(price)


def generate_venue_pricing(
    venue_types: List[str],
    city: str,
    rating: Optional[float] = None,
) -> List[PricingResult]:
    """
    Generate mock pricing for all activity types at a venue.
    
    This function infers which activities are available based on
    the venue's Google Places types and generates pricing for each.
    
    Args:
        venue_types: List of Google Places types (e.g., ["swimming_pool"])
        city: City name for price adjustment
        rating: Venue's Google rating
    
    Returns:
        List[PricingResult]: Pricing for each inferred activity
    
    Examples:
        ```python
        pricing = generate_venue_pricing(
            venue_types=["swimming_pool", "gym"],
            city="Bangalore",
            rating=4.5
        )
        # Returns list of PricingResult for swimming, gym activities
        ```
    """
    # Map Google Places types to activity types
    type_to_activities = _map_venue_types_to_activities(venue_types)
    
    # Generate pricing for each activity
    results: List[PricingResult] = []
    
    for activity_type in type_to_activities:
        # Calculate weekday price
        weekday_price = calculate_mock_price(
            activity_type=activity_type,
            city=city,
            is_weekend=False,
            rating=rating,
            add_variation=True,
        )
        
        # Calculate weekend price
        weekend_price = calculate_mock_price(
            activity_type=activity_type,
            city=city,
            is_weekend=True,
            rating=rating,
            add_variation=True,
        )
        
        results.append(PricingResult(
            activity_type=activity_type,
            weekday_price=weekday_price,
            weekend_price=weekend_price,
            city=city,
            rating_premium_applied=(
                rating is not None and rating >= 4.0
            ),
        ))
    
    return results


def _map_venue_types_to_activities(venue_types: List[str]) -> List[str]:
    """
    Map Google Places venue types to activity types.
    
    Args:
        venue_types: List of Google Places types
    
    Returns:
        List of activity types for pricing
    """
    # Mapping from Google Places types to our activity types
    type_mapping: Dict[str, List[str]] = {
        # Sports
        "swimming_pool": ["swimming"],
        "gym": ["general", "yoga"],
        "stadium": ["general", "football", "cricket"],
        "sports_complex": ["general", "badminton", "basketball"],
        
        # Arts
        "art_gallery": ["art_class"],
        "art_school": ["art_class", "pottery"],
        "dance_school": ["dance"],
        "music_school": ["music"],
        
        # Education
        "school": ["general", "workshop"],
        "university": ["general", "workshop"],
        "library": ["workshop", "general"],
        
        # Entertainment
        "amusement_park": ["general", "camp"],
        "bowling_alley": ["general"],
        "movie_theater": ["drama"],
        
        # Default
        "point_of_interest": ["general"],
        "establishment": ["general"],
    }
    
    activities: set = set()
    
    for venue_type in venue_types:
        # Normalize type
        normalized_type = venue_type.lower().strip()
        
        # Get mapped activities
        if normalized_type in type_mapping:
            activities.update(type_mapping[normalized_type])
        else:
            # Default to general
            activities.add("general")
    
    # Always include "general" as fallback
    if not activities:
        activities.add("general")
    
    return sorted(list(activities))


def get_activity_type_from_name(activity_name: str) -> str:
    """
    Infer activity type from activity name.
    
    Args:
        activity_name: Name of the activity
    
    Returns:
        str: Inferred activity type for pricing
    
    Examples:
        ```python
        get_activity_type_from_name("Swimming Lessons for Kids")
        # Returns: "swimming"
        
        get_activity_type_from_name("Creative Art Workshop")
        # Returns: "art_class"
        ```
    """
    # Normalize name
    name_lower = activity_name.lower()
    
    # Keywords to activity type mapping
    keyword_mapping: Dict[str, List[str]] = {
        "swimming": ["swim", "aqua", "pool"],
        "badminton": ["badminton", "shuttle"],
        "tennis": ["tennis", "racquet"],
        "basketball": ["basket", "basketball"],
        "football": ["football", "soccer"],
        "cricket": ["cricket", "bat and ball"],
        "gymnastics": ["gymnast", "tumble", "acrobat"],
        "martial_arts": ["karate", "martial", "judo", "taekwondo", "kungfu"],
        "yoga": ["yoga", "meditation", "mindfulness"],
        "skating": ["skate", "skating", "roller"],
        "art_class": ["art", "drawing", "painting", "sketch"],
        "pottery": ["pottery", "ceramic", "clay"],
        "music": ["music", "guitar", "piano", "violin", "drum", "singing", "vocal"],
        "dance": ["dance", "dancing", "ballet", "salsa", "hip hop"],
        "drama": ["drama", "theater", "theatre", "acting"],
        "photography": ["photo", "camera"],
        "coding": ["code", "coding", "programming", "computer"],
        "robotics": ["robot", "robotics", "mechan"],
        "science": ["science", "experiment", "lab"],
        "math": ["math", "abacus", "vedic"],
        "workshop": ["workshop"],
        "camp": ["camp", "summer camp", "holiday"],
    }
    
    # Check each keyword mapping
    for activity_type, keywords in keyword_mapping.items():
        for keyword in keywords:
            if keyword in name_lower:
                return activity_type
    
    # Default to general
    return "general"


def calculate_credits_from_price(
    price_inr: int,
    credit_value_inr: int = 200,
) -> int:
    """
    Convert INR price to credits (for Phase 2).
    
    Args:
        price_inr: Price in INR
        credit_value_inr: Value of one credit in INR
    
    Returns:
        int: Number of credits (minimum 1)
    
    Examples:
        ```python
        calculate_credits_from_price(400)  # Returns 2
        calculate_credits_from_price(550)  # Returns 3
        calculate_credits_from_price(100)  # Returns 1 (minimum)
        ```
    """
    # Calculate credits, rounding up
    credits = max(1, round(price_inr / credit_value_inr))
    return credits
