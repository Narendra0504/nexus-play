#!/usr/bin/env python
# =============================================================================
# NEXUS FAMILY PASS - MOCK PRICING GENERATION SCRIPT
# =============================================================================
"""
Mock Pricing Generation Script.

This script generates mock pricing for venues based on:
    - Venue category/type
    - City (location-based pricing)
    - Google rating (quality premium)
    - Day of week (weekend premium)

The generated prices are stored in venue_mock_pricing table
and can be overridden by vendors through the portal.

Usage:
    # Generate pricing for all venues without pricing
    python scripts/generate_mock_pricing.py
    
    # Regenerate pricing for all venues
    python scripts/generate_mock_pricing.py --regenerate
    
    # Generate for specific venue
    python scripts/generate_mock_pricing.py --venue-id <uuid>
    
    # Dry run
    python scripts/generate_mock_pricing.py --dry-run

Environment Variables Required:
    - DATABASE_URL: PostgreSQL connection string
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # Async operations
import argparse  # Command line argument parsing
import sys  # System operations
from typing import List, Optional
from uuid import UUID

# Add parent directory to path for imports
sys.path.insert(0, str(__file__).rsplit("/", 2)[0])

# Local imports
from app.core.database import get_db_session
from app.core.logging_config import get_logger, setup_logging
from app.models.venue import Venue
from app.models.quality_score import VenueMockPricing
from app.utils.pricing import generate_venue_pricing

# Third-party
from sqlalchemy import select, delete

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# PRICING FUNCTIONS
# =============================================================================
async def generate_pricing(
    venue_id: Optional[UUID] = None,
    regenerate: bool = False,
    dry_run: bool = False,
) -> dict:
    """
    Generate mock pricing for venues.
    
    Args:
        venue_id: Optional specific venue to process
        regenerate: If True, regenerate pricing even if exists
        dry_run: If True, don't save to database
    
    Returns:
        dict: Summary of generation results
    """
    logger.info("Starting mock pricing generation...")
    
    # Track results
    results = {
        "venues_processed": 0,
        "pricing_records_created": 0,
        "pricing_records_updated": 0,
        "errors": [],
    }
    
    async with get_db_session() as db:
        # Get venues to process
        if venue_id:
            query = select(Venue).where(Venue.id == venue_id)
        else:
            query = select(Venue).where(Venue.is_active == True)
        
        venue_result = await db.execute(query)
        venues = venue_result.scalars().all()
        
        logger.info(f"Found {len(venues)} venues to process")
        
        for venue in venues:
            try:
                # Check if pricing already exists
                existing_query = select(VenueMockPricing).where(
                    VenueMockPricing.venue_id == venue.id
                )
                existing_result = await db.execute(existing_query)
                existing_pricing = existing_result.scalars().all()
                
                if existing_pricing and not regenerate:
                    logger.debug(f"Skipping {venue.name}: pricing already exists")
                    continue
                
                # Get venue types from metadata
                venue_types = venue.google_types or []
                if not venue_types:
                    # Default to generic type based on category
                    venue_types = [venue.primary_category or "general"]
                
                # Generate pricing
                pricing_list = generate_venue_pricing(
                    venue_types=venue_types,
                    city=venue.city or "bangalore",
                    rating=float(venue.google_rating) if venue.google_rating else None,
                )
                
                if dry_run:
                    logger.info(
                        f"[DRY RUN] Would generate {len(pricing_list)} pricing records "
                        f"for {venue.name}"
                    )
                    for p in pricing_list:
                        logger.info(
                            f"  - {p.activity_type}: "
                            f"₹{p.weekday_price} weekday, "
                            f"₹{p.weekend_price} weekend"
                        )
                    results["venues_processed"] += 1
                    results["pricing_records_created"] += len(pricing_list)
                    continue
                
                # Delete existing pricing if regenerating
                if existing_pricing and regenerate:
                    await db.execute(
                        delete(VenueMockPricing).where(
                            VenueMockPricing.venue_id == venue.id
                        )
                    )
                    results["pricing_records_updated"] += len(existing_pricing)
                
                # Create new pricing records
                for pricing in pricing_list:
                    mock_pricing = VenueMockPricing(
                        venue_id=venue.id,
                        activity_type=pricing.activity_type,
                        weekday_price_inr=pricing.weekday_price,
                        weekend_price_inr=pricing.weekend_price,
                        price_source="algorithm",
                    )
                    db.add(mock_pricing)
                    results["pricing_records_created"] += 1
                
                await db.commit()
                results["venues_processed"] += 1
                
                logger.info(
                    f"Generated {len(pricing_list)} pricing records for {venue.name}"
                )
                
            except Exception as e:
                logger.error(f"Error processing venue {venue.name}: {e}")
                results["errors"].append(f"{venue.name}: {str(e)}")
                await db.rollback()
    
    logger.info(
        f"Pricing generation complete: {results['venues_processed']} venues, "
        f"{results['pricing_records_created']} records created"
    )
    
    return results


# =============================================================================
# MAIN
# =============================================================================
def main():
    """Main entry point for the script."""
    
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description="Generate mock pricing for venues"
    )
    
    parser.add_argument(
        "--venue-id",
        type=str,
        help="Generate pricing for a specific venue UUID",
    )
    
    parser.add_argument(
        "--regenerate",
        action="store_true",
        help="Regenerate pricing even if it already exists",
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
    
    # Parse venue ID if provided
    venue_id = None
    if args.venue_id:
        try:
            venue_id = UUID(args.venue_id)
        except ValueError:
            logger.error(f"Invalid venue ID: {args.venue_id}")
            sys.exit(1)
    
    # Run generation
    results = asyncio.run(
        generate_pricing(
            venue_id=venue_id,
            regenerate=args.regenerate,
            dry_run=args.dry_run,
        )
    )
    
    # Print summary
    print("\n" + "=" * 50)
    print("PRICING GENERATION SUMMARY")
    print("=" * 50)
    print(f"Venues processed: {results.get('venues_processed')}")
    print(f"Pricing records created: {results.get('pricing_records_created')}")
    print(f"Pricing records updated: {results.get('pricing_records_updated')}")
    
    if results.get("errors"):
        print(f"\nErrors ({len(results['errors'])}):")
        for error in results["errors"][:5]:
            print(f"  - {error}")


if __name__ == "__main__":
    main()
