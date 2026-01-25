# =============================================================================
# NEXUS FAMILY PASS - MCP TOOL DEFINITIONS
# =============================================================================
"""
MCP Tool Definitions Module.

This module defines tools following the Model Context Protocol specification.
Each tool includes:
    - Name and description
    - Input schema (JSON Schema)
    - Execution function
    - Output formatting

Tools are organized by domain:
    - Venue tools: Search, details, quality scores
    - Activity tools: Search, sessions, availability
    - Booking tools: Create, cancel, status
"""

# =============================================================================
# IMPORTS
# =============================================================================
from typing import Dict, Any, List, Optional, Callable, Awaitable
from dataclasses import dataclass, field
from enum import Enum
import json

from pydantic import BaseModel, Field
from app.core.logging_config import get_logger

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# MCP TYPES
# =============================================================================
class MCPToolResult(BaseModel):
    """Result from an MCP tool execution."""

    success: bool = Field(..., description="Whether the tool succeeded")
    data: Optional[Dict[str, Any]] = Field(
        None, description="Tool output data"
    )
    error: Optional[str] = Field(None, description="Error message if failed")


@dataclass
class MCPTool:
    """
    Definition of an MCP tool.

    Attributes:
        name: Unique tool name
        description: Human-readable description
        input_schema: JSON Schema for input validation
        handler: Async function to execute the tool
    """

    name: str
    description: str
    input_schema: Dict[str, Any]
    handler: Callable[..., Awaitable[MCPToolResult]]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to MCP-compatible dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.input_schema,
        }


# =============================================================================
# VENUE TOOLS
# =============================================================================
async def search_venues_handler(
    query: str,
    city: str = "Bangalore",
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_results: int = 10,
) -> MCPToolResult:
    """Search for venues matching criteria."""
    try:
        from app.core.database import get_db_session
        from app.models.venue import Venue
        from sqlalchemy import select, and_

        async with get_db_session() as db:
            # Build query
            stmt = select(Venue).where(Venue.is_active == True)

            if city:
                stmt = stmt.where(Venue.city.ilike(f"%{city}%"))

            if min_rating:
                stmt = stmt.where(Venue.google_rating >= min_rating)

            if query:
                stmt = stmt.where(Venue.name.ilike(f"%{query}%"))

            stmt = stmt.limit(max_results)

            result = await db.execute(stmt)
            venues = result.scalars().all()

            venues_data = [
                {
                    "id": str(v.id),
                    "name": v.name,
                    "city": v.city,
                    "rating": v.google_rating,
                    "address": v.formatted_address,
                }
                for v in venues
            ]

            return MCPToolResult(
                success=True,
                data={"venues": venues_data, "count": len(venues_data)},
            )

    except Exception as e:
        logger.error(f"search_venues failed: {e}")
        return MCPToolResult(success=False, error=str(e))


async def get_venue_details_handler(venue_id: str) -> MCPToolResult:
    """Get detailed information about a venue."""
    try:
        from app.core.database import get_db_session
        from app.models.venue import Venue
        from app.models.quality_score import VenueQualityScore
        from sqlalchemy import select

        async with get_db_session() as db:
            # Get venue
            stmt = select(Venue).where(Venue.id == venue_id)
            result = await db.execute(stmt)
            venue = result.scalar_one_or_none()

            if not venue:
                return MCPToolResult(success=False, error="Venue not found")

            # Get quality scores
            score_stmt = select(VenueQualityScore).where(
                VenueQualityScore.venue_id == venue_id
            )
            score_result = await db.execute(score_stmt)
            quality_score = score_result.scalar_one_or_none()

            venue_data = {
                "id": str(venue.id),
                "name": venue.name,
                "slug": venue.slug,
                "city": venue.city,
                "address": venue.formatted_address,
                "rating": venue.google_rating,
                "review_count": venue.google_review_count,
                "types": venue.google_types,
                "photos": venue.photos_urls[:5] if venue.photos_urls else [],
            }

            if quality_score:
                venue_data["quality_scores"] = {
                    "overall": quality_score.overall_score,
                    "hygiene": quality_score.hygiene_score,
                    "safety": quality_score.safety_score,
                    "teaching": quality_score.teaching_score,
                    "facilities": quality_score.facilities_score,
                }

            return MCPToolResult(success=True, data=venue_data)

    except Exception as e:
        logger.error(f"get_venue_details failed: {e}")
        return MCPToolResult(success=False, error=str(e))


