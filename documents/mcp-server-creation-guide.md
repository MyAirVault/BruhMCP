# MCP Server Creation Guide

## Overview

This guide provides detailed steps to create a new MCP server for any API using the MiniMCP architecture. Each MCP server is a standalone Node.js process that translates MCP protocol requests to target API calls.

**⚠️ Implementation Status**: This guide represents the **planned architecture** for MCP server creation. Some components require additional implementation:
- Database tables for MCP types and instances (planned)
- Process management infrastructure (planned)
- MCP protocol SDK integration (planned)
- Complete logging and monitoring system (planned)

**Related Documentation**:
- [`/documents/backend-architecture.md`](./backend-architecture.md) - System architecture overview
- [`/documents/database-schema.md`](./database-schema.md) - Database structure and relationships
- [`/documents/security-architecture.md`](./security-architecture.md) - Security requirements and implementation
- [`/documents/authentication-flow.md`](./authentication-flow.md) - Magic link authentication system
- [`/documents/logging-monitoring.md`](./logging-monitoring.md) - File-based logging and monitoring
- [`/documents/mcp-integration-guide.md`](./mcp-integration-guide.md) - MCP system integration details

## Prerequisites

- Target API documentation
- API credentials/access tokens (will be encrypted with AES-256-GCM)
- Node.js environment (v18+ recommended)
- Understanding of MCP protocol basics
- Familiarity with security requirements (see [`/documents/security-architecture.md`](./security-architecture.md))
- Understanding of the authentication flow (see [`/documents/authentication-flow.md`](./authentication-flow.md))

**⚠️ Required Infrastructure** (needs implementation):
- Database migrations for `mcp_types`, `api_keys`, and `mcp_instances` tables
- MCP protocol SDK dependencies (`@modelcontextprotocol/sdk`)
- Process management services for spawning and monitoring
- Encryption service for credential management
- File-based logging infrastructure

## Step-by-Step Process

### Step 1: API Analysis and Planning

#### 1.1 Study Target API Documentation
- **Authentication Method**: Identify how the API authenticates (API keys, OAuth, Bearer tokens, etc.)
- **Base URL**: Note the API's base URL and version
- **Core Endpoints**: List the main endpoints you want to expose
- **Request/Response Format**: Understand data structures (JSON, XML, etc.)
- **Rate Limits**: Document any rate limiting or usage restrictions
- **Error Handling**: Note error codes and formats

#### 1.2 Map API Capabilities to MCP Concepts
- **Tools**: API endpoints that perform actions (POST, PUT, DELETE)
- **Resources**: API endpoints that retrieve data (GET)
- **Prompts**: Any AI/generation capabilities the API offers

#### 1.3 Define Required Credentials
Document what credentials are needed following the encrypted storage system:
- **api_key**: Primary API authentication key
- **client_secret**: OAuth client secret for authorization
- **client_id**: OAuth client identifier
- **personal_access_token**: Personal access tokens for user-specific APIs
- **refresh_token**: OAuth refresh tokens for token renewal
- **custom_headers**: Custom authentication headers (JSON format)
- **base_url**: API base URL variations
- **webhook_secret**: Secret for webhook validation

**Note**: All credentials are stored encrypted using AES-256-GCM encryption in the `api_keys` table with unique initialization vectors per credential.

### Step 2: Database Configuration

**⚠️ Implementation Required**: This section requires database migrations to be created first.

#### 2.1 Add MCP Type to Database
Following the schema from `/documents/database-schema.md`, add entry to `mcp_types` table:

```sql
INSERT INTO mcp_types (id, name, display_name, description, server_script, config_template, required_credentials, created_at, updated_at) VALUES
(gen_random_uuid(), 'your-api-name', 'Your API Name', 'Description of your API integration', 
 './mcp-servers/your-api-mcp-server.js', 
 '{
  "api_version": "v1", 
  "base_url": "https://api.example.com",
  "timeout": 30000,
  "retry_attempts": 3
}', 
 '[
  "api_key", 
  "client_secret"
]',
NOW(), NOW());
```

