# =============================================================================
# NEXUS FAMILY PASS - LANGGRAPH WORKFLOW NODES
# =============================================================================
"""
LangGraph Workflow Nodes Module.

This module defines individual nodes (steps) for LangGraph workflows.
Each node is a function that:
    - Receives the current state
    - Performs an operation
    - Returns state updates

Nodes are designed to be:
    - Idempotent: Safe to retry
    - Traceable: Logged via LangSmith
    - Composable: Can be combined into different graphs
"""

# =============================================================================
# IMPORTS
# =============================================================================
from typing import Dict, Any, List
from datetime import datetime

from langsmith import traceable

from app.core.logging_config import get_logger
from app.integrations.ai.langgraph.state import (
    VenueOnboardingState,
    QualityScoringBatchState,
    VenueDiscoveryState,
    OnboardingStep,
    WorkflowStatus,
)

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# VENUE ONBOARDING NODES
# =============================================================================
@traceable(name="fetch_venue_details", run_type="chain")
async def fetch_venue_details(state: VenueOnboardingState) -> Dict[str, Any]:
    """
    Fetch venue details from Google Places API.

    This node retrieves comprehensive venue information including
    name, address, rating, photos, and business hours.

    Args:
        state: Current workflow state with google_place_id

    Returns:
        State updates with venue_data and reviews
    """
    from app.integrations.google_places.client import GooglePlacesClient
    from app.config import settings

    logger.info(f"Fetching venue details for: {state['google_place_id']}")

    try:
        client = GooglePlacesClient(api_key=settings.GOOGLE_PLACES_API_KEY)

        # Get place details
        venue_data = await client.get_place_details(
            place_id=state["google_place_id"]
        )

        # Extract reviews
        reviews = [
            review.get("text", "")
            for review in venue_data.get("reviews", [])
            if review.get("text")
        ]

        logger.info(
            f"Fetched venue: {venue_data.get('name')} with {len(reviews)} reviews"
        )

        return {
            "venue_data": venue_data,
            "reviews": reviews,
            "current_step": OnboardingStep.ANALYZE_VENUE.value,
            "status": WorkflowStatus.IN_PROGRESS.value,
        }

    except Exception as e:
        logger.error(f"Failed to fetch venue details: {e}")
        return {
            "errors": [f"fetch_venue_details: {str(e)}"],
            "status": WorkflowStatus.FAILED.value,
        }


@traceable(name="analyze_venue_suitability", run_type="chain")
async def analyze_venue_suitability(state: VenueOnboardingState) -> Dict[str, Any]:
    """
    Analyze venue suitability for kids activities.

    Uses AI to determine if the venue is appropriate for children
    and what types of activities it might offer.

    Args:
        state: Current state with venue_data

    Returns:
        State updates with venue_analysis
    """
    from app.integrations.ai.langchain.chains import VenueAnalysisChain

    logger.info(f"Analyzing venue: {state['venue_data'].get('name')}")

    try:
        chain = VenueAnalysisChain()

        venue_data = state["venue_data"]
        analysis = await chain.run(
            venue_name=venue_data.get("name", "Unknown"),
            google_types=venue_data.get("types", []),
            description=venue_data.get("editorial_summary", ""),
            rating=venue_data.get("rating"),
            review_count=venue_data.get("user_ratings_total"),
        )

        logger.info(
            f"Venue analysis complete: suitable={analysis.get('suitable_for_kids')}"
        )

        return {
            "venue_analysis": analysis,
            "current_step": OnboardingStep.SCORE_QUALITY.value,
        }

    except Exception as e:
        logger.error(f"Venue analysis failed: {e}")
        return {
            "errors": [f"analyze_venue: {str(e)}"],
            "venue_analysis": {"suitable_for_kids": True, "error": str(e)},
            "current_step": OnboardingStep.SCORE_QUALITY.value,
        }


@traceable(name="score_venue_quality", run_type="chain")
async def score_venue_quality(state: VenueOnboardingState) -> Dict[str, Any]:
    """
    Score venue quality based on reviews.

    Uses AI to extract quality scores across 8 categories
    from customer reviews.

    Args:
        state: Current state with venue_data and reviews

    Returns:
        State updates with quality_scores
    """
    from app.integrations.ai.langchain.chains import QualityScoringChain

    venue_name = state["venue_data"].get("name", "Unknown")
    logger.info(f"Scoring quality for: {venue_name}")

    try:
        chain = QualityScoringChain()

        scores = await chain.run(
            venue_name=venue_name,
            venue_type=state["venue_data"].get("types", ["unknown"])[0],
            reviews=state["reviews"],
        )

        logger.info(f"Quality scoring complete: overall={scores.get('overall_score')}")

        return {
            "quality_scores": scores,
            "current_step": OnboardingStep.INFER_ACTIVITIES.value,
        }

    except Exception as e:
        logger.error(f"Quality scoring failed: {e}")
        return {
            "errors": [f"score_quality: {str(e)}"],
            "quality_scores": {"error": str(e)},
            "current_step": OnboardingStep.INFER_ACTIVITIES.value,
        }