async def get_venue_activities_handler(venue_id: str) -> MCPToolResult:
    """Get activities offered at a venue."""
    try:
        from app.core.database import get_db_session
        from app.models.activity import Activity
        from sqlalchemy import select

        async with get_db_session() as db:
            stmt = select(Activity).where(
                Activity.venue_id == venue_id,
                Activity.is_active == True,
            )
            result = await db.execute(stmt)
            activities = result.scalars().all()

            activities_data = [
                {
                    "id": str(a.id),
                    "name": a.name,
                    "category": a.category,
                    "description": a.short_description,
                    "min_age": a.min_age,
                    "max_age": a.max_age,
                    "duration_minutes": a.duration_minutes,
                    "credits_required": a.credits_required,
                }
                for a in activities
            ]

            return MCPToolResult(
                success=True,
                data={"activities": activities_data, "count": len(activities_data)},
            )

    except Exception as e:
        logger.error(f"get_venue_activities failed: {e}")
        return MCPToolResult(success=False, error=str(e))


# Define venue tools
venue_tools: List[MCPTool] = [
    MCPTool(
        name="search_venues",
        description="Search for kids activity venues by query, city, or category",
        input_schema={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query (venue name or type)",
                },
                "city": {
                    "type": "string",
                    "description": "City to search in",
                    "default": "Bangalore",
                },
                "category": {
                    "type": "string",
                    "description": "Activity category filter",
                    "enum": ["sports", "arts", "music", "dance", "stem", "other"],
                },
                "min_rating": {
                    "type": "number",
                    "description": "Minimum Google rating",
                    "minimum": 1,
                    "maximum": 5,
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum results to return",
                    "default": 10,
                    "maximum": 50,
                },
            },
            "required": ["query"],
        },
        handler=search_venues_handler,
    ),
    MCPTool(
        name="get_venue_details",
        description="Get detailed information about a specific venue including quality scores",
        input_schema={
            "type": "object",
            "properties": {
                "venue_id": {
                    "type": "string",
                    "description": "UUID of the venue",
                },
            },
            "required": ["venue_id"],
        },
        handler=get_venue_details_handler,
    ),
    MCPTool(
        name="get_venue_activities",
        description="Get all activities offered at a venue",
        input_schema={
            "type": "object",
            "properties": {
                "venue_id": {
                    "type": "string",
                    "description": "UUID of the venue",
                },
            },
            "required": ["venue_id"],
        },
        handler=get_venue_activities_handler,
    ),
]


# =============================================================================
# ACTIVITY TOOLS
# =============================================================================
async def search_activities_handler(
    query: str,
    category: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    city: Optional[str] = None,
    max_results: int = 10,
) -> MCPToolResult:
    """Search for activities across venues."""
    try:
        from app.core.database import get_db_session
        from app.models.activity import Activity
        from app.models.venue import Venue
        from sqlalchemy import select, and_
        from sqlalchemy.orm import joinedload

        async with get_db_session() as db:
            stmt = (
                select(Activity)
                .join(Venue)
                .where(Activity.is_active == True)
                .options(joinedload(Activity.venue))
            )

            if query:
                stmt = stmt.where(Activity.name.ilike(f"%{query}%"))

            if category:
                stmt = stmt.where(Activity.category == category)

            if min_age is not None:
                stmt = stmt.where(Activity.max_age >= min_age)

            if max_age is not None:
                stmt = stmt.where(Activity.min_age <= max_age)

            if city:
                stmt = stmt.where(Venue.city.ilike(f"%{city}%"))

            stmt = stmt.limit(max_results)

            result = await db.execute(stmt)
            activities = result.scalars().all()

            activities_data = [
                {
                    "id": str(a.id),
                    "name": a.name,
                    "category": a.category,
                    "description": a.short_description,
                    "age_range": f"{a.min_age}-{a.max_age}",
                    "duration_minutes": a.duration_minutes,
                    "venue_name": a.venue.name if a.venue else None,
                    "venue_city": a.venue.city if a.venue else None,
                }
                for a in activities
            ]

            return MCPToolResult(
                success=True,
                data={"activities": activities_data, "count": len(activities_data)},
            )

    except Exception as e:
        logger.error(f"search_activities failed: {e}")
        return MCPToolResult(success=False, error=str(e))


