# Backend Architecture Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Component Architecture](#component-architecture)
4. [Technology Stack](#technology-stack)
5. [Data Flow](#data-flow)
6. [Scalability Considerations](#scalability-considerations)
7. [Deployment Architecture](#deployment-architecture)

## System Overview

The MiniMCP backend is a Node.js-based system designed to manage isolated Model Context Protocol (MCP) instances. Each MCP instance runs as a separate Node.js process with specific API integrations (Gmail, Figma, GitHub, etc.) and has a defined lifecycle with expiration times.

### Core Responsibilities
- **MCP Lifecycle Management**: Create, monitor, expire, renew, and delete MCP instances
- **Handler Management**: Manage Express route handlers for each MCP instance
- **Credential Management**: Securely store and manage multiple credential types (API keys, client secrets, etc.)
- **Custom Instance Management**: Support user-defined names and active/inactive toggling
- **File-Based Logging & Monitoring**: Capture and store logs in isolated file system structure
- **Access Control**: Generate and manage secure access URLs for MCP instances

## Architecture Principles

### 1. **Handler Isolation**
Each MCP instance runs as a separate Express route handler to ensure:
- Route boundaries between instances
- Independent route assignment per instance
- Clean handler lifecycle management

### 2. **Stateless API Design**
The Express API layer remains stateless with:
- All state stored in PostgreSQL
- In-memory session management
- Handlers as the only stateful components

### 3. **Simple Communication**
- Direct HTTP access to MCP handlers via routes
- File-based status updates
- Basic handler monitoring via Express middleware

### 4. **Security by Design**
- Plain text API key storage (encryption to be added later)
- Handler isolation boundaries
- Least privilege access principles

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│                   (React Frontend - Port 5173)              │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
│                    (Express.js - Port 5000)                 │
├─────────────────────────────────────────────────────────────┤
│  • REST API Endpoints                                       │
│  • HTTP API Server                                          │
│  • Request Validation                                       │
│  • Rate Limiting                                           │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│     Service Layer        │    │    Background Tasks      │
├──────────────────────────┤    ├──────────────────────────┤
│  • MCP Service          │    │  • Expiration Monitor    │
│  • Handler Service      │    │  • Handler Health Check  │
│  • Log Service          │    │  • Cleanup Service       │
│  • API Key Service      │    │  • Route Manager         │
└──────────────────────────┘    └──────────────────────────┘
                │                               │
                ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL                               │
│  • MCP Instances         • API Keys (plain text)           │
│  • Handler Info          • Logs                            │
│  • Route Assignments     • MCP Types                       │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Handler Layer                           │
│                   (Express Handlers)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │My Gmail │  │Work Figma│  │Dev GitHub│  │Custom   │      │
│  │/mcp/abc │  │/mcp/def  │  │/mcp/ghi  │  │Name     │      │
│  │(active) │  │(inactive)│  │(expires  │  │/mcp/jkl │      │
│  │         │  │          │  │ 1day)    │  │(never   │      │
│  └─────────┘  └─────────┘  └─────────┘  │expires) │      │
│                                          └─────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Descriptions

#### 1. **API Gateway Layer**
- **Express.js Server**: Handles HTTP requests
- **Middleware Stack**: CORS, body parsing, authentication (future), rate limiting
- **Route Handlers**: Organized by resource type (MCPs, logs, settings)

#### 2. **Service Layer**
Business logic components:
- **MCP Service**: Manages complete MCP lifecycle (create, renew, toggle, edit, delete)
- **Handler Service**: Manages Express route handlers for MCP instances
- **Log Service**: Handles file-based log collection, storage, and retrieval
- **Credential Service**: Secure storage and retrieval of multiple credential types
- **Route Manager**: In-memory route allocation and management

#### 3. **Background Tasks**
Asynchronous processing:
- **Expiration Monitor**: Checks and expires MCPs based on expiration_option
- **Handler Health Check**: Monitors handler health and status
- **Cleanup Service**: Removes expired handlers and archives logs
- **Log Rotation**: Automatic log file rotation and cleanup
- **Metrics Collection**: Gather JSON-based metrics per MCP instance

#### 4. **Data Layer**
- **PostgreSQL**: Primary datastore for core data (users, mcp_instances, mcp_credentials, mcp_types)
- **File System**: User-isolated logs and metrics storage
- **In-Memory**: Route management and handler tracking

#### 5. **Handler Layer**
- **Express Handlers**: Independent route handlers for each MCP instance
- **Route Assignment**: Each handler has a unique route (/mcp/{instanceId})
- **Handler Isolation**: Application level handler boundaries

## Technology Stack

### Core Technologies (Simplified)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ (minimal schema)
- **Process Manager**: Built-in Node.js child_process only
- **Language**: JavaScript with JSDoc type annotations

### Key Libraries (Minimal)
- **pg**: PostgreSQL client with basic connection pooling
- **express**: Node.js routing and middleware management
- **winston**: File-based logging only
- **joi**: Request validation
- **fs**: File system operations for logs and metrics

### Development Tools
- **TypeScript**: Type checking via JSDoc
- **Nodemon**: Development server
- **ESLint + Prettier**: Code quality
- **Jest**: Testing framework

## Data Flow

### MCP Creation Flow
```
1. Client Request → POST /api/mcps
2. API validates request (MCP type, custom_name, expiration_option, credentials)
3. Check instance limit (max 10 per user)
4. Generate instance number (next available for user/type)
5. Credential Service stores plain text credentials (supports multiple fields)
6. Route Manager assigns available route (/mcp/{instanceId})
7. Handler Service creates new Express route handler with:
   - MCP type-specific handler logic
   - Handler context (credentials, instance info)
   - Configuration from database config JSONB field
   - Handler ID tracking
   - Instance identifier: user_{userId}_mcp_{mcpId}_{mcpType}_{instanceNum}
8. MCP Service creates database record with:
   - Custom name, instance_number, expiration option, credentials reference
   - Handler info, route assignment
9. Generate unique access URL (http://localhost:3000/mcp/{instanceId})
10. Start file-based monitoring in user-specific directory
11. Return access URL and instance details to client
```

### MCP Access Flow
```
1. Client uses direct access URL (http://localhost:3000/mcp/{instanceId})
2. Request goes to Express app and routes to specific MCP handler
3. MCP handler processes request and logs interaction
4. Background monitor updates last_accessed timestamp
```

### File-Based Log Aggregation Flow
```
1. Handler generates logs via middleware
2. Log service captures handler output
3. Parse and structure log data
4. Store in user-isolated file structure:
   ./logs/users/user_{userId}/mcp_{mcpId}_{mcpType}_{instanceNum}/
5. Make available via file-based API endpoints
6. Automatic log rotation and cleanup
```

### MCP Renewal Flow
```
1. Client Request → PUT /api/mcps/:id/renew
2. Validate MCP is expired and owned by user
3. Update expiration_option and calculate new expires_at
4. Update last_renewed_at timestamp
5. If handler is inactive, restart with existing credentials
6. Update database record with new expiration
7. Return renewed instance details
```

### MCP Toggle Flow
```
1. Client Request → PUT /api/mcps/:id/toggle
2. Validate MCP ownership and current status
3. Update is_active flag in database
4. If toggling to inactive: stop handler but keep record
5. If toggling to active: restart handler if needed
6. Return updated status
```

### MCP Edit Flow
```
1. Client Request → PUT /api/mcps/:id/edit
2. Validate MCP ownership and edit permissions
3. Update custom_name if provided
4. If credentials provided:
   - Store new credentials as plain text
   - Restart handler with new credentials
5. Update database record
6. Return updated instance details
```

### MCP Delete Flow
```
1. Client Request → DELETE /api/mcps/:id
2. Validate MCP ownership
3. Stop and remove handler immediately
4. Release assigned route
5. Hard delete database records (mcp_instances, mcp_credentials)
6. Archive logs to separate location
7. Return deletion confirmation
```

## Error Handling Procedures

### Handler Failure Recovery
```javascript
// Error handling for handler failures
class HandlerErrorHandler {
  async handleHandlerFailure(handlerId, error) {
    // Log failure details
    logger.error(`Handler ${handlerId} failed`, { error, timestamp: new Date() });
    
    // Update database status
    await mcpInstancesService.updateStatus(handlerId, 'failed');
    
    // Auto-restart if configured
    if (config.autoRestart) {
      await this.restartHandler(handlerId);
    }
    
    // Notify monitoring system
    await notificationService.sendAlert('HANDLER_FAILURE', { handlerId, error });
  }
}
```

### Route Allocation Failure Recovery
```javascript
// Handle route allocation failures
class RouteAllocationErrorHandler {
  async handleRouteAllocationFailed(userId, instanceId, error) {
    // Find alternative route
    const alternativeRoute = await routeManager.findAlternativeRoute(userId, instanceId);
    
    if (alternativeRoute) {
      return alternativeRoute;
    }
    
    // If no alternative, fail gracefully
    throw new Error('ROUTE_ALLOCATION_FAILED: No available routes');
  }
}
```

## Scalability Considerations

### Horizontal Scaling
- **API Servers**: Multiple Express instances behind load balancer
- **Database**: Read replicas for query distribution
- **Handler Distribution**: Distribute MCP handlers across multiple servers

### Vertical Scaling
- **Handler Resources**: Monitor and limit per-handler CPU/memory usage
- **Database Connections**: Connection pooling optimization
- **Background Tasks**: Configurable monitoring intervals

### Performance Optimizations
- **In-Memory Caching**: Cache frequently accessed data in application memory
- **Database Indexes**: On process_id, status, port, created_at
- **Log Rotation**: Automatic cleanup of old logs
- **Route Pooling**: Reuse routes from terminated handlers

## Deployment Architecture

### Development Environment
```
┌─────────────────┐
│   Developer     │
│   Machine       │
├─────────────────┤
│ • Node.js       │
│ • Node.js       │
│ • PostgreSQL    │
│ • Frontend Dev  │
└─────────────────┘
```

### Production Environment
```
┌─────────────────┐     ┌─────────────────┐
│   Load          │────▶│   API Server    │
│   Balancer      │     │   + Node.js     │
└─────────────────┘     └─────────────────┘
         │              ┌─────────────────┐
         └─────────────▶│   API Server    │
                        │   + Node.js     │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   PostgreSQL    │
                        │   (Primary)      │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   MCP Process   │
                        │   Management    │
                        └─────────────────┘
```

### Simple Handler Management
**Single Approach**: Built-in Express route handlers only
- No PM2 complexity
- No Docker containers  
- Simple handler lifecycle management
- File-based logging per handler

### Simple File-Based Monitoring
- **Winston**: File-based logging only (./logs/users/user_{id}/mcp_{id}_{type}/)
- **JSON Metrics**: Simple metrics in files (metrics.json per MCP)
- **Handler Health**: Basic handler status checks
- **HTTP Polling**: Real-time status updates via API endpoints
- **User Isolation**: Complete separation via file system structure
- **Log Rotation**: Automatic cleanup and archiving

## Security Considerations

### API Security
- Rate limiting per IP/user
- Request validation and sanitization
- CORS configuration
- API versioning

### Handler Security
- Handler isolation boundaries
- Non-privileged handler execution
- Context variable protection
- Resource usage monitoring

### Data Security
- Plain text API keys at rest (encryption to be added later)
- TLS for all communications
- Audit logging
- Regular security updates

## Next Steps

1. Review [Database Schema](./database-schema.md) for data model details
2. Check [API Documentation](./api-documentation.md) for endpoint specifications
3. See [MCP Integration Guide](./mcp-integration-guide.md) for implementation details
4. Consult [Security Architecture](./security-architecture.md) for detailed security measures