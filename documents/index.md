# Documentation Index

This directory contains comprehensive documentation for the MCP (Model Context Protocol) service ecosystem, organized into specialized folders for different aspects of the project.

## 📁 Documentation Structure

### 🏗️ Project Structure (`Project_structure/`)
**Core architecture and implementation documentation**

Complete multi-tenant MCP service architecture including database design, authentication flows, and service management. Contains detailed implementation guides for the overall system architecture.

**Key Documents:**
- Phase 1 implementation with multi-tenant architecture
- Database schema and credential management
- OAuth and API key integration guides
- MCP protocol specification and development guides
- Handler session management and troubleshooting

### 📚 MCP Documentation (`mcp_documentation/`)
**Service-specific documentation for implemented MCP services**

Documentation for each MCP service implementation including endpoints, tools, and integration guides.

**Available Services:**
- **Gmail**: Email management and automation
- **Google Drive**: File storage and sharing
- **Slack**: Team communication and workflows
- **Notion**: Knowledge management and databases
- **Reddit**: Social media and community management
- **Dropbox**: File storage and synchronization
- **Discord**: Community and server management
- **Figma**: Design collaboration and assets
- **Airtable**: Database and project management

### 🛠️ Implementation Templates (`template_for_mcp_implementation/`)
**Templates and guides for creating new MCP services**

Complete templates and step-by-step guides for implementing new MCP services from scratch.

**Includes:**
- `MCP_SERVICE_TEMPLATE.md`: Complete code template based on Gmail implementation
- `MCP_SERVICE_IMPLEMENTATION_GUIDE.md`: Step-by-step implementation walkthrough

## 🚀 Quick Start Guides

### For New Service Development
1. **Planning**: Review `Project_structure/mcp-server-development-guide.md` for architecture overview
2. **Template**: Use `template_for_mcp_implementation/MCP_SERVICE_TEMPLATE.md`
3. **Implementation**: Follow `template_for_mcp_implementation/MCP_SERVICE_IMPLEMENTATION_GUIDE.md`
4. **Reference**: Check existing service docs in `mcp_documentation/` for patterns

### For Architecture Understanding
1. **System Overview**: Start with `Project_structure/index.md`
2. **Database Design**: Review `Project_structure/database-design.md`
3. **Authentication**: Study `Project_structure/centralized-oauth-flow.md`
4. **Request Flow**: Understand `Project_structure/multi-tenant-mcp-flow.md`

### For Troubleshooting
1. **MCP Issues**: Check `Project_structure/mcp-troubleshooting-guide.md`
2. **Service Specific**: Reference individual service docs in `mcp_documentation/`
3. **Protocol Questions**: Review `Project_structure/mcp-protocol-specification.md`

## 🏛️ Architecture Highlights

### Multi-Tenant Design
- **Service Independence**: Services start without database dependencies
- **Complete User Isolation**: Instance-based credential and data separation
- **Dynamic Scalability**: One service handles unlimited users through routing
- **Security & Compliance**: Instance-level credential management and expiration

### MCP Protocol Compliance
- **JSON-RPC 2.0**: Full specification compliance following MCP 2024-11-05
- **Error Handling**: Comprehensive error codes and response formats
- **Authentication**: Built-in OAuth 2.0 and API key management
- **Session Management**: Persistent handler instances for stateful operations

### Development Features
- **24 core files** across standardized directory structure
- **OAuth 2.0 authentication** with intelligent token caching
- **Comprehensive logging** and monitoring capabilities
- **Testing frameworks** for unit, integration, and load testing

## 📋 Implementation Status

### ✅ Completed Services
- Figma, Gmail, Google Drive, Slack, Notion, Reddit, Dropbox, Discord, Airtable

### 🔄 In Progress
- Database schema deployment and nginx configuration updates

### 📋 Planned
- Additional MCP services and centralized OAuth service implementation

## 💡 Support

For implementation questions or issues:
- **Architecture Questions**: Reference `Project_structure/` documentation
- **Service Implementation**: Use templates in `template_for_mcp_implementation/`
- **Specific Services**: Check relevant docs in `mcp_documentation/`
- **Troubleshooting**: Follow guides in `Project_structure/mcp-troubleshooting-guide.md`

Last updated: 2025-07-21