# Architecture Overview: Shared Instances

## Current vs Target Architecture

### Current Architecture (Dynamic Services)
```
User Request → Dynamic Process Creation → Unique Port Assignment → Service Response
```

- Each user activation spawns a new Node.js process
- Each process gets a unique port (49160-49999 range)
- Process lifecycle tied to user activation state
- Resource overhead: N users = N processes

### Target Architecture (Shared Instances)
```
User Authentication → Instance URL Generation → Shared Service Access → Isolated Response
```

- Static services start at server boot
- Multiple users share the same service process
- User isolation through instance-based authentication
- Resource efficiency: N users = 1 process per service type

## Core Components

### 1. Static Service Registry
- Central registry of all 373+ MCP services
- Service metadata from `mcp-ports/*/config.json`
- Static port assignments maintained from current configs
- Service health and availability tracking

### 2. Instance Management System
- Generates unique instance URLs per user per service
- Maps instance IDs to user authentication contexts
- Manages service access permissions
- Tracks user service usage

### 3. Authentication & Authorization
- Per-service API key validation and storage
- Encrypted credential management
- Request-level user context resolution
- Service-specific permission handling

### 4. Request Routing & Isolation
- Instance URL pattern: `/{instanceId}/{serviceType}/*`
- Context extraction from instance URLs
- User credential injection into service requests
- Response isolation and security

## Service Flow Example: Figma

### 1. Server Startup
```
PM2 starts → Figma MCP service (port 49160) → Ready for requests
```

### 2. User Onboarding
```
User enters API key → Validation → Storage → Instance ID generation
Result: fig_user_a_abc123
URL: https://domain.com/fig_user_a_abc123/figma/*
```

### 3. Request Processing
```
LLM Request: GET /fig_user_a_abc123/figma/get-file/12345
↓
Extract context: instance_id = "fig_user_a_abc123"
↓
Resolve user: user_id from instance mapping
↓
Fetch credentials: User A's Figma API key
↓
Service call: Figma API with User A's key
↓
Return: Isolated response to User A
```

### 4. Multi-User Isolation
```
User A: /fig_user_a_abc123/figma/* → Uses User A's API key
User B: /fig_user_b_def456/figma/* → Uses User B's API key
User C: /fig_user_c_ghi789/figma/* → Uses User C's API key
```
All requests processed by the same Figma service with different user contexts.

## Key Architectural Decisions

### 1. Hybrid Model
- **Static services** for performance and reliability
- **Instance-based URLs** for user familiarity and isolation
- **Shared processes** for resource efficiency

### 2. URL Structure
```
Pattern: /{service_prefix}_{user_id}_{random}/{service_type}/*
Example: /fig_user_a_abc123/figma/tools
```

### 3. Service Identification
- Service prefix from service type (fig, git, slack, etc.)
- User identifier for ownership
- Random component for security
- Service type for routing clarity

### 4. Authentication Flow
- API key validation at onboarding
- Encrypted storage in database
- Request-time credential injection
- Service-specific authentication patterns

## Scalability Considerations

### Horizontal Scaling
- Services can be load-balanced across multiple servers
- Instance-to-server mapping for distributed deployments
- Shared database for user authentication state

### Vertical Scaling
- PM2 cluster mode for CPU-intensive services
- Memory management for high-usage services
- Connection pooling for database access

### Performance Optimization
- Service health monitoring
- Request caching where appropriate
- API rate limiting per user per service
- Resource usage tracking and alerting

## Security Model

### User Isolation
- Complete request context separation
- No cross-user data access
- Encrypted credential storage
- Instance URL randomization

### Service Security
- API key validation before storage
- Encrypted credential transmission
- Service-specific security patterns
- Audit logging for user actions

### Network Security
- Internal service communication only
- External API access through service credentials
- Request validation and sanitization
- Rate limiting and abuse prevention