# Nexus Family Pass - Backend API

## Overview

A comprehensive Python backend for the Nexus Family Pass platform - a B2B2C platform where companies provide activity subscriptions for employees' children. This backend features a modern **Agentic AI Architecture** using LangChain, LangGraph, LangSmith, N8N, and MCP integrations.

**Key Features:**
- Venue discovery via Google Places API
- AI-powered quality scoring using LangChain
- Stateful workflow orchestration with LangGraph
- Full observability with LangSmith tracing
- N8N webhook integration for automation
- MCP (Model Context Protocol) server for AI tool access

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API Layer (FastAPI)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Endpoints: /venues, /activities, /vendors, /webhooks, /health              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                       Service Layer (Business Logic)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  VenueService, ActivityService, VendorService                                │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────────┐
        │                           │                               │
        ▼                           ▼                               ▼
┌───────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│    PostgreSQL     │     │   Google Places     │     │   Agentic AI Layer  │
│    (Supabase)     │     │       API           │     │                     │
│    + pgvector     │     │                     │     │  ┌───────────────┐  │
└───────────────────┘     └─────────────────────┘     │  │  LangChain    │  │
                                                       │  │  Chains       │  │
                                                       │  ├───────────────┤  │
                                                       │  │  LangGraph    │  │
                                                       │  │  Workflows    │  │
                                                       │  ├───────────────┤  │
                                                       │  │  LangSmith    │  │
                                                       │  │  Tracing      │  │
                                                       │  ├───────────────┤  │
                                                       │  │  MCP Server   │  │
                                                       │  └───────────────┘  │
                                                       └─────────────────────┘
```

### Agentic AI Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           AGENTIC AI LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        LangChain Layer                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │ LLM Client   │  │ Prompt       │  │ Chains                    │   │    │
│  │  │ (Gemini)     │  │ Templates    │  │ - QualityScoringChain     │   │    │
│  │  │              │  │              │  │ - ActivityInferenceChain  │   │    │
│  │  │ + Callbacks  │  │ + Parsers    │  │ - VenueAnalysisChain      │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        LangGraph Layer                               │    │
│  │                                                                      │    │
│  │  Venue Onboarding Workflow:                                          │    │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐          │    │
│  │  │  Fetch   │──▶│ Analyze  │──▶│  Score   │──▶│  Infer   │          │    │
│  │  │ Details  │   │  Venue   │   │ Quality  │   │ Activity │          │    │
│  │  └──────────┘   └──────────┘   └──────────┘   └──────────┘          │    │
│  │       │                                              │               │    │
│  │       │         ┌──────────┐   ┌──────────┐         │               │    │
│  │       └────────▶│ Generate │──▶│  Save to │◀────────┘               │    │
│  │                 │Embeddings│   │ Database │                          │    │
│  │                 └──────────┘   └──────────┘                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        LangSmith Tracing                             │    │
│  │                                                                      │    │
│  │  All chains, workflows, and tool calls are automatically traced     │    │
│  │  and visible in the LangSmith dashboard for debugging and           │    │
│  │  performance monitoring.                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        MCP Server                                    │    │
│  │                                                                      │    │
│  │  Provides standardized tools for AI systems:                         │    │
│  │  - search_venues       - get_venue_details    - get_venue_activities │    │
│  │  - search_activities   - get_activity_sessions                       │    │
│  │  - create_booking      - cancel_booking       - get_booking_status   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        N8N Webhooks                                  │    │
│  │                                                                      │    │
│  │  POST /api/v1/webhooks/venue/onboard        - Trigger onboarding    │    │
│  │  POST /api/v1/webhooks/venue/batch-onboard  - Batch onboarding      │    │
│  │  POST /api/v1/webhooks/quality/score        - Batch scoring         │    │
│  │  POST /api/v1/webhooks/venue/discover       - Venue discovery       │    │
│  │  POST /api/v1/webhooks/credits/refresh      - Monthly credit reset  │    │
│  │  POST /api/v1/webhooks/bookings/reconcile   - Daily reconciliation  │    │
│  │  GET  /api/v1/webhooks/jobs/{job_id}        - Check job status      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
nexus-backend/
├── README.md                       # This file
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
├── pyproject.toml                  # Project metadata
├── alembic.ini                     # Database migration config
├── run.py                          # Application entry point
│
├── app/                            # Main application package
│   ├── __init__.py
│   ├── main.py                     # FastAPI app factory
│   ├── config.py                   # Configuration management
│   │
│   ├── api/                        # API layer
│   │   └── v1/
│   │       ├── router.py           # Main API router
│   │       ├── dependencies.py     # Dependency injection
│   │       └── endpoints/
│   │           ├── health.py       # Health checks
│   │           ├── venues.py       # Venue endpoints
│   │           ├── activities.py   # Activity endpoints
│   │           ├── vendors.py      # Vendor portal
│   │           └── webhooks.py     # N8N webhook endpoints
│   │
│   ├── core/                       # Core utilities
│   │   ├── database.py             # Database connection
│   │   ├── exceptions.py           # Custom exceptions
│   │   ├── logging_config.py       # Structured logging
│   │   └── security.py             # Auth utilities
│   │
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── venue.py
│   │   ├── activity.py
│   │   ├── vendor.py
│   │   ├── review.py
│   │   └── quality_score.py
│   │
│   ├── schemas/                    # Pydantic validation schemas
│   │   ├── venue.py
│   │   ├── activity.py
│   │   └── vendor.py
│   │
│   ├── services/                   # Business logic layer
│   │   ├── venue_service.py
│   │   ├── activity_service.py
│   │   └── vendor_service.py
│   │
│   ├── integrations/               # External integrations
│   │   ├── google_places/          # Google Places API
│   │   │   ├── client.py
│   │   │   ├── mapper.py
│   │   │   └── models.py
│   │   │
│   │   ├── ai/                     # AI/ML integrations
│   │   │   ├── gemini_client.py    # Direct Gemini client (legacy)
│   │   │   ├── quality_scorer.py   # Legacy scorer
│   │   │   ├── activity_inferrer.py
│   │   │   ├── embeddings.py
│   │   │   │
│   │   │   ├── langchain/          # LangChain integration
│   │   │   │   ├── __init__.py
│   │   │   │   ├── llm.py          # LLM with LangSmith tracing
│   │   │   │   ├── prompts.py      # Prompt templates
│   │   │   │   ├── chains.py       # Reusable chains
│   │   │   │   └── tools.py        # LangChain tools
│   │   │   │
│   │   │   └── langgraph/          # LangGraph workflows
│   │   │       ├── __init__.py
│   │   │       ├── state.py        # State definitions
│   │   │       ├── nodes.py        # Workflow nodes
│   │   │       └── workflows.py    # Workflow orchestrators
│   │   │
│   │   └── mcp/                    # MCP server
│   │       ├── __init__.py
│   │       ├── server.py           # MCP server implementation
│   │       └── tools.py            # MCP tool definitions
│   │
│   └── utils/                      # Utility functions
│       ├── pricing.py
│       ├── slug.py
│       └── validators.py
│
├── scripts/                        # Utility scripts
│   ├── ingest_venues.py            # Venue ingestion
│   ├── process_reviews.py          # Review processing
│   ├── generate_mock_pricing.py
│   └── seed_vendor_accounts.py
│
└── tests/                          # Test suite
    ├── conftest.py
    └── test_*.py
```

