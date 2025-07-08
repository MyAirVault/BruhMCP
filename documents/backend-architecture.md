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
- **Process Management**: Manage Node.js processes for each MCP instance
- **Credential Management**: Securely store and manage multiple credential types (API keys, client secrets, etc.)
- **Custom Instance Management**: Support user-defined names and active/inactive toggling
- **File-Based Logging & Monitoring**: Capture and store logs in isolated file system structure
- **Access Control**: Generate and manage secure access URLs for MCP instances

## Architecture Principles

### 1. **Process Isolation**
Each MCP instance runs as a separate Node.js process to ensure:
- Process boundaries between instances
- Independent port assignment per instance
- Clean process lifecycle management

### 2. **Stateless API Design**
The Express API layer remains stateless with:
- All state stored in PostgreSQL
- In-memory session management
- Processes as the only stateful components

### 3. **Simple Communication**
- Direct HTTP access to MCP processes
- File-based status updates
- Basic process monitoring via built-in Node.js APIs

### 4. **Security by Design**
- Encrypted API key storage
- Process isolation boundaries
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
│  • Process Service      │    │  • Process Health Check  │
│  • Log Service          │    │  • Cleanup Service       │
│  • API Key Service      │    │  • Port Manager          │
└──────────────────────────┘    └──────────────────────────┘
                │                               │
                ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL                               │
│  • MCP Instances         • API Keys (encrypted)            │
│  • Process Info          • Logs                            │
│  • Port Assignments      • MCP Types                       │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Process Layer                           │
│                   (Node.js Processes)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │My Gmail │  │Work Figma│  │Dev GitHub│  │Custom   │      │
│  │:3001    │  │:3002     │  │:3003     │  │Name:3004│      │
│  │(active) │  │(inactive)│  │(expires  │  │(never   │      │
│  │         │  │          │  │ 1day)    │  │expires) │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
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
- **Process Service**: Manages Node.js processes for MCP instances
- **Log Service**: Handles file-based log collection, storage, and retrieval
- **Credential Service**: Secure storage and retrieval of multiple credential types
- **Port Manager**: In-memory port allocation and management

#### 3. **Background Tasks**
Asynchronous processing:
- **Expiration Monitor**: Checks and expires MCPs based on expiration_option
- **Process Health Check**: Monitors process health and status
- **Cleanup Service**: Removes expired processes and archives logs
- **Log Rotation**: Automatic log file rotation and cleanup
- **Metrics Collection**: Gather JSON-based metrics per MCP instance

#### 4. **Data Layer**
- **PostgreSQL**: Primary datastore for core data (users, mcp_instances, mcp_credentials, mcp_types)
- **File System**: User-isolated logs and metrics storage
- **In-Memory**: Port management and process tracking

#### 5. **Process Layer**
- **Node.js Processes**: Independent processes for each MCP instance
- **Port Assignment**: Each process runs on a unique port (3001, 3002, etc.)
- **Process Isolation**: Operating system level process boundaries

## Technology Stack

### Core Technologies (Simplified)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ (minimal schema)
- **Process Manager**: Built-in Node.js child_process only
- **Language**: JavaScript with JSDoc type annotations

### Key Libraries (Minimal)
- **pg**: PostgreSQL client with basic connection pooling
- **child_process**: Node.js process spawning and management
- **winston**: File-based logging only
- **joi**: Request validation
- **crypto**: API key encryption
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
5. Credential Service stores encrypted credentials (supports multiple fields)
6. Port Manager assigns available port (basePort + (userId * 10) + instanceNum)
7. Process Service spawns new Node.js process with:
   - MCP type-specific server script
   - Environment variables (decrypted credentials, assigned port)
   - Process ID tracking
   - Instance identifier: user_{userId}_mcp_{mcpId}_{mcpType}_{instanceNum}
8. MCP Service creates database record with:
   - Custom name, instance_number, expiration option, credentials reference
   - Process info, port assignment
