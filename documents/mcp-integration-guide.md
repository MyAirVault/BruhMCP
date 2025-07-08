# MCP Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [MCP Architecture](#mcp-architecture)
3. [Process Management](#process-management)
4. [MCP Type Configuration](#mcp-type-configuration)
5. [API Key Management](#api-key-management)
6. [Process Lifecycle](#process-lifecycle)
7. [Adding New MCP Types](#adding-new-mcp-types)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Overview

This guide explains how Model Context Protocol (MCP) instances are managed within the MiniMCP system. Each MCP runs as an isolated Node.js process with specific configurations and API integrations.

## MCP Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                      MCP Instance                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ Node.js Process │    │   MCP Runtime    │               │
│  │  - Process ID   │    │  - API Client    │               │
│  │  - Assigned     │───▶│  - Protocol      │               │
│  │    Port         │    │    Handler       │               │
│  │  - Isolated     │    │  - HTTP Server   │               │
│  │    Memory       │    │  - Event Loop    │               │
│  └─────────────────┘    └─────────────────┘               │
│           │                      │                          │
│           ▼                      ▼                          │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │   Environment   │    │  External API    │               │
│  │   Variables     │    │  (Gmail, Figma,  │               │
│  │  - API Keys     │───▶│   GitHub, etc.)  │               │
│  │  - Config       │    │                  │               │
│  │  - Port Number  │    │                  │               │
│  └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### MCP Instance Properties

1. **Unique Identifier**: UUID for database reference
2. **Access Token**: Secure token for API access
3. **Process ID**: Node.js process identifier
4. **Assigned Port**: Unique port for HTTP communication
5. **Access URL**: Direct URL (http://localhost:PORT)
6. **Expiration Time**: TTL for automatic cleanup
7. **Status**: Current state (pending, running, expired, etc.)

## Process Management

### MCP Server Implementation

Each MCP type has a dedicated Node.js server script:

```javascript
// Example: Gmail MCP Server (gmail-mcp-server.js)
const express = require('express');
const { MCPRuntime } = require('@modelcontextprotocol/runtime');

const app = express();
const port = process.env.PORT || 3001;
const mcpId = process.env.MCP_ID;
const apiKey = process.env.API_KEY;

// Initialize MCP with Gmail API
const mcp = new MCPRuntime({
  type: 'gmail',
  apiKey: apiKey,
  config: {
    scopes: ['gmail.readonly', 'gmail.send']
  }
});

// MCP endpoints
app.use('/mcp', mcp.router);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mcpId, 
    timestamp: new Date().toISOString() 
  });
});

app.listen(port, () => {
  console.log(`Gmail MCP server running on port ${port}`);
});
```

### Process Creation Flow

```javascript
// Process creation flow
async function createMCPProcess(mcpType, config) {
  const { spawn } = require('child_process');
  const path = require('path');
  
  // 1. Get available port
  const assignedPort = await portManager.getAvailablePort();
  
  // 2. Prepare environment variables
  const env = {
    ...process.env,
    PORT: assignedPort,
    MCP_ID: config.instanceId,
    API_KEY: config.decryptedApiKey,
    LOG_LEVEL: config.logLevel || 'info',
    NODE_ENV: 'production'
  };
  
  // 3. Start MCP process
  const mcpProcess = spawn('node', [
    path.join(__dirname, 'mcp-servers', `${mcpType}-mcp-server.js`)
  ], {
    env,
    detached: false,
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // 4. Setup process monitoring
  mcpProcess.stdout.on('data', (data) => {
    logger.info(`MCP ${config.instanceId} stdout: ${data}`);
  });
  
  mcpProcess.stderr.on('data', (data) => {
    logger.error(`MCP ${config.instanceId} stderr: ${data}`);
  });
  
  mcpProcess.on('exit', (code) => {
    logger.info(`MCP ${config.instanceId} exited with code ${code}`);
    processManager.handleProcessExit(config.instanceId, code);
  });
  
  return {
    processId: mcpProcess.pid,
    assignedPort,
    accessUrl: `http://localhost:${assignedPort}`
  };
}
```

### Resource Monitoring

Resource tracking per process:
- **CPU**: Monitor via process.cpuUsage()
- **Memory**: Monitor via process.memoryUsage()
- **Port**: Unique port assignment
- **Process Health**: Regular health checks

## MCP Type Configuration

### Configuration Structure

```javascript
// MCP Type configuration in database
{
  "name": "gmail",
  "display_name": "Gmail MCP",
  "docker_image": "minimcp/gmail-mcp:latest",
  "config_template": {
    "api_version": "v1",
    "scopes": ["gmail.readonly", "gmail.send"],
    "timeout_ms": 30000,
    "retry_attempts": 3
  },
  "resource_limits": {
    "cpu": "0.5",
    "memory": "512m",
    "disk": "1g"
  },
  "environment_variables": [
    {
      "name": "GMAIL_API_ENDPOINT",
      "value": "https://gmail.googleapis.com"
    }
  ],
  "health_check": {
    "endpoint": "/health",
    "interval": 30,
    "timeout": 5,
    "retries": 3
  }
}
```

### Supported MCP Types

#### 1. Gmail MCP
```javascript
{
  "name": "gmail",
  "required_auth": "oauth2",
  "scopes": [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send"
  ],
  "capabilities": [
    "list_messages",
    "read_message",
    "send_message",
    "search_messages"
  ]
}
```

#### 2. Figma MCP
```javascript
{
  "name": "figma",
  "required_auth": "api_key",
  "capabilities": [
    "list_files",
    "read_file",
    "export_assets",
    "get_comments"
  ]
}
```

#### 3. GitHub MCP
```javascript
{
  "name": "github",
  "required_auth": "personal_access_token",
  "scopes": [
    "repo",
    "read:org",
    "write:discussion"
  ],
  "capabilities": [
    "list_repos",
    "read_files",
    "create_issue",
    "manage_pr"
  ]
}
```

## API Key Management

### Storage Strategy

```javascript
// API key encryption and storage
class APIKeyManager {
  constructor(encryptionKey) {
    this.cipher = crypto.createCipher('aes-256-gcm', encryptionKey);
  }
  
  async storeAPIKey(userId, mcpType, apiKey) {
    // 1. Generate unique IV
    const iv = crypto.randomBytes(16);
    
    // 2. Encrypt API key
    const encrypted = await this.encrypt(apiKey, iv);
    
    // 3. Store in database
    await db.query(
      `INSERT INTO api_keys 
       (user_id, mcp_type_id, encrypted_key, encryption_iv, key_hint) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, mcpTypeId, encrypted, iv.toString('hex'), apiKey.slice(-4)]
    );
  }
  
  async retrieveAPIKey(userId, mcpType) {
    // 1. Get encrypted key from database
    const result = await db.query(
      `SELECT encrypted_key, encryption_iv 
       FROM api_keys 
       WHERE user_id = $1 AND mcp_type_id = $2`,
      [userId, mcpTypeId]
    );
    
    // 2. Decrypt
    return await this.decrypt(
      result.encrypted_key, 
      Buffer.from(result.encryption_iv, 'hex')
    );
  }
}
```

### Key Rotation

- Automatic key rotation every 90 days
- Grace period for old keys
- Notification system for expiring keys

## Process Lifecycle

### 1. Creation Phase
```javascript
async function createMCPInstance(request) {
  // Validate request
  const { mcpType, expirationMinutes, config } = request;
  
  // Check user limits
  await checkUserLimits(request.userId);
  
  // Retrieve API key
  const apiKey = await apiKeyManager.retrieve(request.userId, mcpType);
  
  // Create database record
  const instance = await db.createMCPInstance({
    userId: request.userId,
    mcpType,
    expiresAt: new Date(Date.now() + expirationMinutes * 60000),
    status: 'pending'
  });
  
  // Create process
  const process = await processService.createProcess({
    mcpType,
    instanceId: instance.id,
    apiKey,
    config
  });
  
  // Update instance with process info
  await db.updateMCPInstance(instance.id, {
    processId: process.processId,
    assignedPort: process.assignedPort,
    accessUrl: process.accessUrl,
    status: 'running'
  });
  
  // Start monitoring
  monitoringService.startMonitoring(instance.id);
  
  return instance;
}
```

### 2. Running Phase
```javascript
// Health monitoring
class MCPMonitor {
  async checkHealth(instanceId) {
    const instance = await db.getMCPInstance(instanceId);
    
    try {
      // Check process status
      const isRunning = await this.isProcessRunning(instance.processId);
      
      if (!isRunning) {
        throw new Error('Process not running');
      }
      
      // Check health endpoint
      const health = await axios.get(
        `http://localhost:${instance.assignedPort}/health`,
        { timeout: 5000 }
      );
      
      // Get process stats
      const stats = await this.getProcessStats(instance.processId);
      
      // Update stats
      await db.updateMCPInstance(instanceId, {
        stats: {
          cpu: stats.cpu.percent,
          memory: stats.memory.rss,
          health: health.data
        },
        lastChecked: new Date()
      });
      
    } catch (error) {
      await this.handleUnhealthy(instanceId, error);
    }
  }
  
  async isProcessRunning(pid) {
    try {
      process.kill(pid, 0); // Signal 0 checks if process exists
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

### 3. Expiration Phase
```javascript
// Expiration handler
async function handleExpiredMCPs() {
  // Find expired instances
  const expired = await db.query(
    `SELECT * FROM mcp_instances 
     WHERE expires_at < NOW() 
     AND status = 'running'`
  );
  
  for (const instance of expired) {
    try {
      // Stop process
      if (instance.process_id) {
        process.kill(instance.process_id, 'SIGTERM');
        
        // Wait for graceful shutdown, then force kill if needed
        setTimeout(() => {
          try {
            process.kill(instance.process_id, 'SIGKILL');
          } catch (error) {
            // Process already terminated
          }
        }, 10000);
      }
      
      // Release port
      await portManager.releasePort(instance.assigned_port);
      
      // Update status
      await db.updateMCPInstance(instance.id, {
        status: 'expired',
        stoppedAt: new Date()
      });
      
      // Archive logs
      await logService.archiveLogs(instance.id);
      
      // Notify user
      await notificationService.sendExpiredNotification(instance);
      
    } catch (error) {
      logger.error(`Failed to expire MCP ${instance.id}`, error);
    }
  }
}
```

### 4. Restoration Phase
```javascript
async function restoreMCP(instanceId, userId) {
  const instance = await db.getMCPInstance(instanceId);
  
  // Validate
  if (instance.user_id !== userId) {
    throw new ForbiddenError('Access denied');
  }
  
  if (instance.status !== 'disconnected') {
    throw new BadRequestError('Can only restore disconnected MCPs');
  }
  
  // Check if process still exists
  const isRunning = await isProcessRunning(instance.process_id);
  
  if (isRunning) {
    // Process is still running, just update status
    await db.updateMCPInstance(instanceId, {
      status: 'running'
    });
  } else {
    // Process died, create new one
    const apiKey = await apiKeyService.retrieve(userId, instance.mcp_type);
    
    const newProcess = await processService.createProcess({
      mcpType: instance.mcp_type,
      instanceId: instance.id,
      apiKey,
      config: instance.config
    });
    
    await db.updateMCPInstance(instanceId, {
      processId: newProcess.processId,
      assignedPort: newProcess.assignedPort,
      accessUrl: newProcess.accessUrl,
      status: 'running',
      restoredAt: new Date()
    });
  }
  
  return instance;
}

async function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
}
```

## Adding New MCP Types

### Step 1: Create MCP Implementation

```javascript
// Example: Slack MCP implementation
class SlackMCP {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.client = new SlackWebClient(this.apiKey);
  }
  
  // MCP Protocol methods
  async listChannels() {
    const result = await this.client.conversations.list();
    return result.channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: 'channel'
    }));
  }
  
  async sendMessage(channelId, text) {
    return await this.client.chat.postMessage({
      channel: channelId,
      text: text
    });
  }
  
  // Health check
  async health() {
    const auth = await this.client.auth.test();
    return {
      status: 'healthy',
      team: auth.team,
      user: auth.user
    };
  }
}
```

### Step 2: Create MCP Server Script

```javascript
// slack-mcp-server.js
const express = require('express');
const { SlackMCP } = require('./slack-mcp');

const app = express();
const port = process.env.PORT || 3001;
const mcpId = process.env.MCP_ID;
const apiKey = process.env.API_KEY;

// Initialize Slack MCP
const slackMCP = new SlackMCP({
  apiKey: apiKey,
  mcpId: mcpId
});

app.use(express.json());

// MCP endpoints
app.get('/channels', async (req, res) => {
  try {
    const channels = await slackMCP.listChannels();
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/message', async (req, res) => {
  try {
    const { channelId, text } = req.body;
    const result = await slackMCP.sendMessage(channelId, text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const health = await slackMCP.health();
    res.json({
      status: 'healthy',
      mcpId,
      ...health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Slack MCP server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});
```

### Step 3: Register MCP Type

```sql
INSERT INTO mcp_types (
  name,
  display_name,
  description,
  server_script,
  config_template,
  required_scopes,
  resource_limits
) VALUES (
  'slack',
  'Slack MCP',
  'Access Slack workspace through MCP',
  'slack-mcp-server.js',
  '{"api_version": "v1", "features": ["chat", "files"]}',
  '["channels:read", "chat:write", "files:read"]',
  '{"max_memory_mb": "512", "max_cpu_percent": "50"}'
);
```

### Step 4: Update Process Service

```javascript
// Add to process service
class ProcessService {
  async createProcess(config) {
    const { mcpType, instanceId, apiKey } = config;
    
    // Get MCP type configuration
    const mcpTypeConfig = await db.getMCPType(mcpType);
    
    // Get available port
    const assignedPort = await portManager.getAvailablePort();
    
    // Prepare environment
    const env = {
      ...process.env,
      PORT: assignedPort,
      MCP_ID: instanceId,
      API_KEY: apiKey,
      NODE_ENV: 'production'
    };
    
    // Start process with the appropriate server script
    const mcpProcess = spawn('node', [
      path.join(__dirname, 'mcp-servers', mcpTypeConfig.server_script)
    ], {
      env,
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    return {
      processId: mcpProcess.pid,
      assignedPort,
      accessUrl: `http://localhost:${assignedPort}`
    };
  }
}
```

## Security Considerations

### Process Isolation

1. **Process Boundaries**
   - Each MCP runs as separate Node.js process
   - No shared memory between processes
   - Operating system level process isolation

2. **Resource Monitoring**
   - CPU and memory usage tracking per process
   - Process termination for resource violations
   - Port isolation (unique port per process)

3. **Security Measures**
   ```javascript
   // Process security configuration
   const processConfig = {
     // Run as non-privileged user
     uid: 1001,
     gid: 1001,
     
     // Limit capabilities
     cwd: '/app/mcp-servers',
     
     // Environment isolation
     env: {
       NODE_ENV: 'production',
       // Only necessary environment variables
     }
   };
   ```

### API Key Security

1. **Encryption at Rest**
   - AES-256-GCM encryption
   - Unique IV per key
   - Master key in secure environment variable

2. **Key Access Control**
   - Keys never exposed to frontend
   - Decrypted only in process memory
   - Audit trail for key usage

3. **Key Lifecycle**
   - Automatic expiration
   - Rotation reminders
   - Secure deletion

### Runtime Security

1. **Process Security**
   - Regular dependency scans
   - Node.js version updates
   - Security auditing

2. **Runtime Protection**
   - Process monitoring
   - Resource limits enforcement
   - Non-root user execution

## Troubleshooting

### Common Issues

#### 1. Process Won't Start
```bash
# Check process status
ps aux | grep mcp-

# Check available ports
netstat -tulpn | grep :3001

# Common causes:
# - Port already in use
# - Invalid API key
# - Missing dependencies
# - Permission issues
```

#### 2. MCP Disconnected
```javascript
// Diagnostic steps
async function diagnoseMCP(instanceId) {
  const instance = await db.getMCPInstance(instanceId);
  
  // Check process existence
  try {
    const isRunning = await isProcessRunning(instance.process_id);
    console.log('Process running:', isRunning);
    
    if (isRunning) {
      // Check if port is responding
      const health = await axios.get(
        `http://localhost:${instance.assigned_port}/health`,
        { timeout: 5000 }
      );
      console.log('Health check:', health.data);
    }
    
    // Check process stats
    const stats = await getProcessStats(instance.process_id);
    console.log('Process stats:', stats);
    
  } catch (error) {
    console.log('Process diagnostic error:', error.message);
  }
}

async function getProcessStats(pid) {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    exec(`ps -p ${pid} -o %cpu,%mem,pid,etime`, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}
```

#### 3. Performance Issues
```javascript
// Performance monitoring
async function checkMCPPerformance(instanceId) {
  const instance = await db.getMCPInstance(instanceId);
  const stats = await getProcessStats(instance.process_id);
  
  const cpuUsage = parseFloat(stats.cpu);
  const memoryUsage = parseFloat(stats.memory);
  
  if (cpuUsage > 80) {
    logger.warn(`High CPU usage for MCP ${instanceId}: ${cpuUsage}%`);
    
    // Consider terminating if consistently high
    if (stats.consecutiveHighCPU > 3) {
      await terminateMCP(instanceId, 'High CPU usage');
    }
  }
  
  if (memoryUsage > 80) { // 80% of system memory
    logger.warn(`High memory usage for MCP ${instanceId}: ${memoryUsage}%`);
    
    // Consider terminating if consistently high
    if (stats.consecutiveHighMemory > 3) {
      await terminateMCP(instanceId, 'High memory usage');
    }
  }
}
```

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
// Enable debug mode for MCP process
await processService.createProcess({
  // ... other config
  env: {
    ...baseEnv,
    LOG_LEVEL: 'debug',
    DEBUG: 'mcp:*',
    NODE_DEBUG: 'http,net,stream'
  }
});
```

## Best Practices

1. **Process Management**
   - Implement graceful shutdown handling
   - Monitor process memory leaks
   - Regular cleanup of terminated processes
   - Port reuse optimization

2. **Monitoring**
   - Set up alerts for process failures
   - Monitor resource usage trends
   - Track API rate limits
   - Health check endpoints

3. **Security**
   - Run processes as non-privileged users
   - Environment variable protection
   - Regular security audits
   - Principle of least privilege

## Next Steps

1. Review [Backend Architecture](./backend-architecture.md) for system overview
2. Check [Security Architecture](./security-architecture.md) for detailed security measures
3. See [Implementation Roadmap](./backend-implementation-roadmap.md) for development timeline