---

## Quick Start

### Prerequisites

- **Python 3.11+**
- **PostgreSQL 15+** with pgvector extension (via Supabase)
- **Google Cloud account** with Places API enabled
- **Gemini API key** (free tier available)
- **LangSmith account** (free tier for tracing)
- **N8N instance** (optional, for workflow automation)

### Step 1: Clone and Setup Virtual Environment

```bash
# Navigate to backend directory
cd nexus-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (Command Prompt):
.\venv\Scripts\activate.bat

# Verify activation
python --version  # Should show Python 3.11+
```

### Step 2: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
# Use any text editor (notepad, vim, nano, etc.)
```

**Required Environment Variables:**

```bash
# =============================================================================
# DATABASE CONFIGURATION (Required)
# =============================================================================
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# =============================================================================
# GOOGLE CLOUD CONFIGURATION (Required)
# =============================================================================
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# =============================================================================
# AI/ML CONFIGURATION (Required)
# =============================================================================
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# =============================================================================
# LANGSMITH TRACING (Recommended)
# =============================================================================
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=nexus-family-pass
LANGSMITH_TRACING_ENABLED=full  # Options: full, errors, false

# =============================================================================
# AGENTIC AI SETTINGS
# =============================================================================
LANGGRAPH_ENABLED=true
MCP_SERVER_ENABLED=true
WEBHOOK_SECRET=your-secure-webhook-secret

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
APP_ENV=development
APP_DEBUG=true
APP_SECRET_KEY=your-secret-key-change-in-production
```

### Step 4: Setup Database

```bash
# Run database migrations
alembic upgrade head

# Verify tables were created (check Supabase dashboard)
```

### Step 5: Run the Application

```bash
# Development mode with auto-reload
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 6: Access the API

- **API Documentation (Swagger):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/api/v1/health

---

## Using the Agentic AI Features

### 1. LangChain Chains

The LangChain chains provide structured AI operations with automatic tracing.

```python
from app.integrations.ai.langchain.chains import (
    QualityScoringChain,
    ActivityInferenceChain,
    VenueAnalysisChain,
)

# Quality scoring from reviews
scorer = QualityScoringChain()
result = await scorer.run(
    venue_name="ABC Swimming Academy",
    venue_type="swimming_pool",
    reviews=["Great instructors!", "Very clean pool", "Kids loved it"]
)
print(result["overall_score"])  # 4.5
print(result["scores"]["safety"])  # 4.8

# Activity inference
inferrer = ActivityInferenceChain()
activities = await inferrer.run(
    venue_name="ABC Swimming Academy",
    venue_type="swimming_pool",
    venue_description="Olympic-sized pool with certified instructors"
)
for activity in activities:
    print(f"{activity['name']}: Ages {activity['min_age']}-{activity['max_age']}")
```

### 2. LangGraph Workflows

LangGraph provides stateful, multi-step workflows with checkpointing.

```python
from app.integrations.ai.langgraph import (
    VenueOnboardingWorkflow,
    QualityScoringBatchWorkflow,
    VenueDiscoveryWorkflow,
)

# Complete venue onboarding
workflow = VenueOnboardingWorkflow()
result = await workflow.run(
    google_place_id="ChIJ...",
    city="Bangalore"
)

if result["status"] == "completed":
    print(f"Venue ID: {result['venue_id']}")
    print(f"Activities: {len(result['activity_ids'])}")
else:
    print(f"Errors: {result['errors']}")

# Batch quality scoring
batch_workflow = QualityScoringBatchWorkflow()
result = await batch_workflow.run(
    venue_ids=["uuid1", "uuid2", "uuid3"]
)
print(f"Scored: {result['processed_count']}/{result['total_count']}")

# Venue discovery with auto-onboarding
discovery = VenueDiscoveryWorkflow()
result = await discovery.discover_and_onboard(
    search_query="swimming_pool",
    city="Bangalore",
    auto_onboard=True
)
print(f"Found {len(result['suitable_venues'])} suitable venues")
```

### 3. N8N Webhook Integration

Trigger workflows from N8N or any HTTP client.

```bash
# Trigger venue onboarding
curl -X POST http://localhost:8000/api/v1/webhooks/venue/onboard \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -d '{
    "google_place_id": "ChIJ...",
    "city": "Bangalore",
    "callback_url": "https://your-n8n-instance/webhook/callback"
  }'

# Response:
# {
#   "job_id": "uuid",
#   "status": "pending",
#   "message": "Venue onboarding job created",
#   "poll_url": "/api/v1/webhooks/jobs/uuid"
# }

# Check job status
curl http://localhost:8000/api/v1/webhooks/jobs/{job_id}
```

