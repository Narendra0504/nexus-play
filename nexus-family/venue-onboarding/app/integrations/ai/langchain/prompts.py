# =============================================================================
# NEXUS FAMILY PASS - LANGCHAIN PROMPT TEMPLATES
# =============================================================================
"""
LangChain Prompt Templates Module.

This module defines structured prompt templates for all AI operations:
    - Quality scoring from reviews
    - Activity inference from venue data
    - Venue analysis and categorization
    - Semantic search query enhancement

Using structured prompts ensures consistent, high-quality AI outputs.
"""

# =============================================================================
# IMPORTS
# =============================================================================
from langchain_core.prompts import (
    ChatPromptTemplate,
    PromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# =============================================================================
# OUTPUT SCHEMAS (Pydantic Models for Structured Output)
# =============================================================================
class QualityScoreOutput(BaseModel):
    """Schema for quality scoring output."""

    scores: Dict[str, Optional[float]] = Field(
        description="Quality scores for each category (1-5 scale)"
    )
    overall_score: float = Field(
        description="Overall quality score (1-5)",
        ge=1.0,
        le=5.0,
    )
    confidence: float = Field(
        description="Confidence in the scoring (0-1)",
        ge=0.0,
        le=1.0,
    )
    key_phrases: Dict[str, List[str]] = Field(
        description="Key phrases extracted from reviews"
    )
    summary: str = Field(
        description="Brief summary of the venue quality"
    )


class ActivityOutput(BaseModel):
    """Schema for a single activity."""

    name: str = Field(description="Activity name")
    category: str = Field(
        description="Category: sports, arts, music, dance, stem, or other"
    )
    short_description: str = Field(
        description="Brief description (max 150 chars)"
    )
    min_age: int = Field(description="Minimum age", ge=3, le=18)
    max_age: int = Field(description="Maximum age", ge=3, le=18)
    duration_minutes: int = Field(
        description="Typical duration in minutes",
        ge=30,
        le=180,
    )
    is_outdoor: bool = Field(description="Is this an outdoor activity")
    is_competitive: bool = Field(description="Is this competitive")
    is_messy: bool = Field(description="Does this get messy")


class ActivityInferenceOutput(BaseModel):
    """Schema for activity inference output."""

    activities: List[ActivityOutput] = Field(
        description="List of inferred activities"
    )
    reasoning: str = Field(
        description="Reasoning for the inferred activities"
    )


class VenueAnalysisOutput(BaseModel):
    """Schema for venue analysis output."""

    venue_type: str = Field(description="Primary venue type")
    suitable_for_kids: bool = Field(description="Is this venue suitable for kids")
    age_range: Dict[str, int] = Field(
        description="Suitable age range with min_age and max_age"
    )
    key_features: List[str] = Field(description="Key venue features")
    safety_notes: List[str] = Field(description="Safety considerations")
    recommended_activities: List[str] = Field(
        description="Recommended activity types"
    )


# =============================================================================
# QUALITY SCORING PROMPTS
# =============================================================================
QUALITY_SCORING_SYSTEM_PROMPT = """You are an expert at analyzing customer reviews for kids activity venues.
Your role is to extract objective quality scores based on parent reviews.

Focus on aspects important for parents:
- Safety: Are children supervised properly? Are facilities safe?
- Hygiene: Is the venue clean? Are equipment sanitized?
- Teaching Quality: Are instructors skilled and patient with kids?
- Facilities: Are the facilities well-maintained and appropriate?
- Value: Is the price reasonable for what's offered?
- Ambience: Is the atmosphere welcoming for children?
- Staff: Are staff friendly and helpful?
- Location: Is the venue conveniently located with parking?

Be objective and only score based on what's actually mentioned in reviews.
If a category is not mentioned, return null for that score.
"""

QUALITY_SCORING_HUMAN_PROMPT = """Analyze these reviews for "{venue_name}" ({venue_type}) and extract quality scores.

Reviews:
{reviews}

Based on these reviews, provide scores (1-5) for each category.
Categories: hygiene, safety, teaching, facilities, value, ambience, staff, location.

{format_instructions}
"""

QUALITY_SCORING_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(QUALITY_SCORING_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template(QUALITY_SCORING_HUMAN_PROMPT),
])


