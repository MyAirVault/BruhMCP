# MCP Server Development Guide

## Table of Contents
1. [Overview](#overview)
2. [MCP Protocol Specification](#mcp-protocol-specification)
3. [Project Structure](#project-structure)
4. [Implementation Guide](#implementation-guide)
5. [Code Templates](#code-templates)
6. [Testing and Validation](#testing-and-validation)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Overview

The Model Context Protocol (MCP) is an open standard for connecting AI assistants to external data sources and tools. This guide provides comprehensive documentation for developing MCP servers within our multi-tenant backend architecture.

### Key Concepts

- **MCP Server**: A service that provides tools and resources to AI models
- **JSON-RPC 2.0**: The protocol used for all MCP communication
- **Protocol Version**: Currently `2024-11-05`
- **Multi-tenant Architecture**: Each user instance has isolated credentials and state

## MCP Protocol Specification

### Protocol Version
- **Current Version**: `2024-11-05`
- **Transport**: JSON-RPC 2.0 over HTTP POST
- **Content-Type**: `application/json`

### Core Message Types

#### Initialize Request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "sampling": {}
    },
    "clientInfo": {
      "name": "Client Name",
      "version": "1.0.0"
    }
  }
}
```

#### Initialize Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "Service MCP Server",
      "version": "1.0.0"
    },
    "instructions": "Optional instructions for the client"
  }
}
```

#### Tools List Request
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {
    "cursor": "optional-cursor-for-pagination"
  }
}
```

#### Tools List Response
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "tool_name",
        "description": "Tool description",
        "inputSchema": {
          "type": "object",
          "properties": {
            "param1": {
              "type": "string",
              "description": "Parameter description"
            }
          },
          "required": ["param1"]
        }
      }
    ],
    "nextCursor": "optional-next-cursor"
  }
}
```

#### Tool Call Request
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1"
    }
  }
}
```

#### Tool Call Response (Success)
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Tool execution result"
      }
    ]
  }
}
```

#### Tool Call Response (Error)
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Error message"
      }
    ],
    "isError": true
  }
}
```

### Error Codes

#### Standard JSON-RPC Error Codes
- `-32700`: Parse error
- `-32600`: Invalid request
- `-32601`: Method not found
- `-32602`: Invalid parameters
- `-32603`: Internal error

#### Custom MCP Error Codes
- `-31000`: Server not initialized
- `-31001`: Resource not found
- `-31002`: Authentication failed
- `-31003`: Rate limit exceeded

### Optional Methods

#### Resources List
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/list",
  "params": {}
}
```

#### Resources Read
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "resources/read",
  "params": {
    "uri": "resource://path/to/resource"
  }
}
```

## Project Structure

```
src/mcp-servers/[service-name]/
├── index.js                    # Main server entry point
├── db/
│   └── service.sql             # Database service registration
├── endpoints/
│   ├── jsonrpc-handler.js      # JSON-RPC protocol handler
│   ├── tools.js                # Tool definitions
│   └── call.js                 # Tool execution logic
├── api/
│   └── [service-name]-api.js   # Service API client
├── middleware/
│   └── credential-auth.js      # Authentication middleware
├── services/
│   ├── credential-cache.js     # Credential caching
│   ├── credential-watcher.js   # Credential monitoring
│   └── database.js             # Database operations
└── utils/
    ├── auth.js                 # Authentication utilities
    └── validation.js           # Input validation
```

## Implementation Guide

### Step 1: Create Database Service Registration

Create the database registration file that will be automatically discovered during migration:

```sql
-- src/mcp-servers/[service-name]/db/service.sql
-- [Service Name] service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'service-name',
    'Service Name',
    'Service description for users',
    '/mcp-logos/service-name.svg',
    49XXX,  -- Must match port in mcp-ports/service-name/config.json
    'api_key'  -- or 'oauth'
);
```

**Important**: 
- Port number must match the port in `mcp-ports/service-name/config.json`
- Service name must be unique across all services
- Icon path should point to existing SVG file in `public/mcp-logos/`

### Step 2: Create Service Configuration

```javascript
// src/mcp-servers/[service-name]/index.js
const SERVICE_CONFIG = {
  name: 'service-name',
  displayName: 'Service Name',
  port: 49XXX,  // Must match port in service.sql and mcp-ports config
  authType: 'api_key',
  description: 'Service description',
  version: '1.0.0'
};
```

### Step 3: Define Tools

```javascript
// src/mcp-servers/[service-name]/endpoints/tools.js
export function getTools() {
  return {
    tools: [
      {
        name: 'tool_name',
        description: 'Tool description',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: 'Parameter description'
            }
          },
          required: ['param1']
        }
      }
    ]
  };
}
```

### Step 4: Implement Tool Execution

```javascript
// src/mcp-servers/[service-name]/endpoints/call.js
import { serviceApiCall } from '../api/service-api.js';

