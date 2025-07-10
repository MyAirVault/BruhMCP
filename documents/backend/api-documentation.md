# API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Base URL and Versioning](#base-url-and-versioning)
3. [Authentication](#authentication)
4. [Common Headers](#common-headers)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Endpoints](#api-endpoints)
    - [Health Check](#health-check)
    - [MCP Types](#mcp-types)
    - [MCP Instances](#mcp-instances)
    - [API Keys](#api-keys)
    - [Logs](#logs)
    - [Settings](#settings)
8. [Examples](#examples)

## Overview

The MiniMCP API is a RESTful API that provides endpoints for managing Model Context Protocol (MCP) instances. All API responses are in JSON format.

## Base URL and Versioning

```
Development: http://localhost:5000/api/v1
Production: https://api.minimcp.com/api/v1
```

API versioning is included in the URL path. The current version is `v1`.

## Authentication

### Cookie-Based Authentication (Magic Links)

All API endpoints require authentication except for health checks. Authentication uses JWT tokens stored in HTTP-only cookies.

**Step 1: Request Magic Link**

```http
POST /auth/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (Production)**
```json
{
  "success": true,
  "message": "Magic link generated. Check console for link.",
  "email": "user@example.com"
}
```

**Response (Development - includes token for testing)**
```json
{
  "success": true,
  "message": "Magic link generated. Check console for link.",
  "email": "user@example.com",
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Step 2: Verify Magic Link Token**

```http
POST /auth/verify
Content-Type: application/json

{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Authentication Details:**

-   JWT tokens stored as HTTP-only cookies
-   SameSite strict, secure in production
-   7-day expiry with automatic refresh
-   No Authorization header required - cookies included automatically

**Authenticated Requests**

```javascript
fetch('/api/v1/api-keys/validate', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	credentials: 'include', // Include authentication cookies
	body: JSON.stringify({
		/* request data */
	}),
});
```

**Authentication Middleware Pattern:**

```javascript
function requireAuth(req, res, next) {
	const token = req.cookies.authToken; // JWT from HTTP-only cookie

	if (!token) {
		return res.status(401).json({
			error: {
				code: 'AUTHENTICATION_REQUIRED',
				message: 'Authentication required',
			},
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // { userId: uuid, email: string }
		next();
	} catch (error) {
		return res.status(401).json({
			error: {
				code: 'INVALID_TOKEN',
				message: 'Invalid or expired token',
			},
		});
	}
}
```

### MCP Access Token

MCP access tokens are used for accessing specific MCP instances after creation. These are separate from user authentication cookies.

```http
X-MCP-Access-Token: <mcp_access_token>
```

**Usage Context:**

-   **User Authentication**: JWT cookies (`authToken`) for API access
-   **MCP Instance Access**: MCP access tokens for direct MCP communication

## Common Headers

### Request Headers

```http
Content-Type: application/json
Accept: application/json
X-Request-ID: <unique-request-id>
```

### Response Headers

```http
Content-Type: application/json
X-Request-ID: <unique-request-id>
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Error Response Format

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Invalid request parameters",
		"details": [
			{
				"field": "expiration_minutes",
				"message": "Must be between 1 and 1440"
			}
		],
		"request_id": "req_abc123",
		"timestamp": "2024-01-07T15:30:00Z"
	}
}
```

### Error Codes

| Code                     | HTTP Status | Description                                                       |
| ------------------------ | ----------- | ----------------------------------------------------------------- |
| `VALIDATION_ERROR`       | 400         | Invalid request parameters                                        |
| `UNAUTHORIZED`           | 401         | Missing or invalid authentication                                 |
| `TOKEN_NOT_FOUND`        | 401         | Authentication token not found                                    |
| `TOKEN_EXPIRED`          | 401         | Authentication token expired                                      |
| `INSTANCE_LIMIT`         | 400         | Maximum instances per user reached - redirect to plans            |
| `FORBIDDEN`              | 403         | Insufficient permissions                                          |
| `NOT_FOUND`              | 404         | Resource not found                                                |
| `CONFLICT`               | 409         | Resource already exists                                           |
| `RATE_LIMIT_EXCEEDED`    | 429         | Too many requests                                                 |
| `INTERNAL_ERROR`         | 500         | Server error                                                      |
| `PORT_ALLOCATION_FAILED` | 500         | Port allocation failure - redirect to dashboard with error        |
| `PROCESS_CRASH`          | 500         | Process crash during API calls - redirect to dashboard with error |
| `SERVICE_UNAVAILABLE`    | 503         | Service temporarily unavailable                                   |

## Rate Limiting

-   **Default limit**: 100 requests per minute per IP
-   **Authenticated users**: 1000 requests per minute
-   **MCP creation**: 10 per user

## API Endpoints

### Health Check

#### GET /health

Check API server status.

**Response**

```json
{
	"status": "ok",
	"timestamp": "2024-01-07T15:30:00Z",
	"version": "1.0.0",
	"services": {
		"database": "healthy",
		"processManager": "healthy"
	}
}
```

---

### MCP Types

#### GET /api/v1/mcp-types

List all available MCP types.

**Query Parameters**

-   `active` (boolean): Filter by active status

**Response**

```json
{
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440001",
			"name": "gmail",
			"display_name": "Gmail MCP",
			"description": "Access Gmail API through MCP",
			"icon_url": "https://example.com/gmail-icon.png",
			"config_template": {
				"api_version": "v1",
				"scopes": ["gmail.readonly", "gmail.send"]
			},
			"resource_limits": {
				"cpu": "0.5",
				"memory": "512m"
			},
			"max_duration_minutes": 60,
			"is_active": true
		}
	],
	"meta": {
		"total": 3
	}
}
```

#### GET /api/v1/mcp-types/:name

Get details of a specific MCP type.

**Response**

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440001",
		"name": "gmail",
		"display_name": "Gmail MCP",
		"description": "Access Gmail API through MCP",
		"icon_url": "https://example.com/gmail-icon.png",
		"config_template": {
			"api_version": "v1",
			"scopes": ["gmail.readonly", "gmail.send"]
		},
		"required_fields": [
			{
				"name": "api_key",
				"type": "string",
				"description": "Gmail API key",
				"required": true
			}
		],
		"resource_limits": {
			"cpu": "0.5",
			"memory": "512m"
		},
		"max_duration_minutes": 60,
		"is_active": true
	}
}
```

---

### MCP Instances

#### POST /api/v1/mcps

Create a new MCP instance.

**Request Body**

```json
{
	"mcp_type": "gmail",
	"custom_name": "My Work Gmail",
	"expiration_option": "1day",
	"credentials": {
		"api_key": "your_api_key_here",
		"client_secret": "client_secret_if_needed",
		"additional_field": "value_if_required"
	},
	"config": {
		"custom_setting": "value"
	}
}
```

**Expiration Options:**

-   `"never"`: No expiration
-   `"1h"`: 1 hour
-   `"6h"`: 6 hours
-   `"1day"`: 1 day
-   `"30days"`: 30 days

**Response** (201 Created)

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440002",
		"custom_name": "My Work Gmail",
		"instance_number": 1,
		"access_token": "mcp_acc_1234567890abcdef",
		"access_url": "http://localhost:3001", // Constructed from assigned_port
		"assigned_port": 3001,
		"status": "active",
		"is_active": true,
		"expiration_option": "1day",
		"expires_at": "2024-01-08T15:30:00Z", // ISO 8601 format from database
		"mcp_type": {
			"name": "gmail",
			"display_name": "Gmail MCP"
		},
		"created_at": "2024-01-07T15:30:00Z"
	}
}
```

#### GET /api/v1/mcps

List user's MCP instances.

**Query Parameters**

-   `status` (string): Filter by status (active, inactive, expired)
-   `is_active` (boolean): Filter by active status
-   `mcp_type` (string): Filter by MCP type
-   `expiration_option` (string): Filter by expiration setting
-   `page` (number): Page number (default: 1)
-   `limit` (number): Items per page (default: 20, max: 100)
-   `sort` (string): Sort field (created_at, expires_at, custom_name)
-   `order` (string): Sort order (asc, desc)

**Response**

```json
{
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440002",
			"custom_name": "My Work Gmail",
			"instance_number": 1,
			"access_token": "mcp_acc_1234567890abcdef",
			"access_url": "http://localhost:3001",
			"assigned_port": 3001,
			"process_id": 12345,
			"status": "active",
			"is_active": true,
			"expiration_option": "1day",
			"expires_at": "2024-01-08T15:30:00Z", // ISO 8601 format from database
			"last_accessed": "2024-01-07T15:35:00Z",
			"mcp_type": {
				"name": "gmail",
				"display_name": "Gmail MCP",
				"icon_url": "https://example.com/gmail-icon.png"
			},
			"metrics": {
				"requests": 45,
				"errors": 2,
				"uptime_hours": 2.5
			},
			"created_at": "2024-01-07T15:30:00Z"
		},
		{
			"id": "550e8400-e29b-41d4-a716-446655440003",
			"custom_name": "Personal Gmail",
			"instance_number": 2,
			"access_token": "mcp_acc_0987654321fedcba",
			"access_url": "http://localhost:3002", // Constructed from assigned_port
			"assigned_port": 3002,
			"process_id": 12346,
			"status": "active",
			"is_active": true,
			"expiration_option": "6h",
			"expires_at": "2024-01-07T21:30:00Z",
			"last_accessed": "2024-01-07T15:40:00Z",
			"mcp_type": {
				"name": "gmail",
				"display_name": "Gmail MCP",
				"icon_url": "https://example.com/gmail-icon.png"
			},
			"metrics": {
				"requests": 23,
				"errors": 0,
				"uptime_hours": 1.2
			},
			"created_at": "2024-01-07T14:20:00Z"
		}
	],
	"meta": {
		"total": 5,
		"page": 1,
		"limit": 20,
		"pages": 1,
		"instances_by_type": {
			"gmail": 2,
			"figma": 1,
			"slack": 2
		}
	}
}
```

#### GET /api/v1/mcps/:id

Get details of a specific MCP instance.

**Response**

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440002",
		"instance_number": 1,
		"access_token": "mcp_acc_1234567890abcdef",
		"access_url": "http://localhost:3001", // Constructed from assigned_port
		"assigned_port": 3001,
		"process_id": 12345,
		"status": "active",
		"expires_at": "2024-01-07T16:00:00Z",
		"last_accessed": "2024-01-07T15:35:00Z",
		"mcp_type": {
			"name": "gmail",
			"display_name": "Gmail MCP",
			"icon_url": "https://example.com/gmail-icon.png"
		},
		"config": {
			"custom_setting": "value"
		},
		"stats": {
			"cpu_percent": 15.2,
			"memory_mb": 256,
			"uptime_seconds": 3600
		},
		"created_at": "2024-01-07T15:30:00Z",
		"updated_at": "2024-01-07T15:35:00Z"
	}
}
```

#### PUT /api/v1/mcps/:id/renew

Renew an expired MCP instance.

**Request Body**

```json
{
	"expiration_option": "6h"
}
```

**Response**

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440002",
		"status": "active",
		"expires_at": "2024-01-07T21:30:00Z",
		"message": "MCP instance renewed successfully"
	}
}
```

#### PUT /api/v1/mcps/:id/toggle

Toggle MCP instance active/inactive status.

**Request Body**

```json
{
	"is_active": false
}
```

**Response**

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440002",
		"is_active": false,
		"message": "MCP instance deactivated"
	}
}
```

#### PUT /api/v1/mcps/:id/edit

Edit MCP instance details.

**Request Body**

```json
{
	"custom_name": "Updated Gmail Account",
	"credentials": {
		"api_key": "new_api_key_here",
		"client_secret": "new_client_secret_if_needed"
	}
}
```

**Response**

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440002",
		"custom_name": "Updated Gmail Account",
		"message": "MCP instance updated successfully"
	}
}
```

#### DELETE /api/v1/mcps/:id

Permanently delete an MCP instance and its credentials.

**Response**

```json
{
	"data": {
		"message": "MCP instance and credentials permanently deleted"
	}
}
```

---

### API Keys

#### GET /api/v1/api-keys

List user's stored API keys.

**Response**

```json
{
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440003",
			"mcp_type_id": "550e8400-e29b-41d4-a716-446655440001",
			"mcp_type": {
				"id": "550e8400-e29b-41d4-a716-446655440001",
				"name": "gmail",
				"display_name": "Gmail MCP"
			},
			"is_active": true,
			"created_at": "2024-01-07T15:00:00Z",
			"updated_at": "2024-01-07T15:00:00Z",
			"expires_at": null
		}
	]
}
```

#### POST /api/v1/api-keys

Store credentials for an MCP type.

**Request Body**

```json
{
	"mcp_type_id": "550e8400-e29b-41d4-a716-446655440001",
	"credentials": {
		"api_key": "AIzaSyD-1234567890abcdef",
		"client_secret": "GOCSPX-1234567890abcdef",
		"client_id": "123456789.apps.googleusercontent.com"
	}
}
```

**Response** (201 Created)

```json
{
	"data": {
		"id": "550e8400-e29b-41d4-a716-446655440003",
		"mcp_type_id": "550e8400-e29b-41d4-a716-446655440001",
		"mcp_type": {
			"id": "550e8400-e29b-41d4-a716-446655440001",
			"name": "gmail",
			"display_name": "Gmail MCP"
		},
		"is_active": true,
		"created_at": "2024-01-07T15:00:00Z",
		"updated_at": "2024-01-07T15:00:00Z",
		"expires_at": null,
		"message": "Credentials stored successfully"
	}
}
```

#### POST /api/v1/api-keys/validate

Validate API credentials before storing them.

**Zod Validation Schema**

```javascript
import { z } from 'zod';

