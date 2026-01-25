# =============================================================================
# NEXUS FAMILY PASS - FASTAPI APPLICATION FACTORY
# =============================================================================
"""
FastAPI Application Factory Module.

This module creates and configures the FastAPI application instance.
It sets up:
    - CORS middleware for frontend integration
    - API routers and versioning
    - Exception handlers
    - Startup/shutdown lifecycle events
    - OpenAPI documentation configuration

The application follows the factory pattern for better testability
and configuration flexibility.
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from contextlib import asynccontextmanager  # For lifespan management
from typing import AsyncGenerator  # Type hint for async generators

# Third-party imports
from fastapi import FastAPI  # The main web framework
from fastapi.middleware.cors import CORSMiddleware  # Cross-Origin Resource Sharing
from fastapi.responses import ORJSONResponse  # Fast JSON serialization

# Local application imports
from app import __version__, __app_name__  # Application metadata
from app.config import settings  # Application configuration
from app.core.database import init_db, close_db  # Database lifecycle
from app.core.logging_config import setup_logging, get_logger  # Logging
from app.core.exceptions import setup_exception_handlers  # Error handling
from app.api.v1.router import api_router  # API routes


# =============================================================================
# LOGGING SETUP
# =============================================================================
# Initialize logging before anything else
# This ensures all subsequent operations are properly logged
setup_logging()

# Get a logger instance for this module
logger = get_logger(__name__)


# =============================================================================
# LIFESPAN MANAGEMENT
# =============================================================================
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.
    
    This async context manager handles application startup and shutdown events.
    It's the recommended way in FastAPI 0.109+ to manage resources that need
    to be initialized at startup and cleaned up at shutdown.
    
    Startup operations:
        - Initialize database connection pool
        - Setup LangChain/AI clients
        - Warm up caches if needed
    
    Shutdown operations:
        - Close database connections
        - Cleanup AI client resources
        - Flush any pending logs
    
    Args:
        app: The FastAPI application instance
        
    Yields:
        None - Control returns to FastAPI for request handling
        
    Example:
        The lifespan is passed to FastAPI during app creation:
        ```python
        app = FastAPI(lifespan=lifespan)
        ```
    """
    # =========================================================================
    # STARTUP PHASE
    # =========================================================================
    # This code runs before the application starts accepting requests
    
    logger.info(
        "Starting Nexus Family Pass API",
        extra={
            "version": __version__,
            "environment": settings.APP_ENV,
        }
    )
    
    # Initialize database connection pool
    # This creates the async engine and session factory
    try:
        await init_db()
        logger.info("Database connection pool initialized")
    except Exception as e:
        # Log the error but don't crash - let the app start
        # Requests will fail gracefully if DB is unavailable
        logger.error(f"Failed to initialize database: {e}")

    # Initialize LangSmith tracing
    try:
        from app.integrations.ai.langchain.llm import setup_langsmith_tracing
        setup_langsmith_tracing()
        logger.info("LangSmith tracing configured")
    except Exception as e:
        logger.warning(f"Failed to setup LangSmith tracing: {e}")

    # Initialize MCP server
    try:
        if settings.MCP_SERVER_ENABLED:
            from app.integrations.mcp import get_mcp_server
            mcp_server = get_mcp_server()
            logger.info(
                f"MCP Server initialized with {len(mcp_server.list_tools())} tools"
            )
    except Exception as e:
        logger.warning(f"Failed to initialize MCP server: {e}")
    
    # Log successful startup
    logger.info(
        "Application startup complete",
        extra={
            "host": settings.HOST,
            "port": settings.PORT,
            "docs_url": f"http://{settings.HOST}:{settings.PORT}/docs",
        }
    )
    
    # =========================================================================
    # YIELD CONTROL TO FASTAPI
    # =========================================================================
    # The application is now running and handling requests
    yield
    
    # =========================================================================
    # SHUTDOWN PHASE
    # =========================================================================
    # This code runs when the application is shutting down
    
    logger.info("Initiating graceful shutdown...")
    
    # Close database connections
    try:
        await close_db()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database connections: {e}")
    
    logger.info("Application shutdown complete")


# =============================================================================
# APPLICATION FACTORY
# =============================================================================
def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    This factory function creates a new FastAPI instance with all middleware,
    routers, and exception handlers configured. Using a factory function
    allows for easier testing and configuration customization.
    
    Returns:
        FastAPI: A fully configured FastAPI application instance
        
    Configuration includes:
        - Application metadata (title, version, description)
        - OpenAPI documentation settings
        - CORS middleware for frontend integration
        - API routers with versioning
        - Custom exception handlers
        
    Example:
        ```python
        app = create_application()
        # app is now ready to be served by uvicorn
        ```
    """
    
    # =========================================================================
    # CREATE FASTAPI INSTANCE
    # =========================================================================
    # Initialize FastAPI with metadata for OpenAPI documentation
    application = FastAPI(
        # Application metadata (shown in OpenAPI docs)
        title="Nexus Family Pass API",
        description="""