@traceable(name="infer_activities", run_type="chain")
async def infer_activities(state: VenueOnboardingState) -> Dict[str, Any]:
    """
    Infer activities offered at the venue.

    Uses AI to determine what activities the venue likely offers
    based on its type and reviews.

    Args:
        state: Current state with venue_data and reviews

    Returns:
        State updates with activities list
    """
    from app.integrations.ai.langchain.chains import ActivityInferenceChain

    venue_name = state["venue_data"].get("name", "Unknown")
    logger.info(f"Inferring activities for: {venue_name}")

    try:
        chain = ActivityInferenceChain()

        activities = await chain.run(
            venue_name=venue_name,
            venue_type=state["venue_data"].get("types", ["unknown"])[0],
            venue_description=state["venue_data"].get("editorial_summary"),
            reviews=state["reviews"][:5],
        )

        logger.info(f"Inferred {len(activities)} activities")

        return {
            "activities": activities,
            "current_step": OnboardingStep.GENERATE_EMBEDDINGS.value,
        }

    except Exception as e:
        logger.error(f"Activity inference failed: {e}")
        return {
            "errors": [f"infer_activities: {str(e)}"],
            "activities": [],
            "current_step": OnboardingStep.GENERATE_EMBEDDINGS.value,
        }


@traceable(name="generate_embeddings", run_type="chain")
async def generate_embeddings(state: VenueOnboardingState) -> Dict[str, Any]:
    """
    Generate embeddings for venue and activities.

    Creates vector embeddings for semantic search using
    the venue description and activity information.

    Args:
        state: Current state with venue_data and activities

    Returns:
        State updates with embeddings
    """
    from app.integrations.ai.embeddings import EmbeddingsGenerator

    venue_name = state["venue_data"].get("name", "Unknown")
    logger.info(f"Generating embeddings for: {venue_name}")

    try:
        generator = EmbeddingsGenerator()

        # Generate venue embedding
        venue_text = f"{venue_name}. {state['venue_data'].get('editorial_summary', '')}"
        venue_embedding = await generator.generate_embedding(venue_text)

        # Generate activity embeddings
        activity_embeddings = []
        for activity in state.get("activities", []):
            activity_text = f"{activity['name']}. {activity.get('short_description', '')}"
            embedding = await generator.generate_embedding(activity_text)
            activity_embeddings.append(embedding)

        logger.info(
            f"Generated {1 + len(activity_embeddings)} embeddings"
        )

        return {
            "venue_embedding": venue_embedding,
            "activity_embeddings": activity_embeddings,
            "current_step": OnboardingStep.SAVE_TO_DATABASE.value,
        }

    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        return {
            "errors": [f"generate_embeddings: {str(e)}"],
            "venue_embedding": [],
            "activity_embeddings": [],
            "current_step": OnboardingStep.SAVE_TO_DATABASE.value,
        }


