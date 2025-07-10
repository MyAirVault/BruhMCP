# MiniMCP Documentation Index

This file provides a comprehensive overview of all documentation in the MiniMCP project.

## Project Overview

MiniMCP is a full-stack web application featuring:
- **Frontend**: Vite + TypeScript + React + Tailwind CSS
- **Backend**: Express + JSDoc with TypeScript compiler
- **Database**: PostgreSQL

## Documentation Structure

### Backend Documentation (`/backend/`)
Contains technical documentation for server-side components and architecture:

- **[Backend Index](./backend/index.md)** - Complete overview of backend documentation
- **[Backend Architecture](./backend/backend-architecture.md)** - Simplified Node.js process-based architecture
- **[Database Schema](./backend/database-schema.md)** - Minimal database schema with core tables
- **[API Documentation](./backend/api-documentation.md)** - Complete REST API specification
- **[Authentication Flow](./backend/authentication-flow.md)** - Magic link authentication with JWT cookies
- **[Security Architecture](./backend/security-architecture.md)** - Basic security measures and process isolation
- **[Logging & Monitoring](./backend/logging-monitoring.md)** - File-based logging and monitoring strategy
- **[MCP Integration Guide](./backend/mcp-integration-guide.md)** - **UPDATED 2025-07-10** - Current implementation of MCP server creation and management
- **[MCP Duplication & Isolation](./backend/mcp-duplication-isolation.md)** - Simple MCP instance duplication

### Frontend Documentation (`/frontend/`)
Contains documentation for client-side components and user interface:

- **[Frontend Index](./frontend/index.md)** - Complete overview of frontend documentation
- **[Login Page](./frontend/login-page.md)** - Main login page with email input and magic link request
- **[Verify Page](./frontend/verify-page.md)** - Magic link verification page handling
- **[Dashboard Page](./frontend/dashboard-page.md)** - Protected dashboard page with logout functionality
- **[Logs Page](./frontend/logs-page.md)** - Logs viewing page with filtering and export capabilities
- **[Magic Link Popup](./frontend/magic-link-popup.md)** - Popup component with polling-based authentication
- **[Credential Validation Modals](./frontend/credential-validation-modals.md)** - Credential validation UI flow
- **[Frontend Enhancements](./frontend/frontend-enhancements.md)** - Latest UI/UX improvements

### Standalone Documentation
- **[How to Create MCP Servers](./how-to-create-mcp-servers-simple.md)** - Comprehensive step-by-step guide for creating MCP servers from any API documentation

## Quick Start Guide

### For New Developers
1. Start with [Backend Architecture](./backend/backend-architecture.md) for system overview
2. Review [Database Schema](./backend/database-schema.md) for data structure
3. Check [API Documentation](./backend/api-documentation.md) for endpoint details
4. Review [Authentication Flow](./backend/authentication-flow.md) for login implementation
5. Study [Frontend Index](./frontend/index.md) for UI component structure

### For API Integration
1. Follow [MCP Server Creation Guide](./how-to-create-mcp-servers-simple.md) for step-by-step process
2. Review [MCP Integration Guide](./backend/mcp-integration-guide.md) for implementation details
3. Check [API Documentation](./backend/api-documentation.md) for endpoint specifications

### For Security & Operations
1. Study [Security Architecture](./backend/security-architecture.md) for security measures
2. Review [Logging & Monitoring](./backend/logging-monitoring.md) for observability setup
3. Check [MCP Duplication & Isolation](./backend/mcp-duplication-isolation.md) for multi-instance management

## Document Categories

### Architecture & Design
- Backend Architecture
- Database Schema
- Security Architecture
- Frontend Structure

### API & Integration
- API Documentation
- Authentication Flow
- MCP Integration Guide
- MCP Server Creation Guide

### User Interface
- Login & Authentication Pages
- Dashboard & Profile Pages
- Logs & Monitoring Pages
- UI Components & Enhancements

### Operations & Monitoring
- Logging & Monitoring
- Security Measures
- Process Management

## Development Workflow

1. **Setup**: Follow project setup instructions in CLAUDE.md
2. **Architecture**: Understand system design through backend/frontend indexes
3. **Implementation**: Use API documentation and integration guides
4. **Testing**: Follow testing guidelines in component documentation
5. **Deployment**: Review security and monitoring documentation

## Maintenance

These documents should be updated when:
- Architecture changes are made
- New features are added
- Security requirements change
- API endpoints are modified
- Database schema evolves
- UI components are enhanced

Last updated: 2025-07-10

## Recent Updates (2025-07-10)

### Major Documentation Updates

- **[MCP Integration Guide](./backend/mcp-integration-guide.md)** - **COMPLETELY REWRITTEN** to reflect actual implementation
  - Removed outdated complex process management documentation
  - Added accurate description of current simplified flow
  - Updated examples to match real API calls and responses
  - Added practical troubleshooting for current system
  - Documented actual credential validation process

### Current Implementation Status

The MiniMCP system currently implements:

✅ **Working Features:**
- Frontend MCP server creation with token input
- Real credential validation against service APIs (Figma, GitHub, Gmail)
- Isolated Node.js process creation per MCP server
- Direct URL access to user's data (`http://localhost:PORT`)
- Basic health monitoring and process management

🚧 **Limitations:**
- Manual MCP server implementation (each service requires coding)
- Basic process monitoring (no automatic recovery)
- Simple credential storage (no rotation)

📋 **Next Development Priorities:**
- Automatic MCP server generation from API documentation  
- Enhanced process monitoring and recovery
- Advanced credential management