const credentialValidationSchema = z.object({
	mcp_type_id: z.string().uuid('MCP type ID must be a valid UUID'),
	credentials: z
		.record(z.string())
		.refine(creds => Object.keys(creds).length > 0, { message: 'At least one credential is required' }),
});

// Specific credential schemas based on MCP type
const gmailCredentialsSchema = z.object({
	api_key: z.string().min(1, 'API key is required'),
	client_secret: z.string().optional(),
	client_id: z.string().optional(),
});

const oauthCredentialsSchema = z.object({
	client_id: z.string().min(1, 'Client ID is required'),
	client_secret: z.string().min(1, 'Client secret is required'),
	refresh_token: z.string().optional(),
});
```

**Request Body**

```json
{
	"mcp_type_id": "550e8400-e29b-41d4-a716-446655440001",
	"credentials": {
		"api_key": "AIzaSyD-1234567890abcdef",
		"client_secret": "GOCSPX-1234567890abcdef",
		"client_id": "123456789.apps.googleusercontent.com"
	}
}
```

**Validation Error Response** (400 Bad Request - Schema validation failure)

```json
{
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Invalid request parameters",
		"details": [
			{
				"field": "credentials.api_key",
				"message": "API key is required"
			},
			{
				"field": "mcp_type_id",
				"message": "MCP type ID must be a valid UUID"
			}
		]
	}
}
```

**Response** (200 OK - Valid credentials)

```json
{
	"data": {
		"valid": true,
		"message": "Credentials validated successfully",
		"api_info": {
			"service": "Gmail API",
			"quota_remaining": 95000,
			"permissions": ["read", "send"]
		}
	}
}
```

**Response** (400 Bad Request - Invalid credentials)

```json
{
	"error": {
		"code": "INVALID_CREDENTIALS",
		"message": "API key is invalid or expired",
		"details": {
			"field": "api_key",
			"reason": "Authentication failed"
		}
	}
}
```

**Controller Implementation Pattern**

```javascript
export async function validateCredentials(req, res) {
	try {
		// Validate request body using Zod
		const validationResult = credentialValidationSchema.safeParse(req.body);

		if (!validationResult.success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid request parameters',
					details: validationResult.error.errors.map(err => ({
						field: err.path.join('.'),
						message: err.message,
					})),
				},
			});
		}

		const { mcp_type_id, credentials } = validationResult.data;

		// Additional credential-specific validation based on MCP type
		const credentialSchema = getCredentialSchemaByType(mcp_type_id);
		const credentialValidation = credentialSchema.safeParse(credentials);

		if (!credentialValidation.success) {
			return res.status(400).json({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid credentials format',
					details: credentialValidation.error.errors.map(err => ({
						field: `credentials.${err.path.join('.')}`,
						message: err.message,
					})),
				},
			});
		}

		// Test credentials with actual API
		const testResult = await testAPICredentials(mcp_type_id, credentials);

		if (testResult.valid) {
			return res.status(200).json({
				data: {
					valid: true,
					message: 'Credentials validated successfully',
					api_info: testResult.api_info,
				},
			});
		} else {
			return res.status(400).json({
				error: {
					code: testResult.error_code,
					message: testResult.error_message,
					details: testResult.details,
				},
			});
		}
	} catch (error) {
		console.error('Credential validation error:', error);
		return res.status(500).json({
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Internal server error during validation',
			},
		});
	}
}
```

**Response** (403 Forbidden - Insufficient permissions)

```json
{
	"error": {
		"code": "INSUFFICIENT_PERMISSIONS",
		"message": "API key lacks required permissions",
		"details": {
			"required_permissions": ["https://www.googleapis.com/auth/gmail.readonly"],
			"granted_permissions": ["https://www.googleapis.com/auth/userinfo.email"]
		}
	}
}
```

**Response** (429 Too Many Requests - Rate limited)

```json
{
	"error": {
		"code": "RATE_LIMIT_EXCEEDED",
		"message": "API rate limit exceeded",
		"details": {
			"retry_after": 60,
			"quota_reset": "2024-01-07T16:00:00Z"
		}
	}
}
```

**Response** (503 Service Unavailable - API service down)

```json
{
	"error": {
		"code": "SERVICE_UNAVAILABLE",
		"message": "Target API service is currently unavailable",
		"details": {
			"service": "Gmail API",
			"status_page": "https://status.google.com"
		}
	}
}
```

#### DELETE /api/v1/api-keys/:id

Delete a stored API key.

**Response** (204 No Content)

---

### Logs

#### GET /api/v1/mcps/:id/logs

Get logs for an MCP instance.

**Query Parameters**

-   `start_time` (ISO 8601): Start timestamp
-   `end_time` (ISO 8601): End timestamp
-   `level` (string): Filter by log level (debug, info, warn, error)
-   `limit` (number): Max logs to return (default: 100)
-   `offset` (number): Pagination offset

**Response**

```json
{
	"data": [
		{
			"id": "550e8400-e29b-41d4-a716-446655440004",
			"timestamp": "2024-01-07T15:30:45Z",
			"level": "info",
			"source": "process",
			"message": "Gmail API connection established",
			"metadata": {
				"api_version": "v1",
				"latency_ms": 250
			}
		}
	],
	"meta": {
		"total": 150,
		"limit": 100,
		"offset": 0
	}
}
```

#### POST /api/v1/mcps/:id/logs/export

Export logs for an MCP instance.

**Request Body**

```json
{
	"format": "json",
	"start_time": "2024-01-07T15:00:00Z",
	"end_time": "2024-01-07T16:00:00Z"
}
```

**Response**

```json
{
	"data": {
		"download_url": "https://api.minimcp.com/downloads/logs_550e8400.json",
		"expires_at": "2024-01-07T17:00:00Z",
		"size_bytes": 102400
	}
}
```

---

## Examples

### Authentication Example

```bash
# Step 1: Request token
curl -X POST http://localhost:5000/auth/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'