#### 2.2 Update Frontend Type Lists
**⚠️ Implementation Required**: The API endpoint `GET /api/mcp-types` needs to be implemented.

The frontend automatically fetches MCP types from the database via the API endpoint `GET /api/mcp-types`. No manual frontend updates are required.

**Frontend Integration Points**:
- Create MCP Modal: Dynamically loads types from `/api/mcp-types`
- Edit MCP Modal: Uses the same API endpoint
- Dashboard filtering: Automatically includes new types
- Configuration UI: Uses `config_template` for form generation
- Credential UI: Uses `required_credentials` for field validation

**Database Relationship**: New MCP instances reference the `mcp_types` table:
```sql
-- mcp_instances table references mcp_types
INSERT INTO mcp_instances (id, user_id, mcp_type_id, name, config, port, status, expires_at) 
VALUES (gen_random_uuid(), 'user-uuid', 'mcp-type-uuid', 'My API Instance', 
  '{"custom_setting": "value"}', 3001, 'active', '2024-01-01 00:00:00');
```

### Step 3: MCP Server Implementation

**⚠️ Implementation Required**: This section requires MCP protocol SDK dependencies to be installed.

#### 3.1 Create Server Script File
Create `/mcp-servers/your-api-mcp-server.js` following the process-based architecture:

**Security Requirements**:
- Script must run as non-privileged user (uid/gid 1001)
- Process isolation with resource limits (512MB memory, 50% CPU)
- Network isolation (localhost binding only)
- No file system access outside working directory
- All credentials handled via environment variables (never hardcoded)

#### 3.2 Server Structure
```javascript
// Basic server structure following /documents/backend-architecture.md
// ⚠️ Note: Requires @modelcontextprotocol/sdk to be installed
const express = require('express');
const { MCPServer } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');

// Initialize Express for health checks
const app = express();
const port = parseInt(process.env.PORT) || 3001; // Port assigned by main system
const userId = process.env.USER_ID;
const mcpId = process.env.MCP_ID;
const instanceNum = process.env.INSTANCE_NUM;

// Initialize MCP Server
const server = new MCPServer({
  name: 'your-api-mcp',
  version: '1.0.0'
});
```

#### 3.3 Environment Configuration
Access decrypted credentials passed from main process via environment variables:
```javascript
const config = {
  apiKey: process.env.API_KEY,
  clientSecret: process.env.CLIENT_SECRET,
  clientId: process.env.CLIENT_ID,
  personalAccessToken: process.env.PERSONAL_ACCESS_TOKEN,
  refreshToken: process.env.REFRESH_TOKEN,
  customHeaders: process.env.CUSTOM_HEADERS ? JSON.parse(process.env.CUSTOM_HEADERS) : {},
  baseUrl: process.env.BASE_URL || 'https://api.example.com',
  webhookSecret: process.env.WEBHOOK_SECRET,
  // Configuration from mcp_instances.config JSONB field
  apiVersion: process.env.API_VERSION || 'v1',
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3
};

// Validate required credentials
if (!config.apiKey) {
  console.error('Required API_KEY not provided');
  process.exit(1);
}
```

