# =============================================================================
# NEXUS FAMILY PASS - MCP (MODEL CONTEXT PROTOCOL) PACKAGE
# =============================================================================
"""
Model Context Protocol (MCP) Integration Package.

This package implements MCP servers that provide standardized tools
for AI systems to interact with the Nexus Family Pass platform:

    - VenueMCPServer: Tools for venue operations
    - ActivityMCPServer: Tools for activity management
    - BookingMCPServer: Tools for booking operations

MCP Benefits:
    - Standardized tool interface for AI agents
    - Automatic schema generation
    - Built-in error handling
    - Integration with Claude and other AI systems

Usage:
    ```python
    from app.integrations.mcp import VenueMCPServer

    server = VenueMCPServer()
    tools = server.get_tools()

    # Use with an AI agent
    result = await server.execute_tool(
        name="search_venues",
        arguments={"query": "swimming", "city": "Bangalore"}
    )
    ```
"""

from app.integrations.mcp.server import (
    MCPServer,
    VenueMCPServer,
    get_mcp_server,
)
from app.integrations.mcp.tools import (
    MCPTool,
    MCPToolResult,
    venue_tools,
    activity_tools,
    booking_tools,
)

__all__ = [
    "MCPServer",
    "VenueMCPServer",
    "get_mcp_server",
    "MCPTool",
    "MCPToolResult",
    "venue_tools",
    "activity_tools",
    "booking_tools",
]
