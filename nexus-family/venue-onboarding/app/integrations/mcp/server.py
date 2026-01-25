# =============================================================================
# NEXUS FAMILY PASS - MCP SERVER IMPLEMENTATION
# =============================================================================
"""
MCP Server Implementation Module.

This module provides the MCP (Model Context Protocol) server that:
    - Registers and manages tools
    - Handles tool execution requests
    - Provides tool discovery endpoints
    - Integrates with AI agents

The MCP server follows the standard MCP specification for tool servers,
enabling integration with Claude and other AI systems.

Usage:
    ```python
    from app.integrations.mcp import get_mcp_server

    server = get_mcp_server()

    # List available tools
    tools = server.list_tools()

    # Execute a tool
    result = await server.execute_tool(
        name="search_venues",
        arguments={"query": "swimming", "city": "Bangalore"}
    )
    ```
"""

# =============================================================================
# IMPORTS
# =============================================================================
from typing import Dict, Any, List, Optional
from functools import lru_cache

from app.core.logging_config import get_logger
from app.integrations.mcp.tools import (
    MCPTool,
    MCPToolResult,
    venue_tools,
    activity_tools,
    booking_tools,
    get_all_tools,
)

# =============================================================================
# LOGGER
# =============================================================================
logger = get_logger(__name__)


# =============================================================================
# MCP SERVER
# =============================================================================
class MCPServer:
    """
    Model Context Protocol (MCP) Server.

    This server manages tool registration, discovery, and execution
    following the MCP specification.

    Attributes:
        name: Server name
        version: Server version
        tools: Registered tools dictionary

    Example:
        ```python
        server = MCPServer(name="nexus-venue-server")
        server.register_tools(venue_tools)

        # List tools
        for tool in server.list_tools():
            print(tool["name"], tool["description"])

        # Execute tool
        result = await server.execute_tool(
            "search_venues",
            {"query": "swimming"}
        )
        ```
    """

    def __init__(
        self,
        name: str = "nexus-mcp-server",
        version: str = "1.0.0",
    ):
        """
        Initialize the MCP server.

        Args:
            name: Server name for identification
            version: Server version string
        """
        self.name = name
        self.version = version
        self._tools: Dict[str, MCPTool] = {}

        logger.info(f"MCP Server initialized: {name} v{version}")

    def register_tool(self, tool: MCPTool) -> None:
        """
        Register a single tool.

        Args:
            tool: MCPTool instance to register
        """
        self._tools[tool.name] = tool
        logger.debug(f"Registered tool: {tool.name}")

    def register_tools(self, tools: List[MCPTool]) -> None:
        """
        Register multiple tools.

        Args:
            tools: List of MCPTool instances
        """
        for tool in tools:
            self.register_tool(tool)

        logger.info(f"Registered {len(tools)} tools")

    def list_tools(self) -> List[Dict[str, Any]]:
        """
        List all registered tools in MCP format.

        Returns:
            List of tool definitions with name, description, and schema
        """
        return [tool.to_dict() for tool in self._tools.values()]

    def get_tool(self, name: str) -> Optional[MCPTool]:
        """
        Get a specific tool by name.

        Args:
            name: Tool name

        Returns:
            MCPTool instance or None if not found
        """
        return self._tools.get(name)

    async def execute_tool(
        self,
        name: str,
        arguments: Dict[str, Any],
    ) -> MCPToolResult:
        """
        Execute a tool with given arguments.

        Args:
            name: Tool name to execute
            arguments: Tool arguments as dictionary

        Returns:
            MCPToolResult with success status and data/error
        """
        tool = self.get_tool(name)

        if not tool:
            logger.warning(f"Tool not found: {name}")
            return MCPToolResult(
                success=False,
                error=f"Tool not found: {name}",
            )

        try:
            logger.info(f"Executing tool: {name}")
            result = await tool.handler(**arguments)

            if result.success:
                logger.info(f"Tool {name} executed successfully")
            else:
                logger.warning(f"Tool {name} failed: {result.error}")

            return result

        except TypeError as e:
            # Handle missing or invalid arguments
            logger.error(f"Invalid arguments for {name}: {e}")
            return MCPToolResult(
                success=False,
                error=f"Invalid arguments: {e}",
            )
        except Exception as e:
            logger.error(f"Tool {name} execution error: {e}")
            return MCPToolResult(
                success=False,
                error=f"Execution error: {e}",
            )

    def get_server_info(self) -> Dict[str, Any]:
        """
        Get server information in MCP format.

        Returns:
            Server info including name, version, and capabilities
        """
        return {
            "name": self.name,
            "version": self.version,
            "protocolVersion": "0.1.0",
            "capabilities": {
                "tools": True,
                "resources": False,
                "prompts": False,
            },
            "tools": len(self._tools),
        }


# =============================================================================
# SPECIALIZED SERVERS
# =============================================================================
class VenueMCPServer(MCPServer):
    """
    MCP Server specialized for venue operations.

    Pre-registers all venue-related tools for use by AI agents.
    """

    def __init__(self):
        """Initialize with venue tools."""
        super().__init__(
            name="nexus-venue-server",
            version="1.0.0",
        )
        self.register_tools(venue_tools)


class ActivityMCPServer(MCPServer):
    """
    MCP Server specialized for activity operations.

    Pre-registers all activity-related tools.
    """

    def __init__(self):
        """Initialize with activity tools."""
        super().__init__(
            name="nexus-activity-server",
            version="1.0.0",
        )
        self.register_tools(activity_tools)


class BookingMCPServer(MCPServer):
    """
    MCP Server specialized for booking operations.

    Pre-registers all booking-related tools.
    """

    def __init__(self):
        """Initialize with booking tools."""
        super().__init__(
            name="nexus-booking-server",
            version="1.0.0",
        )
        self.register_tools(booking_tools)


class UnifiedMCPServer(MCPServer):
    """
    Unified MCP Server with all tools.

    Provides a single server with access to all platform tools.
    """

    def __init__(self):
        """Initialize with all tools."""
        super().__init__(
            name="nexus-unified-server",
            version="1.0.0",
        )
        self.register_tools(get_all_tools())


# =============================================================================
# FACTORY FUNCTION
# =============================================================================
@lru_cache(maxsize=1)
def get_mcp_server() -> UnifiedMCPServer:
    """
    Get the singleton MCP server instance.

    Returns:
        UnifiedMCPServer instance with all tools registered

    Example:
        ```python
        server = get_mcp_server()
        tools = server.list_tools()
        ```
    """
    return UnifiedMCPServer()


def get_venue_mcp_server() -> VenueMCPServer:
    """Get a venue-specific MCP server."""
    return VenueMCPServer()


def get_activity_mcp_server() -> ActivityMCPServer:
    """Get an activity-specific MCP server."""
    return ActivityMCPServer()


# =============================================================================
# MCP ENDPOINT HELPERS
# =============================================================================
def create_mcp_list_tools_response(server: MCPServer) -> Dict[str, Any]:
    """
    Create MCP-compliant list_tools response.

    Args:
        server: MCP server instance

    Returns:
        Response dict following MCP specification
    """
    return {
        "tools": server.list_tools(),
    }


def create_mcp_call_tool_response(result: MCPToolResult) -> Dict[str, Any]:
    """
    Create MCP-compliant call_tool response.

    Args:
        result: Tool execution result

    Returns:
        Response dict following MCP specification
    """
    if result.success:
        return {
            "content": [
                {
                    "type": "text",
                    "text": str(result.data),
                }
            ],
        }
    else:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"Error: {result.error}",
                }
            ],
            "isError": True,
        }