# Step 2: Check console for token, then verify
curl -X POST http://localhost:5000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456"
  }'
```

### Create Multiple Gmail MCPs

```bash
# Create first Gmail instance
curl -X POST https://api.minimcp.com/api/v1/mcps \
  -H "X-Session-Token: <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mcp_type": "gmail",
    "custom_name": "Work Gmail",
    "expiration_option": "1day",
    "credentials": {
      "api_key": "AIzaSyD-work-key",
      "client_secret": "GOCSPX-work-secret"
    }
  }'

# Create second Gmail instance
curl -X POST https://api.minimcp.com/api/v1/mcps \
  -H "X-Session-Token: <session_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mcp_type": "gmail",
    "custom_name": "Personal Gmail",
    "expiration_option": "6h",
    "credentials": {
      "api_key": "AIzaSyD-personal-key",
      "client_secret": "GOCSPX-personal-secret"
    }
  }'
```

### JavaScript SDK Example

```javascript
import { MiniMCPClient } from '@minimcp/sdk';

const client = new MiniMCPClient({
	apiKey: 'your-api-key',
	baseURL: 'https://api.minimcp.com',
});

// Create multiple MCP instances
const workGmail = await client.createMCP({
	type: 'gmail',
	customName: 'Work Gmail',
	expirationOption: '1day',
	credentials: {
		apiKey: 'work_api_key',
		clientSecret: 'work_client_secret',
	},
});

