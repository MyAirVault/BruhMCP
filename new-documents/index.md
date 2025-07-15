# Documentation Index

This folder contains comprehensive documentation for the multi-tenant MCP service architecture and implementation.

## Core Documentation

### [phase1.md](./phase1.md)
**Multi-Tenant MCP Service Management and Startup Flow**
- Updated Phase 1 implementation with multi-tenant architecture
- Service structure with instance-based routing
- Multi-user isolation and authentication
- Database-driven credential management
- Step-by-step implementation process for multi-tenant services

### [database-redesign-flow.md](./database-redesign-flow.md)
**Database Redesign Flow: Static Service Architecture**
- Complete database schema for multi-tenant MCP services
- User instance management and credential storage
- Authentication flow design (API key and OAuth)
- URL structure and nginx routing architecture
- Service registry and instance lifecycle management

### [multi-tenant-mcp-flow.md](./multi-tenant-mcp-flow.md)
**Multi-Tenant MCP Service Flow Documentation**
- Detailed request flow from client to service response
- Instance-based authentication middleware
- Database credential lookup and validation
- Complete user isolation examples
- Error handling and security considerations

## MCP Development Documentation

### [mcp-server-development-guide.md](./mcp-server-development-guide.md)
**Complete MCP Server Development Guide**
- Comprehensive guide for developing MCP-compliant servers
- Step-by-step implementation instructions
- Code templates and examples
- Project structure and best practices
- Testing and validation procedures
- Deployment and monitoring guidelines

### [mcp-protocol-specification.md](./mcp-protocol-specification.md)
**Official MCP Protocol Specification**
- Complete technical specification for MCP protocol version 2024-11-05
- JSON-RPC 2.0 implementation details
- All core methods (initialize, tools/list, tools/call, resources/*)
- Error codes and handling requirements
- Security considerations and best practices
- Protocol extensions and versioning

### [mcp-troubleshooting-guide.md](./mcp-troubleshooting-guide.md)
**MCP Server Troubleshooting and Best Practices**
- Common issues and solutions
- Debugging techniques and tools
- Performance optimization strategies
- Security issue prevention
- Protocol compliance validation
- Monitoring and logging best practices

### [mcp-handler-sessions.md](./mcp-handler-sessions.md)
**MCP Handler Session Management**
- Persistent handler instances for stateful MCP sessions
- Solves "Server not initialized" errors with Claude Code
- Session lifecycle and automatic cleanup
- Integration with credential caching
- Monitoring and troubleshooting sessions
- Implementation guide for all MCP services

### [centralized-oauth-flow.md](./centralized-oauth-flow.md)
**Centralized OAuth Flow for MCP Services**
- Unified OAuth 2.0 authentication system for all MCP services
- OAuth consent during instance creation for seamless LLM integration
- Memory-based token caching with flexible refresh strategies
- Support for multiple OAuth providers (Google, Microsoft, etc.)
- Detailed implementation guide and integration instructions
- Complete flow from credential entry to API authentication

### [oauth-api-service-integration-guide.md](./oauth-api-service-integration-guide.md)
**OAuth and API Key Service Integration Guide**
- Comprehensive analysis of current OAuth and API key authentication architecture
- Detailed implementation requirements for Google Drive (OAuth) and Splitwise (API key)
- Step-by-step integration process for both authentication types
- Security considerations and best practices
- Complete code examples and configuration templates
- Frontend and backend implementation patterns

## Implementation Status

### ✅ Completed
- **Figma MCP Service**: Full multi-tenant implementation with instance-based routing and JSON-RPC 2.0 compliance
- **Database Integration**: Instance credential lookup and validation
- **Authentication Middleware**: Instance-based authentication with usage tracking
- **Multi-User Support**: Complete isolation between users of the same service
- **MCP Protocol Implementation**: Specification-compliant JSON-RPC 2.0 server with proper error handling
- **Development Documentation**: Complete guides for implementing new MCP servers
- **Handler Session Management**: Persistent handler instances for proper MCP stateful sessions
- **Claude Code Compatibility**: Full support for Claude Code and other MCP clients

### 🔄 In Progress
- Database schema deployment
- Nginx configuration updates
- Frontend instance creation flow
- Service registry population

### 📋 Planned
- Additional MCP services (GitHub, Slack, etc.)
- Centralized OAuth service implementation
- Advanced monitoring and analytics
- Service health monitoring dashboard

## Quick Start

### For Architecture Understanding
1. **Read Phase 1 Documentation**: Start with [phase1.md](./phase1.md) for architecture overview
2. **Understand Database Design**: Review [database-redesign-flow.md](./database-redesign-flow.md) for data structure
3. **Follow Request Flow**: Study [multi-tenant-mcp-flow.md](./multi-tenant-mcp-flow.md) for complete request lifecycle

### For MCP Development
1. **Read Protocol Specification**: Start with [mcp-protocol-specification.md](./mcp-protocol-specification.md) for official requirements
2. **Follow Development Guide**: Use [mcp-server-development-guide.md](./mcp-server-development-guide.md) for implementation
3. **Reference Troubleshooting**: Keep [mcp-troubleshooting-guide.md](./mcp-troubleshooting-guide.md) handy for issues

## Architecture Benefits

- **Service Independence**: Services start without database dependencies
- **Complete User Isolation**: Each user's credentials and data completely separated
- **Dynamic Scalability**: One service handles unlimited users through instance routing
- **Security & Compliance**: Instance-level credential management and expiration
- **Operational Simplicity**: Standard HTTP/REST architecture with nginx routing

This architecture supports 300+ MCP services with complete multi-user isolation while maintaining operational simplicity and security.

## MCP Development Features

- **Protocol Compliance**: Full JSON-RPC 2.0 implementation following MCP specification 2024-11-05
- **Error Handling**: Comprehensive error codes and proper error response formats
- **Security**: Built-in authentication, input validation, and credential management
- **Testing**: Complete test suites and validation procedures
- **Monitoring**: Structured logging, metrics collection, and health checks
- **Documentation**: Detailed guides, troubleshooting, and best practices