**Available Webhooks:**

| Endpoint | Description |
|----------|-------------|
| `POST /webhooks/venue/onboard` | Single venue onboarding |
| `POST /webhooks/venue/batch-onboard` | Batch venue onboarding |
| `POST /webhooks/quality/score` | Batch quality scoring |
| `POST /webhooks/venue/discover` | Venue discovery |
| `POST /webhooks/credits/refresh` | Monthly credit refresh |
| `POST /webhooks/bookings/reconcile` | Daily booking reconciliation |
| `GET /webhooks/jobs/{job_id}` | Check job status |

### 4. MCP Server

Use the MCP server for AI tool access.

```python
from app.integrations.mcp import get_mcp_server

# Get the MCP server
server = get_mcp_server()

# List available tools
tools = server.list_tools()
for tool in tools:
    print(f"{tool['name']}: {tool['description']}")

# Execute a tool
result = await server.execute_tool(
    name="search_venues",
    arguments={
        "query": "swimming",
        "city": "Bangalore",
        "min_rating": 4.0
    }
)

if result.success:
    for venue in result.data["venues"]:
        print(f"{venue['name']} - {venue['rating']}")
```

### 5. LangSmith Tracing

All AI operations are automatically traced in LangSmith when enabled.

**Viewing Traces:**
1. Go to [LangSmith Dashboard](https://smith.langchain.com)
2. Select your project (nexus-family-pass)
3. View traces for chains, workflows, and tool calls
4. Analyze latency, token usage, and errors

**Tracing Modes:**
- `full`: Trace all operations (development)
- `errors`: Only trace failures (production)
- `false`: Disable tracing

---

## Data Ingestion Scripts

### Ingest Venues from Google Places

```bash
# Ingest swimming pools in Bangalore
python -m scripts.ingest_venues --city "Bangalore" --category "swimming_pool"

# Ingest all categories
python -m scripts.ingest_venues --city "Bangalore" --all-categories

# Dry run (see what would be done)
python -m scripts.ingest_venues --city "Bangalore" --all-categories --dry-run
```

### Process Reviews with AI

```bash
# Score all venues with reviews
python -m scripts.process_reviews
```

### Generate Mock Pricing

```bash
# Generate pricing for all venues
python -m scripts.generate_mock_pricing
```

### Seed Vendor Accounts

```bash
# Create vendor accounts for each venue
python -m scripts.seed_vendor_accounts
```

---

## API Documentation

### Health Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Basic health check |
| GET | `/api/v1/health/detailed` | Detailed with database check |
| GET | `/api/v1/health/ready` | Kubernetes readiness probe |
| GET | `/api/v1/health/live` | Kubernetes liveness probe |

### Venue Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/venues` | List venues with pagination |
| GET | `/api/v1/venues/{id}` | Get venue details |
| GET | `/api/v1/venues/slug/{slug}` | Get venue by slug |
| GET | `/api/v1/venues/{id}/quality-scores` | Get AI quality scores |
| GET | `/api/v1/venues/{id}/pricing` | Get pricing information |
| GET | `/api/v1/venues/cities` | List available cities |
| GET | `/api/v1/venues/categories` | List categories |

### Activity Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/activities` | List activities |
| GET | `/api/v1/activities/{id}` | Get activity details |
| GET | `/api/v1/activities/{id}/sessions` | Get activity sessions |

### Vendor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/vendors/login` | Vendor authentication |
| GET | `/api/v1/vendors/me` | Current vendor profile |
| GET | `/api/v1/vendors/me/venue` | Vendor's venue |
| PUT | `/api/v1/vendors/me/pricing` | Update pricing |

---

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply all migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View history
alembic history
```

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `GOOGLE_PLACES_API_KEY` | Yes | - | Google Places API key |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `LANGSMITH_API_KEY` | No | - | LangSmith API key |
| `LANGSMITH_PROJECT` | No | nexus-family-pass | LangSmith project name |
| `LANGSMITH_TRACING_ENABLED` | No | errors | Tracing mode |
| `LANGGRAPH_ENABLED` | No | true | Enable LangGraph |
| `MCP_SERVER_ENABLED` | No | true | Enable MCP server |
| `WEBHOOK_SECRET` | No | nexus-webhook-secret | Webhook auth secret |
| `APP_ENV` | No | development | Environment |
| `APP_DEBUG` | No | true | Debug mode |

---

## Free Tier Limits

| Service | Limit | Our Usage |
|---------|-------|-----------|
| Google Places API | $200/month credit | ~$3 for 150 venues |
| Gemini API | 15 RPM | Batched with delays |
| LangSmith | 1,000 traces/month | Conditional tracing |
| Supabase | 500MB, 50K rows | ~50MB for Phase 1 |

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Test connection
python -c "from app.core.database import engine; print(engine.url)"
```

### LangSmith Not Tracing

1. Verify `LANGSMITH_API_KEY` is set
2. Check `LANGSMITH_TRACING_ENABLED` is `full` or `errors`
3. Ensure you're using chains from `app.integrations.ai.langchain`

### Webhook Authentication Errors

1. Set `WEBHOOK_SECRET` in `.env`
2. Include `X-Webhook-Secret` header in requests
3. In development, authentication is relaxed

### Import Errors

```bash
# Ensure you're in the virtual environment
which python  # Should show venv path

# Reinstall dependencies
pip install -r requirements.txt
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run linting: `ruff check app/`
4. Run tests: `pytest`
5. Submit pull request

---

## License

Proprietary - Nexus Family Pass

---

## Support

For issues or questions, contact the development team or create a GitHub issue.

---

## Simplified User Flow - Step by Step Guide

This section explains the complete flow from start to finish in simple terms. Follow these steps in order to get the platform running and understand how everything connects.

---

### Phase 1: Initial Setup (One-Time Only)

#### Step 1: Get Your API Keys
**What you do:** Sign up for free accounts and get API keys.

**Why it matters:** These keys allow the application to talk to external services.

| Service | Where to Get | What It Does |
|---------|-------------|--------------|
| Supabase | supabase.com | Hosts your database in the cloud |
| Google Cloud | console.cloud.google.com | Finds venue information from Google Maps |
| Gemini | aistudio.google.com | Powers all the AI features |
| LangSmith | smith.langchain.com | Shows you what the AI is doing (debugging) |

---

#### Step 2: Setup Your Computer
**What you do:** Install Python, create a virtual environment, and install dependencies.

**Why it matters:** Creates an isolated space for the application to run without conflicts.

**Order of actions:**
1. Install Python 3.11 or higher
2. Navigate to the `nexus-backend` folder
3. Create virtual environment
4. Activate the virtual environment
5. Install all required packages from `requirements.txt`

---

#### Step 3: Configure Environment
**What you do:** Copy `.env.example` to `.env` and fill in your API keys.

**Why it matters:** The application reads these values to connect to all external services. Without them, nothing works.

**Most important variables:**
- `DATABASE_URL` - Where your data is stored
- `GOOGLE_PLACES_API_KEY` - Finds venues on Google Maps
- `GEMINI_API_KEY` - Powers all AI features
- `LANGSMITH_API_KEY` - Enables AI debugging dashboard

---

#### Step 4: Initialize Database
**What you do:** Run database migrations.

**Why it matters:** Creates all the tables needed to store venues, activities, reviews, and scores. The database is empty until you do this.

---

#### Step 5: Start the Server
**What you do:** Run the application.

**Why it matters:** Makes the API available at `http://localhost:8000`. Until you do this, nothing responds.

---

### Phase 2: Populating Data (Venue Onboarding)

#### Step 6: Discover Venues from Google
**What you do:** Run the venue ingestion script OR trigger the discovery webhook.

**Why it matters:** This is how venues get into your system. The script searches Google Places for kids activity venues (swimming pools, dance schools, etc.) in your target city and saves their basic information.

**What happens behind the scenes:**
1. Google Places API is called to search for venues
2. For each venue found, details are fetched (name, address, rating, reviews)
3. Basic venue record is created in your database

---

#### Step 7: AI Analyzes Each Venue (Automatic)
**What you do:** The LangGraph workflow runs automatically for each venue.

**Why it matters:** This is where the AI adds value. Raw Google data becomes enriched, analyzed data.

**The workflow steps (in order):**

| Step | What Happens | Why It Matters |
|------|--------------|----------------|
| 1. Fetch Details | Gets complete venue info from Google | Ensures we have all available data |
| 2. Analyze Suitability | AI checks if this venue is good for kids | Filters out unsuitable venues early |
| 3. Score Quality | AI reads all reviews and scores 8 categories | Parents can see objective quality ratings |
| 4. Infer Activities | AI guesses what activities the venue offers | Creates activity listings without manual entry |
| 5. Generate Embeddings | Converts descriptions to numbers | Enables smart semantic search later |
| 6. Save to Database | Stores everything in PostgreSQL | Data is now available through the API |

---

#### Step 8: Quality Scores Appear
**What you do:** Nothing - this happens automatically.

**Why it matters:** Each venue now has AI-generated quality scores across 8 categories:
- Hygiene, Safety, Teaching Quality, Facilities
- Value for Money, Ambience, Staff Friendliness, Location

Parents can trust these scores because they're derived from real customer reviews.

---

### Phase 3: Using the Platform (Ongoing)

#### Step 9: Vendors Log In
**What you do:** Venue owners access their portal.

**Why it matters:** Vendors can see their listing, update pricing, and manage their profile.

---

#### Step 10: Parents Browse Venues
**What you do:** Parents use the frontend app (or API) to discover venues.

**Why it matters:** This is the core user experience. Parents search, filter, and find activities for their kids.

**Available filters:**
- City
- Activity category
- Age range
- Quality scores
- Price range

---

#### Step 11: View Venue Details
**What you do:** Parents click on a venue to see full details.

**Why it matters:** Shows everything needed to make a decision - quality scores, activities offered, pricing, reviews summary.

---

### Phase 4: Automation (N8N Workflows)

These run on schedules without user intervention.

#### Daily: Booking Reconciliation
**What happens:** System checks yesterday's bookings, marks no-shows, processes refunds.

**Why it matters:** Keeps booking data accurate and handles credits automatically.

---

#### Weekly: Quality Score Refresh
**What happens:** AI re-analyzes venues with new reviews.

**Why it matters:** Quality scores stay current as new reviews come in.

---

#### Monthly: Credit Refresh
**What happens:** All family credit balances reset for the new month.

**Why it matters:** Subscription credits are time-limited to encourage regular use.

---

### How the Technologies Connect

```
USER ACTION                    TECHNOLOGY                 RESULT
─────────────────────────────────────────────────────────────────────────
Admin triggers discovery  →   N8N Webhook           →   Job starts
Job starts                →   LangGraph Workflow    →   Orchestrates steps
Each step runs            →   LangChain Chains      →   AI processes data
AI calls happen           →   LangSmith             →   Everything is logged
Data is saved             →   PostgreSQL            →   Available via API
Parent searches           →   FastAPI + pgvector    →   Smart results returned
AI tool needed            →   MCP Server            →   Standardized access
```

---

### Summary: The Data Journey

**Empty Database → Full Platform**

```
Google Places API
       ↓
   [Raw venue data: name, address, rating, reviews]
       ↓
LangGraph Workflow triggered
       ↓
   Step 1: VenueAnalysisChain runs
       ↓
   [AI determines: "Yes, this is suitable for kids"]
       ↓
   Step 2: QualityScoringChain runs
       ↓
   [AI produces: Safety: 4.5, Hygiene: 4.2, Teaching: 4.8...]
       ↓
   Step 3: ActivityInferenceChain runs
       ↓
   [AI creates: "Swimming Lessons (ages 4-15)", "Advanced Swimming (ages 8-16)"]
       ↓
   Step 4: Embeddings generated
       ↓
   [768 numbers representing the venue for semantic search]
       ↓
   Everything saved to PostgreSQL
       ↓
API now returns enriched data to parents
       ↓
LangSmith dashboard shows what happened at each step
```

---

### Key Takeaways

1. **Setup is one-time** - Get API keys, configure environment, run migrations once
2. **Data flows automatically** - Once triggered, LangGraph handles the entire pipeline
3. **AI adds value at every step** - Analysis, scoring, inference, embeddings
4. **Everything is observable** - LangSmith shows exactly what happened
5. **N8N automates operations** - Scheduled tasks run without intervention
6. **MCP standardizes AI access** - Any AI system can use your tools

---

## Quick Run Guide: Vendor Onboarding Module

This section provides exact commands to run the vendor onboarding module from scratch. Follow these steps in exact order.

---

### Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.11 or higher installed
- [ ] Git installed
- [ ] A Supabase account (free tier works)
- [ ] A Google Cloud account with Places API enabled
- [ ] A Gemini API key from Google AI Studio
- [ ] (Optional) A LangSmith account for AI tracing

---

### Step 1: Open Terminal and Navigate to Project

**Windows (PowerShell):**
```powershell
cd C:\Users\naren\OneDrive\Documents\Softwares\NexusPlay\nexus-family\nexus-backend
```

**macOS/Linux:**
```bash
cd ~/path/to/NexusPlay/nexus-family/venue-onboarding
```

**Verify you're in the right folder:**
```bash
ls
```
You should see: `app/`, `scripts/`, `requirements.txt`, `README.md`, etc.

---

### Step 2: Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
.\venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Verify activation** - your prompt should now show `(venv)` at the beginning.

---

### Step 3: Install All Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Wait for this to complete.** It may take 2-5 minutes depending on your internet speed.

**Verify installation:**
```bash
pip list | grep langchain
```
You should see `langchain`, `langchain-core`, `langchain-google-genai`, `langgraph`, `langsmith`.

---

### Step 4: Create Environment File

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

---

### Step 5: Edit Environment File with Your API Keys

Open `.env` in any text editor and fill in these values:

```bash
# REQUIRED - Get from Supabase dashboard → Settings → Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres

# REQUIRED - Get from Google Cloud Console → APIs & Services → Credentials
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# REQUIRED - Get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# OPTIONAL but recommended - Get from https://smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=nexus-family-pass
LANGSMITH_TRACING_ENABLED=full

# Keep these as-is for development
APP_ENV=development
APP_DEBUG=true
LANGGRAPH_ENABLED=true
MCP_SERVER_ENABLED=true
```

**Save and close the file.**

---

### Step 6: Verify Environment Variables are Loaded

```bash
python -c "from app.config import settings; print('DB:', settings.DATABASE_URL[:50] + '...'); print('Gemini:', 'SET' if settings.GEMINI_API_KEY else 'NOT SET')"
```

You should see your database URL (truncated) and "Gemini: SET".

---

### Step 7: Run Database Migrations

```bash
alembic upgrade head
```

**Expected output:** `INFO  [alembic.runtime.migration] Running upgrade -> 001_initial_schema, Initial schema`

**If you get an error:** Check your `DATABASE_URL` in `.env` is correct.

---

### Step 8: Start the Backend Server

```bash
python run.py
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal running.** Open a NEW terminal for the next steps.

---

### Step 9: Verify Server is Running

Open a new terminal, navigate to the project, and activate venv again:

**Windows:**
```powershell
cd C:\Users\naren\OneDrive\Documents\Softwares\NexusPlay\nexus-family\nexus-backend
.\venv\Scripts\Activate.ps1
```

**Test the health endpoint:**
```bash
curl http://localhost:8000/api/v1/health
```

**Or open in browser:** http://localhost:8000/api/v1/health

**Expected response:** `{"status":"healthy","version":"0.1.0",...}`

---

### Step 10: Run Venue Onboarding (Option A - Using Script)

This ingests venues from Google Places directly:

```bash
python -m scripts.ingest_venues --city "Bangalore" --category "swimming_pool" --max-results 5
```

**What this does:**
1. Searches Google Places for swimming pools in Bangalore
2. Fetches details for each venue
3. Saves basic venue data to database

**Expected output:**
```
INFO: Starting venue ingestion for Bangalore
INFO: Found 5 swimming_pool venues
INFO: Created venue: ABC Swimming Academy
...
INGESTION SUMMARY
Venues found: 5
Venues created: 5
```

---

### Step 11: Run Venue Onboarding (Option B - Using Webhook)

This triggers the full LangGraph workflow with AI processing:

```bash
curl -X POST http://localhost:8000/api/v1/webhooks/venue/discover \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: nexus-webhook-secret" \
  -d '{
    "search_query": "swimming_pool",
    "city": "Bangalore",
    "max_results": 5,
    "auto_onboard": true
  }'
