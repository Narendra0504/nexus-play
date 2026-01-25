# =============================================================================
# NEXUS FAMILY PASS - CUSTOM EXCEPTIONS
# =============================================================================
"""
Custom Exception Classes and Handlers Module.

This module defines custom exception classes for the application and
sets up exception handlers for FastAPI. Using custom exceptions allows
for consistent error responses across the API.

Exception Hierarchy:
    NexusException (base)
    ├── NotFoundError (404)
    ├── ValidationError (422)
    ├── AuthenticationError (401)
    ├── AuthorizationError (403)
    ├── ConflictError (409)
    ├── RateLimitError (429)
    └── ExternalServiceError (502)

Usage:
    ```python
    from app.core.exceptions import NotFoundError
    
    async def get_venue(venue_id: str):
        venue = await db.get(Venue, venue_id)
        if not venue:
            raise NotFoundError(f"Venue {venue_id} not found")
        return venue
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
from typing import Any, Dict, Optional  # Type hints

# Third-party imports
from fastapi import FastAPI, Request, status  # FastAPI components
from fastapi.responses import JSONResponse  # JSON response class
from fastapi.exceptions import RequestValidationError  # Pydantic validation errors
from pydantic import BaseModel  # For response schema

# Local imports
from app.core.logging_config import get_logger  # Logging

# =============================================================================
# LOGGING
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# ERROR RESPONSE SCHEMA
# =============================================================================
class ErrorResponse(BaseModel):
    """
    Standard error response schema.
    
    All API errors return this consistent format, making it easy
    for clients to handle errors uniformly.
    
    Attributes:
        error: Error type/code (e.g., "not_found", "validation_error")
        message: Human-readable error message
        details: Optional additional error details
        request_id: Optional request ID for tracing
    """
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    request_id: Optional[str] = None


# =============================================================================
# BASE EXCEPTION CLASS
# =============================================================================
class NexusException(Exception):
    """
    Base exception class for all Nexus application errors.
    
    All custom exceptions should inherit from this class to ensure
    consistent error handling and response formatting.
    
    Attributes:
        message: Human-readable error message
        error_code: Machine-readable error code
        status_code: HTTP status code for the response
        details: Optional dictionary with additional error information
    
    Example:
        ```python
        raise NexusException(
            message="Something went wrong",
            error_code="internal_error",
            status_code=500,
            details={"trace_id": "abc123"}
        )
        ```
    """
    
    def __init__(
        self,
        message: str,
        error_code: str = "error",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Initialize the exception.
        
        Args:
            message: Human-readable error message
            error_code: Machine-readable error code (default: "error")
            status_code: HTTP status code (default: 500)
            details: Optional additional error details
        """
        # Call parent constructor with the message
        super().__init__(message)
        
        # Store exception attributes
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
    
    def to_response(self, request_id: Optional[str] = None) -> ErrorResponse:
        """
        Convert the exception to an ErrorResponse.
        
        Args:
            request_id: Optional request ID for tracing
            
        Returns:
            ErrorResponse: Formatted error response
        """
        return ErrorResponse(
            error=self.error_code,
            message=self.message,
            details=self.details if self.details else None,
            request_id=request_id,
        )


# =============================================================================
# SPECIFIC EXCEPTION CLASSES
# =============================================================================
class NotFoundError(NexusException):
    """
    Exception for resource not found errors (HTTP 404).
    
    Use this when a requested resource doesn't exist.
    
    Example:
        ```python
        venue = await db.get(Venue, venue_id)
        if not venue:
            raise NotFoundError(f"Venue with ID {venue_id} not found")
        ```
    """
    
    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="not_found",
            status_code=status.HTTP_404_NOT_FOUND,
            details=details,
        )