#### 3.4 API Client Setup
Create HTTP client for target API with security hardening:
```javascript
const axios = require('axios');
const https = require('https');

// Security-hardened HTTP client
const apiClient = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  maxRedirects: 5,
  headers: {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': `MiniMCP-Server/${process.env.MCP_ID || 'unknown'}`
  },
  // Enforce HTTPS and validate certificates
  httpsAgent: new https.Agent({
    rejectUnauthorized: true,
    secureProtocol: 'TLSv1_2_method'
  }),
  // Validate response size to prevent DoS
  maxContentLength: 50 * 1024 * 1024, // 50MB limit
  maxBodyLength: 50 * 1024 * 1024
});

// Add request validation
apiClient.interceptors.request.use(
  (config) => {
    // Validate request URL to prevent SSRF
    const url = new URL(config.url, config.baseURL);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      throw new Error('Localhost requests not allowed');
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Step 4: MCP Protocol Implementation

#### 4.1 Define Tools (Actions)
Map API endpoints that perform actions:
```javascript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_item',
        description: 'Create a new item via API',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['name']
        }
      }
    ]
  };
});
```

#### 4.2 Implement Tool Execution
Handle tool calls by translating to API requests with input validation and security checks:
```javascript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Input validation and sanitization
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid tool name');
  }
  
  // Rate limiting per tool
  if (toolCallCounts[name] > 100) {
    throw new Error('Tool rate limit exceeded');
  }
  toolCallCounts[name] = (toolCallCounts[name] || 0) + 1;
  
  switch (name) {
    case 'create_item':
      try {
        // Validate and sanitize input
        const joi = require('joi');
        const schema = joi.object({
          name: joi.string().max(100).required(),
          description: joi.string().max(500).optional()
        });
        
        const { error, value } = schema.validate(args);
        if (error) {
          throw new Error(`Invalid input: ${error.message}`);
        }
        
        const response = await apiClient.post('/items', {
          name: value.name,
          description: value.description || ''
        });
        
        // Sanitize response data
        const sanitizedResponse = {
          id: response.data.id,
          name: response.data.name,
          created_at: response.data.created_at
        };
        
        return {
          content: [
            {
              type: 'text',
              text: `Created item: ${sanitizedResponse.name} (ID: ${sanitizedResponse.id})`
            }
          ]
        };
      } catch (error) {
        logger.error('Tool execution error', { tool: name, error: error.message });
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

#### 4.3 Define Resources (Data Retrieval)
Map API endpoints that retrieve data:
```javascript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'api://items',
        name: 'Items List',
        description: 'List all items from API'
      }
    ]
  };
});
```

#### 4.4 Implement Resource Reading
Handle resource requests:
```javascript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  switch (uri) {
    case 'api://items':
      try {
        const response = await apiClient.get('/items');
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(response.data, null, 2)
            }
          ]
        };
      } catch (error) {
        throw new Error(`Failed to fetch items: ${error.message}`);
      }
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});
```

### Step 5: Error Handling and Logging

#### 5.1 Implement Error Handling
Following `/documents/logging-monitoring.md` file-based approach with Winston logging:
```javascript
const winston = require('winston');

// Configure Winston logger for file-based logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport for stdout capture
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Global error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

// Replace console.log with logger
const originalConsoleLog = console.log;
console.log = (...args) => {
  logger.info(args.join(' '));
};

const originalConsoleError = console.error;
console.error = (...args) => {
  logger.error(args.join(' '));
};
```

#### 5.2 API Request Logging
Log all API interactions with structured logging:
```javascript
// API request interceptor
apiClient.interceptors.request.use(request => {
  logger.info('API Request', {
    method: request.method?.toUpperCase(),
    url: request.url,
    headers: request.headers ? Object.keys(request.headers) : [],
    timestamp: new Date().toISOString()
  });
  return request;
});

// API response interceptor
apiClient.interceptors.response.use(
  response => {
    logger.info('API Response', {
      status: response.status,
      url: response.config.url,
      duration: response.config.metadata?.startTime 
        ? Date.now() - response.config.metadata.startTime 
        : null,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  error => {
    logger.error('API Error', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// Add timing metadata to requests
apiClient.interceptors.request.use(request => {
  request.metadata = { startTime: Date.now() };
  return request;
});
```

### Step 6: Rate Limiting and Resource Management

#### 6.1 Implement Rate Limiting
Respect target API's rate limits and implement security middleware:
```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting for health endpoint
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/health', limiter);

// Input validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};
```

#### 6.2 Resource Monitoring
Monitor memory and CPU usage as per [`/documents/backend-architecture.md`](./backend-architecture.md):
```javascript
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory Usage:', {
    rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
  });
}, 30000); // Log every 30 seconds
```

### Step 7: Server Startup and Health Checks

#### 7.1 Start MCP Server
```javascript
// Start MCP server with stdio transport
const transport = new StdioServerTransport();
server.connect(transport);

// Start HTTP server for health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    api: config.baseUrl
  });
});

app.listen(port, 'localhost', () => {
  console.log(`MCP server ${mcpId} running on port ${port}`);
  console.log(`Process ID: ${process.pid}`);
  console.log(`User: ${userId}, Instance: ${instanceNum}`);
  console.log('MCP server ready for stdio transport');
});
```

#### 7.2 Graceful Shutdown
Handle process termination:
```javascript
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
```

### Step 8: Integration with Main System

**⚠️ Implementation Required**: This section requires process management services to be implemented.

#### 8.1 Process Spawning
The main system spawns your server using Node.js child_process following [`/documents/backend-architecture.md`](./backend-architecture.md):

**Process Management Architecture**:
- **Process Identifier**: `user_{userId}_mcp_{mcpId}_{mcpType}_{instanceNum}`
- **Port Assignment**: Formula `3001 + (hash(userId) * 10) + instanceNum` (range: 3001-4000)
  - **⚠️ Note**: Requires UUID-to-integer mapping for port calculation
- **Process Limits**: 512MB memory, 50% CPU usage
- **User Isolation**: Non-privileged execution (uid/gid 1001)
- **Environment Variables**: Decrypted credentials injected at spawn time

**Spawning Process**:
```javascript
// Main system spawns MCP server process
const spawn = require('child_process').spawn;
const mcpProcess = spawn('node', ['./mcp-servers/your-api-mcp-server.js'], {
  env: {
    ...process.env,
    API_KEY: decryptedCredentials.api_key,
    CLIENT_SECRET: decryptedCredentials.client_secret,
    BASE_URL: config.base_url,
    PORT: assignedPort,
    USER_ID: userId,
    MCP_ID: mcpId,
    INSTANCE_NUM: instanceNum
  },
  stdio: ['pipe', 'pipe', 'pipe'],
  uid: 1001,
  gid: 1001
});
```

**Process Tracking**:
- Process ID stored in `mcp_instances.process_id`
- Health checks every 30 seconds using `process.kill(pid, 0)`
- Automatic restart on crash with exponential backoff
- Graceful shutdown with SIGTERM handling

#### 8.2 File-Based Logging
**⚠️ Implementation Required**: This section requires file-based logging infrastructure to be implemented.

Your server's stdout/stderr will be captured to the structured logging system:
```
./logs/
├── system/              # System-wide logs
└── users/
    └── user_{userId}/
        ├── activity.log                    # User activity logs
        └── mcp_{mcpId}_{mcpType}_{instanceNum}/
            ├── app.log                     # Application logs (stdout)
            ├── access.log                  # HTTP access logs  
            ├── error.log                   # Error logs (stderr)
            ├── metrics.json                # Performance metrics
            └── process.log                 # Process lifecycle logs
```

**Log Rotation and Retention**:
- **Maximum file size**: 10MB per log file
- **Retention**: 5 rotated files per log type
- **Format**: JSON structured logging with timestamps
- **Compression**: Gzip compression for rotated files
- **Cleanup**: Automatic cleanup after 30 days

**Metrics Collection**:
```javascript
// Metrics collection every 5 minutes
setInterval(() => {
  const metrics = {
    timestamp: new Date().toISOString(),
    pid: process.pid,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    uptime: process.uptime(),
    api_calls: apiCallCount,
    errors: errorCount,
    active_connections: activeConnections
  };
  
  logger.info('Metrics', metrics);
}, 5 * 60 * 1000);
```

### Step 9: Testing and Validation

#### 9.1 Local Testing
- Test server startup with required environment variables
- Verify MCP protocol responses
- Test API integration with sample requests
- Check error handling and logging

#### 9.2 Integration Testing
- Test with main system process spawning
- Verify credential passing works
- Check log file creation and content
- Test port assignment and access

### Step 10: Documentation and Maintenance

#### 10.1 Server Documentation
Create documentation for your MCP server:
- Available tools and resources
- Required credentials and setup
- API-specific considerations
- Troubleshooting guide

#### 10.2 Monitoring and Updates
- Monitor API changes and deprecations
- Update server for new API features
- Maintain credential security
- Regular testing and validation

## Best Practices

### Security
- **Never log sensitive credentials** - All credentials are encrypted at rest using AES-256-GCM
- **Validate all inputs** before API calls using Joi schemas
- **Handle authentication errors gracefully** - Implement proper error responses
- **Use HTTPS for all API communications** - TLS required for external API calls
- **Process isolation** - Run with non-privileged user (uid/gid 1001)
- **Resource limits** - Respect memory (512MB) and CPU (50%) constraints
- **Network isolation** - Bind only to localhost, use assigned port range (3001-4000)
- **User authentication** - Integrate with magic link authentication system (see `/documents/authentication-flow.md`)
- **Session management** - Respect JWT cookie expiration (7 days)
- **Rate limiting** - Implement rate limiting for API endpoints

### Performance
- Implement appropriate caching where possible
- Respect API rate limits
- Monitor resource usage
- Handle large responses efficiently

### Reliability
- Implement retry logic for transient failures
- Graceful degradation for API downtime
- Comprehensive error handling
- Proper logging for debugging

### Maintainability
- Follow consistent code structure
- Document API-specific quirks
- Use configuration for API endpoints
- Implement proper testing

## Common Patterns

### OAuth Flow
For APIs requiring OAuth:
```javascript
// Handle OAuth token refresh
async function refreshToken() {
  const response = await axios.post('/oauth/token', {
    grant_type: 'refresh_token',
    refresh_token: process.env.REFRESH_TOKEN
  });
  
  // Update token for future requests
  apiClient.defaults.headers.Authorization = `Bearer ${response.data.access_token}`;
}
```

### Pagination
For APIs with paginated responses:
```javascript
async function getAllItems() {
  let allItems = [];
  let page = 1;
  
  while (true) {
    const response = await apiClient.get(`/items?page=${page}`);
    allItems.push(...response.data.items);
    
    if (!response.data.has_more) break;
    page++;
  }
  
  return allItems;
}
```

### Webhook Support
For APIs that support webhooks:
```javascript
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  // Process webhook data
  res.status(200).send('OK');
});
```

## Troubleshooting

### Common Issues
1. **Authentication Failures**: Check credential format and API key validity
2. **Rate Limiting**: Implement proper delays and retry logic
3. **Network Errors**: Handle timeouts and connection issues
4. **Data Format Issues**: Validate API response structures
5. **Memory Leaks**: Monitor and clean up resources properly

### Debugging Tips
- Use detailed logging for API requests/responses (see [`/documents/logging-monitoring.md`](./logging-monitoring.md))
- Test with API documentation examples
- Verify environment variable passing (see [`/documents/backend-architecture.md`](./backend-architecture.md))
- Check network connectivity to target API (see [`/documents/security-architecture.md`](./security-architecture.md))
- Monitor process health and resource usage (see [`/documents/backend-architecture.md`](./backend-architecture.md))
- Review authentication flow integration (see [`/documents/authentication-flow.md`](./authentication-flow.md))
- Validate database schema compliance (see [`/documents/database-schema.md`](./database-schema.md))

This guide provides a comprehensive framework for creating MCP servers that integrate with any API while following the MiniMCP architecture principles of process isolation, file-based logging, and simple Node.js process management.