```

**Expected response:**
```json
{
  "job_id": "some-uuid-here",
  "status": "pending",
  "message": "Venue discovery job created for swimming_pool",
  "poll_url": "/api/v1/webhooks/jobs/some-uuid-here"
}
```

---

### Step 12: Check Job Status

Replace `JOB_ID` with the actual job_id from the previous response:

```bash
curl http://localhost:8000/api/v1/webhooks/jobs/JOB_ID
```

**Poll this every 10-30 seconds until status is "completed".**

**Expected final response:**
```json
{
  "job_id": "...",
  "status": "completed",
  "message": "Found 5 suitable venues",
  "result": {
    "suitable_venues": [...],
    "onboarding_results": [...]
  }
}
```

---

### Step 13: Verify Venues Were Created

```bash
curl http://localhost:8000/api/v1/venues
```

**Expected response:** A list of venues with their details, quality scores, and activities.

---

### Step 14: View a Single Venue's Details

Get a venue ID from the previous response, then:

```bash
curl http://localhost:8000/api/v1/venues/VENUE_ID
```

This shows the complete venue including AI-generated quality scores and inferred activities.

---

### Step 15: View Quality Scores

```bash
curl http://localhost:8000/api/v1/venues/VENUE_ID/quality-scores
```

**Expected response:**
```json
{
  "overall_score": 4.2,
  "scores": {
    "hygiene": 4.5,
    "safety": 4.3,
    "teaching": 4.0,
    ...
  },
  "confidence": 0.85,
  "summary": "Parents praise the clean facilities..."
}
```

---

### Step 16: View LangSmith Traces (Optional)

If you configured LangSmith:

1. Go to https://smith.langchain.com
2. Select project "nexus-family-pass"
3. You'll see traces for:
   - `venue_onboarding_workflow`
   - `quality_scoring` chain
   - `activity_inference` chain
   - `venue_analysis` chain

This shows exactly what the AI did at each step.

---

### Step 17: Process Additional Categories

Repeat for other venue types:

```bash
# Dance schools
python -m scripts.ingest_venues --city "Bangalore" --category "dance_school" --max-results 5

