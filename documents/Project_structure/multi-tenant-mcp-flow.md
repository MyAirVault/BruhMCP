# Multi-Tenant MCP Service Flow Documentation

## Overview

This document explains the complete flow of the multi-tenant MCP service architecture, where each service runs independently and supports multiple users through instance-based routing. This architecture allows for 300+ MCP services to run simultaneously while providing complete user isolation.

## Architecture Principles

### 1. Service Independence

-   Each MCP service runs on a dedicated port (e.g., Figma: 49280, GitHub: 49294)
-   Services start without requiring database connections or user instances
-   Services can handle any number of user instances dynamically

### 2. Instance-Based Routing

-   Each user gets a unique instance ID (UUID) for each service they use
-   URLs include the instance ID: `https://domain.com/figma/550e8400-e29b-41d4-a716-446655440000/mcp/call`
-   Instance ID determines which user's credentials to use

### 3. Database-Driven Authentication

-   User credentials stored in database per instance
-   Services query database in real-time for authentication
-   Complete isolation between users of the same service

## Complete Request Flow

### Step 1: Service Startup

```bash
# Service starts independently
cd bruhmcp/backend/src/mcp-servers/figma
node index.js

# Output:
✅ Figma service running on port 49280
🔗 Global Health: http://localhost:49280/health
🏠 Instance Health: http://localhost:49280/:instanceId/health
🛠️  MCP Tools: http://localhost:49280/:instanceId/mcp/tools
📞 MCP Call: POST http://localhost:49280/:instanceId/mcp/call
🌐 Multi-tenant architecture enabled with instance-based routing
```

**Service State:**

-   ✅ Listening on port 49280
-   ✅ Ready to handle any instance requests
-   ✅ No database dependencies at startup
-   ✅ Global health endpoint immediately available

### Step 2: User Instance Creation

**User Action (via main application):**

1. User browses available services
2. Selects "Figma" service
3. Enters Figma API key: `figd_ABC123def456...`
4. Provides custom name: "Work Figma"
5. Sets expiration: "30 days"

**System Process:**

```sql
-- Generate unique instance ID
INSERT INTO mcp_service (
  instance_id,           -- 550e8400-e29b-41d4-a716-446655440000
  user_id,              -- user's UUID
  mcp_service_id,       -- figma service UUID
  api_key,              -- figd_ABC123def456...
  status,               -- 'active'
  expires_at,           -- NOW() + 30 days
  custom_name,          -- 'Work Figma'
  usage_count,          -- 0
  created_at            -- NOW()
) VALUES (...);
```

**User Receives:**

```
Instance URL: https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000
```

### Step 3: Client Request

**LLM/External Client makes request:**

```http
POST https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/mcp/call
Content-Type: application/json

{
  "name": "get_figma_file",
  "arguments": {
    "fileKey": "zX1YuwS9Jg1Rc_qF3T1Du_Um"
  }
}
```

### Step 4: Nginx Routing

**Nginx Configuration:**

```nginx
location /figma/ {
    proxy_pass http://localhost:49280/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

**Request Transformation:**

```
Original: POST https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/mcp/call
Nginx:    POST http://localhost:49280/550e8400-e29b-41d4-a716-446655440000/mcp/call
```

### Step 5: Service Processing

**Express Route Matching:**

```javascript
app.post('/:instanceId/mcp/call', instanceAuthMiddleware, async (req, res) => {
	// Route matches with instanceId = '550e8400-e29b-41d4-a716-446655440000'
});
```

**Instance Authentication Middleware:**

1. **Extract Instance ID:**

```javascript
const { instanceId } = req.params;
// instanceId = '550e8400-e29b-41d4-a716-446655440000'
```

2. **Validate UUID Format:**

```javascript
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(instanceId)) {
	return res.status(400).json({ error: 'Invalid instance ID format' });
}
```

3. **Database Lookup:**

```sql
SELECT
  ms.instance_id,
  ms.user_id,
  ms.api_key,
  ms.status,
  ms.expires_at,
  ms.usage_count,
  ms.custom_name,
  m.mcp_service_name,
  m.display_name,
  m.type as auth_type,
  m.is_active as service_active
FROM mcp_service ms
JOIN mcp m ON ms.mcp_service_id = m.mcp_service_id
WHERE ms.instance_id = $1
  AND m.mcp_service_name = 'figma'
```

4. **Instance Validation:**

```javascript
// Check if instance exists
if (!instance) {
	return res.status(404).json({ error: 'Instance not found' });
}

// Check service is globally active
if (!instance.service_active) {
	return res.status(503).json({ error: 'Service is currently disabled' });
}

// Check instance status
if (instance.status === 'inactive') {
	return res.status(403).json({ error: 'Instance is paused' });
}

if (instance.status === 'expired') {
	return res.status(403).json({ error: 'Instance has expired' });
}

// Check expiration time
if (instance.expires_at && new Date(instance.expires_at) < new Date()) {
	return res.status(403).json({ error: 'Instance has expired' });
}

