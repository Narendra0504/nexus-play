#!/usr/bin/env python
# =============================================================================
# NEXUS FAMILY PASS - REVIEW PROCESSING SCRIPT
# =============================================================================
"""
AI Review Processing Script.

This script processes Google reviews using Gemini AI to:
    1. Extract quality scores (hygiene, safety, teaching, etc.)
    2. Identify key phrases and sentiment
    3. Generate venue quality profiles

The script respects Gemini API rate limits (15 RPM for free tier)
by adding delays between requests.

Usage:
    # Process all unprocessed reviews
    python scripts/process_reviews.py
    
    # Process reviews for a specific venue
    python scripts/process_reviews.py --venue-id <uuid>
    
    # Limit number of reviews to process
    python scripts/process_reviews.py --limit 10
    
    # Dry run
    python scripts/process_reviews.py --dry-run

Environment Variables Required:
    - GEMINI_API_KEY: Google Gemini API key
    - DATABASE_URL: PostgreSQL connection string
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import asyncio  # Async operations
import argparse  # Command line argument parsing
import sys  # System operations
from datetime import datetime
from typing import List, Optional
from uuid import UUID

# Add parent directory to path for imports
sys.path.insert(0, str(__file__).rsplit("/", 2)[0])

# Local imports
from app.config import settings
from app.core.database import get_db_session
from app.core.logging_config import get_logger, setup_logging
from app.integrations.ai.quality_scorer import QualityScorer
from app.models.venue import Venue
from app.models.review import GoogleReview
from app.models.quality_score import VenueQualityScore

# Third-party
from sqlalchemy import select, and_

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)

# =============================================================================
# CONSTANTS
# =============================================================================
# Delay between API calls (seconds) for rate limiting
# Gemini free tier: 15 RPM = 4 seconds between requests
API_DELAY_SECONDS = 4

# Minimum reviews needed for quality scoring
MIN_REVIEWS_FOR_SCORING = 3


# =============================================================================
# PROCESSING FUNCTIONS
# =============================================================================
async def process_reviews(
    venue_id: Optional[UUID] = None,
    limit: Optional[int] = None,
    dry_run: bool = False,
) -> dict:
    """
    Process unprocessed reviews with AI quality scoring.
    
    Args:
        venue_id: Optional specific venue to process
        limit: Maximum reviews to process
        dry_run: If True, don't save to database
    
    Returns:
        dict: Summary of processing results
    """
    logger.info("Starting review processing...")
    
    # Initialize quality scorer
    quality_scorer = QualityScorer(api_key=settings.GEMINI_API_KEY)
    
    # Track results
    results = {
        "venues_processed": 0,
        "reviews_processed": 0,
        "quality_scores_updated": 0,
        "errors": [],
    }
    
    async with get_db_session() as db:
        # Get venues to process
        if venue_id:
            # Specific venue
            query = select(Venue).where(Venue.id == venue_id)
        else:
            # All active venues
            query = select(Venue).where(Venue.is_active == True)
        
        if limit:
            query = query.limit(limit)
        
        venue_result = await db.execute(query)
        venues = venue_result.scalars().all()
        
        logger.info(f"Found {len(venues)} venues to process")
        
        for venue in venues:
            try:
                # Get unprocessed reviews for this venue
                review_query = select(GoogleReview).where(
                    and_(
                        GoogleReview.venue_id == venue.id,
                        GoogleReview.is_processed == False
                    )
                )
                review_result = await db.execute(review_query)
                reviews = review_result.scalars().all()
                
                if not reviews:
                    logger.debug(f"No unprocessed reviews for {venue.name}")
                    continue
                
                logger.info(f"Processing {len(reviews)} reviews for {venue.name}")
                
                # Get all reviews for quality scoring (including processed ones)
                all_reviews_query = select(GoogleReview).where(
                    GoogleReview.venue_id == venue.id
                )
                all_result = await db.execute(all_reviews_query)
                all_reviews = all_result.scalars().all()
                
                # Skip if not enough reviews
                if len(all_reviews) < MIN_REVIEWS_FOR_SCORING:
                    logger.info(
                        f"Skipping {venue.name}: only {len(all_reviews)} reviews "
                        f"(need {MIN_REVIEWS_FOR_SCORING})"
                    )
                    continue
                
                # Prepare review texts for AI processing
                review_texts = [
                    {
                        "rating": r.rating,
                        "text": r.text or "",
                        "author": r.author_name or "Anonymous",
                    }
                    for r in all_reviews
                    if r.text  # Only include reviews with text
                ]
                
                if len(review_texts) < MIN_REVIEWS_FOR_SCORING:
                    logger.info(f"Skipping {venue.name}: not enough reviews with text")
                    continue
                
                if dry_run:
                    logger.info(f"[DRY RUN] Would process {len(review_texts)} reviews for {venue.name}")
                    results["reviews_processed"] += len(reviews)
                    results["venues_processed"] += 1
                    continue
                
                # Process reviews with AI
                logger.info(f"Calling AI for {venue.name}...")
                
                quality_scores = await quality_scorer.analyze_reviews(
                    venue_name=venue.name,
                    reviews=review_texts,
                )
                
                if quality_scores:
                    # Update or create quality scores
                    existing_scores = await db.execute(
                        select(VenueQualityScore).where(
                            VenueQualityScore.venue_id == venue.id
                        )
                    )
                    existing = existing_scores.scalar_one_or_none()
                    
                    score_data = {
                        "venue_id": venue.id,
                        "hygiene_score": quality_scores.get("hygiene"),
                        "safety_score": quality_scores.get("safety"),
                        "teaching_score": quality_scores.get("teaching"),
                        "facilities_score": quality_scores.get("facilities"),
                        "value_score": quality_scores.get("value"),
                        "ambience_score": quality_scores.get("ambience"),
                        "staff_score": quality_scores.get("staff"),
                        "location_score": quality_scores.get("location"),
                        "overall_score": quality_scores.get("overall"),
                        "confidence": quality_scores.get("confidence"),
                        "review_count_analyzed": len(review_texts),
                        "key_phrases": quality_scores.get("key_phrases", {}),
                        "model_version": quality_scores.get("model_version"),
                        "processed_at": datetime.utcnow(),
                    }
                    
                    if existing:
                        # Update existing scores
                        for key, value in score_data.items():
                            if key != "venue_id":
                                setattr(existing, key, value)
                    else:
                        # Create new scores
                        new_scores = VenueQualityScore(**score_data)
                        db.add(new_scores)
                    
                    results["quality_scores_updated"] += 1
                    logger.info(
                        f"Updated quality scores for {venue.name}: "
                        f"overall={quality_scores.get('overall')}"
                    )
                
                # Mark reviews as processed
                for review in reviews:
                    review.is_processed = True
                    review.processed_at = datetime.utcnow()
                    results["reviews_processed"] += 1
                
                await db.commit()
                results["venues_processed"] += 1
                
                # Rate limiting delay
                logger.debug(f"Waiting {API_DELAY_SECONDS}s for rate limiting...")
                await asyncio.sleep(API_DELAY_SECONDS)
                
            except Exception as e:
                logger.error(f"Error processing venue {venue.name}: {e}")
                results["errors"].append(f"{venue.name}: {str(e)}")
                await db.rollback()
    
    logger.info(
        f"Processing complete: {results['venues_processed']} venues, "
        f"{results['reviews_processed']} reviews"
    )
    
    return results


# =============================================================================
# MAIN
# =============================================================================
def main():
    """Main entry point for the script."""
    
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description="Process Google reviews with AI quality scoring"
    )
    
    parser.add_argument(
        "--venue-id",
        type=str,
        help="Process reviews for a specific venue UUID",
    )
    
    parser.add_argument(
        "--limit",
        type=int,
        help="Maximum number of venues to process",
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
    
    # Run processing
    results = asyncio.run(
        process_reviews(
            venue_id=venue_id,
            limit=args.limit,
            dry_run=args.dry_run,
        )
    )
    
    # Print summary
    print("\n" + "=" * 50)
    print("PROCESSING SUMMARY")
    print("=" * 50)
    print(f"Venues processed: {results.get('venues_processed')}")
    print(f"Reviews processed: {results.get('reviews_processed')}")
    print(f"Quality scores updated: {results.get('quality_scores_updated')}")
    
    if results.get("errors"):
        print(f"\nErrors ({len(results['errors'])}):")
        for error in results["errors"][:5]:
            print(f"  - {error}")


if __name__ == "__main__":
    main()