@traceable(name="save_to_database", run_type="chain")
async def save_to_database(state: VenueOnboardingState) -> Dict[str, Any]:
    """
    Save venue and activities to the database.

    Creates or updates venue, activities, and quality scores
    in the PostgreSQL database.

    Args:
        state: Current state with all processed data

    Returns:
        State updates with database IDs
    """
    from app.core.database import get_db_session
    from app.integrations.google_places.mapper import GooglePlacesMapper
    from app.models.venue import Venue
    from app.models.activity import Activity
    from app.models.quality_score import VenueQualityScore
    from app.utils.slug import generate_unique_slug

    venue_data = state["venue_data"]
    logger.info(f"Saving to database: {venue_data.get('name')}")

    try:
        mapper = GooglePlacesMapper()

        async with get_db_session() as db:
            # Check if venue exists
            existing = await db.execute(
                Venue.__table__.select().where(
                    Venue.google_place_id == state["google_place_id"]
                )
            )
            existing_venue = existing.fetchone()

            if existing_venue:
                # Update existing venue
                venue_dict = mapper.map_place_to_venue(venue_data, state["city"])
                if state.get("venue_embedding"):
                    venue_dict["description_embedding"] = state["venue_embedding"]

                await db.execute(
                    Venue.__table__.update()
                    .where(Venue.google_place_id == state["google_place_id"])
                    .values(**venue_dict)
                )
                venue_id = str(existing_venue.id)
                logger.info(f"Updated venue: {venue_id}")
            else:
                # Create new venue
                venue_dict = mapper.map_place_to_venue(venue_data, state["city"])
                venue_dict["slug"] = await generate_unique_slug(
                    db, Venue, venue_dict["name"]
                )
                if state.get("venue_embedding"):
                    venue_dict["description_embedding"] = state["venue_embedding"]

                venue = Venue(**venue_dict)
                db.add(venue)
                await db.flush()
                venue_id = str(venue.id)
                logger.info(f"Created venue: {venue_id}")

            # Create activities
            activity_ids = []
            for i, activity_data in enumerate(state.get("activities", [])):
                activity_data["venue_id"] = venue_id
                activity_data["slug"] = await generate_unique_slug(
                    db, Activity, activity_data["name"]
                )
                if i < len(state.get("activity_embeddings", [])):
                    activity_data["description_embedding"] = state["activity_embeddings"][i]

                activity = Activity(**activity_data)
                db.add(activity)
                await db.flush()
                activity_ids.append(str(activity.id))

            # Create quality scores
            if state.get("quality_scores") and not state["quality_scores"].get("error"):
                scores = state["quality_scores"]
                score_record = VenueQualityScore(
                    venue_id=venue_id,
                    hygiene_score=scores["scores"].get("hygiene"),
                    safety_score=scores["scores"].get("safety"),
                    teaching_score=scores["scores"].get("teaching"),
                    facilities_score=scores["scores"].get("facilities"),
                    value_score=scores["scores"].get("value"),
                    ambience_score=scores["scores"].get("ambience"),
                    staff_score=scores["scores"].get("staff"),
                    location_score=scores["scores"].get("location"),
                    overall_score=scores.get("overall_score"),
                    confidence=scores.get("confidence"),
                    review_count_analyzed=scores.get("review_count_analyzed", 0),
                    key_phrases=scores.get("key_phrases", {}),
                )
                db.add(score_record)

            await db.commit()

            logger.info(
                f"Saved venue {venue_id} with {len(activity_ids)} activities"
            )

            return {
                "venue_id": venue_id,
                "activity_ids": activity_ids,
                "current_step": OnboardingStep.COMPLETE.value,
                "status": WorkflowStatus.COMPLETED.value,
                "completed_at": datetime.utcnow().isoformat(),
            }

    except Exception as e:
        logger.error(f"Database save failed: {e}")
        return {
            "errors": [f"save_to_database: {str(e)}"],
            "status": WorkflowStatus.FAILED.value,
            "completed_at": datetime.utcnow().isoformat(),
        }


# =============================================================================
# VENUE DISCOVERY NODES
# =============================================================================
@traceable(name="search_venues", run_type="chain")
async def search_venues(state: VenueDiscoveryState) -> Dict[str, Any]:
    """
    Search for venues using Google Places API.

    Args:
        state: Current state with search parameters

    Returns:
        State updates with discovered_venues
    """
    from app.integrations.google_places.client import GooglePlacesClient
    from app.config import settings

    logger.info(f"Searching venues: {state['search_query']} in {state['city']}")

    try:
        client = GooglePlacesClient(api_key=settings.GOOGLE_PLACES_API_KEY)

        # Get city coordinates
        city_coords = {
            "bangalore": (12.9716, 77.5946),
            "mumbai": (19.0760, 72.8777),
            "delhi": (28.6139, 77.2090),
            "chennai": (13.0827, 80.2707),
            "hyderabad": (17.3850, 78.4867),
        }

        lat, lng = city_coords.get(
            state["city"].lower(),
            (12.9716, 77.5946)
        )

        # Search venues
        venues = await client.search_nearby(
            latitude=lat,
            longitude=lng,
            radius=state.get("radius", 10000),
            place_type=state["search_query"],
            max_results=state.get("max_results", 20),
        )

        logger.info(f"Found {len(venues)} venues")

        return {
            "discovered_venues": venues,
            "status": WorkflowStatus.IN_PROGRESS.value,
        }

    except Exception as e:
        logger.error(f"Venue search failed: {e}")
        return {
            "errors": [f"search_venues: {str(e)}"],
            "discovered_venues": [],
            "status": WorkflowStatus.FAILED.value,
        }