const personalGmail = await client.createMCP({
	type: 'gmail',
	customName: 'Personal Gmail',
	expirationOption: '6h',
	credentials: {
		apiKey: 'personal_api_key',
		clientSecret: 'personal_client_secret',
	},
});

console.log(`Work Gmail (instance ${workGmail.instanceNumber}): ${workGmail.accessUrl}`);
console.log(`Personal Gmail (instance ${personalGmail.instanceNumber}): ${personalGmail.accessUrl}`);

// Get logs
const logs = await client.getMCPLogs(mcp.id, {
	level: 'error',
	limit: 50,
});

// Poll for status updates
setInterval(async () => {
	const status = await client.getMCPStatus(mcp.id);
	console.log(`MCP ${mcp.id} status: ${status}`);
}, 5000); // Poll every 5 seconds
```

### Python Example

```python
import requests

# Create multiple Figma instances
figma_instances = []

for i, project in enumerate(['Design System', 'Mobile App', 'Web App'], 1):
    response = requests.post(
        'https://api.minimcp.com/api/v1/mcps',
        headers={
            'X-Session-Token': '<session_token>',
            'Content-Type': 'application/json'
        },
        json={
            'mcp_type': 'figma',
            'custom_name': f'{project} Figma',
            'expiration_option': '6h',
            'credentials': {
                'api_key': f'figma_key_{i}'
            }
        }
    )

    mcp = response.json()['data']
    figma_instances.append(mcp)
    print(f"Instance {mcp['instance_number']} - {project}: {mcp['access_url']}")

