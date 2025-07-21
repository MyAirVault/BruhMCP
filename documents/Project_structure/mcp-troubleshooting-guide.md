# MCP Server Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [Debugging Techniques](#debugging-techniques)
3. [Performance Issues](#performance-issues)
4. [Security Issues](#security-issues)
5. [Protocol Compliance Issues](#protocol-compliance-issues)
6. [Best Practices](#best-practices)
7. [Monitoring and Logging](#monitoring-and-logging)

## Common Issues

### 1. Protocol Version Mismatch

#### Symptoms
- Client connection fails during initialization
- Error: "Unsupported protocol version"
- JSON-RPC error code: -32602

#### Causes
- Client using different protocol version than server
- Server not validating protocol version correctly
- Hardcoded protocol version in client

#### Solutions
```javascript
// Correct implementation
async handleInitialize(params, id) {
  if (!params || !params.protocolVersion) {
    return this.createErrorResponse(id, -32602, 'Invalid params: missing protocolVersion');
  }

  // Validate exact protocol version
  if (params.protocolVersion !== '2024-11-05') {
    return this.createErrorResponse(id, -32602, 'Unsupported protocol version');
  }

  this.initialized = true;
  return this.createSuccessResponse(id, {
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    serverInfo: { name: 'Server', version: '1.0.0' }
  });
}
```

#### Prevention
- Always validate protocol version in initialize method
- Use constants for protocol version
- Document supported versions

### 2. Server Not Initialized

#### Symptoms
- Tools/list or tools/call fails with error
- Error: "Server not initialized"
- JSON-RPC error code: -31000

#### Causes
- Client calling methods before initialize
- Server not setting initialized flag
- Connection lost between initialize and method call

#### Solutions
```javascript
// Add initialization check to all methods
async handleToolsList(params, id) {
  if (!this.initialized) {
    return this.createErrorResponse(id, -31000, 'Server not initialized');
  }
  // ... rest of method
}

// Track initialization state properly
constructor(serviceConfig, apiKey) {
  this.serviceConfig = serviceConfig;
  this.apiKey = apiKey;
  this.initialized = false; // Important: start as false
}
```

#### Prevention
- Always check initialization state in methods
- Implement proper session management
- Add initialization timeout handling

### 3. Invalid JSON-RPC Format

#### Symptoms
- Error: "Invalid Request"
- JSON-RPC error code: -32600
- Messages not processed

#### Causes
- Missing required fields (jsonrpc, id, method)
- Wrong JSON-RPC version
- Invalid JSON syntax

#### Solutions
```javascript
// Proper JSON-RPC validation
isValidJsonRpc(message) {
  return (
    message &&
    message.jsonrpc === '2.0' &&
    typeof message.method === 'string' &&
    (message.id !== undefined || message.id === null)
  );
}

// Handle validation errors
async processMessage(message) {
  if (!this.isValidJsonRpc(message)) {
    return this.createErrorResponse(
      message.id || null, 
      -32600, 
      'Invalid Request'
    );
  }
  // ... continue processing
}
```

#### Prevention
- Validate all incoming messages
- Use JSON schema validation
- Test with malformed messages

### 4. Tool Not Found

#### Symptoms
- Tool execution fails
- Error: "Method not found: tools/call"
- Tool name not recognized

#### Causes
- Tool not defined in tools.js
- Case sensitivity issues
- Tool name mismatch between definition and execution

#### Solutions
```javascript
// Ensure tools are properly exported
export function getTools() {
  return {
    tools: [
      {
        name: 'get_data', // Exact name used in execution
        description: 'Gets data from service',
        inputSchema: { /* schema */ }
      }
    ]
  };
}

// Handle unknown tools gracefully
async executeToolCall(toolName, args, apiKey) {
  const validTools = ['get_data', 'update_data', 'delete_data'];
  
  if (!validTools.includes(toolName)) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  switch (toolName) {
    case 'get_data':
      return await getData(args, apiKey);
    // ... other cases
  }
}
```

#### Prevention
- Maintain tool registry
- Use constants for tool names
- Add tool validation tests

### 5. Authentication Failures

#### Symptoms
- API calls fail with authentication errors
- 401 Unauthorized responses
- Invalid credentials messages

#### Causes
- Expired API keys
- Invalid credentials format
- Missing authentication middleware
- Credential caching issues

#### Solutions
```javascript
// Implement proper credential validation
async validateCredentials(apiKey) {
  try {
    const response = await fetch('https://api.service.com/auth/verify', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Credential validation failed:', error);
    return false;
  }
}

// Add authentication middleware
app.post('/:instanceId/mcp', async (req, res) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  
  if (!apiKey || !await validateCredentials(apiKey)) {
    return res.status(401).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: { code: -31002, message: 'Authentication failed' }
    });
  }
  
  // ... continue processing
});
```

#### Prevention
- Implement credential caching
- Add credential refresh mechanisms
- Monitor authentication failures

### 6. Rate Limiting Issues

#### Symptoms
- Requests failing with rate limit errors
- 429 Too Many Requests responses
- Slow response times

#### Causes
- Exceeding API rate limits
- No rate limiting implementation
- Burst traffic patterns

#### Solutions
```javascript
// Implement rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    jsonrpc: '2.0',
    id: null,
    error: { code: -31003, message: 'Rate limit exceeded' }
  }
});

app.use('/:instanceId/mcp', limiter);

// Add exponential backoff for API calls
async function makeApiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

#### Prevention
- Implement request queuing
- Add circuit breaker pattern
- Monitor rate limit usage

## Debugging Techniques

### 1. Enable Debug Logging

```javascript
// Add debug logging environment variable
const DEBUG = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

// Log all requests and responses
async processMessage(message) {
  if (DEBUG) {
    console.log('📥 Received message:', JSON.stringify(message, null, 2));
  }
  
  const response = await this.handleMessage(message);
  
  if (DEBUG) {
    console.log('📤 Sending response:', JSON.stringify(response, null, 2));
  }
  
  return response;
}
```

### 2. Request Tracing

```javascript
// Add request IDs for tracing
class MCPJsonRpcHandler {
  constructor(serviceConfig, apiKey) {
    this.serviceConfig = serviceConfig;
    this.apiKey = apiKey;
    this.requestCounter = 0;
  }
  
  async processMessage(message) {
    const requestId = ++this.requestCounter;
    console.log(`[${requestId}] Processing ${message.method}`);
    
    try {
      const response = await this.handleMessage(message);
      console.log(`[${requestId}] Success: ${message.method}`);
      return response;
    } catch (error) {
      console.error(`[${requestId}] Error: ${error.message}`);
      throw error;
    }
  }
}
```

### 3. Health Check Debugging

```javascript
// Enhanced health check with diagnostics
app.get('/:instanceId/health', async (req, res) => {
  const diagnostics = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    instanceId: req.params.instanceId,
    service: SERVICE_CONFIG.name,
    version: SERVICE_CONFIG.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: await checkDatabaseConnection(),
      apiCredentials: await checkApiCredentials(req.params.instanceId),
      externalService: await checkExternalService()
    }
  };
  
  const isHealthy = Object.values(diagnostics.checks).every(check => check.status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json(diagnostics);
});
```

## Performance Issues

### 1. Slow Response Times

#### Symptoms
- High latency for tool calls
- Timeout errors
- Poor user experience

#### Causes
- Blocking operations
- Database query performance
- External API latency
- Memory leaks

#### Solutions
```javascript
// Add request timeouts
const TIMEOUT_MS = 30000; // 30 seconds

async function executeToolCall(toolName, args, apiKey) {
  return Promise.race([
    actualToolExecution(toolName, args, apiKey),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Tool execution timeout')), TIMEOUT_MS)
    )
  ]);
}

// Use connection pooling
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Implement caching
const cache = new Map();

async function getCachedData(key, fetchFunction) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchFunction();
  cache.set(key, data);
  
  // Set TTL
  setTimeout(() => cache.delete(key), 5 * 60 * 1000); // 5 minutes
  
  return data;
}
```

### 2. Memory Leaks

#### Symptoms
- Increasing memory usage over time
- Out of memory errors
- Slow garbage collection

#### Solutions
```javascript
// Proper cleanup in handlers
class MCPJsonRpcHandler {
  constructor(serviceConfig, apiKey) {
    this.serviceConfig = serviceConfig;
    this.apiKey = apiKey;
    this.activeRequests = new Map();
  }
  
  async processMessage(message) {
    this.activeRequests.set(message.id, Date.now());
    
    try {
      const response = await this.handleMessage(message);
      return response;
    } finally {
      this.activeRequests.delete(message.id);
    }
  }
  
  // Cleanup method
  cleanup() {
    this.activeRequests.clear();
    // Clean up other resources
  }
}

// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB'
  });
}, 60000); // Log every minute
```

## Security Issues

### 1. API Key Exposure

#### Prevention
```javascript
// Never log API keys
function sanitizeForLogging(data) {
  const sanitized = { ...data };
  if (sanitized.apiKey) {
    sanitized.apiKey = '***REDACTED***';
  }
  if (sanitized.authorization) {
    sanitized.authorization = '***REDACTED***';
  }
  return sanitized;
}