@traceable(name="evaluate_venues", run_type="chain")
async def evaluate_venues(state: VenueDiscoveryState) -> Dict[str, Any]:
    """
    Evaluate discovered venues for suitability.

    Uses AI to analyze each venue and determine if it's
    suitable for kids activities.

    Args:
        state: Current state with discovered_venues

    Returns:
        State updates with evaluated_venues and suitable_venues
    """
    from app.integrations.ai.langchain.chains import VenueAnalysisChain

    logger.info(f"Evaluating {len(state['discovered_venues'])} venues")

    chain = VenueAnalysisChain()
    evaluated = []
    suitable = []

    for venue in state["discovered_venues"]:
        try:
            analysis = await chain.run(
                venue_name=venue.get("name", "Unknown"),
                google_types=venue.get("types", []),
                description=venue.get("editorial_summary", ""),
                rating=venue.get("rating"),
                review_count=venue.get("user_ratings_total"),
            )

            venue_with_analysis = {
                **venue,
                "analysis": analysis,
            }
            evaluated.append(venue_with_analysis)

            if analysis.get("suitable_for_kids", True):
                suitable.append(venue_with_analysis)

        except Exception as e:
            logger.warning(f"Failed to evaluate venue {venue.get('name')}: {e}")
            # Include venue without analysis
            evaluated.append({**venue, "analysis": {"error": str(e)}})

    logger.info(f"Found {len(suitable)} suitable venues")

    return {
        "evaluated_venues": evaluated,
        "suitable_venues": suitable,
        "onboarding_queue": [v.get("place_id") for v in suitable if v.get("place_id")],
        "status": WorkflowStatus.COMPLETED.value,
        "completed_at": datetime.utcnow().isoformat(),
    }


# =============================================================================
# BATCH PROCESSING NODES
# =============================================================================
@traceable(name="load_venues_for_scoring", run_type="chain")
async def load_venues_for_scoring(state: QualityScoringBatchState) -> Dict[str, Any]:
    """
    Load venue data for batch scoring.

    Fetches venue details and reviews from the database
    for all venues in the batch.

    Args:
        state: Current state with venue_ids

    Returns:
        State updates with venues_data
    """
    from app.core.database import get_db_session
    from app.models.venue import Venue
    from app.models.review import GoogleReview

    logger.info(f"Loading {len(state['venue_ids'])} venues for scoring")

    try:
        async with get_db_session() as db:
            venues_data = []

            for venue_id in state["venue_ids"]:
                # Get venue
                venue_result = await db.execute(
                    Venue.__table__.select().where(Venue.id == venue_id)
                )
                venue = venue_result.fetchone()

                if not venue:
                    continue

                # Get reviews
                reviews_result = await db.execute(
                    GoogleReview.__table__.select().where(
                        GoogleReview.venue_id == venue_id
                    )
                )
                reviews = reviews_result.fetchall()

                venues_data.append({
                    "venue_id": str(venue.id),
                    "venue_name": venue.name,
                    "venue_type": venue.google_types[0] if venue.google_types else "unknown",
                    "reviews": [r.text for r in reviews if r.text],
                })

            logger.info(f"Loaded {len(venues_data)} venues")

            return {
                "venues_data": venues_data,
                "total_count": len(venues_data),
                "status": WorkflowStatus.IN_PROGRESS.value,
            }

    except Exception as e:
        logger.error(f"Failed to load venues: {e}")
        return {
            "errors": [f"load_venues: {str(e)}"],
            "status": WorkflowStatus.FAILED.value,
        }


@traceable(name="score_venues_batch", run_type="chain")
async def score_venues_batch(state: QualityScoringBatchState) -> Dict[str, Any]:
    """
    Score all venues in the batch.

    Processes each venue sequentially with rate limiting
    to avoid API limits.

    Args:
        state: Current state with venues_data

    Returns:
        State updates with results
    """
    from app.integrations.ai.langchain.chains import QualityScoringChain

    logger.info(f"Scoring {len(state['venues_data'])} venues")

    chain = QualityScoringChain()
    results = []
    processed = 0
    errors = 0

    for venue_data in state["venues_data"]:
        try:
            scores = await chain.run(
                venue_name=venue_data["venue_name"],
                venue_type=venue_data["venue_type"],
                reviews=venue_data["reviews"],
            )

            results.append({
                "venue_id": venue_data["venue_id"],
                "scores": scores,
                "success": True,
            })
            processed += 1

        except Exception as e:
            logger.warning(
                f"Failed to score {venue_data['venue_name']}: {e}"
            )
            results.append({
                "venue_id": venue_data["venue_id"],
                "error": str(e),
                "success": False,
            })
            errors += 1

    logger.info(f"Scored {processed} venues, {errors} errors")

    return {
        "results": results,
        "processed_count": processed,
        "error_count": errors,
        "status": WorkflowStatus.COMPLETED.value,
        "completed_at": datetime.utcnow().isoformat(),
    }