print(f"Created {len(figma_instances)} Figma instances")
```

## API Changelog

### v1.0.0 (2025-07-10) - Implementation Complete

**Implemented Features:**
-   ✅ Authentication endpoints (`/auth/request`, `/auth/verify`, `/auth/me`, `/auth/logout`)
-   ✅ MCP Types endpoints (`/api/v1/mcp-types`, `/api/v1/mcp-types/:name`)
-   ✅ MCP Instances endpoints (create, list, get, renew, toggle, edit, delete)
-   ✅ API Keys endpoints (store, validate, list, delete)
-   ✅ Logs endpoints (`/api/v1/mcps/:id/logs`, `/api/v1/mcps/:id/logs/export`)
-   ✅ Health check endpoints (`/health`, `/api/v1/health`)

**Development Features:**
-   ✅ Development mode includes auth tokens in response for testing
-   ✅ File-based logging system with user isolation
-   ✅ Log export in JSON, CSV, and TXT formats
-   ✅ Magic link authentication with JWT cookies
-   ✅ Comprehensive error handling and validation

**Technical Implementation:**
-   ✅ PostgreSQL database with migrations
-   ✅ Zod validation schemas
-   ✅ Express.js with TypeScript JSDoc support
-   ✅ Cookie-based authentication
-   ✅ Rate limiting and security middleware

## Next Steps

1. Review [Backend Architecture](./backend-architecture.md) for system design
2. Check [Security Architecture](./security-architecture.md) for authentication details
3. See [MCP Integration Guide](./mcp-integration-guide.md) for adding new MCP types