9. Generate unique access URL (http://localhost:PORT)
10. Start file-based monitoring in user-specific directory
11. Return access URL and instance details to client
```

### MCP Access Flow
```
1. Client uses direct access URL (http://localhost:3001)
2. Request goes directly to MCP process
3. MCP process handles request and logs interaction
4. Background monitor updates last_accessed timestamp
```

### File-Based Log Aggregation Flow
```
1. Process generates logs to stdout/stderr
2. Log service captures process output
3. Parse and structure log data
4. Store in user-isolated file structure:
   <project-root>/logs/users/user_{id}/mcp_{id}_{type}/
5. Make available via file-based API endpoints
6. Automatic log rotation and cleanup
```

### MCP Renewal Flow
```
1. Client Request → PUT /api/mcps/:id/renew
2. Validate MCP is expired and owned by user
3. Update expiration_option and calculate new expires_at
4. Update last_renewed_at timestamp
5. If process is dead, restart with existing credentials
6. Update database record with new expiration
7. Return renewed instance details
```

### MCP Toggle Flow
```
1. Client Request → PUT /api/mcps/:id/toggle
2. Validate MCP ownership and current status
3. Update is_active flag in database
4. If toggling to inactive: stop process but keep record
5. If toggling to active: restart process if needed
6. Return updated status
```

### MCP Edit Flow
```
1. Client Request → PUT /api/mcps/:id/edit
2. Validate MCP ownership and edit permissions
3. Update custom_name if provided
4. If credentials provided:
   - Encrypt and store new credentials
   - Restart process with new credentials
5. Update database record
6. Return updated instance details
```

### MCP Delete Flow
```
1. Client Request → DELETE /api/mcps/:id
2. Validate MCP ownership
3. Stop and kill process immediately
4. Release assigned port
5. Hard delete database records (mcp_instances, mcp_credentials)
6. Archive logs to separate location
7. Return deletion confirmation
```

## Scalability Considerations

### Horizontal Scaling
- **API Servers**: Multiple Express instances behind load balancer
- **Database**: Read replicas for query distribution
- **Process Distribution**: Distribute MCP processes across multiple servers

### Vertical Scaling
- **Process Resources**: Monitor and limit per-process CPU/memory usage
- **Database Connections**: Connection pooling optimization
- **Background Tasks**: Configurable monitoring intervals

### Performance Optimizations
- **In-Memory Caching**: Cache frequently accessed data in application memory
- **Database Indexes**: On process_id, status, port, created_at
- **Log Rotation**: Automatic cleanup of old logs
- **Port Pooling**: Reuse ports from terminated processes

## Deployment Architecture

### Development Environment
```
┌─────────────────┐
│   Developer     │
│   Machine       │
├─────────────────┤
│ • Node.js       │
│ • PM2           │
│ • PostgreSQL    │
│ • Frontend Dev  │
└─────────────────┘
```

### Production Environment
```
┌─────────────────┐     ┌─────────────────┐
│   Load          │────▶│   API Server    │
│   Balancer      │     │   + PM2         │
└─────────────────┘     └─────────────────┘
         │              ┌─────────────────┐
         └─────────────▶│   API Server    │
                        │   + PM2         │
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

### Simple Process Management
**Single Approach**: Built-in Node.js child_process spawning only
- No PM2 complexity
- No Docker containers  
- Simple process lifecycle management
- File-based logging per process

### Simple File-Based Monitoring
- **Winston**: File-based logging only (<project-root>/logs/users/user_{id}/mcp_{id}_{type}/)
- **JSON Metrics**: Simple metrics in files (metrics.json per MCP)
- **Process Health**: Basic process.kill(pid, 0) checks
- **HTTP Polling**: Real-time status updates via API endpoints
- **User Isolation**: Complete separation via file system structure
- **Log Rotation**: Automatic cleanup and archiving

## Security Considerations

### API Security
- Rate limiting per IP/user
- Request validation and sanitization
- CORS configuration
- API versioning

### Process Security
- Process isolation boundaries
- Non-privileged user execution
- Environment variable protection
- Resource usage monitoring

### Data Security
- Encrypted API keys at rest
- TLS for all communications
- Audit logging
- Regular security updates

## Next Steps

1. Review [Database Schema](./database-schema.md) for data model details
2. Check [API Documentation](./api-documentation.md) for endpoint specifications
3. See [Implementation Roadmap](./backend-implementation-roadmap.md) for development phases
4. Consult [Security Architecture](./security-architecture.md) for detailed security measures