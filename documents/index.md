# Documentation Index

## Project Structure Documentation

### MCP Server Architecture
- **[OAuth MCP Servers](project-structure/oauth-mcp-servers.md)** - Complete implementation guide for OAuth-based MCP servers including Gmail, Google Sheets, Discord, and other third-party integrations
- **[API Key MCP Servers](project-structure/apikey-based-mcp-servers.md)** - Implementation guide for API key-based MCP servers
- **[MCP Auth Registry](project-structure/mcp-auth-registry.md)** - Central authentication registry system for MCP servers
- **[Database Architecture](project-structure/database-architecture.md)** - Database schema and integration patterns
- **[Logging and Monitoring](project-structure/logging-and-monitoring.md)** - Comprehensive logging infrastructure with Winston, circuit breakers, performance monitoring, and user-specific logging systems
- **[Local Development](project-structure/local-development.md)** - Local development configuration for disabling payments and enabling pro plan features

## Implementation Guides

### Complete Project Structure
- **[Complete Project Structure](project-structure/complete-project-structure.md)** - Comprehensive overview of the entire full-stack MCP Registry application including frontend, backend, database, and infrastructure components

## MCP Service Templates

### API Key-Based Services
- **[API Key-Based MCP Services](mcp-template/apikey-based.md)** - Step-by-step checklist for implementing API key-based MCP services with exact file structure, naming conventions, and integration requirements

### OAuth-Based Services
- **[OAuth-Based MCP Services](mcp-template/oauth-based.md)** - Comprehensive checklist for implementing OAuth 2.0 MCP services with sophisticated token management, caching, refresh mechanisms, and multi-tenant architecture

### OAuth MCP Servers
The OAuth MCP servers documentation provides a comprehensive guide for implementing secure, multi-tenant OAuth 2.0 authentication for third-party services through the Model Context Protocol. It covers the complete architecture including required files, functionality specifications, security requirements, and best practices for services like Gmail, Google Sheets, Discord, Slack, and others.