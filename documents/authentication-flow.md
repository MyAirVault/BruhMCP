# Authentication Flow

## Overview

**Token-based authentication only** - No user management system planned. Simple email-based token authentication for easy login. User enters email → gets token → verifies token → logged in.

**Current Implementation**: This is the final authentication approach for the system. No migration to complex user management is planned.

## Authentication Flow

### Step 1: Request Token
**User Action**: Enter email address
**Endpoint**: `POST /auth/request`
**Process**:
1. User submits email
2. Server generates random token
3. Server stores token in memory: `{token: {email, expiry}}`
4. Server logs token to console (for development)
5. User copies token from console/logs

### Step 2: Verify Token
**User Action**: Enter/paste token
**Endpoint**: `POST /auth/verify`
**Process**:
1. Server checks if token exists in memory
2. Server validates token not expired (15 minutes)
3. If valid, create simple session
4. User logged in

## Implementation

### Token Storage
- **In-memory Map**: `const authTokens = new Map()`
- **Token format**: Random 16-character string
- **Expiry**: 15 minutes from generation
- **Cleanup**: Remove expired tokens every 5 minutes

### Session Management
- **Simple sessions**: `const sessions = new Map()`
- **Session data**: `{userId: email, createdAt: timestamp}`
- **Session expiry**: 24 hours
- **No persistence**: Sessions cleared on server restart

### API Endpoints

#### POST /auth/request
```javascript
{
  "email": "user@example.com"
}
```

#### POST /auth/verify
```javascript
{
  "token": "abc123def456"
}
```

## Security

### Token Generation
- Use `crypto.randomBytes(8).toString('hex')`
- 16-character hex string
- No special characters for easy copy/paste

### Basic Protection
- Rate limit: 5 requests per minute per IP
- Token cleanup on expiry
- No password storage needed

## Error Handling

Simple error responses:
- `TOKEN_NOT_FOUND`: Token doesn't exist
- `TOKEN_EXPIRED`: Token expired
- `INVALID_EMAIL`: Email format invalid
- `RATE_LIMITED`: Too many requests

## Development Setup

1. User enters email in frontend form
2. Token logged to console: `Auth token for user@example.com: abc123def456`
3. User copies token from console
4. User enters token in verification form
5. User logged in

This approach eliminates email service complexity while maintaining security for development and testing.