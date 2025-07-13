# MCP Integration Guide

## Overview

This guide explains how Model Context Protocol (MCP) instances are created and managed within the MiniMCP system. The current implementation uses a simplified approach where users provide API tokens through the frontend, and the system creates isolated MCP server processes.

## Current Implementation

### User Flow

1. **User selects service** (Figma, GitHub, etc.) in frontend
2. **User enters API token** for that service
3. **System validates token** against the actual API
4. **System creates MCP server** with user's credentials
5. **User gets access URL** to communicate with their data

### Technical Flow

```
Frontend → Backend → Validation → Process Creation → URL Return
```

### Example: Creating a Figma MCP Server

**Frontend Request:**

```typescript
POST /api/v1/mcps
{
  "mcp_type": "figma",
  "custom_name": "My Figma MCP",
  "expiration_option": "1h",
  "credentials": {
    "api_key": "<your-api-key>"
  }
}
```

**Backend Response:**

```json
{
	"access_url": "http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000",
	"access_token": "mcp_acc_b4303f9309804e85874a044548d56391",
	"status": "active"
}
```

**User can now access:**

-   `http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/health` - Server health (REST)
-   `http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/me` - User info from Figma (REST)
-   `http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/files` - User's Figma files (REST)
-   `POST http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/` - JSON-RPC protocol messages
-   `POST http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/message` - Alternative JSON-RPC endpoint

## Credential Management

### Current Implementation

-   **Storage**: Credentials encrypted in database
-   **Validation**: Real API calls to validate tokens (Figma API, GitHub API, etc.)
-   **Usage**: Passed to MCP server process via environment variables
-   **Security**: Each MCP server runs as isolated Node.js process

### Supported Services

-   **Figma**: Requires `api_key` (starts with `figd_`)
-   **GitHub**: Requires `personal_access_token` (starts with `ghp_`)
-   **Gmail**: Requires `api_key` (starts with `AIza`)

## Process Management

### Process Creation

```javascript
// Backend creates isolated MCP handler
const mcpHandler = new MCPHandler({
	mcpType: mcpType,
	instanceId: instanceId,
	userId: userId,
	credentials: credentials,
	route: `/mcp/${instanceId}`
});

// Register handler with Express app
app.use(`/mcp/${instanceId}`, mcpHandler.router);
```

### Handler Properties

-   **Unique Routes**: Each MCP gets its own route `/mcp/{instanceId}`
-   **Isolation**: Separate handler instance per MCP
-   **Environment**: Credentials passed to handler constructor
-   **Monitoring**: Basic health checks via `/health` endpoint

## MCP Server Structure

Each MCP server implements the official Model Context Protocol using JSON-RPC 2.0 messaging, along with REST endpoints for compatibility:

### MCP JSON-RPC 2.0 Protocol Endpoints

**Main Protocol Endpoint:**

-   `POST /` - Primary JSON-RPC message handling
-   `POST /message` - Alternative JSON-RPC endpoint

**Supported JSON-RPC Methods:**

-   `initialize` - Server initialization and capability negotiation
-   `tools/list` - List available tools/actions
-   `tools/call` - Execute specific tools
-   `resources/list` - List available resources/data sources
-   `resources/read` - Read resource content

### Example JSON-RPC Messages

**Initialize Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"method": "initialize",
	"params": {
		"protocolVersion": "2024-11-05",
		"capabilities": {},
		"clientInfo": { "name": "MCP Client", "version": "1.0.0" }
	}
}
```

**Initialize Response:**

```json
{
	"jsonrpc": "2.0",
	"id": 1,
	"result": {
		"protocolVersion": "2024-11-05",
		"capabilities": { "tools": {}, "resources": {} },
		"serverInfo": { "name": "Figma MCP Server", "version": "1.0.0" },
		"instructions": "This is a Figma MCP server providing tools and resources for Figma API integration."
	}
}
```

**Tools List Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 2,
	"method": "tools/list"
}
```

**Tool Call Request:**

```json
{
	"jsonrpc": "2.0",
	"id": 3,
	"method": "tools/call",
	"params": {
		"name": "get_figma_user_info",
		"arguments": {}
	}
}
```

### Legacy REST Endpoints (for compatibility)

-   `GET /health` - Server health check
-   `GET /info` - Server information
-   `GET /tools` - List available tools
-   `POST /tools/:toolName` - Execute tools
-   `GET /resources` - List resources
-   `GET /resources/*` - Get resource content
-   `GET /me` - User info endpoint

## Adding New MCP Types

### Step 1: Create MCP Server File

Create `new-service-mcp-server.js` in `/src/mcp-servers/`:

```javascript
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT;
const credentials = JSON.parse(process.env.CREDENTIALS);

// Implement service-specific endpoints
app.get('/data', async (req, res) => {
	// Make API calls using credentials
	const response = await fetch('https://api.newservice.com/data', {
		headers: { Authorization: `Bearer ${credentials.access_token}` },
	});
	res.json(await response.json());
});

app.listen(port);
```

### Step 2: Add to Database

```sql
INSERT INTO mcp_types (name, display_name, description)
VALUES ('newservice', 'New Service MCP', 'Access New Service data');
```

### Step 3: Update Credential Validation

Add validation logic in `credentialValidationService.js`:

```javascript
// Add to testAPICredentials function
if (credentials.access_token && credentials.access_token.startsWith('ns_')) {
	const response = await fetch('https://api.newservice.com/me', {
		headers: { Authorization: `Bearer ${credentials.access_token}` },
	});

	if (response.ok) {
		result.valid = true;
		result.api_info = await response.json();
	}
}
```

### Step 4: Test

The new service will automatically appear in the frontend dropdown and work with the existing flow.

## Troubleshooting

### Common Issues

**MCP Handler Won't Start:**

-   Check if route is registered: Review Express app routes
-   Verify credentials are valid
-   Check server logs in console

**Invalid Credentials:**

-   Ensure token format is correct (starts with proper prefix)
-   Test token manually with service API
-   Check token permissions/scopes

**Handler Fails:**

-   Check for memory leaks in handler
-   Verify all required dependencies are installed
-   Review error logs

### Debug Commands

```bash
# Check running MCP handlers
curl http://localhost:3000/api/v1/mcps

# Test MCP handler health (REST) - replace instanceId with actual instance ID
curl http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/health

# Test JSON-RPC initialize
curl -X POST http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "Test Client", "version": "1.0.0"}
    }
  }'

# Test JSON-RPC tools list
curl -X POST http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'

# Test JSON-RPC tool call
curl -X POST http://localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_figma_user_info",
      "arguments": {}
    }
  }'

# Check registered routes
curl http://localhost:3000/api/v1/mcps | jq '.data[].access_url'
```

## Current Limitations

1. **No automatic handler recovery** - If handler fails, user must recreate
2. **Basic credential storage** - Simple encryption, no rotation
3. **Limited monitoring** - Basic health checks only
4. **Manual MCP handler creation** - Each service requires manual implementation

## Next Steps

1. **Handler Recovery**: Implement automatic restart of failed handlers
2. **Enhanced Monitoring**: Add detailed metrics and alerting
3. **Credential Management**: Add token rotation and better security
4. **Auto-generation**: Build system to create MCP handlers from API documentation automatically

---

_Last updated: 2025-07-10_