// Store credentials securely
import crypto from 'crypto';

function encryptCredential(credential, key) {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(credential, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
```

### 2. Input Validation

```javascript
// Validate all inputs
import Joi from 'joi';

const toolCallSchema = Joi.object({
  name: Joi.string().required(),
  arguments: Joi.object().required()
});

async function handleToolsCall(params, id) {
  const { error, value } = toolCallSchema.validate(params);
  if (error) {
    return this.createErrorResponse(id, -32602, `Invalid params: ${error.message}`);
  }
  
  // Continue with validated params
}
```

## Protocol Compliance Issues

### 1. Response Format Validation

```javascript
// Ensure all responses follow MCP spec
function validateMCPResponse(response) {
  const requiredFields = ['jsonrpc', 'id'];
  const hasResult = 'result' in response;
  const hasError = 'error' in response;
  
  if (!hasResult && !hasError) {
    throw new Error('Response must have either result or error');
  }
  
  if (hasResult && hasError) {
    throw new Error('Response cannot have both result and error');
  }
  
  if (response.jsonrpc !== '2.0') {
    throw new Error('Invalid JSON-RPC version');
  }
  
  return true;
}
```

### 2. Tool Schema Validation

```javascript
// Validate tool definitions
function validateToolDefinition(tool) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    inputSchema: Joi.object({
      type: Joi.string().valid('object').required(),
      properties: Joi.object().required(),
      required: Joi.array().items(Joi.string())
    }).required()
  });
  
  return schema.validate(tool);
}
```

## Best Practices

### 1. Error Handling Strategy

```javascript
// Centralized error handling
class MCPError extends Error {
  constructor(code, message, data = null) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

// Use specific error types
class AuthenticationError extends MCPError {
  constructor(message, data) {
    super(-31002, message, data);
  }
}

class RateLimitError extends MCPError {
  constructor(message, data) {
    super(-31003, message, data);
  }
}
```

### 2. Structured Logging

```javascript
// Implement structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log with context
logger.info('Tool execution started', {
  toolName: 'get_data',
  instanceId: 'instance123',
  requestId: 'req-456',
  timestamp: new Date().toISOString()
});
```

### 3. Configuration Management

```javascript
// Use environment-specific configuration
const config = {
  development: {
    logLevel: 'debug',
    timeout: 10000,
    retries: 1
  },
  production: {
    logLevel: 'info',
    timeout: 30000,
    retries: 3
  }
};

const env = process.env.NODE_ENV || 'development';
const currentConfig = config[env];
```

## Monitoring and Logging

### 1. Metrics Collection

```javascript
// Basic metrics collection
class MetricsCollector {
  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      toolCalls: new Map()
    };
  }
  
  recordRequest(duration) {
    this.metrics.requestCount++;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + duration) / 
      this.metrics.requestCount;
  }
  
  recordError() {
    this.metrics.errorCount++;
  }
  
  recordToolCall(toolName) {
    const count = this.metrics.toolCalls.get(toolName) || 0;
    this.metrics.toolCalls.set(toolName, count + 1);
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.metrics.errorCount / this.metrics.requestCount,
      toolCalls: Object.fromEntries(this.metrics.toolCalls)
    };
  }
}
```

### 2. Alert Configuration

```javascript
// Set up alerts for critical issues
function checkHealthMetrics(metrics) {
  const alerts = [];
  
  if (metrics.errorRate > 0.1) {
    alerts.push({
      level: 'critical',
      message: `High error rate: ${metrics.errorRate * 100}%`
    });
  }
  
  if (metrics.averageResponseTime > 5000) {
    alerts.push({
      level: 'warning',
      message: `Slow response time: ${metrics.averageResponseTime}ms`
    });
  }
  
  return alerts;
}
```

### 3. Log Analysis

```javascript
// Log parsing and analysis
function analyzeErrorLogs(logs) {
  const errorPatterns = logs
    .filter(log => log.level === 'error')
    .reduce((acc, log) => {
      const key = log.error?.code || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  
  return {
    totalErrors: Object.values(errorPatterns).reduce((sum, count) => sum + count, 0),
    errorsByType: errorPatterns,
    topErrors: Object.entries(errorPatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  };
}
```

## Testing Strategies

### 1. Unit Testing

```javascript
// Test individual components
describe('MCPJsonRpcHandler', () => {
  it('should handle initialize correctly', async () => {
    const handler = new MCPJsonRpcHandler(config, 'test-key');
    
    const response = await handler.processMessage({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'Test', version: '1.0.0' }
      }
    });
    
    expect(response.result.protocolVersion).toBe('2024-11-05');
    expect(handler.initialized).toBe(true);
  });
});
```

### 2. Integration Testing

```javascript
// Test complete workflows
describe('MCP Integration', () => {
  it('should execute tool call workflow', async () => {
    const response = await fetch('http://localhost:49280/instance123/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'Test', version: '1.0.0' }
        }
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.result.protocolVersion).toBe('2024-11-05');
  });
});
```

## Conclusion

This troubleshooting guide provides comprehensive solutions for common MCP server issues. Regular monitoring, proper error handling, and following best practices will help maintain robust and reliable MCP server implementations.

Remember to:
- Log everything relevant for debugging
- Implement proper error handling
- Monitor performance metrics
- Test thoroughly
- Follow security best practices
- Keep documentation updated

For specific implementation details, refer to the MCP Server Development Guide and Protocol Specification documents.