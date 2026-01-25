# =============================================================================
# NEXUS FAMILY PASS - LANGGRAPH WORKFLOW PACKAGE
# =============================================================================
"""
LangGraph Workflow Package.

This package provides stateful AI workflow graphs for:
    - Venue onboarding pipeline
    - Quality scoring batch processing
    - Activity inference workflows
    - Search and recommendation workflows

LangGraph enables:
    - Stateful multi-step workflows
    - Parallel execution of independent tasks
    - Checkpointing and resumption
    - Comprehensive tracing via LangSmith

Components:
    - state: State definitions for workflows
    - nodes: Individual workflow step implementations
    - graphs: Complete workflow graph definitions
    - workflows: High-level workflow orchestrators

Usage:
    ```python
    from app.integrations.ai.langgraph import VenueOnboardingWorkflow

    workflow = VenueOnboardingWorkflow()
    result = await workflow.run(
        venue_name="ABC Pool",
        google_place_id="ChIJ..."
    )
    ```
"""

from app.integrations.ai.langgraph.workflows import (
    VenueOnboardingWorkflow,
    QualityScoringBatchWorkflow,
    VenueDiscoveryWorkflow,
)
from app.integrations.ai.langgraph.state import (
    VenueOnboardingState,
    WorkflowStatus,
)

__all__ = [
    "VenueOnboardingWorkflow",
    "QualityScoringBatchWorkflow",
    "VenueDiscoveryWorkflow",
    "VenueOnboardingState",
    "WorkflowStatus",
]