# Art studios
python -m scripts.ingest_venues --city "Bangalore" --category "art_school" --max-results 5

# Music schools
python -m scripts.ingest_venues --city "Bangalore" --category "music_school" --max-results 5

# All categories at once
python -m scripts.ingest_venues --city "Bangalore" --all-categories --max-results 3
```

---

### Step 18: Generate Mock Pricing (Optional)

```bash
python -m scripts.generate_mock_pricing
```

This creates pricing data for all venues.

---

### Step 19: Create Vendor Accounts (Optional)

```bash
python -m scripts.seed_vendor_accounts
```

This creates login credentials for each venue owner.

---

### Step 20: Access the API Documentation

Open in browser: http://localhost:8000/docs

This shows all available endpoints with interactive testing capability.

---

### Common Issues and Solutions

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError` | Make sure virtual environment is activated |
| `Connection refused` on curl | Make sure the server is running (Step 8) |
| `401 Unauthorized` on webhooks | Add `-H "X-Webhook-Secret: nexus-webhook-secret"` header |
| `Database connection error` | Check DATABASE_URL in .env |
| `Gemini API error` | Check GEMINI_API_KEY in .env |
| Job stuck in "running" | Check the server terminal for errors |
| `alembic` command not found | Run `pip install alembic` |

---

