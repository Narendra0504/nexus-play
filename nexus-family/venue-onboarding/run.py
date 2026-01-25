#!/usr/bin/env python3
# =============================================================================
# NEXUS FAMILY PASS - APPLICATION ENTRY POINT
# =============================================================================
# This is the main entry point for running the FastAPI application.
# It handles environment loading, logging setup, and server startup.
#
# Usage:
#   Development: python run.py
#   Production:  uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
# =============================================================================

# Standard library imports
import os  # For environment variable access
import sys  # For system-level operations like exit codes

# Third-party imports
import uvicorn  # ASGI server for running FastAPI
from dotenv import load_dotenv  # Load environment variables from .env file


def main() -> None:
    """
    Main entry point for the application.
    
    This function:
    1. Loads environment variables from .env file
    2. Validates required configuration
    3. Starts the uvicorn server with appropriate settings
    
    The function reads configuration from environment variables and starts
    the server in either development mode (with auto-reload) or production
    mode (with multiple workers).
    
    Returns:
        None
        
    Raises:
        SystemExit: If required environment variables are missing
    """
    
    # =========================================================================
    # STEP 1: LOAD ENVIRONMENT VARIABLES
    # =========================================================================
    # Load variables from .env file into the environment
    # override=False means existing env vars won't be replaced
    # This allows deployment platforms to set vars without .env file
    load_dotenv(override=False)
    
    # =========================================================================
    # STEP 2: VALIDATE CRITICAL ENVIRONMENT VARIABLES
    # =========================================================================
    # List of required environment variables for the application to run
    required_env_vars = [
        "DATABASE_URL",       # PostgreSQL connection string (Supabase)
    ]
    
    # Track which variables are missing
    missing_vars = []
    
    # Check each required variable
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    # If any required variables are missing, print error and exit
    if missing_vars:
        # Print error message to stderr
        print(
            f"ERROR: Missing required environment variables: {', '.join(missing_vars)}",
            file=sys.stderr
        )
        print(
            "Please copy .env.example to .env and fill in the required values.",
            file=sys.stderr
        )
        # Exit with error code 1
        sys.exit(1)
    
    # =========================================================================
    # STEP 3: READ SERVER CONFIGURATION FROM ENVIRONMENT
    # =========================================================================
    # Host address to bind the server to
    # 0.0.0.0 allows connections from any IP (required for containers/deployment)
    # 127.0.0.1 would only allow local connections
    host = os.getenv("HOST", "0.0.0.0")
    
    # Port number for the server
    # 8000 is the conventional port for Python web applications
    port = int(os.getenv("PORT", "8000"))
    
    # Application environment determines server behavior
    # development: auto-reload, debug mode
    # production: multiple workers, no reload
    app_env = os.getenv("APP_ENV", "development")
    
    # Debug mode enables detailed error messages
    # WARNING: Always disable in production for security
    debug = os.getenv("APP_DEBUG", "true").lower() == "true"
    
    # Number of worker processes
    # In development, use 1 for simplicity
    # In production, use CPU count or higher for concurrency
    workers = int(os.getenv("WORKERS", "1"))
    
    # Log level for the server
    # Options: debug, info, warning, error, critical
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    # =========================================================================
    # STEP 4: PRINT STARTUP INFORMATION
    # =========================================================================
    # Print a banner showing server configuration
    # This helps with debugging deployment issues
    print("\n" + "=" * 60)
    print("NEXUS FAMILY PASS - API SERVER")
    print("=" * 60)
    print(f"Environment: {app_env}")
    print(f"Debug Mode:  {debug}")
    print(f"Host:        {host}")
    print(f"Port:        {port}")
    print(f"Workers:     {workers}")
    print(f"Log Level:   {log_level}")
    print("=" * 60)
    print(f"API Docs:    http://{host}:{port}/docs")
    print(f"Health:      http://{host}:{port}/api/v1/health")
    print("=" * 60 + "\n")
    
    # =========================================================================
    # STEP 5: CONFIGURE AND START UVICORN SERVER
    # =========================================================================
    # Build uvicorn configuration based on environment
    
    if app_env == "development":
        # ---------------------------------------------------------------------
        # DEVELOPMENT MODE
        # ---------------------------------------------------------------------
        # Features enabled:
        # - Auto-reload: Server restarts when code changes
        # - Single worker: Simpler debugging
        # - Detailed logging: Easier to trace issues
        
        uvicorn.run(
            # Application path in format "module:app"
            # app.main is the module, app is the FastAPI instance
            "app.main:app",
            
            # Server binding configuration
            host=host,
            port=port,
            
            # Development-specific settings
            reload=True,            # Auto-reload on code changes
            reload_dirs=["app"],    # Directories to watch for changes
            
            # Logging configuration
            log_level=log_level,
            
            # Access log shows every HTTP request
            access_log=True,
            
            # Use lifespan events (startup/shutdown hooks)
            lifespan="on",
        )
    else:
        # ---------------------------------------------------------------------
        # PRODUCTION MODE
        # ---------------------------------------------------------------------
        # Features enabled:
        # - Multiple workers: Handle concurrent requests
        # - No reload: Stable for production
        # - Reduced logging: Only important events
        
        uvicorn.run(
            # Application path
            "app.main:app",
            
            # Server binding
            host=host,
            port=port,
            
            # Production settings
            reload=False,           # No auto-reload in production
            workers=workers,        # Multiple workers for concurrency
            
            # Logging - less verbose in production
            log_level=log_level,
            access_log=False,       # Disable access log (use reverse proxy logs)
            
            # Lifespan events
            lifespan="on",
            
            # Production performance settings
            # limit_concurrency: Max concurrent connections per worker
            # timeout_keep_alive: Seconds to keep idle connections open
            limit_concurrency=100,
            timeout_keep_alive=30,
        )


# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
# This block runs only when the script is executed directly,
# not when imported as a module.
if __name__ == "__main__":
    # Call the main function to start the server
    main()
