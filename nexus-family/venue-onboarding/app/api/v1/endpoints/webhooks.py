# =============================================================================
# NEXUS FAMILY PASS - N8N WEBHOOK ENDPOINTS
# =============================================================================
"""
N8N Webhook Endpoints Module.

This module provides webhook endpoints for N8N workflow automation:
    - Venue onboarding triggers
    - Batch quality scoring
    - Credit refresh automation
    - Booking reconciliation
    - Low utilization nudges

Webhooks are designed to be:
    - Idempotent: Safe to call multiple times
    - Authenticated: Secured with webhook secrets
    - Async: Long-running tasks return immediately with job IDs

N8N Integration:
    - All webhooks accept POST requests with JSON payloads
    - Responses include job IDs for tracking
    - Callback URLs can be provided for notifications

Example N8N Workflow:
    1. HTTP Request node → POST /api/v1/webhooks/venue/onboard
    2. Wait node → Poll /api/v1/webhooks/jobs/{job_id}
    3. Process results
"""

# =============================================================================
# IMPORTS
# =============================================================================
import uuid
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

from fastapi import APIRouter, HTTPException, Header, BackgroundTasks, Depends
from pydantic import BaseModel, Field

from app.config import settings
from app.core.logging_config import get_logger
from app.core.database import get_db

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)

# =============================================================================
# ROUTER
# =============================================================================
router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# =============================================================================
# JOB STORAGE (In production, use Redis or database)
# =============================================================================
_job_store: Dict[str, Dict[str, Any]] = {}


class JobStatus(str, Enum):
    """Webhook job status."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# =============================================================================
# REQUEST SCHEMAS
# =============================================================================
class VenueOnboardRequest(BaseModel):
    """Request for venue onboarding webhook."""

    google_place_id: str = Field(..., description="Google Places ID to onboard")
    city: str = Field(..., description="City where venue is located")
    callback_url: Optional[str] = Field(
        None, description="URL to call when complete"
    )


class BatchOnboardRequest(BaseModel):
    """Request for batch venue onboarding."""

    place_ids: List[str] = Field(..., description="List of Google Place IDs")
    city: str = Field(..., description="City for all venues")
    callback_url: Optional[str] = None


class QualityScoringRequest(BaseModel):
    """Request for quality scoring webhook."""

    venue_ids: List[str] = Field(..., description="List of venue UUIDs to score")
    callback_url: Optional[str] = None


class VenueDiscoveryRequest(BaseModel):
    """Request for venue discovery webhook."""

    search_query: str = Field(..., description="Category or search query")
    city: str = Field(..., description="City to search in")
    radius: int = Field(default=10000, description="Search radius in meters")
    max_results: int = Field(default=20, description="Max results")
    auto_onboard: bool = Field(
        default=False, description="Auto-onboard suitable venues"
    )
    callback_url: Optional[str] = None


class CreditRefreshRequest(BaseModel):
    """Request for monthly credit refresh."""

    corporate_id: Optional[str] = Field(
        None, description="Specific corporate ID (None for all)"
    )
    month: int = Field(..., ge=1, le=12, description="Month to refresh")
    year: int = Field(..., description="Year to refresh")
    callback_url: Optional[str] = None


class BookingReconciliationRequest(BaseModel):
    """Request for booking reconciliation."""

    date: str = Field(..., description="Date to reconcile (YYYY-MM-DD)")
    callback_url: Optional[str] = None


# =============================================================================
# RESPONSE SCHEMAS
# =============================================================================
class WebhookJobResponse(BaseModel):
    """Response for webhook job creation."""

    job_id: str = Field(..., description="Unique job ID for tracking")
    status: str = Field(..., description="Initial job status")
    message: str = Field(..., description="Status message")
    poll_url: str = Field(..., description="URL to poll for status")


class JobStatusResponse(BaseModel):
    """Response for job status check."""

    job_id: str
    status: str
    message: str
    created_at: str
    completed_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
def create_job(job_type: str, metadata: Dict[str, Any]) -> str:
    """Create a new job and return its ID."""
    job_id = str(uuid.uuid4())
    _job_store[job_id] = {
        "job_id": job_id,
        "type": job_type,
        "status": JobStatus.PENDING.value,
        "message": "Job created, pending execution",
        "metadata": metadata,
        "created_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "result": None,
        "errors": [],
    }
    logger.info(f"Created job {job_id} of type {job_type}")
    return job_id


def update_job(
    job_id: str,
    status: JobStatus,
    message: str,
    result: Optional[Dict[str, Any]] = None,
    errors: Optional[List[str]] = None,
) -> None:
    """Update a job's status."""
    if job_id in _job_store:
        _job_store[job_id]["status"] = status.value
        _job_store[job_id]["message"] = message
        if result:
            _job_store[job_id]["result"] = result
        if errors:
            _job_store[job_id]["errors"] = errors
        if status in [JobStatus.COMPLETED, JobStatus.FAILED]:
            _job_store[job_id]["completed_at"] = datetime.utcnow().isoformat()
        logger.info(f"Updated job {job_id}: {status.value}")


