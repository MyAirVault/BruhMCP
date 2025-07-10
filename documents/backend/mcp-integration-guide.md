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
    "api_key": "figd_zWfTj8oHAmpYRsds9arzHge06ftLAzOy0oC0Jyc5"
  }
}
```

**Backend Response:**
```json
{
  "access_url": "http://localhost:3001",
  "access_token": "mcp_acc_b4303f9309804e85874a044548d56391",
  "status": "active"
}
```

**User can now access:**
- `http://localhost:3001/health` - Server health
- `http://localhost:3001/me` - User info from Figma
- `http://localhost:3001/files` - User's Figma files

## Credential Management

### Current Implementation

- **Storage**: Credentials encrypted in database
- **Validation**: Real API calls to validate tokens (Figma API, GitHub API, etc.)
- **Usage**: Passed to MCP server process via environment variables
- **Security**: Each MCP server runs as isolated Node.js process

### Supported Services

- **Figma**: Requires `api_key` (starts with `figd_`)
- **GitHub**: Requires `personal_access_token` (starts with `ghp_`)
- **Gmail**: Requires `api_key` (starts with `AIza`)

## Process Management

### Process Creation

```javascript
// Backend creates isolated Node.js process
const mcpProcess = spawn('node', [`${mcpType}-mcp-server.js`], {
  env: {
    PORT: assignedPort,
    MCP_ID: instanceId,
    USER_ID: userId,
    CREDENTIALS: JSON.stringify(credentials)
  }
});
```

### Process Properties

- **Unique Port**: Each MCP gets its own port (3001, 3002, etc.)
- **Isolation**: Separate Node.js process per MCP
- **Environment**: Credentials passed via environment variables
- **Monitoring**: Basic health checks via `/health` endpoint

## MCP Server Structure

Each MCP server is a simple Express.js application:

```javascript
// figma-mcp-server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT;
const credentials = JSON.parse(process.env.CREDENTIALS);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// User info
app.get('/me', async (req, res) => {
  const response = await fetch('https://api.figma.com/v1/me', {
    headers: { 'X-Figma-Token': credentials.api_key }
  });
  const data = await response.json();
  res.json(data);
});

app.listen(port, () => {
  console.log(`Figma MCP server running on port ${port}`);
});
```

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
    headers: { 'Authorization': `Bearer ${credentials.access_token}` }
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
    headers: { 'Authorization': `Bearer ${credentials.access_token}` }
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

**MCP Server Won't Start:**
- Check if port is available: `netstat -tlnp | grep :3001`
- Verify credentials are valid
- Check server logs in console

**Invalid Credentials:**
- Ensure token format is correct (starts with proper prefix)
- Test token manually with service API
- Check token permissions/scopes

**Process Dies:**
- Check for memory leaks
- Verify all required dependencies are installed
- Review error logs

### Debug Commands

```bash
# Check running MCP processes
ps aux | grep mcp-server

# Test MCP server directly
curl http://localhost:3001/health

# Check port usage
netstat -tlnp | grep :300
```

## Current Limitations

1. **No automatic process recovery** - If process dies, user must recreate
2. **Basic credential storage** - Simple encryption, no rotation
3. **Limited monitoring** - Basic health checks only
4. **Manual MCP server creation** - Each service requires manual implementation

## Next Steps

1. **Process Recovery**: Implement automatic restart of failed processes
2. **Enhanced Monitoring**: Add detailed metrics and alerting  
3. **Credential Management**: Add token rotation and better security
4. **Auto-generation**: Build system to create MCP servers from API documentation automatically

---

*Last updated: 2025-07-10*