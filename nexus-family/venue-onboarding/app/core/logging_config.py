# =============================================================================
# NEXUS FAMILY PASS - LOGGING CONFIGURATION
# =============================================================================
"""
Structured Logging Configuration Module.

This module configures structured logging for the application using
Python's standard logging library with structlog for enhanced formatting.

Features:
    - Structured JSON logging for production
    - Human-readable colored output for development
    - Consistent log format across the application
    - Request context propagation
    - Performance metrics logging

Usage:
    ```python
    from app.core.logging_config import get_logger
    
    logger = get_logger(__name__)
    logger.info("Processing request", extra={"user_id": "123"})
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
# Standard library imports
import logging  # Python standard logging
import sys  # System-specific parameters (stdout)
from typing import Any, Dict, Optional  # Type hints
from datetime import datetime  # Timestamp handling
import json  # JSON serialization for structured logging


# =============================================================================
# CUSTOM FORMATTER FOR STRUCTURED LOGGING
# =============================================================================
class StructuredFormatter(logging.Formatter):
    """
    Custom log formatter for structured (JSON) output.
    
    This formatter outputs logs as JSON objects, which is ideal for
    production environments where logs are aggregated and analyzed
    by tools like ELK Stack, Datadog, or CloudWatch.
    
    Output Format:
        {
            "timestamp": "2024-01-15T10:30:00.000Z",
            "level": "INFO",
            "logger": "app.services.venue",
            "message": "Venue created",
            "venue_id": "abc123",
            "request_id": "xyz789"
        }
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record as a JSON string.
        
        Args:
            record: The log record to format
            
        Returns:
            str: JSON-formatted log string
        """
        # Build the base log entry
        log_entry: Dict[str, Any] = {
            # ISO 8601 timestamp in UTC
            "timestamp": datetime.utcnow().isoformat() + "Z",
            
            # Log level (INFO, WARNING, ERROR, etc.)
            "level": record.levelname,
            
            # Logger name (usually the module path)
            "logger": record.name,
            
            # The log message
            "message": record.getMessage(),
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add any extra fields passed to the logger
        # Extra fields are added via logger.info("msg", extra={...})
        if hasattr(record, "__dict__"):
            # Standard fields to exclude (they're internal to logging)
            excluded_fields = {
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "pathname", "process", "processName", "relativeCreated",
                "stack_info", "exc_info", "exc_text", "thread", "threadName",
                "message", "asctime",
            }
            
            # Add all non-excluded fields
            for key, value in record.__dict__.items():
                if key not in excluded_fields and not key.startswith("_"):
                    # Try to serialize the value, fall back to string
                    try:
                        json.dumps(value)
                        log_entry[key] = value
                    except (TypeError, ValueError):
                        log_entry[key] = str(value)
        
        # Return as JSON string
        return json.dumps(log_entry)


class DevelopmentFormatter(logging.Formatter):
    """
    Human-readable log formatter for development.
    
    This formatter outputs colored, human-readable logs that are
    easy to read in a terminal during development.
    
    Output Format:
        2024-01-15 10:30:00 | INFO     | app.services.venue | Venue created | venue_id=abc123
    """
    
    # ANSI color codes for different log levels
    COLORS = {
        "DEBUG": "\033[36m",     # Cyan
        "INFO": "\033[32m",      # Green
        "WARNING": "\033[33m",   # Yellow
        "ERROR": "\033[31m",     # Red
        "CRITICAL": "\033[35m",  # Magenta
    }
    RESET = "\033[0m"  # Reset color
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record as a human-readable string.
        
        Args:
            record: The log record to format
            
        Returns:
            str: Formatted log string with colors
        """
        # Get the color for this log level
        color = self.COLORS.get(record.levelname, "")
        
        # Format the timestamp
        timestamp = datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S")
        
        # Build the base message
        message = f"{timestamp} | {color}{record.levelname:8}{self.RESET} | {record.name} | {record.getMessage()}"
        
        # Add extra fields if present
        extra_parts = []
        excluded_fields = {
            "name", "msg", "args", "created", "filename", "funcName",
            "levelname", "levelno", "lineno", "module", "msecs",
            "pathname", "process", "processName", "relativeCreated",
            "stack_info", "exc_info", "exc_text", "thread", "threadName",
            "message", "asctime",
        }
        
        for key, value in record.__dict__.items():
            if key not in excluded_fields and not key.startswith("_"):
                extra_parts.append(f"{key}={value}")
        
        if extra_parts:
            message += " | " + " ".join(extra_parts)
        
        # Add exception info if present
        if record.exc_info:
            message += "\n" + self.formatException(record.exc_info)
        
        return message