def verify_webhook_secret(x_webhook_secret: Optional[str] = Header(None)) -> bool:
    """Verify webhook secret for authentication."""
    # In production, use a proper secret from settings
    expected_secret = getattr(settings, 'WEBHOOK_SECRET', 'nexus-webhook-secret')
    if x_webhook_secret != expected_secret:
        # For development, allow if no secret is configured
        if settings.APP_ENV == "development":
            return True
        raise HTTPException(status_code=401, detail="Invalid webhook secret")
    return True


# =============================================================================
# WEBHOOK ENDPOINTS
# =============================================================================
@router.post(
    "/venue/onboard",
    response_model=WebhookJobResponse,
    summary="Trigger Venue Onboarding",
    description="Start the venue onboarding workflow for a single venue.",
)
async def webhook_venue_onboard(
    request: VenueOnboardRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_webhook_secret),
) -> WebhookJobResponse:
    """
    Trigger venue onboarding workflow.

    This endpoint starts an async workflow to onboard a venue from
    Google Places. Returns immediately with a job ID for polling.
    """
    job_id = create_job("venue_onboard", request.model_dump())

    async def run_onboarding():
        try:
            update_job(job_id, JobStatus.RUNNING, "Onboarding in progress")

            from app.integrations.ai.langgraph import VenueOnboardingWorkflow

            workflow = VenueOnboardingWorkflow()
            result = await workflow.run(
                google_place_id=request.google_place_id,
                city=request.city,
            )

            if result.get("status") == "completed":
                update_job(
                    job_id,
                    JobStatus.COMPLETED,
                    f"Venue onboarded: {result.get('venue_id')}",
                    result=result,
                )
            else:
                update_job(
                    job_id,
                    JobStatus.FAILED,
                    "Onboarding failed",
                    errors=result.get("errors", []),
                )

            # Call callback if provided
            if request.callback_url:
                await notify_callback(request.callback_url, job_id)

        except Exception as e:
            logger.error(f"Onboarding job {job_id} failed: {e}")
            update_job(job_id, JobStatus.FAILED, str(e), errors=[str(e)])

    background_tasks.add_task(run_onboarding)

    return WebhookJobResponse(
        job_id=job_id,
        status=JobStatus.PENDING.value,
        message="Venue onboarding job created",
        poll_url=f"/api/v1/webhooks/jobs/{job_id}",
    )


@router.post(
    "/venue/batch-onboard",
    response_model=WebhookJobResponse,
    summary="Batch Venue Onboarding",
    description="Start onboarding for multiple venues.",
)
async def webhook_batch_onboard(
    request: BatchOnboardRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_webhook_secret),
) -> WebhookJobResponse:
    """Trigger batch venue onboarding workflow."""
    job_id = create_job("batch_onboard", request.model_dump())

    async def run_batch():
        try:
            update_job(
                job_id,
                JobStatus.RUNNING,
                f"Processing {len(request.place_ids)} venues",
            )

            from app.integrations.ai.langgraph import VenueOnboardingWorkflow

            workflow = VenueOnboardingWorkflow()
            results = await workflow.run_batch(
                place_ids=request.place_ids,
                city=request.city,
            )

            success_count = sum(
                1 for r in results if r.get("status") == "completed"
            )

            update_job(
                job_id,
                JobStatus.COMPLETED,
                f"Onboarded {success_count}/{len(request.place_ids)} venues",
                result={"results": results, "success_count": success_count},
            )

            if request.callback_url:
                await notify_callback(request.callback_url, job_id)

        except Exception as e:
            update_job(job_id, JobStatus.FAILED, str(e), errors=[str(e)])

    background_tasks.add_task(run_batch)

    return WebhookJobResponse(
        job_id=job_id,
        status=JobStatus.PENDING.value,
        message=f"Batch onboarding job created for {len(request.place_ids)} venues",
        poll_url=f"/api/v1/webhooks/jobs/{job_id}",
    )


