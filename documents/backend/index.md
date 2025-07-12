# Documents Index

This file contains brief descriptions of all documents in the documents/ folder.

## Available Documents

### Architecture & Design
- **[backend-architecture.md](./backend-architecture.md)** - **Simplified Node.js process-based architecture** with file-based logging and basic process management (no Docker/PM2 complexity)
- **[database-schema.md](./database-schema.md)** - **Minimal database schema** with core tables only, file-based logging, and simple port management (no complex audit tables)
- **[database-setup.md](./database-setup.md)** - **Complete database setup guide** including PostgreSQL configuration, environment variables, migration scripts, and troubleshooting
- **[security-architecture.md](./security-architecture.md)** - **Basic security measures** focused on process isolation and file-based logging (no enterprise complexity)

### New Backend Architecture (2025-07-10)

The backend has been completely refactored to follow CLAUDE.md rules with a modular architecture:

#### Controllers (`/backend/src/controllers/`)

- **`apiKeys/`** - API key management controllers
  - `getAPIKeys.js` - Retrieve stored API keys
  - `storeAPIKey.js` - Store new API credentials
  - `deleteAPIKey.js` - Delete stored API keys
  - `validateCredentials.js` - Validate credentials against service APIs
  - `schemas.js` - API key validation schemas

- **`mcpInstances/`** - MCP instance management controllers
  - `crud/` - CRUD operations
    - `createMCP.js` - Create new MCP instances
    - `getMCPInstances.js` - List MCP instances with filtering
    - `getMCPInstance.js` - Get specific MCP instance
    - `editMCP.js` - Update MCP instance details
    - `deleteMCP.js` - Delete MCP instances
  - `logs/` - Log management
    - `getMCPLogs.js` - Retrieve MCP instance logs
    - `exportMCPLogs.js` - Export logs in various formats
  - `operations/` - MCP operations
    - `toggleMCP.js` - Toggle MCP active/inactive status
    - `renewMCP.js` - Renew expired MCP instances
  - `schemas.js` - MCP validation schemas
  - `utils.js` - MCP utility functions

- **`mcpTypes/`** - MCP type management controllers
  - `getMCPTypes.js` - List available MCP types
  - `getMCPTypeByName.js` - Get specific MCP type details

- **`authController.js`** - Authentication controller

#### Database Layer (`/backend/src/db/`)

- **`mcp-instances/`** - MCP instance database operations
  - `create-instance.js` - Create new MCP instances
  - `read-instances.js` - Query MCP instances
  - `update-instance.js` - Update MCP instances
  - `delete-instance.js` - Delete MCP instances
  - `instance-utilities.js` - Common instance utilities

- **`mcp-types/`** - MCP type database operations
  - `types-data.js` - MCP type data management
  - `upsert-type.js` - Insert/update MCP types
  - `type-verification.js` - Type verification logic
  - `credential-verification.js` - Credential validation
  - `connection-tests.js` - Connection testing utilities
  - `retrieval-tests.js` - Data retrieval testing
  - `test-reporting.js` - Test result reporting
  - `update-types.js` - Type update operations
  - `verify-update.js` - Update verification

- **Legacy Files** (maintained for compatibility)
  - `mcpInstancesQueries.js` - Legacy MCP instance queries
  - `mcpTypesQueries.js` - Legacy MCP type queries
  - `apiKeysQueries.js` - API key queries
  - `userQueries.js` - User management queries

#### MCP Server Architecture (`/backend/src/mcp-servers/`)

- **`config/`** - Server configuration
  - `service-configs.js` - Service-specific configurations

- **`handlers/`** - Request handlers
  - `endpoint-handlers.js` - API endpoint handlers
  - `resource-handlers.js` - Resource management handlers
  - `tool-handlers.js` - Tool-specific handlers

- **`routes/`** - MCP routing
  - `mcp-routes.js` - MCP server route definitions

- **`utils/`** - Server utilities
  - `server-setup.js` - Server setup and initialization

- **`universal-mcp-server.js`** - Universal MCP server implementation

#### Services (`/backend/src/services/`)

- **`process/`** - Process management services
  - `process-creation.js` - Process creation utilities
  - `process-monitoring.js` - Process monitoring and health checks
  - `process-utilities.js` - Common process utilities

- **Service Files**
  - `processManager.js` - Main process management service
  - `portManager.js` - Port allocation and management
  - `credentialValidationService.js` - Credential validation service
  - `authService.js` - Authentication service

