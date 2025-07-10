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
- **[MCP Duplication & Isolation](./backend/mcp-duplication-isolation.md)** - **UPDATED 2025-07-10** - UUID-based instance isolation architecture

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

### Architecture Documentation (New - 2025-07-10)
- **[Component Organization Patterns](./component-organization-patterns.md)** - Comprehensive guide to the new component organization patterns implementing CLAUDE.md compliance
- **[Custom Hooks and Utilities](./custom-hooks-utilities.md)** - Documentation for custom hooks and utility functions that support the refactored architecture

## Quick Start Guide

### For New Developers
1. Start with [Backend Architecture](./backend/backend-architecture.md) for system overview
2. Review [Database Schema](./backend/database-schema.md) for data structure
3. Check [API Documentation](./backend/api-documentation.md) for endpoint details
4. Review [Authentication Flow](./backend/authentication-flow.md) for login implementation
5. Study [Frontend Index](./frontend/index.md) for UI component structure
6. **NEW**: Review [Component Organization Patterns](./component-organization-patterns.md) for code structure guidelines
7. **NEW**: Study [Custom Hooks and Utilities](./custom-hooks-utilities.md) for frontend architecture patterns

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
- **NEW**: Component Organization Patterns
- **NEW**: Custom Hooks and Utilities

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
- **NEW**: Refactored Component Architecture

### Operations & Monitoring
- Logging & Monitoring
- Security Measures
- Process Management

### Development Guidelines
- **NEW**: CLAUDE.md Compliance Patterns
- **NEW**: Component Splitting Strategies
- **NEW**: Hook and Utility Organization

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

### Major Infrastructure Fixes & Improvements

- **Port Management & Cleanup Fixes** - **COMPLETED 2025-07-10**
  - Fixed port manager to sync with database on initialization
  - Enhanced process cleanup to ensure proper port release
  - **UPDATED**: Changed port range to 49160-49999 (dynamic port range)
  - Implemented port conflict prevention and resource leak detection
  - Added comprehensive verification testing with 15 test scenarios
  - Created automated verification agent for continuous testing

- **Duplicate Service Support** - **COMPLETED 2025-07-10**
  - Implemented support for multiple instances of same MCP type (e.g., 2 Figma MCPs)
  - Fixed credential isolation for independent instances
  - Updated database constraints to properly support duplicates
  - Added comprehensive testing for multiple instance scenarios
  - Each instance gets unique ports, credentials, and process isolation

### Major Documentation Updates

- **[MCP Integration Guide](./backend/mcp-integration-guide.md)** - **COMPLETELY REWRITTEN** to reflect actual implementation
  - Removed outdated complex process management documentation
  - Added accurate description of current simplified flow
  - Updated examples to match real API calls and responses
  - Added practical troubleshooting for current system
  - Documented actual credential validation process

### New Architecture Documentation

- **[Component Organization Patterns](./component-organization-patterns.md)** - **NEW DOCUMENT**
  - Comprehensive guide to CLAUDE.md compliance patterns
  - Frontend and backend organization strategies
  - Component splitting methodologies
  - File size and complexity guidelines
  - Migration strategies for existing code

- **[Custom Hooks and Utilities](./custom-hooks-utilities.md)** - **NEW DOCUMENT**
  - Documentation for all custom React hooks
  - Utility function specifications and usage
  - Integration patterns and testing strategies
  - Examples and best practices

### Frontend Architecture Refactoring

- **[Frontend Index](./frontend/index.md)** - **MAJOR UPDATE**
  - Complete component structure documentation
  - New subdirectory organization (dashboard/, logs/, modals/, ui/, etc.)
  - Custom hooks and utilities documentation
  - Updated component responsibilities and relationships

### Backend Architecture Refactoring

- **[Backend Index](./backend/index.md)** - **MAJOR UPDATE**
  - New modular controller architecture
  - Database layer reorganization
  - MCP server structure documentation
  - Service layer improvements

### Current Implementation Status

The MiniMCP system currently implements:

✅ **Working Features:**
- Frontend MCP server creation with token input
- Real credential validation against service APIs (Figma, GitHub, Gmail)
- Isolated Node.js process creation per MCP server
- Direct URL access to user's data (`http://localhost:PORT`)
- **NEW**: Enhanced port management with database synchronization
- **NEW**: Multiple instances of same MCP type support (e.g., 2 Figma MCPs)
- **NEW**: Proper process cleanup and port release
- **NEW**: Comprehensive verification testing suite

🚧 **Limitations:**
- Manual MCP server implementation (each service requires coding)
- Basic process monitoring (no automatic recovery)
- Simple credential storage (no rotation)

📋 **Next Development Priorities:**
- Automatic MCP server generation from API documentation  
- Enhanced process monitoring and recovery
- Advanced credential management