### Quick Command Reference

| Action | Command |
|--------|---------|
| Start server | `python run.py` |
| Health check | `curl http://localhost:8000/api/v1/health` |
| List venues | `curl http://localhost:8000/api/v1/venues` |
| Ingest venues | `python -m scripts.ingest_venues --city "Bangalore" --all-categories` |
| Trigger discovery | `curl -X POST http://localhost:8000/api/v1/webhooks/venue/discover -H "Content-Type: application/json" -H "X-Webhook-Secret: nexus-webhook-secret" -d '{"search_query":"swimming_pool","city":"Bangalore","auto_onboard":true}'` |
| Check job | `curl http://localhost:8000/api/v1/webhooks/jobs/JOB_ID` |
| API docs | Open http://localhost:8000/docs |

---

### Summary: Minimum Steps to See It Working

1. `cd nexus-backend`
2. `python -m venv venv && .\venv\Scripts\Activate.ps1`
3. `pip install -r requirements.txt`
4. `cp .env.example .env` → Edit with your API keys
5. `alembic upgrade head`
6. `python run.py` (keep running)
7. New terminal: `python -m scripts.ingest_venues --city "Bangalore" --category "swimming_pool" --max-results 3`
8. `curl http://localhost:8000/api/v1/venues`

**Total time:** ~10-15 minutes (mostly waiting for package installation)

---

## Agentic Code Flow: How LangChain, LangGraph, LangSmith, N8N, and MCP Work Together

This section explains how each AI technology interacts with the others in the codebase. Understanding this flow helps you see why each piece exists and how they connect.

---

### The Five Technologies at a Glance

| Technology | Role | Simple Explanation |
|------------|------|-------------------|
| **LangChain** | AI Building Blocks | Provides the pieces (prompts, chains, tools) to talk to AI |
| **LangGraph** | Workflow Orchestrator | Connects multiple AI steps into a complete pipeline |
| **LangSmith** | Observer & Debugger | Watches everything and shows you what happened |
| **N8N** | External Trigger | Lets outside systems (or schedules) start workflows |
| **MCP** | Tool Standardizer | Makes AI tools available in a standard format |

---

### How They Relate to Each Other

```
                                    ┌─────────────────┐
                                    │    LangSmith    │
                                    │   (Observes     │
                                    │   Everything)   │
                                    └────────┬────────┘
                                             │ watches
                                             ▼
┌─────────────┐    triggers    ┌─────────────────────────┐    uses    ┌─────────────┐
│    N8N      │ ─────────────► │      LangGraph          │ ─────────► │  LangChain  │
│  (External  │                │   (Orchestrates         │            │  (AI Calls) │
│   Trigger)  │                │    the Workflow)        │            │             │
└─────────────┘                └─────────────────────────┘            └─────────────┘
                                             │
                                             │ can use
                                             ▼
                               ┌─────────────────────────┐
                               │         MCP             │
                               │  (Standardized Tools)   │
                               └─────────────────────────┘
```

---

### Detailed Flow: What Happens When You Trigger Venue Onboarding

Here's the complete journey of a request through all five technologies:

---

#### Stage 1: The Trigger (N8N Layer)