This new architecture ensures:
- **Maximum 8 files per folder** (CLAUDE.md compliance)
- **Single responsibility** per module
- **Logical grouping** by domain (CRUD, logs, operations)
- **Clear separation** between controllers, database, and services
- **Modular design** for easy maintenance and testing

### API & Integration
- **[api-documentation.md](./api-documentation.md)** - Complete REST API specification with direct URL endpoints, simplified access, error handling, and examples
- **[mcp-integration-guide.md](./mcp-integration-guide.md)** - **Simple Node.js process management** guide with server scripts, basic lifecycle, and adding new MCP types (no Docker complexity)
- **[how-to-create-mcp-servers-simple.md](./how-to-create-mcp-servers-simple.md)** - **Comprehensive step-by-step guide** for creating MCP servers from any API documentation using the planned Node.js process-based architecture (implementation required)
- **[authentication-flow.md](./authentication-flow.md)** - **Magic link authentication with JWT cookies** - UUID-based magic links with React frontend integration, PostgreSQL user storage, and enhanced VerifyPage with fallback auth checks
- **[mcp-duplication-isolation.md](./mcp-duplication-isolation.md)** - **Simple MCP instance duplication** allowing multiple instances per user with basic process isolation (aligned with existing architecture)

### Frontend Components
- **[frontend/](./frontend/)** - Frontend component documentation and implementation guides
  - **[frontend/verify-page.md](./frontend/verify-page.md)** - Magic link verification page documentation
  - **[frontend/credential-validation-modals.md](./frontend/credential-validation-modals.md)** - **Credential validation UI flow** for API key testing and error handling in MCP creation modals

### Implementation & Operations
- **[logging-monitoring.md](./logging-monitoring.md)** - **File-based logging and monitoring** strategy with complete user/MCP isolation using simple file system approach (no Prometheus/Grafana complexity)

## Document Categories

- **Architecture**: System design and architectural decisions
  - backend-architecture.md
  - database-schema.md
  - security-architecture.md

- **API**: API documentation and endpoints
  - api-documentation.md
  - authentication-flow.md

- **Database**: Database schema and migration guides
  - database-schema.md

- **Setup**: Installation and configuration guides
  - (Configuration handled via CLAUDE.md)

- **Development**: Development workflows and best practices
  - mcp-integration-guide.md
  - how-to-create-mcp-servers-simple.md
  - mcp-duplication-isolation.md
  - logging-monitoring.md

## Quick Reference

### For Developers
1. Start with [Backend Architecture](./backend-architecture.md) for **simplified Node.js process-based system** overview
2. Review [Database Schema](./database-schema.md) for **minimal core tables** and file-based logging approach
3. Check [API Documentation](./api-documentation.md) for direct URL endpoint details
4. Review [Authentication Flow](./authentication-flow.md) for **magic link authentication with JWT cookies** implementation
5. Follow [MCP Server Creation Guide](./how-to-create-mcp-servers-simple.md) for **step-by-step API integration** process
6. Study [MCP Duplication & Isolation](./mcp-duplication-isolation.md) for **simple multi-instance MCP management** approach
7. Review [Credential Validation Modals](./frontend/credential-validation-modals.md) for **credential testing UI flow** implementation

### For DevOps/SRE
1. Study [Security Architecture](./security-architecture.md) for **basic process isolation** security measures
2. Review [Logging & Monitoring](./logging-monitoring.md) for **file-based observability** setup (no complex infrastructure)

### For Product Teams
1. Review [API Documentation](./api-documentation.md) for simplified MCP access capabilities
2. Check [Authentication Flow](./authentication-flow.md) for **magic link authentication with JWT cookies** process
3. Study [MCP Duplication & Isolation](./mcp-duplication-isolation.md) for **simple multi-instance MCP capabilities**
4. Check [MCP Integration Guide](./mcp-integration-guide.md) for **simple Node.js process-based** integrations

## Document Dependencies

```
backend-architecture.md (foundational)
├── database-schema.md
├── api-documentation.md
├── authentication-flow.md
├── mcp-duplication-isolation.md
├── security-architecture.md
└── logging-monitoring.md

mcp-integration-guide.md (**Simple Node.js process management** implementation details)
├── how-to-create-mcp-servers-simple.md (**Step-by-step API integration** guide)
```

## Maintenance

These documents should be updated when:
- Architecture changes are made
- New features are added
- Security requirements change
- API endpoints are modified
- Database schema evolves

Last updated: 2025-07-09