# =============================================================================
# LOGGING SETUP
# =============================================================================
def setup_logging() -> None:
    """
    Configure logging for the application.
    
    This function sets up the logging system with appropriate
    formatters and handlers based on the environment.
    
    - Development: Human-readable colored output to stdout
    - Production: JSON structured output to stdout
    
    This function should be called once at application startup,
    typically in main.py before any other imports.
    
    Example:
        ```python
        from app.core.logging_config import setup_logging
        
        setup_logging()
        logger = get_logger(__name__)
        logger.info("Application starting")
        ```
    """
    # Import settings here to avoid circular imports
    from app.config import settings
    
    # Get the root logger
    root_logger = logging.getLogger()
    
    # Remove any existing handlers (prevents duplicate logs)
    root_logger.handlers.clear()
    
    # Set the log level from configuration
    log_level = getattr(logging, settings.LOG_LEVEL, logging.INFO)
    root_logger.setLevel(log_level)
    
    # Create a handler that outputs to stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    
    # Choose formatter based on environment
    if settings.LOG_FORMAT == "json" or settings.is_production:
        # Use JSON formatter for production
        formatter = StructuredFormatter()
    else:
        # Use development formatter with colors
        formatter = DevelopmentFormatter()
    
    handler.setFormatter(formatter)
    
    # Add the handler to the root logger
    root_logger.addHandler(handler)
    
    # Configure third-party library log levels
    # These are often too verbose at DEBUG level
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.DEBUG if settings.DATABASE_ECHO else logging.WARNING
    )
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    
    # Log that logging is configured
    logger = logging.getLogger(__name__)
    logger.debug(
        "Logging configured",
        extra={
            "level": settings.LOG_LEVEL,
            "format": settings.LOG_FORMAT,
        }
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the given name.
    
    This is the primary way to get a logger in the application.
    The name should typically be __name__ to use the module path.
    
    Args:
        name: The logger name (usually __name__)
        
    Returns:
        logging.Logger: A configured logger instance
        
    Example:
        ```python
        from app.core.logging_config import get_logger
        
        logger = get_logger(__name__)
        
        # Basic logging
        logger.info("Processing started")
        
        # With extra context
        logger.info("User created", extra={"user_id": "123", "email": "test@example.com"})
        
        # Error with exception
        try:
            do_something()
        except Exception as e:
            logger.exception("Operation failed")
        ```
    """
    return logging.getLogger(name)


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================
def log_request(
    logger: logging.Logger,
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    **kwargs: Any,
) -> None:
    """
    Log an HTTP request with standard fields.
    
    This helper function provides a consistent format for request logging.
    
    Args:
        logger: The logger to use
        method: HTTP method (GET, POST, etc.)
        path: Request path
        status_code: Response status code
        duration_ms: Request duration in milliseconds
        **kwargs: Additional fields to log
        
    Example:
        ```python
        log_request(
            logger,
            method="GET",
            path="/api/v1/venues",
            status_code=200,
            duration_ms=45.2,
            user_id="123",
        )
        ```
    """
    # Determine log level based on status code
    if status_code >= 500:
        level = logging.ERROR
    elif status_code >= 400:
        level = logging.WARNING
    else:
        level = logging.INFO
    
    # Build the log message
    message = f"{method} {path} {status_code} ({duration_ms:.1f}ms)"
    
    # Log with extra context
    logger.log(
        level,
        message,
        extra={
            "http_method": method,
            "http_path": path,
            "http_status": status_code,
            "duration_ms": duration_ms,
            **kwargs,
        }
    )


def log_external_call(
    logger: logging.Logger,
    service: str,
    operation: str,
    success: bool,
    duration_ms: float,
    **kwargs: Any,
) -> None:
    """
    Log an external service call.
    
    This helper function provides a consistent format for logging
    calls to external services like Google Places or Gemini.
    
    Args:
        logger: The logger to use
        service: Service name (e.g., "google_places", "gemini")
        operation: Operation name (e.g., "search", "generate_embedding")
        success: Whether the call succeeded
        duration_ms: Call duration in milliseconds
        **kwargs: Additional fields to log
        
    Example:
        ```python
        log_external_call(
            logger,
            service="google_places",
            operation="search",
            success=True,
            duration_ms=234.5,
            results_count=15,
        )
        ```
    """
    level = logging.INFO if success else logging.WARNING
    status = "success" if success else "failed"
    
    message = f"External call: {service}.{operation} {status} ({duration_ms:.1f}ms)"
    
    logger.log(
        level,
        message,
        extra={
            "external_service": service,
            "external_operation": operation,
            "external_success": success,
            "duration_ms": duration_ms,
            **kwargs,
        }
    )
