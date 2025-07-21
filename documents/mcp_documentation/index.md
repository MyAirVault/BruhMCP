# MCP Service Documentation

This directory contains service-specific documentation for all implemented MCP services. Each service folder includes comprehensive documentation for endpoints, tools, and integration guides.

## Available MCP Services

### 📧 [Gmail](./gmail/)
**Email management and automation**
- `README.md`: Service overview and setup guide
- `endpoints-actions.md`: Available endpoints and actions
- `tool-reference.md`: Complete tool reference documentation

### 📁 [Google Drive](./googledrive/)
**File storage and sharing**
- `README.md`: Service overview and setup guide
- `endpoints-actions.md`: Available endpoints and actions
- `tool-reference.md`: Complete tool reference documentation

### 💬 [Slack](./slack/)
**Team communication and workflows**
- `README.md`: Service overview and setup guide
- `tool-reference.md`: Complete tool reference documentation

### 📚 [Notion](./notion/)
**Knowledge management and databases**
- `README.md`: Service overview and setup guide
- `tool-reference.md`: Complete tool reference documentation

### 🔴 [Reddit](./reddit/)
**Social media and community management**
- `README.md`: Service overview and setup guide
- `endpoints-actions.md`: Available endpoints and actions
- `tool-reference.md`: Complete tool reference documentation

### 📦 [Dropbox](./dropbox/)
**File storage and synchronization**
- `README.md`: Service overview and setup guide
- `tool-reference.md`: Complete tool reference documentation

### 🎮 [Discord](./discord/)
**Community and server management**
- `endpoints-actions.md`: Available endpoints and actions

### 🎨 [Figma](./figma/)
**Design collaboration and assets**
- `endpoints-actions.md`: Available endpoints and actions

### 🗃️ [Airtable](./airtable/)
**Database and project management**
- `endpoints-actions.md`: Available endpoints and actions

## Documentation Structure

Each service typically includes:

### README.md
- **Service Overview**: Purpose and capabilities
- **Authentication**: OAuth/API key setup instructions
- **Configuration**: Environment variables and settings
- **Usage Examples**: Common use cases and code samples
- **Troubleshooting**: Common issues and solutions

### endpoints-actions.md
- **Available Endpoints**: Complete API endpoint listing
- **Request/Response Formats**: Data structures and examples
- **Action Descriptions**: Detailed action explanations
- **Parameter Documentation**: Required and optional parameters

### tool-reference.md
- **Tool Definitions**: MCP tool specifications
- **Input Schemas**: Parameter validation schemas
- **Output Formats**: Response data structures
- **Error Handling**: Error codes and messages
- **Usage Examples**: Tool invocation examples

## Implementation Patterns

All MCP services follow consistent patterns:

### Authentication
- **OAuth 2.0**: For services requiring user consent (Gmail, Google Drive, Slack, etc.)
- **API Keys**: For services using direct API access (Reddit, Discord, etc.)
- **Token Management**: Automatic refresh and caching

### Multi-Tenant Architecture
- **Instance-Based Routing**: Each user gets isolated service instances
- **Credential Isolation**: Complete separation of user credentials
- **Session Management**: Persistent MCP handler instances

### MCP Protocol Compliance
- **JSON-RPC 2.0**: Standard protocol implementation
- **Tool Discovery**: Dynamic tool listing and capabilities
- **Error Handling**: Standardized error codes and responses
- **Resource Management**: Efficient connection and memory usage

## Quick Start

### For Developers
1. **Choose a Service**: Select from available services above
2. **Review Documentation**: Read the service's README.md first
3. **Check Implementation**: Reference existing code in `/backend/src/mcp-servers/[service]/`
4. **Test Integration**: Use tool-reference.md for testing

### For Users
1. **Authentication Setup**: Follow service-specific auth instructions
2. **Instance Creation**: Create service instances through the frontend
3. **Tool Usage**: Reference tool documentation for available capabilities
4. **Troubleshooting**: Check service README for common issues

## Development Status

### ✅ Production Ready
- Gmail, Google Drive, Slack, Notion, Reddit, Dropbox

### 🔄 In Development
- Discord, Figma, Airtable (documentation complete, testing in progress)

### 📋 Planned
- GitHub, Microsoft Teams, Trello, Asana, Linear

Last updated: 2025-07-21