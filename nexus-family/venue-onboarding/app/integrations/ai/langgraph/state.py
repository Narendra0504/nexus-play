# =============================================================================
# NEXUS FAMILY PASS - LANGGRAPH STATE DEFINITIONS
# =============================================================================
"""
LangGraph State Definitions Module.

This module defines TypedDict state classes for LangGraph workflows.
Each workflow has its own state type that flows through the graph.

State Management:
    - States are immutable dictionaries
    - Each node receives the current state and returns updates
    - LangGraph merges updates into the state automatically
    - Checkpointing allows state persistence and resumption
"""

# =============================================================================
# IMPORTS
# =============================================================================
from typing import TypedDict, Optional, List, Dict, Any, Annotated
from enum import Enum
from datetime import datetime
import operator


# =============================================================================
# ENUMS
# =============================================================================
class WorkflowStatus(str, Enum):
    """Workflow execution status."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class OnboardingStep(str, Enum):
    """Venue onboarding workflow steps."""

    FETCH_DETAILS = "fetch_details"
    FETCH_REVIEWS = "fetch_reviews"
    ANALYZE_VENUE = "analyze_venue"
    SCORE_QUALITY = "score_quality"
    INFER_ACTIVITIES = "infer_activities"
    GENERATE_EMBEDDINGS = "generate_embeddings"
    SAVE_TO_DATABASE = "save_to_database"
    COMPLETE = "complete"


# =============================================================================
# VENUE ONBOARDING STATE
# =============================================================================
class VenueOnboardingState(TypedDict, total=False):
    """
    State for the venue onboarding workflow.

    This state flows through all nodes in the onboarding graph,
    accumulating data at each step.

    Attributes:
        # Input
        google_place_id: Google Places ID to onboard
        city: City where the venue is located

        # Google Places Data
        venue_data: Raw venue data from Google Places
        reviews: List of review texts

        # AI Analysis Results
        venue_analysis: AI analysis of venue suitability
        quality_scores: Quality scores from review analysis
        activities: Inferred activities

        # Embeddings
        venue_embedding: Venue description embedding
        activity_embeddings: Activity embeddings

        # Database Results
        venue_id: Created/updated venue UUID
        activity_ids: Created activity UUIDs

        # Workflow Metadata
        current_step: Current workflow step
        status: Overall workflow status
        errors: List of errors encountered
        started_at: Workflow start timestamp
        completed_at: Workflow completion timestamp
    """

    # Input parameters
    google_place_id: str
    city: str

    # Google Places data
    venue_data: Dict[str, Any]
    reviews: List[str]

    # AI analysis results
    venue_analysis: Dict[str, Any]
    quality_scores: Dict[str, Any]
    activities: List[Dict[str, Any]]

    # Embeddings
    venue_embedding: List[float]
    activity_embeddings: List[List[float]]

    # Database results
    venue_id: str
    activity_ids: List[str]

    # Workflow metadata
    current_step: str
    status: str
    errors: Annotated[List[str], operator.add]  # Errors accumulate
    started_at: str
    completed_at: str


# =============================================================================
# QUALITY SCORING BATCH STATE
# =============================================================================
class QualityScoringBatchState(TypedDict, total=False):
    """
    State for batch quality scoring workflow.

    Processes multiple venues in a single workflow run.

    Attributes:
        venue_ids: List of venue IDs to process
        venues_data: Venue data with reviews
        results: Scoring results per venue
        processed_count: Number of venues processed
        error_count: Number of failures
        status: Workflow status
    """

    # Input
    venue_ids: List[str]

    # Processing data
    venues_data: List[Dict[str, Any]]
    results: List[Dict[str, Any]]

    # Progress tracking
    processed_count: int
    error_count: int
    total_count: int

    # Workflow metadata
    status: str
    started_at: str
    completed_at: str


# =============================================================================
# VENUE DISCOVERY STATE
# =============================================================================
class VenueDiscoveryState(TypedDict, total=False):
    """
    State for venue discovery workflow.

    Searches for and evaluates potential venues to onboard.

    Attributes:
        search_query: Search query or category
        city: City to search in
        radius: Search radius in meters
        discovered_venues: Raw search results
        evaluated_venues: Venues after AI evaluation
        suitable_venues: Venues suitable for kids
        onboarding_queue: Venues queued for onboarding
        status: Workflow status
    """

    # Search parameters
    search_query: str
    city: str
    radius: int
    max_results: int

    # Discovery results
    discovered_venues: List[Dict[str, Any]]
    evaluated_venues: List[Dict[str, Any]]
    suitable_venues: List[Dict[str, Any]]

    # Onboarding queue
    onboarding_queue: List[str]  # Place IDs

    # Workflow metadata
    status: str
    started_at: str
    completed_at: str


# =============================================================================
# RECOMMENDATION STATE
# =============================================================================
class RecommendationState(TypedDict, total=False):
    """
    State for activity recommendation workflow.

    Generates personalized activity recommendations for users.

    Attributes:
        user_id: User to generate recommendations for
        child_profiles: Child age and preference data
        location: User's location for filtering
        preferences: User preferences
        candidate_activities: Initial activity candidates
        scored_activities: Activities with relevance scores
        recommendations: Final recommendations
        status: Workflow status
    """

    # Input
    user_id: str
    child_profiles: List[Dict[str, Any]]
    location: Dict[str, float]  # lat, lng
    preferences: Dict[str, Any]

    # Processing
    candidate_activities: List[Dict[str, Any]]
    scored_activities: List[Dict[str, Any]]

    # Output
    recommendations: List[Dict[str, Any]]

    # Metadata
    status: str
    started_at: str
    completed_at: str


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
def create_initial_onboarding_state(
    google_place_id: str,
    city: str,
) -> VenueOnboardingState:
    """
    Create initial state for venue onboarding workflow.

    Args:
        google_place_id: Google Places ID
        city: City name

    Returns:
        Initial workflow state
    """
    return VenueOnboardingState(
        google_place_id=google_place_id,
        city=city,
        venue_data={},
        reviews=[],
        venue_analysis={},
        quality_scores={},
        activities=[],
        venue_embedding=[],
        activity_embeddings=[],
        venue_id="",
        activity_ids=[],
        current_step=OnboardingStep.FETCH_DETAILS.value,
        status=WorkflowStatus.PENDING.value,
        errors=[],
        started_at=datetime.utcnow().isoformat(),
        completed_at="",
    )


def create_initial_batch_state(
    venue_ids: List[str],
) -> QualityScoringBatchState:
    """
    Create initial state for batch scoring workflow.

    Args:
        venue_ids: List of venue UUIDs to process

    Returns:
        Initial workflow state
    """
    return QualityScoringBatchState(
        venue_ids=venue_ids,
        venues_data=[],
        results=[],
        processed_count=0,
        error_count=0,
        total_count=len(venue_ids),
        status=WorkflowStatus.PENDING.value,
        started_at=datetime.utcnow().isoformat(),
        completed_at="",
    )


def create_initial_discovery_state(
    search_query: str,
    city: str,
    radius: int = 10000,
    max_results: int = 20,
) -> VenueDiscoveryState:
    """
    Create initial state for venue discovery workflow.

    Args:
        search_query: Search query or category
        city: City to search in
        radius: Search radius in meters
        max_results: Maximum results

    Returns:
        Initial workflow state
    """
    return VenueDiscoveryState(
        search_query=search_query,
        city=city,
        radius=radius,
        max_results=max_results,
        discovered_venues=[],
        evaluated_venues=[],
        suitable_venues=[],
        onboarding_queue=[],
        status=WorkflowStatus.PENDING.value,
        started_at=datetime.utcnow().isoformat(),
        completed_at="",
    )