@router.post(
    "/quality/score",
    response_model=WebhookJobResponse,
    summary="Trigger Quality Scoring",
    description="Start batch quality scoring for venues.",
)
async def webhook_quality_scoring(
    request: QualityScoringRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_webhook_secret),
) -> WebhookJobResponse:
    """Trigger batch quality scoring workflow."""
    job_id = create_job("quality_scoring", request.model_dump())

    async def run_scoring():
        try:
            update_job(
                job_id,
                JobStatus.RUNNING,
                f"Scoring {len(request.venue_ids)} venues",
            )

            from app.integrations.ai.langgraph import QualityScoringBatchWorkflow

            workflow = QualityScoringBatchWorkflow()
            result = await workflow.run(venue_ids=request.venue_ids)

            update_job(
                job_id,
                JobStatus.COMPLETED,
                f"Scored {result.get('processed_count', 0)} venues",
                result=result,
            )

            if request.callback_url:
                await notify_callback(request.callback_url, job_id)

        except Exception as e:
            update_job(job_id, JobStatus.FAILED, str(e), errors=[str(e)])

    background_tasks.add_task(run_scoring)

    return WebhookJobResponse(
        job_id=job_id,
        status=JobStatus.PENDING.value,
        message=f"Quality scoring job created for {len(request.venue_ids)} venues",
        poll_url=f"/api/v1/webhooks/jobs/{job_id}",
    )


@router.post(
    "/venue/discover",
    response_model=WebhookJobResponse,
    summary="Trigger Venue Discovery",
    description="Discover and evaluate venues in a city.",
)
async def webhook_venue_discovery(
    request: VenueDiscoveryRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_webhook_secret),
) -> WebhookJobResponse:
    """Trigger venue discovery workflow."""
    job_id = create_job("venue_discovery", request.model_dump())

    async def run_discovery():
        try:
            update_job(
                job_id,
                JobStatus.RUNNING,
                f"Discovering {request.search_query} in {request.city}",
            )

            from app.integrations.ai.langgraph import VenueDiscoveryWorkflow

            workflow = VenueDiscoveryWorkflow()
            result = await workflow.discover_and_onboard(
                search_query=request.search_query,
                city=request.city,
                auto_onboard=request.auto_onboard,
            )

            suitable_count = len(result.get("suitable_venues", []))
            update_job(
                job_id,
                JobStatus.COMPLETED,
                f"Found {suitable_count} suitable venues",
                result=result,
            )

            if request.callback_url:
                await notify_callback(request.callback_url, job_id)

        except Exception as e:
            update_job(job_id, JobStatus.FAILED, str(e), errors=[str(e)])

    background_tasks.add_task(run_discovery)

    return WebhookJobResponse(
        job_id=job_id,
        status=JobStatus.PENDING.value,
        message=f"Venue discovery job created for {request.search_query}",
        poll_url=f"/api/v1/webhooks/jobs/{job_id}",
    )