# =============================================================================
# ACTIVITY INFERENCE PROMPTS
# =============================================================================
ACTIVITY_INFERENCE_SYSTEM_PROMPT = """You are an expert on kids activities and extracurricular programs.
Your role is to infer what activities a venue likely offers based on its type, description, and reviews.

Guidelines:
- Be realistic about what activities the venue type typically offers
- Consider age-appropriate activities (ages 3-18)
- Include both beginner and advanced options if appropriate
- Don't make up activities that are unlikely for this venue type
- Consider what parents mention in reviews

Categories to use:
- sports: Physical activities, swimming, martial arts
- arts: Painting, crafts, creative projects
- music: Instruments, singing, music theory
- dance: Ballet, hip-hop, classical dance
- stem: Coding, robotics, science experiments
- other: Activities that don't fit above categories
"""

ACTIVITY_INFERENCE_HUMAN_PROMPT = """Based on this venue information, infer what activities they likely offer for children:

Venue Name: {venue_name}
Venue Type: {venue_type}
Description: {venue_description}
Review Insights: {review_insights}

{format_instructions}
"""

ACTIVITY_INFERENCE_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(ACTIVITY_INFERENCE_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template(ACTIVITY_INFERENCE_HUMAN_PROMPT),
])


# =============================================================================
# VENUE ANALYSIS PROMPTS
# =============================================================================
VENUE_ANALYSIS_SYSTEM_PROMPT = """You are a venue analysis expert specializing in kids activity centers.
Your role is to analyze venue information and determine if it's suitable for children's activities.

Consider:
- Is this a legitimate kids activity venue or a general business?
- What age groups would benefit from this venue?
- What are the key features that make it suitable for kids?
- Are there any safety considerations parents should know about?
"""

VENUE_ANALYSIS_HUMAN_PROMPT = """Analyze this venue for suitability as a kids activity provider:

Venue Name: {venue_name}
Google Place Types: {google_types}
Description: {description}
Rating: {rating}
Review Count: {review_count}

{format_instructions}
"""

VENUE_ANALYSIS_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(VENUE_ANALYSIS_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template(VENUE_ANALYSIS_HUMAN_PROMPT),
])


# =============================================================================
# SEARCH QUERY ENHANCEMENT PROMPTS
# =============================================================================
SEARCH_ENHANCEMENT_PROMPT = PromptTemplate.from_template(
    """You are a search query enhancer for a kids activity booking platform.

Given a user's natural language search query, enhance it with relevant keywords
and synonyms to improve search results.

User Query: {query}

Enhanced keywords (comma-separated):"""
)


# =============================================================================
# OUTPUT PARSERS
# =============================================================================
quality_score_parser = JsonOutputParser(pydantic_object=QualityScoreOutput)
activity_inference_parser = JsonOutputParser(pydantic_object=ActivityInferenceOutput)
venue_analysis_parser = JsonOutputParser(pydantic_object=VenueAnalysisOutput)


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
def get_quality_scoring_prompt_with_parser() -> tuple:
    """Get the quality scoring prompt with its parser."""
    return QUALITY_SCORING_PROMPT, quality_score_parser


def get_activity_inference_prompt_with_parser() -> tuple:
    """Get the activity inference prompt with its parser."""
    return ACTIVITY_INFERENCE_PROMPT, activity_inference_parser


def get_venue_analysis_prompt_with_parser() -> tuple:
    """Get the venue analysis prompt with its parser."""
    return VENUE_ANALYSIS_PROMPT, venue_analysis_parser