export async function executeToolCall(toolName, args, apiKey) {
  try {
    switch (toolName) {
      case 'tool_name':
        const result = await serviceApiCall(args.param1, apiKey);
        return {
          content: [
            {
              type: 'text',
              text: `Result: ${JSON.stringify(result, null, 2)}`
            }
          ]
        };
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    throw new Error(`Error executing ${toolName}: ${error.message}`);
  }
}
```

### Step 5: Create JSON-RPC Handler

```javascript
// src/mcp-servers/[service-name]/endpoints/jsonrpc-handler.js
import { executeToolCall } from './call.js';
import { getTools } from './tools.js';

export class ServiceMCPJsonRpcHandler {
  constructor(serviceConfig, apiKey) {
    this.serviceConfig = serviceConfig;
    this.apiKey = apiKey;
    this.initialized = false;
  }

  async processMessage(message) {
    if (!this.isValidJsonRpc(message)) {
      return this.createErrorResponse(message.id || null, -32600, 'Invalid Request');
    }

    const { method, params, id } = message;

    try {
      switch (method) {
        case 'initialize':
          return await this.handleInitialize(params, id);
        case 'tools/list':
          return await this.handleToolsList(params, id);
        case 'tools/call':
          return await this.handleToolsCall(params, id);
        case 'resources/list':
          return await this.handleResourcesList(params, id);
        case 'resources/read':
          return await this.handleResourcesRead(params, id);
        default:
          return this.createErrorResponse(id, -32601, `Method not found: ${method}`);
      }
    } catch (error) {
      return this.createErrorResponse(id, -32603, 'Internal error', { details: error.message });
    }
  }

  isValidJsonRpc(message) {
    return (
      message &&
      message.jsonrpc === '2.0' &&
      typeof message.method === 'string' &&
      (message.id !== undefined || message.id === null)
    );
  }

  async handleInitialize(params, id) {
    if (!params || !params.protocolVersion) {
      return this.createErrorResponse(id, -32602, 'Invalid params: missing protocolVersion');
    }

    if (params.protocolVersion !== '2024-11-05') {
      return this.createErrorResponse(id, -32602, 'Unsupported protocol version');
    }

    this.initialized = true;

    return this.createSuccessResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: `${this.serviceConfig.displayName} MCP Server`,
        version: this.serviceConfig.version
      },
      instructions: `MCP server for ${this.serviceConfig.displayName} integration`
    });
  }

  async handleToolsList(params, id) {
    if (!this.initialized) {
      return this.createErrorResponse(id, -31000, 'Server not initialized');
    }

    const toolsData = getTools();
    
    return this.createSuccessResponse(id, {
      tools: toolsData.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    });
  }

  async handleToolsCall(params, id) {
    if (!this.initialized) {
      return this.createErrorResponse(id, -31000, 'Server not initialized');
    }

    if (!params || !params.name) {
      return this.createErrorResponse(id, -32602, 'Invalid params: missing tool name');
    }

    const { name: toolName, arguments: args = {} } = params;

    try {
      const result = await executeToolCall(toolName, args, this.apiKey);
      
      return this.createSuccessResponse(id, {
        content: result.content || [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          }
        ]
      });
    } catch (error) {
      return this.createSuccessResponse(id, {
        content: [
          {
            type: 'text',
            text: `Error executing ${toolName}: ${error.message}`
          }
        ],
        isError: true
      });
    }
  }

  async handleResourcesList(params, id) {
    if (!this.initialized) {
      return this.createErrorResponse(id, -31000, 'Server not initialized');
    }

    return this.createSuccessResponse(id, {
      resources: []
    });
  }

  async handleResourcesRead(params, id) {
    if (!this.initialized) {
      return this.createErrorResponse(id, -31000, 'Server not initialized');
    }

    if (!params || !params.uri) {
      return this.createErrorResponse(id, -32602, 'Invalid params: missing resource URI');
    }

    return this.createErrorResponse(id, -31001, 'Resource not found');
  }

  createSuccessResponse(id, result) {
    return {
      jsonrpc: '2.0',
      id,
      result
    };
  }

  createErrorResponse(id, code, message, data = null) {
    const response = {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message
      }
    };

    if (data) {
      response.error.data = data;
    }

    return response;
  }
}
```

### Step 6: Create Main Server

```javascript
// src/mcp-servers/[service-name]/index.js
import express from 'express';
import cors from 'cors';
import { ServiceMCPJsonRpcHandler } from './endpoints/jsonrpc-handler.js';
import { createCredentialAuthMiddleware } from './middleware/credential-auth.js';

