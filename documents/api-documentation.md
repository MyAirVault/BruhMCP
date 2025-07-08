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

> **Note**: Authentication is planned for future implementation. Current documentation shows the intended design.

### Bearer Token Authentication
```http
Authorization: Bearer <access_token>
```

### API Key Authentication (for MCP access)
```http
X-MCP-Access-Token: <mcp_access_token>
```

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
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

- **Default limit**: 100 requests per minute per IP
- **Authenticated users**: 1000 requests per minute
- **MCP creation**: 10 per hour per user

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
- `active` (boolean): Filter by active status

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
  "expiration_minutes": 30,
  "config": {
    "custom_setting": "value"
  }
}
```

**Response** (201 Created)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "access_token": "mcp_acc_1234567890abcdef",
    "access_url": "http://localhost:3001",
    "assigned_port": 3001,
    "status": "pending",
    "expires_at": "2024-01-07T16:00:00Z",
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
- `status` (string): Filter by status (pending, running, expired, disconnected)
- `mcp_type` (string): Filter by MCP type
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sort` (string): Sort field (created_at, expires_at)
- `order` (string): Sort order (asc, desc)

**Response**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "access_token": "mcp_acc_1234567890abcdef",
      "access_url": "http://localhost:3001",
      "assigned_port": 3001,
      "process_id": 12345,
      "status": "running",
      "expires_at": "2024-01-07T16:00:00Z",
      "last_accessed": "2024-01-07T15:35:00Z",
      "mcp_type": {
        "name": "gmail",
        "display_name": "Gmail MCP",
        "icon_url": "https://example.com/gmail-icon.png"
      },
      "stats": {
        "cpu_percent": 15.2,
        "memory_mb": 256
      },
      "created_at": "2024-01-07T15:30:00Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
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
    "access_token": "mcp_acc_1234567890abcdef",
    "access_url": "http://localhost:3001",
    "assigned_port": 3001,
    "process_id": 12345,
    "status": "running",
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

#### PUT /api/v1/mcps/:id/restore
Restore a disconnected MCP instance.

**Response**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "status": "running",
    "message": "MCP instance restored successfully"
  }
}
```

#### DELETE /api/v1/mcps/:id
Terminate an MCP instance.

**Response** (204 No Content)

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
      "mcp_type": {
        "name": "gmail",
        "display_name": "Gmail MCP"
      },
      "key_hint": "...cdef",
      "is_active": true,
      "created_at": "2024-01-07T15:00:00Z",
      "expires_at": null
    }
  ]
}
```

#### POST /api/v1/api-keys
Store a new API key.

**Request Body**
```json
{
  "mcp_type": "gmail",
  "api_key": "AIzaSyD-1234567890abcdef"
}
```

**Response** (201 Created)
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "mcp_type": {
      "name": "gmail",
      "display_name": "Gmail MCP"
    },
    "key_hint": "...cdef",
    "message": "API key stored successfully"
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
- `start_time` (ISO 8601): Start timestamp
- `end_time` (ISO 8601): End timestamp
- `level` (string): Filter by log level (debug, info, warn, error)
- `limit` (number): Max logs to return (default: 100)
- `offset` (number): Pagination offset

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

### Settings

#### GET /api/v1/settings
Get user settings.

**Response**
```json
{
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "preferences": {
      "default_expiration_minutes": 60,
      "notifications_enabled": true
    },
    "limits": {
      "max_concurrent_mcps": 10,
      "max_api_keys": 20
    }
  }
}
```

#### PATCH /api/v1/settings
Update user settings.

**Request Body**
```json
{
  "preferences": {
    "default_expiration_minutes": 30,
    "notifications_enabled": false
  }
}
```

**Response**
```json
{
  "data": {
    "message": "Settings updated successfully",
    "preferences": {
      "default_expiration_minutes": 30,
      "notifications_enabled": false
    }
  }
}
```


## Examples

### Create Gmail MCP with cURL
```bash
curl -X POST https://api.minimcp.com/api/v1/mcps \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "mcp_type": "gmail",
    "expiration_minutes": 30
  }'
```

### JavaScript SDK Example
```javascript
import { MiniMCPClient } from '@minimcp/sdk';

const client = new MiniMCPClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.minimcp.com'
});

// Create MCP instance
const mcp = await client.createMCP({
  type: 'gmail',
  expirationMinutes: 30
});

// Access MCP
console.log(`Access URL: ${mcp.accessUrl}`);

// Get logs
const logs = await client.getMCPLogs(mcp.id, {
  level: 'error',
  limit: 50
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

# Create MCP
response = requests.post(
    'https://api.minimcp.com/api/v1/mcps',
    headers={
        'Authorization': 'Bearer <access_token>',
        'Content-Type': 'application/json'
    },
    json={
        'mcp_type': 'figma',
        'expiration_minutes': 60
    }
)

mcp = response.json()['data']
print(f"Access token: {mcp['access_token']}")
```

## API Changelog

### v1.0.0 (2024-01-07)
- Initial API release
- MCP instance management
- Log aggregation
- HTTP polling for status updates

## Next Steps

1. Review [Backend Architecture](./backend-architecture.md) for system design
2. Check [Security Architecture](./security-architecture.md) for authentication details
3. See [MCP Integration Guide](./mcp-integration-guide.md) for adding new MCP types