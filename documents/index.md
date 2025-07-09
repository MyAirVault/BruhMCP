# Documents Index

This file contains brief descriptions of all documents in the documents/ folder.

## Available Documents

### Architecture & Design
- **[backend-architecture.md](./backend-architecture.md)** - **Simplified Node.js process-based architecture** with file-based logging and basic process management (no Docker/PM2 complexity)
- **[database-schema.md](./database-schema.md)** - **Minimal database schema** with core tables only, file-based logging, and simple port management (no complex audit tables)
- **[security-architecture.md](./security-architecture.md)** - **Basic security measures** focused on process isolation and file-based logging (no enterprise complexity)

### API & Integration
- **[api-documentation.md](./api-documentation.md)** - Complete REST API specification with direct URL endpoints, simplified access, error handling, and examples
- **[mcp-integration-guide.md](./mcp-integration-guide.md)** - **Simple Node.js process management** guide with server scripts, basic lifecycle, and adding new MCP types (no Docker complexity)
- **[authentication-flow.md](./authentication-flow.md)** - **Magic link authentication with JWT cookies** - UUID-based magic links with React frontend integration and PostgreSQL user storage
- **[mcp-duplication-isolation.md](./mcp-duplication-isolation.md)** - **Simple MCP instance duplication** allowing multiple instances per user with basic process isolation (aligned with existing architecture)

### Frontend Components
- **[frontend/](./frontend/)** - Frontend component documentation and implementation guides
  - **[frontend/verify-page.md](./frontend/verify-page.md)** - Magic link verification page documentation

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
  - mcp-duplication-isolation.md
  - logging-monitoring.md

## Quick Reference

### For Developers
1. Start with [Backend Architecture](./backend-architecture.md) for **simplified Node.js process-based system** overview
2. Review [Database Schema](./database-schema.md) for **minimal core tables** and file-based logging approach
3. Check [API Documentation](./api-documentation.md) for direct URL endpoint details
4. Review [Authentication Flow](./authentication-flow.md) for **magic link authentication with JWT cookies** implementation
5. Study [MCP Duplication & Isolation](./mcp-duplication-isolation.md) for **simple multi-instance MCP management** approach

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
```

## Maintenance

These documents should be updated when:
- Architecture changes are made
- New features are added
- Security requirements change
- API endpoints are modified
- Database schema evolves

Last updated: 2025-01-08