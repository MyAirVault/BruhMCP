# MCP Protocol Specification

## Overview

The Model Context Protocol (MCP) is an open standard that enables seamless integration between LLM applications and external data sources and tools. This document provides the complete technical specification for implementing MCP-compliant servers.

## Protocol Details

### Version Information
- **Protocol Version**: `2024-11-05`
- **Transport**: JSON-RPC 2.0 over HTTP
- **Content-Type**: `application/json`
- **Specification Source**: https://modelcontextprotocol.io/specification

### Communication Model

MCP establishes communication between three key entities:

1. **Hosts**: LLM applications initiating connections
2. **Clients**: Connectors within host applications  
3. **Servers**: Services providing context and capabilities

### Core Capabilities

#### Server Capabilities
- **Tools**: Executable functions for AI models
- **Resources**: Contextual data for users/AI (optional)
- **Prompts**: Templated message workflows (optional)

#### Client Capabilities
- **Sampling**: Agentic behaviors and LLM interactions
- **Roots**: Inquiries into URI/filesystem boundaries
- **Elicitation**: Requests for additional user information

## JSON-RPC 2.0 Implementation

### Message Structure

All MCP messages MUST follow JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "id": "string|number",
  "method": "string",
  "params": "object (optional)"
}
```

### Response Structure

#### Success Response
```json
{
  "jsonrpc": "2.0",
  "id": "string|number",
  "result": "any"
}
```

#### Error Response
```json
{
  "jsonrpc": "2.0",
  "id": "string|number",
  "error": {
    "code": "number",
    "message": "string",
    "data": "any (optional)"
  }
}
```

## Core Methods

### 1. Initialize

The initialize method establishes the connection and negotiates capabilities.

#### Request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "sampling": {},
      "roots": {},
      "elicitation": {}
    },
    "clientInfo": {
      "name": "Client Name",
      "version": "1.0.0"
    }
  }
}
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {}
    },
    "serverInfo": {
      "name": "Server Name",
      "version": "1.0.0"
    },
    "instructions": "Optional instructions for the client"
  }
}
```

#### Validation Rules
- `protocolVersion` MUST be `2024-11-05`
- `capabilities` object MUST be present
- `clientInfo` MUST contain `name` and `version`
- Server MUST respond with matching protocol version

### 2. Tools/List

Lists available tools that can be invoked by the client.

#### Request
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

#### Response
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

#### Schema Requirements
- `name`: Unique tool identifier
- `description`: Human-readable description
- `inputSchema`: JSON Schema for tool parameters
- `nextCursor`: For pagination (optional)

### 3. Tools/Call

Invokes a specific tool with provided arguments.

#### Request
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "tool_name",
    "arguments": {
      "param1": "value1",
      "param2": "value2"
    }
  }
}
```

#### Response (Success)
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

#### Response (Tool Error)
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

#### Content Types
- `text`: Plain text content
- `image`: Image data (base64 or URL)
- `resource`: Reference to a resource

### 4. Resources/List (Optional)

Lists available resources that provide contextual data.

#### Request
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/list",
  "params": {
    "cursor": "optional-cursor"
  }
}
```

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "resources": [
      {
        "uri": "resource://path/to/resource",
        "name": "Resource Name",
        "description": "Resource description",
        "mimeType": "application/json"
      }
    ],
    "nextCursor": "optional-next-cursor"
  }
}
```

### 5. Resources/Read (Optional)

Reads the content of a specific resource.

#### Request
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

#### Response
```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "contents": [
      {
        "uri": "resource://path/to/resource",
        "mimeType": "application/json",
        "text": "Resource content"
      }
    ]
  }
}
```

## Error Handling

### Standard JSON-RPC Error Codes

| Code | Message | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON syntax |
| -32600 | Invalid request | Invalid JSON-RPC request |
| -32601 | Method not found | Method does not exist |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Internal server error |

### MCP-Specific Error Codes

| Code | Message | Description |
|------|---------|-------------|
| -31000 | Server not initialized | Server requires initialization |
| -31001 | Resource not found | Requested resource does not exist |
| -31002 | Authentication failed | Invalid credentials |
| -31003 | Rate limit exceeded | Too many requests |
| -31004 | Tool not found | Requested tool does not exist |
| -31005 | Invalid tool arguments | Tool arguments don't match schema |

### Error Response Format

```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "error": {
    "code": -32602,
    "message": "Invalid params",
    "data": {
      "details": "Missing required parameter 'name'",
      "parameter": "name"
    }
  }
}
```

## Security Considerations

### Authentication
- Servers MUST implement proper authentication
- API keys should be validated on each request
- Credentials should be securely stored and transmitted

### Authorization
- Implement role-based access control
- Validate permissions for each operation
- Log all security-related events

### Input Validation
- Validate all input parameters against schemas
- Sanitize inputs to prevent injection attacks
- Implement rate limiting to prevent abuse

### Data Privacy
- Encrypt sensitive data in transit and at rest
- Implement data retention policies
- Provide user consent mechanisms

## Implementation Guidelines

### Initialization Flow
1. Client sends initialize request with protocol version
2. Server validates protocol version compatibility
3. Server responds with capabilities and server info
4. Client can now invoke tools and access resources

### Tool Execution Flow
1. Client calls tools/list to discover available tools
2. Client validates tool parameters against input schema
3. Client calls tools/call with tool name and arguments
4. Server executes tool and returns results
5. Server handles errors and returns appropriate responses

### Error Handling Best Practices
1. Use appropriate error codes for different scenarios
2. Provide meaningful error messages
3. Include relevant context in error data
4. Log errors for debugging and monitoring

### Performance Considerations
1. Implement connection pooling for database operations
2. Cache frequently accessed data
3. Use pagination for large result sets
4. Implement request timeouts

## Protocol Extensions

### Custom Methods
Servers MAY implement custom methods using reverse domain notation:
```json
{
  "method": "com.example.custom/method",
  "params": {}
}
```

### Custom Error Codes
Use codes outside the reserved range (-32768 to -32000):
```json
{
  "error": {
    "code": -30001,
    "message": "Custom error message"
  }
}
```

## Testing and Validation

### Protocol Compliance Tests
1. Initialize with correct protocol version
2. Initialize with wrong protocol version (should fail)
3. Call methods before initialization (should fail)
4. List tools and validate schema format
5. Call tools with valid/invalid parameters
6. Test error handling and response formats

### Integration Testing
1. Test with real API credentials
2. Validate authentication flows
3. Test error scenarios
4. Performance testing under load

## Migration and Versioning

### Version Compatibility
- Servers MUST support the current protocol version
- Clients SHOULD handle version negotiation gracefully
- Breaking changes require new protocol versions

### Deprecation Policy
- Deprecated features should be documented
- Provide migration guides for version updates
- Maintain backward compatibility when possible

## Monitoring and Observability

### Logging Requirements
- Log all requests and responses
- Include timing information
- Log security events
- Implement structured logging

### Metrics Collection
- Track request/response times
- Monitor error rates
- Track authentication failures
- Monitor resource usage

### Health Checks
- Implement health check endpoints
- Monitor service dependencies
- Provide service status information

## Conclusion

This specification provides the foundation for implementing MCP-compliant servers that can integrate with AI applications. Following these guidelines ensures interoperability, security, and maintainability of MCP implementations.

For practical implementation examples, refer to the MCP Server Development Guide and existing server implementations in the codebase.