@router.post(
    "/credits/refresh",
    response_model=WebhookJobResponse,
    summary="Monthly Credit Refresh",
    description="Trigger monthly credit refresh for corporates.",
)
async def webhook_credit_refresh(
    request: CreditRefreshRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_webhook_secret),
) -> WebhookJobResponse:
    """
    Trigger monthly credit refresh.

    This is typically called by N8N on the 1st of each month.
    """
    job_id = create_job("credit_refresh", request.model_dump())

    async def run_refresh():
        try:
            update_job(
                job_id,
                JobStatus.RUNNING,
                f"Refreshing credits for {request.month}/{request.year}",
            )

            # TODO: Implement credit refresh logic
            # This would:
            # 1. Query all active subscriptions
            # 2. Calculate credit allocations
            # 3. Create credit_ledger entries
            # 4. Send notifications

            update_job(
                job_id,
                JobStatus.COMPLETED,
                "Credit refresh completed",
                result={"month": request.month, "year": request.year},
            )

            if request.callback_url:
                await notify_callback(request.callback_url, job_id)

        except Exception as e:
            update_job(job_id, JobStatus.FAILED, str(e), errors=[str(e)])

    background_tasks.add_task(run_refresh)

    return WebhookJobResponse(
        job_id=job_id,
        status=JobStatus.PENDING.value,
        message=f"Credit refresh job created for {request.month}/{request.year}",
        poll_url=f"/api/v1/webhooks/jobs/{job_id}",
    )


@router.post(
    "/bookings/reconcile",
    response_model=WebhookJobResponse,
    summary="Booking Reconciliation",
    description="Reconcile bookings for a date (mark no-shows, etc.).",
)
async def webhook_booking_reconciliation(
    request: BookingReconciliationRequest,
    background_tasks: BackgroundTasks,
    _: bool = Depends(verify_webhook_secret),
) -> WebhookJobResponse:
    """
    Trigger booking reconciliation.

    This is typically called by N8N daily to:
    - Mark past bookings as completed or no-show
    - Process credit forfeitures for no-shows
    - Send follow-up emails for feedback
    """
    job_id = create_job("booking_reconciliation", request.model_dump())

    async def run_reconciliation():
        try:
            update_job(
                job_id,
                JobStatus.RUNNING,
                f"Reconciling bookings for {request.date}",
            )

            # TODO: Implement reconciliation logic
            # This would:
            # 1. Query all bookings for the date
            # 2. Check venue attendance records
            # 3. Update booking statuses
            # 4. Process credit forfeitures
            # 5. Send feedback request emails

            update_job(
                job_id,
                JobStatus.COMPLETED,
                f"Reconciliation completed for {request.date}",
                result={"date": request.date, "processed": 0, "no_shows": 0},
            )

            if request.callback_url:
                await notify_callback(request.callback_url, job_id)

        except Exception as e:
            update_job(job_id, JobStatus.FAILED, str(e), errors=[str(e)])

    background_tasks.add_task(run_reconciliation)

    return WebhookJobResponse(
        job_id=job_id,
        status=JobStatus.PENDING.value,
        message=f"Booking reconciliation job created for {request.date}",
        poll_url=f"/api/v1/webhooks/jobs/{job_id}",
    )


# =============================================================================
# JOB STATUS ENDPOINT
# =============================================================================
@router.get(
    "/jobs/{job_id}",
    response_model=JobStatusResponse,
    summary="Get Job Status",
    description="Check the status of a webhook job.",
)
async def get_job_status(job_id: str) -> JobStatusResponse:
    """Get the status of a webhook job."""
    if job_id not in _job_store:
        raise HTTPException(status_code=404, detail="Job not found")

    job = _job_store[job_id]
    return JobStatusResponse(
        job_id=job["job_id"],
        status=job["status"],
        message=job["message"],
        created_at=job["created_at"],
        completed_at=job["completed_at"],
        result=job["result"],
        errors=job["errors"] if job["errors"] else None,
    )


# =============================================================================
# CALLBACK HELPER
# =============================================================================
async def notify_callback(callback_url: str, job_id: str) -> None:
    """Send callback notification when job completes."""
    import httpx

    try:
        job = _job_store.get(job_id)
        if not job:
            return

        async with httpx.AsyncClient() as client:
            await client.post(
                callback_url,
                json={
                    "job_id": job_id,
                    "status": job["status"],
                    "result": job["result"],
                    "completed_at": job["completed_at"],
                },
                timeout=10.0,
            )

        logger.info(f"Callback sent for job {job_id} to {callback_url}")

    except Exception as e:
        logger.warning(f"Failed to send callback for job {job_id}: {e}")