async def get_activity_sessions_handler(
    activity_id: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> MCPToolResult:
    """Get available sessions for an activity."""
    try:
        from app.core.database import get_db_session
        from app.models.activity import Activity, ActivitySession
        from sqlalchemy import select
        from datetime import datetime, date

        async with get_db_session() as db:
            stmt = select(ActivitySession).where(
                ActivitySession.activity_id == activity_id,
                ActivitySession.is_cancelled == False,
            )

            if date_from:
                from_date = datetime.strptime(date_from, "%Y-%m-%d").date()
                stmt = stmt.where(ActivitySession.session_date >= from_date)

            if date_to:
                to_date = datetime.strptime(date_to, "%Y-%m-%d").date()
                stmt = stmt.where(ActivitySession.session_date <= to_date)

            result = await db.execute(stmt)
            sessions = result.scalars().all()

            sessions_data = [
                {
                    "id": str(s.id),
                    "date": s.session_date.isoformat(),
                    "start_time": s.start_time.isoformat() if s.start_time else None,
                    "end_time": s.end_time.isoformat() if s.end_time else None,
                    "capacity": s.total_capacity,
                    "booked": s.booked_count,
                    "available": s.total_capacity - s.booked_count,
                }
                for s in sessions
            ]

            return MCPToolResult(
                success=True,
                data={"sessions": sessions_data, "count": len(sessions_data)},
            )

    except Exception as e:
        logger.error(f"get_activity_sessions failed: {e}")
        return MCPToolResult(success=False, error=str(e))


# Define activity tools
activity_tools: List[MCPTool] = [
    MCPTool(
        name="search_activities",
        description="Search for activities by name, category, age range, or location",
        input_schema={
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query",
                },
                "category": {
                    "type": "string",
                    "description": "Activity category",
                    "enum": ["sports", "arts", "music", "dance", "stem", "other"],
                },
                "min_age": {
                    "type": "integer",
                    "description": "Minimum age requirement",
                    "minimum": 3,
                    "maximum": 18,
                },
                "max_age": {
                    "type": "integer",
                    "description": "Maximum age requirement",
                    "minimum": 3,
                    "maximum": 18,
                },
                "city": {
                    "type": "string",
                    "description": "City filter",
                },
                "max_results": {
                    "type": "integer",
                    "default": 10,
                },
            },
            "required": ["query"],
        },
        handler=search_activities_handler,
    ),
    MCPTool(
        name="get_activity_sessions",
        description="Get available sessions for an activity within a date range",
        input_schema={
            "type": "object",
            "properties": {
                "activity_id": {
                    "type": "string",
                    "description": "UUID of the activity",
                },
                "date_from": {
                    "type": "string",
                    "description": "Start date (YYYY-MM-DD)",
                    "format": "date",
                },
                "date_to": {
                    "type": "string",
                    "description": "End date (YYYY-MM-DD)",
                    "format": "date",
                },
            },
            "required": ["activity_id"],
        },
        handler=get_activity_sessions_handler,
    ),
]


# =============================================================================
# BOOKING TOOLS (Placeholder for future implementation)
# =============================================================================
async def create_booking_handler(
    session_id: str,
    child_id: str,
    parent_notes: Optional[str] = None,
) -> MCPToolResult:
    """Create a booking for a child."""
    # Placeholder - would integrate with booking service
    return MCPToolResult(
        success=False,
        error="Booking creation not yet implemented",
    )


async def cancel_booking_handler(
    booking_id: str,
    reason: str,
) -> MCPToolResult:
    """Cancel an existing booking."""
    # Placeholder - would integrate with booking service
    return MCPToolResult(
        success=False,
        error="Booking cancellation not yet implemented",
    )


async def get_booking_status_handler(booking_id: str) -> MCPToolResult:
    """Get the status of a booking."""
    # Placeholder - would integrate with booking service
    return MCPToolResult(
        success=False,
        error="Booking status check not yet implemented",
    )


# Define booking tools (placeholders for Phase 2)
booking_tools: List[MCPTool] = [
    MCPTool(
        name="create_booking",
        description="Create a booking for a child at an activity session",
        input_schema={
            "type": "object",
            "properties": {
                "session_id": {
                    "type": "string",
                    "description": "UUID of the activity session",
                },
                "child_id": {
                    "type": "string",
                    "description": "UUID of the child",
                },
                "parent_notes": {
                    "type": "string",
                    "description": "Optional notes for the venue",
                },
            },
            "required": ["session_id", "child_id"],
        },
        handler=create_booking_handler,
    ),
    MCPTool(
        name="cancel_booking",
        description="Cancel an existing booking",
        input_schema={
            "type": "object",
            "properties": {
                "booking_id": {
                    "type": "string",
                    "description": "UUID of the booking",
                },
                "reason": {
                    "type": "string",
                    "description": "Cancellation reason",
                },
            },
            "required": ["booking_id", "reason"],
        },
        handler=cancel_booking_handler,
    ),
    MCPTool(
        name="get_booking_status",
        description="Get the status of a booking",
        input_schema={
            "type": "object",
            "properties": {
                "booking_id": {
                    "type": "string",
                    "description": "UUID of the booking",
                },
            },
            "required": ["booking_id"],
        },
        handler=get_booking_status_handler,
    ),
]


# =============================================================================
# ALL TOOLS
# =============================================================================
def get_all_tools() -> List[MCPTool]:
    """Get all available MCP tools."""
    return venue_tools + activity_tools + booking_tools