const SERVICE_CONFIG = {
  name: 'service-name',
  displayName: 'Service Name',
  port: 49XXX,
  authType: 'api_key',
  description: 'Service description',
  version: '1.0.0'
};

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const credentialAuthMiddleware = createCredentialAuthMiddleware();

// Health endpoint
app.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    service: SERVICE_CONFIG.name,
    version: SERVICE_CONFIG.version
  });
});

// Instance health endpoint
app.get('/:instanceId/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: SERVICE_CONFIG.name,
    instanceId: req.params.instanceId,
    version: SERVICE_CONFIG.version
  });
});

// MCP JSON-RPC endpoint
app.post('/:instanceId/mcp', credentialAuthMiddleware, async (req, res) => {
  try {
    const jsonRpcHandler = new ServiceMCPJsonRpcHandler(SERVICE_CONFIG, req.serviceApiKey || '');
    const response = await jsonRpcHandler.processMessage(req.body);
    
    if (response) {
      res.json(response);
    } else {
      res.status(204).send();
    }
  } catch (error) {
    res.json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: { details: error.message }
      }
    });
  }
});

// Start server
const server = app.listen(SERVICE_CONFIG.port, () => {
  console.log(`✅ ${SERVICE_CONFIG.displayName} MCP Server running on port ${SERVICE_CONFIG.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});

export default app;
```

## Code Templates

### Basic Tool Definition Template

```javascript
// Template for adding a new tool
{
  name: 'tool_name',
  description: 'Clear description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      required_param: {
        type: 'string',
        description: 'Description of the parameter'
      },
      optional_param: {
        type: 'number',
        description: 'Optional parameter description'
      }
    },
    required: ['required_param']
  }
}
```

### Error Handling Template

```javascript
// Template for consistent error handling
try {
  const result = await apiCall();
  return {
    content: [
      {
        type: 'text',
        text: formatResult(result)
      }
    ]
  };
} catch (error) {
  throw new Error(`Operation failed: ${error.message}`);
}
```

### API Client Template

```javascript
// src/mcp-servers/[service-name]/api/service-api.js
export async function makeServiceApiCall(endpoint, params, apiKey) {
  const response = await fetch(`https://api.service.com${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

## Testing and Validation

### Test Script Template

```javascript
// test-service-mcp.js
import { ServiceMCPJsonRpcHandler } from './src/mcp-servers/service-name/endpoints/jsonrpc-handler.js';

const SERVICE_CONFIG = {
  name: 'service-name',
  displayName: 'Service Name',
  version: '1.0.0'
};

async function testMCPCompliance() {
  console.log('🧪 Testing Service MCP Implementation\\n');
  
  const handler = new ServiceMCPJsonRpcHandler(SERVICE_CONFIG, 'test-api-key');
  
  // Test initialization
  const initResponse = await handler.processMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'Test Client', version: '1.0.0' }
    }
  });
  
  console.log('Initialize:', initResponse.error ? 'FAILED' : 'PASSED');
  
  // Test tools list
  const toolsResponse = await handler.processMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  });
  
  console.log('Tools List:', toolsResponse.error ? 'FAILED' : 'PASSED');
  console.log('Tools Count:', toolsResponse.result?.tools?.length || 0);
  
  // Test tool call
  const callResponse = await handler.processMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'test_tool',
      arguments: {}
    }
  });
  
  console.log('Tool Call:', callResponse.error ? 'FAILED' : 'PASSED');
}

testMCPCompliance().catch(console.error);
```

### Validation Checklist

- [ ] Protocol version is `2024-11-05`
- [ ] Initialize method validates protocol version
- [ ] JSON-RPC 2.0 format compliance
- [ ] Proper error codes used
- [ ] Tools have valid input schemas
- [ ] Tool execution handles errors gracefully
- [ ] Authentication middleware integrated
- [ ] Multi-tenant support implemented
- [ ] Health endpoints respond correctly
- [ ] Graceful shutdown implemented

## Deployment

### Database Registration

After creating your service, the database registration happens automatically:

1. **Service Discovery**: The migration script automatically discovers your `service.sql` file
2. **Database Registration**: Run `npm run db:migrate` to register your service
3. **Port Validation**: The system validates port consistency with `mcp-ports/` configuration
4. **Service Availability**: Your service becomes available in the frontend service catalog

### Environment Variables

```bash
# .env file
NODE_ENV=production
PORT=49XXX
DATABASE_URL=postgresql://...
SERVICE_NAME=service-name
```

### PM2 Configuration

```json
{
  "apps": [
    {
      "name": "service-name-mcp",
      "script": "src/mcp-servers/service-name/index.js",
      "instances": 1,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": "49XXX"
      },
      "log_file": "logs/service-name.log",
      "error_file": "logs/service-name-error.log",
      "out_file": "logs/service-name-out.log"
    }
  ]
}
```

### Docker Configuration

```dockerfile
# Dockerfile for MCP service
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/mcp-servers/service-name ./src/mcp-servers/service-name
COPY src/utils ./src/utils

EXPOSE 49XXX

CMD ["node", "src/mcp-servers/service-name/index.js"]
```

## Troubleshooting

### Common Issues

#### 1. Protocol Version Mismatch
**Error**: `Unsupported protocol version`
**Solution**: Ensure client and server use `2024-11-05`

#### 2. Tool Not Found
**Error**: `Method not found: tools/call`
**Solution**: Verify tool is defined in `tools.js` and properly exported

#### 3. Authentication Failures
**Error**: `Authentication failed`
**Solution**: Check API key validity and credential middleware setup

#### 4. JSON-RPC Format Errors
**Error**: `Invalid Request`
**Solution**: Validate JSON-RPC 2.0 message structure

### Debug Mode

```javascript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Received message:', JSON.stringify(message, null, 2));
  console.log('Sending response:', JSON.stringify(response, null, 2));
}
```

### Health Check Endpoints

```bash
# Global health check
curl http://localhost:49XXX/health

# Instance health check
curl http://localhost:49XXX/instance123/health
```

## Best Practices

### 1. Security
- Always validate API keys
- Sanitize user inputs
- Use HTTPS in production
- Implement rate limiting
- Log security events

### 2. Error Handling
- Use appropriate error codes
- Provide meaningful error messages
- Log errors for debugging
- Handle network failures gracefully

### 3. Performance
- Implement credential caching
- Use connection pooling
- Add request timeouts
- Monitor response times

### 4. Maintainability
- Follow consistent naming conventions
- Document all tools thoroughly
- Write comprehensive tests
- Keep dependencies updated

### 5. Monitoring
- Log all requests/responses
- Monitor service health
- Track error rates
- Set up alerts for failures

### 6. Documentation
- Document API endpoints
- Provide usage examples
- Keep documentation updated
- Include troubleshooting guides

## Example: Complete Figma MCP Server

This guide was used to create the Figma MCP server implementation, which serves as a reference for proper MCP protocol compliance and multi-tenant architecture integration.

## Conclusion

This guide provides the foundation for developing robust, specification-compliant MCP servers within our multi-tenant architecture. Follow these patterns to ensure consistency, security, and maintainability across all service implementations.

For specific service implementations, refer to the existing servers in `src/mcp-servers/` as examples of these patterns in practice.