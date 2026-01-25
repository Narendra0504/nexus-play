#!/usr/bin/env python
# =============================================================================
# NEXUS FAMILY PASS - VENUE INGESTION SCRIPT
# =============================================================================
"""
Google Places Venue Ingestion Script.

This script fetches venues from Google Places API and stores them
in the database. It's designed to be run periodically to discover
new venues or update existing venue information.

Features:
    - Search for kids activity venues by category and location
    - Fetch venue details including reviews
    - Generate URL slugs
    - Store in PostgreSQL with embeddings placeholder

Usage:
    # Ingest venues in Bangalore
    python scripts/ingest_venues.py --city "Bangalore" --category "swimming_pool"
    
    # Ingest multiple categories
    python scripts/ingest_venues.py --city "Bangalore" --all-categories
    
    # Dry run (don't save to database)
    python scripts/ingest_venues.py --city "Bangalore" --dry-run

Environment Variables Required:
    - GOOGLE_PLACES_API_KEY: Google Places API key
    - DATABASE_URL: PostgreSQL connection string
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # Async operations
import argparse  # Command line argument parsing
import sys  # System operations
from typing import List, Optional  # Type hints

# Add parent directory to path for imports
sys.path.insert(0, str(__file__).rsplit("/", 2)[0])

# Local imports
from app.config import settings
from app.core.database import get_db_session
from app.core.logging_config import get_logger, setup_logging
from app.integrations.google_places.client import GooglePlacesClient
from app.integrations.google_places.mapper import GooglePlacesMapper
from app.models.venue import Venue
from app.models.review import GoogleReview
from app.utils.slug import generate_unique_slug
from app.utils.pricing import generate_venue_pricing

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)

# =============================================================================
# CONSTANTS
# =============================================================================
# Categories to search for kids activities
ACTIVITY_CATEGORIES = [
    "swimming_pool",
    "gym",
    "sports_complex",
    "art_school",
    "dance_school",
    "music_school",
    "martial_arts_school",
    "yoga_studio",
    "playground",
]

# Default search radius in meters
DEFAULT_RADIUS = 10000  # 10km

# City coordinates for search center
CITY_COORDINATES = {
    "bangalore": (12.9716, 77.5946),
    "bengaluru": (12.9716, 77.5946),
    "mumbai": (19.0760, 72.8777),
    "delhi": (28.6139, 77.2090),
    "chennai": (13.0827, 80.2707),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
}


# =============================================================================
# INGESTION FUNCTIONS
# =============================================================================
async def ingest_venues(
    city: str,
    categories: List[str],
    radius: int = DEFAULT_RADIUS,
    dry_run: bool = False,
    max_results: int = 20,
) -> dict:
    """
    Ingest venues from Google Places API.
    
    Args:
        city: City name to search in
        categories: List of venue categories to search for
        radius: Search radius in meters
        dry_run: If True, don't save to database
        max_results: Maximum results per category
    
    Returns:
        dict: Summary of ingestion results
    """
    logger.info(
        f"Starting venue ingestion for {city}",
        extra={"categories": categories, "radius": radius}
    )
    
    # Get city coordinates
    city_lower = city.lower()
    if city_lower not in CITY_COORDINATES:
        logger.error(f"Unknown city: {city}")
        return {"error": f"Unknown city: {city}"}
    
    lat, lng = CITY_COORDINATES[city_lower]
    
    # Initialize Google Places client
    places_client = GooglePlacesClient(api_key=settings.GOOGLE_PLACES_API_KEY)
    mapper = GooglePlacesMapper()
    
    # Track results
    results = {
        "city": city,
        "categories_searched": len(categories),
        "venues_found": 0,
        "venues_created": 0,
        "venues_updated": 0,
        "reviews_fetched": 0,
        "errors": [],
    }
    
    async with get_db_session() as db:
        for category in categories:
            logger.info(f"Searching for {category} venues...")
            
            try:
                # Search for venues
                places = await places_client.search_nearby(
                    latitude=lat,
                    longitude=lng,
                    radius=radius,
                    place_type=category,
                    max_results=max_results,
                )
                
                results["venues_found"] += len(places)
                logger.info(f"Found {len(places)} {category} venues")
                
                for place_data in places:
                    try:
                        # Get detailed place information
                        place_details = await places_client.get_place_details(
                            place_id=place_data["place_id"]
                        )
                        
                        if dry_run:
                            logger.info(f"[DRY RUN] Would create: {place_details.get('name')}")
                            continue
                        
                        # Check if venue already exists
                        existing_venue = await db.execute(
                            Venue.__table__.select().where(
                                Venue.google_place_id == place_details.get("place_id")
                            )
                        )
                        existing = existing_venue.fetchone()
                        
                        if existing:
                            # Update existing venue
                            venue_data = mapper.map_place_to_venue(place_details, city)
                            await db.execute(
                                Venue.__table__.update()
                                .where(Venue.google_place_id == place_details.get("place_id"))
                                .values(**venue_data)
                            )
                            results["venues_updated"] += 1
                            venue_id = existing.id
                            logger.info(f"Updated venue: {place_details.get('name')}")
                        else:
                            # Create new venue
                            venue_data = mapper.map_place_to_venue(place_details, city)
                            
                            # Generate unique slug
                            venue_data["slug"] = await generate_unique_slug(
                                db, Venue, venue_data["name"]
                            )
                            
                            # Create venue
                            venue = Venue(**venue_data)
                            db.add(venue)
                            await db.flush()
                            venue_id = venue.id
                            
                            results["venues_created"] += 1
                            logger.info(f"Created venue: {place_details.get('name')}")
                        
                        # Process reviews
                        reviews = place_details.get("reviews", [])
                        for review_data in reviews:
                            review = mapper.map_review(review_data, venue_id)
                            
                            # Check if review exists
                            existing_review = await db.execute(
                                GoogleReview.__table__.select().where(
                                    GoogleReview.google_review_id == review.get("google_review_id")
                                )
                            )
                            
                            if not existing_review.fetchone():
                                google_review = GoogleReview(**review)
                                db.add(google_review)
                                results["reviews_fetched"] += 1
                        
                        await db.commit()
                        
                        # Rate limiting: Wait between requests
                        await asyncio.sleep(0.5)
                        
                    except Exception as e:
                        logger.error(f"Error processing venue: {e}")
                        results["errors"].append(str(e))
                        await db.rollback()
                
            except Exception as e:
                logger.error(f"Error searching for {category}: {e}")
                results["errors"].append(f"{category}: {str(e)}")
    
    logger.info(
        f"Ingestion complete: {results['venues_created']} created, "
        f"{results['venues_updated']} updated"
    )
    
    return results


# =============================================================================
# MAIN
# =============================================================================
def main():
    """Main entry point for the script."""
    
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description="Ingest venues from Google Places API"
    )
    
    parser.add_argument(
        "--city",
        type=str,
        required=True,
        help="City to search in (e.g., Bangalore)",
    )
    
    parser.add_argument(
        "--category",
        type=str,
        help="Single category to search for",
    )
    
    parser.add_argument(
        "--all-categories",
        action="store_true",
        help="Search all predefined categories",
    )
    
    parser.add_argument(
        "--radius",
        type=int,
        default=DEFAULT_RADIUS,
        help=f"Search radius in meters (default: {DEFAULT_RADIUS})",
    )
    
    parser.add_argument(
        "--max-results",
        type=int,
        default=20,
        help="Maximum results per category (default: 20)",
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't save to database, just show what would be done",
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging",
    )
    
    args = parser.parse_args()
    
    # Set up logging
    setup_logging()
    
    # Determine categories to search
    if args.all_categories:
        categories = ACTIVITY_CATEGORIES
    elif args.category:
        categories = [args.category]
    else:
        logger.error("Must specify --category or --all-categories")
        sys.exit(1)
    
    # Validate city
    if args.city.lower() not in CITY_COORDINATES:
        logger.error(f"Unknown city: {args.city}")
        logger.info(f"Available cities: {', '.join(CITY_COORDINATES.keys())}")
        sys.exit(1)
    
    # Run ingestion
    results = asyncio.run(
        ingest_venues(
            city=args.city,
            categories=categories,
            radius=args.radius,
            dry_run=args.dry_run,
            max_results=args.max_results,
        )
    )
    
    # Print summary
    print("\n" + "=" * 50)
    print("INGESTION SUMMARY")
    print("=" * 50)
    print(f"City: {results.get('city')}")
    print(f"Categories searched: {results.get('categories_searched')}")
    print(f"Venues found: {results.get('venues_found')}")
    print(f"Venues created: {results.get('venues_created')}")
    print(f"Venues updated: {results.get('venues_updated')}")
    print(f"Reviews fetched: {results.get('reviews_fetched')}")
    
    if results.get("errors"):
        print(f"\nErrors ({len(results['errors'])}):")
        for error in results["errors"][:5]:
            print(f"  - {error}")


if __name__ == "__main__":
    main()