class ValidationError(NexusException):
    """
    Exception for validation errors (HTTP 422).
    
    Use this for business logic validation failures
    (not Pydantic schema validation, which is handled separately).
    
    Example:
        ```python
        if price < 0:
            raise ValidationError(
                "Price must be positive",
                details={"field": "price", "value": price}
            )
        ```
    """
    
    def __init__(
        self,
        message: str = "Validation error",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="validation_error",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class AuthenticationError(NexusException):
    """
    Exception for authentication failures (HTTP 401).
    
    Use this when authentication is required but not provided
    or when credentials are invalid.
    
    Example:
        ```python
        if not verify_password(password, hashed):
            raise AuthenticationError("Invalid email or password")
        ```
    """
    
    def __init__(
        self,
        message: str = "Authentication required",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="authentication_error",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details=details,
        )


class AuthorizationError(NexusException):
    """
    Exception for authorization failures (HTTP 403).
    
    Use this when the user is authenticated but lacks permission
    to perform the requested action.
    
    Example:
        ```python
        if venue.owner_id != current_user.id:
            raise AuthorizationError("You don't have permission to edit this venue")
        ```
    """
    
    def __init__(
        self,
        message: str = "Permission denied",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="authorization_error",
            status_code=status.HTTP_403_FORBIDDEN,
            details=details,
        )


class ConflictError(NexusException):
    """
    Exception for resource conflicts (HTTP 409).
    
    Use this when an operation conflicts with the current state,
    such as duplicate entries or concurrent modifications.
    
    Example:
        ```python
        existing = await db.get_by_email(email)
        if existing:
            raise ConflictError(f"User with email {email} already exists")
        ```
    """
    
    def __init__(
        self,
        message: str = "Resource conflict",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="conflict",
            status_code=status.HTTP_409_CONFLICT,
            details=details,
        )


class RateLimitError(NexusException):
    """
    Exception for rate limit exceeded (HTTP 429).
    
    Use this when a client has exceeded their rate limit.
    
    Example:
        ```python
        if request_count > MAX_REQUESTS:
            raise RateLimitError(
                "Too many requests",
                details={"retry_after": 60}
            )
        ```
    """
    
    def __init__(
        self,
        message: str = "Rate limit exceeded",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="rate_limit_exceeded",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details=details,
        )


class ExternalServiceError(NexusException):
    """
    Exception for external service failures (HTTP 502).
    
    Use this when an external API (Google Places, Gemini, etc.)
    fails or returns an unexpected response.
    
    Example:
        ```python
        try:
            response = await google_places_client.search(query)
        except Exception as e:
            raise ExternalServiceError(
                "Google Places API unavailable",
                details={"service": "google_places", "error": str(e)}
            )
        ```
    """
    
    def __init__(
        self,
        message: str = "External service error",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="external_service_error",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details,
        )


class DatabaseError(NexusException):
    """
    Exception for database operation failures (HTTP 500).
    
    Use this when a database operation fails unexpectedly.
    
    Example:
        ```python
        try:
            await db.commit()
        except SQLAlchemyError as e:
            raise DatabaseError(
                "Failed to save data",
                details={"operation": "commit"}
            )
        ```
    """
    
    def __init__(
        self,
        message: str = "Database operation failed",
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(
            message=message,
            error_code="database_error",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details,
        )


# =============================================================================
# EXCEPTION HANDLERS
# =============================================================================
async def nexus_exception_handler(
    request: Request,
    exc: NexusException,
) -> JSONResponse:
    """
    Handle NexusException and subclasses.
    
    This handler catches all custom exceptions and returns
    a consistent JSON error response.
    
    Args:
        request: The FastAPI request object
        exc: The exception that was raised
        
    Returns:
        JSONResponse: Formatted error response
    """
    # Get request ID from headers if available (for tracing)
    request_id = request.headers.get("X-Request-ID")
    
    # Log the error
    logger.warning(
        f"Application error: {exc.message}",
        extra={
            "error_code": exc.error_code,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method,
            "request_id": request_id,
        }
    )
    
    # Convert exception to response
    error_response = exc.to_response(request_id)
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(exclude_none=True),
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Handle Pydantic validation errors.
    
    This handler catches FastAPI/Pydantic validation errors
    and formats them consistently with our error response schema.
    
    Args:
        request: The FastAPI request object
        exc: The validation exception
        
    Returns:
        JSONResponse: Formatted validation error response
    """
    # Get request ID
    request_id = request.headers.get("X-Request-ID")
    
    # Extract validation error details
    errors = exc.errors()
    
    # Format error details
    formatted_errors = []
    for error in errors:
        formatted_errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    # Log the validation error
    logger.info(
        "Validation error",
        extra={
            "path": request.url.path,
            "method": request.method,
            "errors": formatted_errors,
        }
    )
    
    # Create error response
    error_response = ErrorResponse(
        error="validation_error",
        message="Request validation failed",
        details={"errors": formatted_errors},
        request_id=request_id,
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump(exclude_none=True),
    )


async def generic_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Handle unexpected exceptions.
    
    This is the catch-all handler for any unhandled exceptions.
    It returns a generic 500 error and logs the full traceback.
    
    Args:
        request: The FastAPI request object
        exc: The exception that was raised
        
    Returns:
        JSONResponse: Generic error response
    """
    # Get request ID
    request_id = request.headers.get("X-Request-ID")
    
    # Log the error with traceback
    logger.exception(
        f"Unhandled exception: {exc}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "request_id": request_id,
        }
    )
    
    # Create generic error response
    # Don't expose internal error details in production
    from app.config import settings
    
    error_response = ErrorResponse(
        error="internal_error",
        message="An unexpected error occurred" if settings.is_production else str(exc),
        request_id=request_id,
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(exclude_none=True),
    )


# =============================================================================
# SETUP FUNCTION
# =============================================================================
def setup_exception_handlers(app: FastAPI) -> None:
    """
    Register exception handlers with the FastAPI application.
    
    This function should be called during application initialization
    to set up all custom exception handlers.
    
    Args:
        app: The FastAPI application instance
        
    Example:
        ```python
        app = FastAPI()
        setup_exception_handlers(app)
        ```
    """
    # Handle custom Nexus exceptions
    app.add_exception_handler(NexusException, nexus_exception_handler)
    
    # Handle Pydantic validation errors
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    
    # Handle all other exceptions
    app.add_exception_handler(Exception, generic_exception_handler)
    
    logger.debug("Exception handlers registered")
