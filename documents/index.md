# Documents Index

This file contains brief descriptions of all documents in the documents/ folder.

## Available Documents

### Architecture & Design
- **[backend-architecture.md](./backend-architecture.md)** - Simplified process-based architecture overview, component interactions, Node.js technology stack, and scalability considerations
- **[database-schema.md](./database-schema.md)** - Complete database schema design with process management tables, port allocation, relationships, and migration strategy
- **[security-architecture.md](./security-architecture.md)** - Security measures across all layers including authentication, encryption, process isolation, and compliance

### API & Integration
- **[api-documentation.md](./api-documentation.md)** - Complete REST API specification with direct URL endpoints, simplified access, error handling, and examples
- **[mcp-integration-guide.md](./mcp-integration-guide.md)** - Detailed guide for MCP process management, Node.js server scripts, lifecycle, and adding new MCP types

### Implementation & Operations
- **[backend-implementation-roadmap.md](./backend-implementation-roadmap.md)** - 10-week phased implementation plan focused on process management with milestones, deliverables, and testing strategy
- **[logging-monitoring.md](./logging-monitoring.md)** - Process-based observability strategy with user/MCP log isolation, process metrics, alerting, and troubleshooting

## Document Categories

- **Architecture**: System design and architectural decisions
  - backend-architecture.md
  - database-schema.md
  - security-architecture.md

- **API**: API documentation and endpoints
  - api-documentation.md

- **Database**: Database schema and migration guides
  - database-schema.md

- **Setup**: Installation and configuration guides
  - backend-implementation-roadmap.md

- **Development**: Development workflows and best practices
  - mcp-integration-guide.md
  - logging-monitoring.md

## Quick Reference

### For Developers
1. Start with [Backend Architecture](./backend-architecture.md) for simplified process-based system overview
2. Review [Database Schema](./database-schema.md) for process and port management data model
3. Check [API Documentation](./api-documentation.md) for direct URL endpoint details
4. Follow [Implementation Roadmap](./backend-implementation-roadmap.md) for development phases

### For DevOps/SRE
1. Study [Security Architecture](./security-architecture.md) for process isolation security measures
2. Review [Logging & Monitoring](./logging-monitoring.md) for process-based observability setup
3. Check [Implementation Roadmap](./backend-implementation-roadmap.md) for PM2-based deployment strategy

### For Product Teams
1. Review [API Documentation](./api-documentation.md) for simplified MCP access capabilities
2. Check [MCP Integration Guide](./mcp-integration-guide.md) for Node.js server-based integrations
3. Study [Implementation Roadmap](./backend-implementation-roadmap.md) for faster timeline and milestones

## Document Dependencies

```
backend-architecture.md (foundational)
├── database-schema.md
├── api-documentation.md
├── security-architecture.md
└── logging-monitoring.md

backend-implementation-roadmap.md (references all above, simplified process-based plan)
mcp-integration-guide.md (Node.js process management implementation details)
```

## Maintenance

These documents should be updated when:
- Architecture changes are made
- New features are added
- Security requirements change
- API endpoints are modified
- Database schema evolves

Last updated: 2024-01-07