// Validate credentials exist
if (instance.auth_type === 'api_key' && !instance.api_key) {
	return res.status(500).json({ error: 'No API key configured' });
}
```

5. **Attach Instance Data:**

```javascript
req.instance = instance;
req.figmaApiKey = instance.api_key; // 'figd_ABC123def456...'
req.instanceId = instanceId;
```

6. **Update Usage Tracking:**

```sql
UPDATE mcp_service
SET
  usage_count = usage_count + 1,
  last_used_at = NOW(),
  updated_at = NOW()
WHERE instance_id = $1
```

### Step 6: Tool Execution

**Execute Tool Call:**

```javascript
const result = await executeToolCall(
	'get_figma_file', // tool name
	{ fileKey: 'zX1YuwS9Jg1Rc_qF3T1Du_Um' }, // arguments
	'figd_ABC123def456...' // user's API key
);
```

**Figma API Call:**

```javascript
const response = await fetch(`https://api.figma.com/v1/files/zX1YuwS9Jg1Rc_qF3T1Du_Um`, {
	headers: {
		'X-Figma-Token': 'figd_ABC123def456...', // user's specific API key
		'Content-Type': 'application/json',
	},
});
```

### Step 7: Response

**Service Response:**

```json
{
	"content": [
		{
			"type": "text",
			"text": "Figma File: My Design System\n\nDocument Structure:\n{...figma file data...}"
		}
	],
	"instanceId": "550e8400-e29b-41d4-a716-446655440000",
	"userId": "user-uuid-here"
}
```

**Response Path:**

```
Figma Service → Nginx → Client
Complete request isolation and proper response handling
```

## URL Structure Examples

### Global Endpoints (No Instance Required)

```
GET  http://localhost:49280/health                    # Service health
```

### Instance-Specific Endpoints

```
GET  http://localhost:49280/550e8400-e29b-41d4-a716-446655440000/health
GET  http://localhost:49280/550e8400-e29b-41d4-a716-446655440000/mcp/tools
POST http://localhost:49280/550e8400-e29b-41d4-a716-446655440000/mcp/call
GET  http://localhost:49280/550e8400-e29b-41d4-a716-446655440000/api/files/abc123
```

### Through Nginx (Production URLs)

```
GET  https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/health
GET  https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/mcp/tools
POST https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/mcp/call
GET  https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/api/files/abc123
```

## Multi-User Isolation Example

### User 1 (Personal Account)

```
Instance ID: 550e8400-e29b-41d4-a716-446655440000
API Key: figd_personal_key_123...
URL: https://myapp.com/figma/550e8400-e29b-41d4-a716-446655440000/mcp/call

Request → Uses personal Figma API key → Accesses personal Figma files
```

### User 2 (Work Account)

```
Instance ID: 7c4a8d09-6f91-4c87-b9e2-3f2d4e5a6b7c
API Key: figd_work_key_456...
URL: https://myapp.com/figma/7c4a8d09-6f91-4c87-b9e2-3f2d4e5a6b7c/mcp/call

Request → Uses work Figma API key → Accesses work Figma files
```

### Complete Isolation

-   Different instance IDs → Different database records
-   Different API keys → Different Figma account access
-   Different usage tracking → Separate analytics
-   Different expiration → Independent lifecycle management

## Error Handling

### Instance Not Found

```json
{
	"error": "Instance not found",
	"message": "Instance access denied",
	"instanceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Instance Expired

```json
{
	"error": "Instance has expired",
	"message": "Instance access denied",
	"instanceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Invalid API Key

```json
{
	"content": [
		{
			"type": "text",
			"text": "Error executing get_figma_file: Figma API error: 403 Forbidden"
		}
	],
	"isError": true,
	"instanceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Benefits of This Architecture

### 1. Service Independence

-   Services start without database dependencies
-   No complex initialization sequences
-   Easy deployment and scaling

### 2. Complete User Isolation

-   Each user's credentials stored separately
-   No cross-contamination between users
-   Individual usage tracking and analytics

### 3. Dynamic Scalability

-   One service handles unlimited users
-   No pre-configuration of user accounts
-   Real-time instance creation and management

### 4. Security & Compliance

-   Credentials isolated per user
-   Instance-level expiration management
-   Audit trail per user interaction

### 5. Operational Simplicity

-   Standard HTTP/REST architecture
-   No special protocols or complex routing
-   Easy monitoring and debugging

## Implementation Status

### ✅ Completed

-   Multi-tenant routing architecture
-   Instance-based authentication middleware
-   Database integration for credential lookup
-   Usage tracking and analytics
-   Instance validation (status, expiration)
-   Complete user isolation

### 🔄 Integration Required

-   Database schema deployment
-   Nginx configuration updates
-   Frontend instance creation flow
-   Service registry population

This architecture provides a robust foundation for supporting 300+ MCP services with complete multi-user isolation while maintaining operational simplicity.