**What happens:**
1. An external system (N8N, cron job, or manual curl) sends an HTTP POST request to the webhook endpoint
2. The webhook endpoint at `/api/v1/webhooks/venue/onboard` receives the request
3. The endpoint validates the webhook secret for security
4. A background job is created with a unique job ID
5. The job ID is returned immediately to the caller (so they don't have to wait)
6. The actual work begins in the background

**Why N8N exists here:**
- Allows scheduled automation (e.g., "run every Monday at 9 AM")
- Enables external systems to trigger workflows
- Provides job tracking so callers can check progress later
- Decouples the trigger from the execution

**File involved:** `app/api/v1/endpoints/webhooks.py`

---

#### Stage 2: The Orchestration (LangGraph Layer)

**What happens:**
1. The background job creates a `VenueOnboardingWorkflow` instance
2. LangGraph builds a state graph with defined nodes and edges
3. An initial state is created with the input parameters (Google Place ID, city)
4. LangGraph starts executing the graph from the entry point

**The graph structure:**
```
Entry Point
     │
     ▼
┌─────────────────┐
│  fetch_details  │  ← Node 1: Gets venue data from Google
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ analyze_venue   │  ← Node 2: AI checks if suitable for kids
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ score_quality   │  ← Node 3: AI scores based on reviews
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│infer_activities │  ← Node 4: AI guesses what activities exist
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│gen_embeddings   │  ← Node 5: Convert text to vectors
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│save_to_database │  ← Node 6: Store everything
└────────┬────────┘
         │
         ▼
       END
```

**How state flows:**
1. Each node receives the current state (a dictionary)
2. Each node does its work and returns updates to the state
3. LangGraph merges the updates into the state
4. The updated state passes to the next node
5. This continues until reaching END

**Why LangGraph exists here:**
- Manages complex multi-step workflows
- Handles state passing between steps automatically
- Can retry failed steps without restarting everything
- Enables parallel execution for independent steps
- Provides a clear visual model of the workflow

**Files involved:**
- `app/integrations/ai/langgraph/workflows.py` - Defines the graph
- `app/integrations/ai/langgraph/nodes.py` - Implements each node
- `app/integrations/ai/langgraph/state.py` - Defines state structure

---

#### Stage 3: The AI Calls (LangChain Layer)

**What happens inside each LangGraph node:**

**Node: analyze_venue**
1. Node creates a `VenueAnalysisChain` instance
2. The chain loads its prompt template
3. The chain formats the prompt with venue data
4. The chain calls the LLM (Gemini) via LangChain
5. The chain parses the response into structured output
6. The node returns the analysis to the state

**Node: score_quality**
1. Node creates a `QualityScoringChain` instance
2. The chain formats reviews into the prompt
3. The chain calls Gemini to analyze reviews
4. The chain parses scores (1-5) for each category
5. The node returns quality scores to the state

**Node: infer_activities**
1. Node creates an `ActivityInferenceChain` instance
2. The chain uses venue type and reviews in the prompt
3. The chain calls Gemini to infer activities
4. The chain parses the list of activities
5. The node returns activities to the state

**Inside each chain:**
```
Prompt Template
      │
      │ formatted with data
      ▼
┌─────────────────┐
│   LLM Client    │ ──► Gemini API
│   (LangChain)   │ ◄── Response
└────────┬────────┘
         │
         ▼
   Output Parser
         │
         │ structured data
         ▼
   Return to Node
```

**Why LangChain exists here:**
- Provides standardized way to interact with LLMs
- Manages prompt templates separately from code
- Handles output parsing (JSON extraction, validation)
- Supports callbacks for monitoring
- Makes switching LLM providers easy

**Files involved:**
- `app/integrations/ai/langchain/chains.py` - Chain implementations
- `app/integrations/ai/langchain/prompts.py` - Prompt templates
- `app/integrations/ai/langchain/llm.py` - LLM client setup

---

#### Stage 4: The Observation (LangSmith Layer)

**What happens throughout the entire process:**

1. **At startup:**
   - Environment variables are set for LangSmith
   - `LANGCHAIN_TRACING_V2=true` enables tracing
   - All LangChain components now report to LangSmith

2. **When a chain runs:**
   - LangSmith records the chain name and start time
   - LangSmith captures the input data
   - LangSmith records the prompt sent to the LLM
   - LangSmith records the raw LLM response
   - LangSmith records the parsed output
   - LangSmith calculates duration and token usage

3. **When a workflow runs:**
   - LangSmith creates a parent trace for the workflow
   - Each node becomes a child trace
   - Each chain within a node becomes a grandchild trace
   - The entire hierarchy is visible in the dashboard

**What you see in LangSmith dashboard:**
```
venue_onboarding_workflow (parent)
├── fetch_venue_details (child)
│   └── Google Places API call
├── analyze_venue_suitability (child)
│   └── VenueAnalysisChain
│       ├── Prompt formatting
│       ├── LLM call to Gemini
│       └── Output parsing
├── score_venue_quality (child)
│   └── QualityScoringChain
│       ├── Prompt formatting
│       ├── LLM call to Gemini
│       └── Output parsing
├── infer_activities (child)
│   └── ActivityInferenceChain
│       └── ...
├── generate_embeddings (child)
│   └── Embedding API calls
└── save_to_database (child)
    └── Database operations
```

**Why LangSmith exists here:**
- Shows exactly what the AI received and returned
- Helps debug when AI produces unexpected results
- Tracks costs (token usage) over time
- Identifies slow steps for optimization
- Enables comparing different prompt versions

**Files involved:**
- `app/integrations/ai/langchain/llm.py` - Sets up tracing
- `app/config.py` - LangSmith configuration
- Every file with `@traceable` decorator

---

#### Stage 5: The Tool Interface (MCP Layer)

**What MCP provides:**

MCP (Model Context Protocol) is an additional layer that makes the same capabilities available as standardized tools. It's used when:
- An external AI agent needs to call your functions
- You want a standardized interface for all operations
- You're building a conversational agent that needs tools

**How MCP relates to the other components:**

```
External AI Agent (e.g., Claude)
         │
         │ "search for swimming venues"
         ▼
┌─────────────────┐
│   MCP Server    │
│                 │
│ Available tools:│
│ - search_venues │
│ - get_details   │
│ - get_activities│
└────────┬────────┘
         │
         │ calls
         ▼
┌─────────────────┐
│  Tool Handler   │ ──► Database queries
│                 │ ──► LangChain chains (if needed)
└─────────────────┘
```

**MCP tool execution flow:**
1. MCP server receives a tool call request
2. Server looks up the tool by name
3. Server validates the input against the tool's schema
4. Server calls the tool's handler function
5. Handler executes the operation (database query, API call, etc.)
6. Handler returns structured result
7. Server formats the result and returns it

**Why MCP exists here:**
- Provides a standard interface for AI agents
- Makes tools discoverable (agents can list available tools)
- Enforces input validation via JSON schemas
- Separates tool definition from implementation
- Enables any AI system to use your capabilities

**Files involved:**
- `app/integrations/mcp/server.py` - MCP server implementation
- `app/integrations/mcp/tools.py` - Tool definitions and handlers

---

### Complete Request Flow: End-to-End Example

Let's trace a single request through all layers:

**Scenario:** N8N triggers venue onboarding for a swimming pool

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: N8N sends HTTP POST to /api/v1/webhooks/venue/onboard               │
│         with body: { "google_place_id": "ChIJ...", "city": "Bangalore" }    │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Webhook endpoint validates secret, creates job, returns job_id      │
│         Background task starts executing                                      │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: VenueOnboardingWorkflow is instantiated                              │
│         LangGraph compiles the state graph                                   │
│         Initial state is created with google_place_id and city              │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: LangGraph executes Node 1 (fetch_details)                           │
│         → Calls Google Places API                                            │
│         → Returns venue_data and reviews to state                           │
│         → LangSmith records this step                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: LangGraph executes Node 2 (analyze_venue)                           │
│         → Creates VenueAnalysisChain                                         │
│         → Chain formats prompt with venue data                               │
│         → Chain calls Gemini via LangChain                                   │
│         → LangSmith records prompt, response, latency                        │
│         → Chain parses response into structured analysis                     │
│         → Returns venue_analysis to state                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: LangGraph executes Node 3 (score_quality)                           │
│         → Creates QualityScoringChain                                        │
│         → Chain formats prompt with reviews                                  │
│         → Chain calls Gemini via LangChain                                   │
│         → LangSmith records everything                                       │
│         → Chain parses scores for 8 categories                               │
│         → Returns quality_scores to state                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: LangGraph executes Node 4 (infer_activities)                        │
│         → Creates ActivityInferenceChain                                     │
│         → Chain formats prompt with venue type and reviews                   │
│         → Chain calls Gemini via LangChain                                   │
│         → LangSmith records everything                                       │
│         → Chain parses list of inferred activities                           │
│         → Returns activities to state                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 8: LangGraph executes Node 5 (generate_embeddings)                     │
│         → Calls Gemini embedding API for venue description                   │
│         → Calls Gemini embedding API for each activity                       │
│         → Returns venue_embedding and activity_embeddings to state          │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 9: LangGraph executes Node 6 (save_to_database)                        │
│         → Creates or updates Venue record                                    │
│         → Creates Activity records                                           │
│         → Creates VenueQualityScore record                                   │
│         → Returns venue_id and activity_ids to state                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 10: LangGraph reaches END                                               │
│          Final state contains all results                                    │
│          Workflow returns completed status                                   │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 11: Background job updates job status to "completed"                   │
│          N8N can poll /webhooks/jobs/{job_id} to see result                 │
│          If callback_url was provided, sends notification                   │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 12: LangSmith dashboard now shows complete trace                       │
│          All prompts, responses, timings visible                            │
│          Can debug any issues by viewing exact AI inputs/outputs            │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### File-by-File Flow Reference

Here's which files are involved at each stage:

| Stage | What Happens | Files Involved |
|-------|--------------|----------------|
| HTTP Request arrives | FastAPI routes request | `app/api/v1/endpoints/webhooks.py` |
| Job is created | Background task queued | `app/api/v1/endpoints/webhooks.py` |
| Workflow starts | LangGraph initializes | `app/integrations/ai/langgraph/workflows.py` |
| State is created | TypedDict initialized | `app/integrations/ai/langgraph/state.py` |
| Node executes | Node function called | `app/integrations/ai/langgraph/nodes.py` |
| Chain is created | LangChain chain init | `app/integrations/ai/langchain/chains.py` |
| Prompt is formatted | Template + data | `app/integrations/ai/langchain/prompts.py` |
| LLM is called | Gemini API via LangChain | `app/integrations/ai/langchain/llm.py` |
| Response is parsed | Output parser | `app/integrations/ai/langchain/prompts.py` |
| Trace is recorded | LangSmith captures | Automatic via `@traceable` decorator |
| Data is saved | SQLAlchemy ORM | `app/models/*.py` |
| MCP tool called | (If using MCP) | `app/integrations/mcp/server.py`, `tools.py` |

---

### Summary: The Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL LAYER                                  │
│                                                                              │
│   N8N / Cron / Manual HTTP Request                                          │
│   └── Triggers workflows via webhooks                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            ORCHESTRATION LAYER                               │
│                                                                              │
│   LangGraph Workflows                                                        │
│   └── Manages state and execution flow                                       │
│   └── Connects nodes in defined order                                        │
│   └── Handles retries and error states                                       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              AI EXECUTION LAYER                              │
│                                                                              │
│   LangChain Chains                                                           │
│   └── Prompt templates with variables                                        │
│   └── LLM calls with callbacks                                               │
│   └── Output parsing and validation                                          │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            OBSERVATION LAYER                                 │
│                                                                              │
│   LangSmith Tracing                                                          │
│   └── Captures all inputs and outputs                                        │
│   └── Records timing and token usage                                         │
│   └── Provides debugging dashboard                                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                              INTERFACE LAYER                                 │
│                                                                              │
│   MCP Server                                                                 │
│   └── Exposes capabilities as standardized tools                             │
│   └── Enables external AI agents to use the system                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Key Takeaways

1. **N8N is the entry point** - It triggers workflows but doesn't do AI work itself

2. **LangGraph is the coordinator** - It decides what runs when and passes data between steps

3. **LangChain does the AI work** - It formats prompts, calls LLMs, and parses responses

4. **LangSmith watches everything** - It's passive but essential for debugging and monitoring

5. **MCP is optional but powerful** - It lets external AI systems use your capabilities

6. **Each layer has a single responsibility** - This makes the system maintainable and testable

7. **Data flows through state** - LangGraph state is the "baton" passed between runners

8. **Everything is async** - Allows handling multiple requests without blocking
