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
- **MCP Lifecycle Management**: Create, monitor, expire, and restore MCP instances
- **Process Management**: Manage Node.js processes for each MCP instance
- **API Key Management**: Securely store and use API keys for different services
- **Logging & Monitoring**: Capture and store logs from MCP instances
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

### 3. **Event-Driven Communication**
- HTTP polling for status updates
- Event emitters for internal communication
- Simple background intervals for monitoring

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
│  │Gmail MCP│  │Figma MCP│  │GitHub   │  │   ...   │      │
│  │:3001    │  │:3002    │  │MCP :3003│  │  :3004  │      │
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
- **MCP Service**: Manages MCP lifecycle (create, restore, delete)
- **Process Service**: Manages Node.js processes for MCP instances
- **Log Service**: Handles log collection, storage, and retrieval
- **API Key Service**: Secure storage and retrieval of API credentials

#### 3. **Background Tasks**
Asynchronous processing:
- **Expiration Monitor**: Checks and expires MCPs based on TTL
- **Process Health Check**: Monitors process health and status
- **Cleanup Service**: Removes expired processes and resources
- **Port Manager**: Manages port allocation and deallocation

#### 4. **Data Layer**
- **PostgreSQL**: Primary datastore for all persistent data including process info, port assignments, and MCP metadata

#### 5. **Process Layer**
- **Node.js Processes**: Independent processes for each MCP instance
- **Port Assignment**: Each process runs on a unique port (3001, 3002, etc.)
- **Process Isolation**: Operating system level process boundaries

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 14+
- **Process Manager**: PM2 or built-in process management
- **Language**: JavaScript with JSDoc type annotations

### Key Libraries
- **pg**: PostgreSQL client with connection pooling
- **child_process**: Node.js process management
- **Simple polling**: HTTP-based status updates
- **winston**: Logging library
- **joi**: Request validation
- **bcrypt**: Password hashing (for future auth)
- **node-cron**: Scheduled jobs
- **find-free-port**: Dynamic port allocation

### Development Tools
- **TypeScript**: Type checking via JSDoc
- **Nodemon**: Development server
- **ESLint + Prettier**: Code quality
- **Jest**: Testing framework

## Data Flow

### MCP Creation Flow
```
1. Client Request → POST /api/mcps
2. API validates request (MCP type, expiration time)
3. API Key Service retrieves encrypted API key
4. Port Manager assigns available port
5. Process Service spawns new Node.js process with:
   - MCP type-specific server script
   - Environment variables (decrypted API key, assigned port)
   - Process ID tracking
6. MCP Service creates database record with process info
7. Generate unique access URL (http://localhost:PORT)
8. Start background monitoring
9. Return access URL to client
```

### MCP Access Flow
```
1. Client uses direct access URL (http://localhost:3001)
2. Request goes directly to MCP process
3. MCP process handles request and logs interaction
4. Background monitor updates last_accessed timestamp
```

### Log Aggregation Flow
```
1. Process generates logs to stdout/stderr
2. Log service monitors process output
3. Parse and structure log data
4. Store in PostgreSQL with MCP association
5. Make available via API
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

### Process Management Options
1. **PM2** (Production Process Manager)
2. **systemd** (System-level process management)  
3. **Built-in Process Manager** (Custom implementation)

### Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Winston**: Application logging
- **Process monitoring**: Built-in process health checks

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