## Nexus Family Pass Backend API

A B2B2C platform where companies provide activity subscriptions for employees' children.

### Features

* **Venue Discovery**: Discover and browse child activity venues
* **AI Quality Scoring**: AI-powered venue quality analysis from reviews
* **Activity Management**: Browse and search activities
* **Vendor Portal**: Venue owners can manage their listings

### API Versioning

All endpoints are versioned under `/api/v1/`. Future versions will be added
as `/api/v2/`, etc., ensuring backward compatibility.

### Authentication (Phase 1)

Phase 1 uses simplified authentication for demo purposes:
- Vendor login with email/password
- Session-based authentication

Phase 2 will add JWT tokens and OAuth2/SSO support.
        """,
        version=__version__,
        
        # OpenAPI documentation URLs
        # Set to None to disable in production if needed
        docs_url="/docs" if settings.APP_DEBUG else None,
        redoc_url="/redoc" if settings.APP_DEBUG else None,
        openapi_url="/openapi.json" if settings.APP_DEBUG else None,
        
        # Use faster JSON serialization
        default_response_class=ORJSONResponse,
        
        # Lifespan context manager for startup/shutdown
        lifespan=lifespan,
        
        # OpenAPI tags for organizing endpoints in docs
        openapi_tags=[
            {
                "name": "health",
                "description": "Health check and system status endpoints",
            },
            {
                "name": "venues",
                "description": "Venue discovery, search, and details",
            },
            {
                "name": "activities",
                "description": "Activity listings and search",
            },
            {
                "name": "vendors",
                "description": "Vendor portal authentication and management",
            },
            {
                "name": "webhooks",
                "description": "N8N workflow automation webhooks for async processing",
            },
        ],
        
        # Additional OpenAPI metadata
        contact={
            "name": "Nexus Support",
            "email": "support@nexusfamilypass.com",
        },
        license_info={
            "name": "Proprietary",
        },
    )
    
    # =========================================================================
    # CONFIGURE CORS MIDDLEWARE
    # =========================================================================
    # CORS (Cross-Origin Resource Sharing) allows the frontend to make
    # requests to this API from a different origin (domain/port)
    
    # Parse allowed origins from configuration
    # Format: comma-separated list of URLs
    allowed_origins = [
        origin.strip() 
        for origin in settings.CORS_ORIGINS.split(",")
        if origin.strip()
    ]
    
    # Add CORS middleware to the application
    application.add_middleware(
        CORSMiddleware,
        # Origins that are allowed to make requests
        # In development, this includes localhost:4200 (Angular)
        allow_origins=allowed_origins,
        
        # Allow cookies and authentication headers
        allow_credentials=True,
        
        # HTTP methods allowed for cross-origin requests
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        
        # Headers that can be included in requests
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
        ],
        
        # Headers exposed to the browser
        expose_headers=[
            "X-Total-Count",      # For pagination
            "X-Page-Count",       # For pagination
            "X-Request-ID",       # For request tracing
        ],
        
        # Cache preflight requests for 10 minutes
        max_age=600,
    )
    
    # =========================================================================
    # REGISTER API ROUTERS
    # =========================================================================
    # Include the main API router with version prefix
    # All v1 endpoints will be under /api/v1/
    application.include_router(
        api_router,
        prefix=settings.API_V1_PREFIX,
    )
    
    # =========================================================================
    # SETUP EXCEPTION HANDLERS
    # =========================================================================
    # Register custom exception handlers for consistent error responses
    setup_exception_handlers(application)
    
    # =========================================================================
    # ROOT ENDPOINT
    # =========================================================================
    # Simple endpoint at the root URL for basic connectivity testing
    @application.get(
        "/",
        include_in_schema=False,  # Don't show in OpenAPI docs
    )
    async def root() -> dict:
        """
        Root endpoint returning basic API information.
        
        This is useful for:
        - Quick connectivity testing
        - Load balancer health checks
        - Service discovery
        """
        return {
            "name": __app_name__,
            "version": __version__,
            "status": "running",
            "docs": f"{settings.API_V1_PREFIX}/docs" if settings.APP_DEBUG else "disabled",
        }
    
    # Log application creation
    logger.debug(
        "FastAPI application created",
        extra={
            "cors_origins": allowed_origins,
            "api_prefix": settings.API_V1_PREFIX,
        }
    )
    
    return application


# =============================================================================
# APPLICATION INSTANCE
# =============================================================================
# Create the application instance that uvicorn will serve
# This is imported by uvicorn: uvicorn app.main:app
app = create_application()
