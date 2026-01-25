# =============================================================================
# NEXUS FAMILY PASS - LANGGRAPH WORKFLOWS
# =============================================================================
"""
LangGraph Workflow Orchestrators Module.

This module provides high-level workflow orchestrators that:
    - Build LangGraph state graphs
    - Define node connections and edges
    - Handle workflow execution and checkpointing
    - Provide clean async interfaces

Workflows:
    - VenueOnboardingWorkflow: Complete venue onboarding pipeline
    - QualityScoringBatchWorkflow: Batch process venue quality scores
    - VenueDiscoveryWorkflow: Discover and evaluate new venues

Usage:
    ```python
    from app.integrations.ai.langgraph import VenueOnboardingWorkflow

    workflow = VenueOnboardingWorkflow()
    result = await workflow.run(
        google_place_id="ChIJ...",
        city="Bangalore"
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
from typing import Dict, Any, Optional, List
from datetime import datetime

from langgraph.graph import StateGraph, END
from langsmith import traceable

from app.core.logging_config import get_logger
from app.integrations.ai.langgraph.state import (
    VenueOnboardingState,
    QualityScoringBatchState,
    VenueDiscoveryState,
    WorkflowStatus,
    create_initial_onboarding_state,
    create_initial_batch_state,
    create_initial_discovery_state,
)
from app.integrations.ai.langgraph.nodes import (
    fetch_venue_details,
    analyze_venue_suitability,
    score_venue_quality,
    infer_activities,
    generate_embeddings,
    save_to_database,
    search_venues,
    evaluate_venues,
    load_venues_for_scoring,
    score_venues_batch,
)

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# VENUE ONBOARDING WORKFLOW
# =============================================================================
class VenueOnboardingWorkflow:
    """
    Complete venue onboarding workflow using LangGraph.

    This workflow orchestrates the entire process of onboarding
    a venue from Google Places into the Nexus database:

    1. Fetch venue details from Google Places
    2. Analyze venue suitability for kids
    3. Score quality based on reviews
    4. Infer activities offered
    5. Generate embeddings for search
    6. Save everything to the database

    The workflow is:
        - Fully traced via LangSmith
        - Idempotent (safe to retry)
        - Stateful with checkpointing capability

    Example:
        ```python
        workflow = VenueOnboardingWorkflow()

        # Single venue onboarding
        result = await workflow.run(
            google_place_id="ChIJ...",
            city="Bangalore"
        )

        # Check status
        if result["status"] == "completed":
            print(f"Created venue: {result['venue_id']}")
        ```
    """

    def __init__(self):
        """Initialize the venue onboarding workflow."""
        self._graph = None
        self._compiled = None
        self._build_graph()

    def _build_graph(self) -> None:
        """Build the LangGraph state graph."""
        # Create state graph
        self._graph = StateGraph(VenueOnboardingState)

        # Add nodes
        self._graph.add_node("fetch_details", fetch_venue_details)
        self._graph.add_node("analyze_venue", analyze_venue_suitability)
        self._graph.add_node("score_quality", score_venue_quality)
        self._graph.add_node("infer_activities", infer_activities)
        self._graph.add_node("generate_embeddings", generate_embeddings)
        self._graph.add_node("save_to_database", save_to_database)

        # Define edges (linear flow for now)
        self._graph.set_entry_point("fetch_details")
        self._graph.add_edge("fetch_details", "analyze_venue")
        self._graph.add_edge("analyze_venue", "score_quality")
        self._graph.add_edge("score_quality", "infer_activities")
        self._graph.add_edge("infer_activities", "generate_embeddings")
        self._graph.add_edge("generate_embeddings", "save_to_database")
        self._graph.add_edge("save_to_database", END)

        # Compile the graph
        self._compiled = self._graph.compile()

        logger.info("VenueOnboardingWorkflow graph compiled")

    def _should_continue(self, state: VenueOnboardingState) -> str:
        """Determine next step based on state."""
        if state.get("status") == WorkflowStatus.FAILED.value:
            return END
        return "continue"

    @traceable(name="venue_onboarding_workflow", run_type="chain")
    async def run(
        self,
        google_place_id: str,
        city: str,
    ) -> Dict[str, Any]:
        """
        Execute the venue onboarding workflow.

        Args:
            google_place_id: Google Places ID to onboard
            city: City where the venue is located

        Returns:
            Final workflow state with results
        """
        logger.info(
            f"Starting venue onboarding workflow",
            extra={"google_place_id": google_place_id, "city": city}
        )

        # Create initial state
        initial_state = create_initial_onboarding_state(
            google_place_id=google_place_id,
            city=city,
        )

        try:
            # Execute the workflow
            final_state = await self._compiled.ainvoke(initial_state)

            logger.info(
                f"Workflow completed: status={final_state.get('status')}",
                extra={
                    "venue_id": final_state.get("venue_id"),
                    "activities_count": len(final_state.get("activity_ids", [])),
                    "errors": final_state.get("errors", []),
                }
            )

            return final_state

        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return {
                **initial_state,
                "status": WorkflowStatus.FAILED.value,
                "errors": [str(e)],
                "completed_at": datetime.utcnow().isoformat(),
            }

    async def run_batch(
        self,
        place_ids: List[str],
        city: str,
    ) -> List[Dict[str, Any]]:
        """
        Run onboarding workflow for multiple venues.

        Args:
            place_ids: List of Google Place IDs
            city: City for all venues

        Returns:
            List of workflow results
        """
        results = []

        for place_id in place_ids:
            result = await self.run(
                google_place_id=place_id,
                city=city,
            )
            results.append(result)

        return results


# =============================================================================
# QUALITY SCORING BATCH WORKFLOW
# =============================================================================
class QualityScoringBatchWorkflow:
    """
    Batch quality scoring workflow using LangGraph.

    Processes multiple venues in sequence with rate limiting
    to generate quality scores from reviews.

    Example:
        ```python
        workflow = QualityScoringBatchWorkflow()
        result = await workflow.run(
            venue_ids=["uuid1", "uuid2", "uuid3"]
        )
        ```
    """

    def __init__(self):
        """Initialize the batch scoring workflow."""
        self._graph = None
        self._compiled = None
        self._build_graph()

    def _build_graph(self) -> None:
        """Build the LangGraph state graph."""
        self._graph = StateGraph(QualityScoringBatchState)

        # Add nodes
        self._graph.add_node("load_venues", load_venues_for_scoring)
        self._graph.add_node("score_batch", score_venues_batch)

        # Define edges
        self._graph.set_entry_point("load_venues")
        self._graph.add_edge("load_venues", "score_batch")
        self._graph.add_edge("score_batch", END)

        # Compile
        self._compiled = self._graph.compile()

        logger.info("QualityScoringBatchWorkflow graph compiled")

    @traceable(name="quality_scoring_batch_workflow", run_type="chain")
    async def run(
        self,
        venue_ids: List[str],
    ) -> Dict[str, Any]:
        """
        Execute the batch scoring workflow.

        Args:
            venue_ids: List of venue UUIDs to score

        Returns:
            Final workflow state with results
        """
        logger.info(f"Starting batch scoring for {len(venue_ids)} venues")

        initial_state = create_initial_batch_state(venue_ids)

        try:
            final_state = await self._compiled.ainvoke(initial_state)

            logger.info(
                f"Batch scoring completed: "
                f"{final_state.get('processed_count')}/{final_state.get('total_count')} "
                f"({final_state.get('error_count')} errors)"
            )

            return final_state

        except Exception as e:
            logger.error(f"Batch workflow failed: {e}")
            return {
                **initial_state,
                "status": WorkflowStatus.FAILED.value,
                "errors": [str(e)],
            }


# =============================================================================
# VENUE DISCOVERY WORKFLOW
# =============================================================================
class VenueDiscoveryWorkflow:
    """
    Venue discovery workflow using LangGraph.

    Searches for venues and evaluates them for suitability,
    producing a queue of venues ready for onboarding.

    Example:
        ```python
        workflow = VenueDiscoveryWorkflow()
        result = await workflow.run(
            search_query="swimming_pool",
            city="Bangalore"
        )

        # Get suitable venues
        for venue in result["suitable_venues"]:
            print(venue["name"])
        ```
    """

    def __init__(self):
        """Initialize the discovery workflow."""
        self._graph = None
        self._compiled = None
        self._build_graph()

    def _build_graph(self) -> None:
        """Build the LangGraph state graph."""
        self._graph = StateGraph(VenueDiscoveryState)

        # Add nodes
        self._graph.add_node("search", search_venues)
        self._graph.add_node("evaluate", evaluate_venues)

        # Define edges
        self._graph.set_entry_point("search")
        self._graph.add_edge("search", "evaluate")
        self._graph.add_edge("evaluate", END)

        # Compile
        self._compiled = self._graph.compile()

        logger.info("VenueDiscoveryWorkflow graph compiled")

    @traceable(name="venue_discovery_workflow", run_type="chain")
    async def run(
        self,
        search_query: str,
        city: str,
        radius: int = 10000,
        max_results: int = 20,
    ) -> Dict[str, Any]:
        """
        Execute the venue discovery workflow.

        Args:
            search_query: Category or search query
            city: City to search in
            radius: Search radius in meters
            max_results: Maximum results

        Returns:
            Final workflow state with discovered venues
        """
        logger.info(f"Starting venue discovery: {search_query} in {city}")

        initial_state = create_initial_discovery_state(
            search_query=search_query,
            city=city,
            radius=radius,
            max_results=max_results,
        )

        try:
            final_state = await self._compiled.ainvoke(initial_state)

            logger.info(
                f"Discovery completed: "
                f"{len(final_state.get('suitable_venues', []))} suitable venues"
            )

            return final_state

        except Exception as e:
            logger.error(f"Discovery workflow failed: {e}")
            return {
                **initial_state,
                "status": WorkflowStatus.FAILED.value,
                "errors": [str(e)],
            }

    async def discover_and_onboard(
        self,
        search_query: str,
        city: str,
        auto_onboard: bool = False,
    ) -> Dict[str, Any]:
        """
        Discover venues and optionally onboard them.

        Args:
            search_query: Category or search query
            city: City to search in
            auto_onboard: If True, automatically onboard suitable venues

        Returns:
            Discovery results with optional onboarding results
        """
        # First, discover venues
        discovery_result = await self.run(
            search_query=search_query,
            city=city,
        )

        if not auto_onboard:
            return discovery_result

        # Onboard suitable venues
        onboarding_workflow = VenueOnboardingWorkflow()
        onboarding_results = []

        for place_id in discovery_result.get("onboarding_queue", []):
            result = await onboarding_workflow.run(
                google_place_id=place_id,
                city=city,
            )
            onboarding_results.append(result)

        return {
            **discovery_result,
            "onboarding_results": onboarding_results,
        }
