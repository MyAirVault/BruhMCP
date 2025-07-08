# Logging and Monitoring

## Table of Contents
1. [Overview](#overview)
2. [Logging Strategy](#logging-strategy)
3. [Application Logging](#application-logging)
4. [System Monitoring](#system-monitoring)
5. [Process Monitoring](#process-monitoring)
6. [Performance Metrics](#performance-metrics)
7. [Alerting](#alerting)
8. [Log Aggregation](#log-aggregation)
9. [Security Monitoring](#security-monitoring)
10. [Observability Stack](#observability-stack)
11. [Troubleshooting](#troubleshooting)

## Overview

The MiniMCP logging and monitoring system provides comprehensive observability across all system components. This includes application logs, system metrics, Node.js process telemetry, and security events.

### Observability Goals
- **Visibility**: Complete system visibility
- **Debuggability**: Easy troubleshooting
- **Performance**: Real-time performance insights
- **Security**: Security event detection
- **Compliance**: Audit trail maintenance

## Logging Strategy

### Log Levels and Categories

#### Standard Log Levels
```javascript
const LOG_LEVELS = {
  ERROR: 0,   // System errors, exceptions
  WARN: 1,    // Warning conditions
  INFO: 2,    // General information
  HTTP: 3,    // HTTP requests/responses
  VERBOSE: 4, // Verbose information
  DEBUG: 5,   // Debug information
  SILLY: 6    // Everything
};
```

#### Log Categories
```javascript
const LOG_CATEGORIES = {
  API: 'api',           // API requests/responses
  AUTH: 'auth',         // Authentication events
  MCP: 'mcp',          // MCP lifecycle events
  PROCESS: 'process',   // Process operations
  DATABASE: 'database', // Database operations
  SECURITY: 'security', // Security events
  SYSTEM: 'system',     // System events
  AUDIT: 'audit'        // Audit trail
};
```

### Log Structure

#### Structured Logging Format
```javascript
// Winston logger configuration
const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, category, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      category,
      message,
      correlationId: meta.correlationId,
      userId: meta.userId,
      mcpId: meta.mcpId,
      requestId: meta.requestId,
      metadata: meta
    });
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'minimcp-backend',
    version: process.env.npm_package_version
  },
  transports: [
    // File transports
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      tailable: true
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 20,
      tailable: true
    }),
    
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
```

## Application Logging

### Request Logging

#### HTTP Request Middleware
```javascript
// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const correlationId = req.headers['x-correlation-id'] || uuid();
  
  // Add correlation ID to request
  req.correlationId = correlationId;
  
  // Log request start
  logger.info('HTTP request started', {
    category: LOG_CATEGORIES.API,
    correlationId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('user-agent'),
    ip: req.ip,
    userId: req.user?.id,
    requestId: req.id
  });
  
  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('HTTP request completed', {
      category: LOG_CATEGORIES.API,
      correlationId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length')
    });
  });
  
  next();
};
```

### MCP Lifecycle Logging

#### MCP Event Logging
```javascript
// MCP lifecycle logger
class MCPLogger {
  static logCreated(mcpInstance, userId) {
    logger.info('MCP instance created', {
      category: LOG_CATEGORIES.MCP,
      event: 'mcp_created',
      mcpId: mcpInstance.id,
      userId,
      mcpType: mcpInstance.mcp_type,
      expiresAt: mcpInstance.expires_at,
      processId: mcpInstance.process_id,
      assignedPort: mcpInstance.assigned_port
    });
  }
  
  static logStarted(mcpId, processId, port) {
    logger.info('MCP process started', {
      category: LOG_CATEGORIES.MCP,
      event: 'mcp_started',
      mcpId,
      processId,
      assignedPort: port
    });
  }
  
  static logExpired(mcpId, processId) {
    logger.warn('MCP instance expired', {
      category: LOG_CATEGORIES.MCP,
      event: 'mcp_expired',
      mcpId,
      processId
    });
  }
  
  static logError(mcpId, error, context = {}) {
    logger.error('MCP error occurred', {
      category: LOG_CATEGORIES.MCP,
      event: 'mcp_error',
      mcpId,
      error: error.message,
      stack: error.stack,
      ...context
    });
  }
}
```

### Database Logging

#### Query Logging
```javascript
// Database query logger
class DatabaseLogger {
  static logQuery(query, params, duration, result) {
    const logLevel = duration > 1000 ? 'warn' : 'debug';
    
    logger[logLevel]('Database query executed', {
      category: LOG_CATEGORIES.DATABASE,
      query: this.sanitizeQuery(query),
      paramCount: params?.length || 0,
      duration,
      rowCount: result?.rowCount,
      slow: duration > 1000
    });
  }
  
  static logTransaction(operation, duration, success) {
    logger.info('Database transaction', {
      category: LOG_CATEGORIES.DATABASE,
      operation,
      duration,
      success
    });
  }
  
  static sanitizeQuery(query) {
    // Remove potential sensitive data from logs
    return query.replace(
      /(\$\d+|\?)/g, 
      '[PARAM]'
    ).substring(0, 200);
  }
}
```

## System Monitoring

### Application Metrics

#### Custom Metrics Collection
```javascript
// Prometheus metrics
const prometheus = require('prom-client');

// Default metrics
prometheus.collectDefaultMetrics({
  timeout: 10000,
  prefix: 'minimcp_'
});

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'minimcp_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const mcpInstancesTotal = new prometheus.Gauge({
  name: 'minimcp_instances_total',
  help: 'Total number of MCP instances',
  labelNames: ['status', 'type']
});

const mcpProcessesActive = new prometheus.Gauge({
  name: 'minimcp_processes_active',
  help: 'Number of active MCP processes',
  labelNames: ['mcp_type']
});

const databaseConnectionsActive = new prometheus.Gauge({
  name: 'minimcp_database_connections_active',
  help: 'Number of active database connections'
});

const apiKeysTotal = new prometheus.Gauge({
  name: 'minimcp_api_keys_total',
  help: 'Total number of stored API keys',
  labelNames: ['mcp_type']
});

// Metrics collection service
class MetricsService {
  static updateMCPMetrics() {
    setInterval(async () => {
      try {
        // Get MCP instance counts by status
        const mcpCounts = await db.query(`
          SELECT status, COUNT(*) as count 
          FROM mcp_instances 
          WHERE deleted_at IS NULL 
          GROUP BY status
        `);
        
        // Reset gauge
        mcpInstancesTotal.reset();
        
        // Update metrics
        mcpCounts.rows.forEach(row => {
          mcpInstancesTotal.set(
            { status: row.status, type: 'all' },
            parseInt(row.count)
          );
        });
        
        // Database connections
        const dbStats = await db.pool.totalCount;
        databaseConnectionsActive.set(dbStats);
        
      } catch (error) {
        logger.error('Failed to update metrics', {
          category: LOG_CATEGORIES.SYSTEM,
          error: error.message
        });
      }
    }, 30000); // Every 30 seconds
  }
}
```

### Health Checks

#### Comprehensive Health Monitoring
```javascript
// Health check service
class HealthService {
  static async checkHealth() {
    const healthChecks = {
      database: await this.checkDatabase(),
      processManager: await this.checkProcessManager(),
      diskSpace: await this.checkDiskSpace(),
      memory: await this.checkMemory(),
      activeMCPs: await this.checkActiveMCPs()
    };
    
    const isHealthy = Object.values(healthChecks).every(
      check => check.status === 'healthy'
    );
    
    const result = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: healthChecks
    };
    
    // Log health status
    logger.info('Health check completed', {
      category: LOG_CATEGORIES.SYSTEM,
      ...result
    });
    
    return result;
  }
  
  static async checkDatabase() {
    try {
      const start = Date.now();
      await db.query('SELECT 1');
      const duration = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime: duration,
        connections: db.pool.totalCount
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  static async checkProcessManager() {
    try {
      // Check if we can spawn processes
      const testProcess = require('child_process').spawn('echo', ['test']);
      
      return new Promise((resolve) => {
        testProcess.on('close', (code) => {
          resolve({
            status: code === 0 ? 'healthy' : 'unhealthy',
            message: code === 0 ? 'Process spawning working' : 'Process spawning failed'
          });
        });
      });
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  static async checkActiveMCPs() {
    try {
      const activeMCPs = await db.query(
        'SELECT COUNT(*) as count FROM mcp_instances WHERE status = $1',
        ['running']
      );
      
      return {
        status: 'healthy',
        activeCount: parseInt(activeMCPs.rows[0].count)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}
```

## Process Monitoring

### Log Isolation Strategy

#### User and MCP Specific Logging
```javascript
// Process-level log separation for user and MCP isolation
const createProcessLogger = (mcpId, userId) => {
  const logDir = path.join(__dirname, 'logs', 'mcp-instances');
  const logFile = path.join(logDir, `${userId}_${mcpId}.log`);
  
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          mcpId,
          userId,
          processId: process.pid,
          ...meta
        });
      })
    ),
    transports: [
      new winston.transports.File({
        filename: logFile,
        maxsize: 10 * 1024 * 1024, // 10MB per file
        maxFiles: 5
      })
    ]
  });
};

// Database log storage with proper user isolation
const logToDatabase = async (logEntry) => {
  await db.query(`
    INSERT INTO mcp_logs (
      id, user_id, mcp_id, process_id, timestamp, 
      level, source, message, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    uuid(),
    logEntry.userId,
    logEntry.mcpId, 
    logEntry.processId,
    logEntry.timestamp,
    logEntry.level,
    'process',
    logEntry.message,
    JSON.stringify(logEntry.metadata)
  ]);
};

// User-specific log retrieval with access control
const getUserMCPLogs = async (userId, mcpId, options = {}) => {
  // Verify user owns this MCP
  const mcp = await db.query(`
    SELECT id FROM mcp_instances 
    WHERE id = $1 AND user_id = $2
  `, [mcpId, userId]);
  
  if (!mcp.rows.length) {
    throw new Error('Access denied: MCP not found or not owned by user');
  }
  
  // Retrieve logs only for this user's MCP
  const logs = await db.query(`
    SELECT timestamp, level, source, message, metadata
    FROM mcp_logs 
    WHERE mcp_id = $1 AND user_id = $2
    ORDER BY timestamp DESC
    LIMIT $3 OFFSET $4
  `, [mcpId, userId, options.limit || 100, options.offset || 0]);
  
  return logs.rows;
};
```

#### HTTP Log Polling with User Isolation
```javascript
// Simple HTTP endpoints for log access
app.get('/api/v1/mcps/:id/logs/tail', authenticateUser, async (req, res) => {
  const mcpId = req.params.id;
  const userId = req.user.id;
  const lastTimestamp = req.query.after || new Date(0).toISOString();
  
  // Verify user owns this MCP
  const hasAccess = await verifyMCPAccess(userId, mcpId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Get recent logs since last timestamp
  const logs = await db.query(`
    SELECT timestamp, level, source, message, metadata
    FROM mcp_logs 
    WHERE mcp_id = $1 AND user_id = $2 AND timestamp > $3
    ORDER BY timestamp ASC
    LIMIT 100
  `, [mcpId, userId, lastTimestamp]);
  
  res.json({ 
    data: logs.rows,
    hasMore: logs.rows.length === 100
  });
});

// Server-sent events for real-time updates (optional)
app.get('/api/v1/mcps/:id/logs/stream', authenticateUser, async (req, res) => {
  const mcpId = req.params.id;
  const userId = req.user.id;
  
  // Verify access
  const hasAccess = await verifyMCPAccess(userId, mcpId);
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Setup SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write('data: {"type":"heartbeat"}\n\n');
  }, 30000);
  
  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});
```

### Process Metrics Collection

#### Node.js Process Monitoring
```javascript
// Process monitoring service
class ProcessMonitor {
  constructor() {
    this.monitoredProcesses = new Map();
    this.monitoringInterval = 30000; // 30 seconds
  }
  
  async startMonitoring(processId, mcpId) {
    const monitoringTimer = setInterval(async () => {
      try {
        await this.collectProcessStats(processId, mcpId);
      } catch (error) {
        logger.error('Process monitoring error', {
          category: LOG_CATEGORIES.SYSTEM,
          mcpId,
          processId,
          error: error.message
        });
      }
    }, this.monitoringInterval);
    
    this.monitoredProcesses.set(processId, {
      mcpId,
      timer: monitoringTimer
    });
  }
  
  async collectProcessStats(processId, mcpId) {
    const stats = await this.getProcessStats(processId);
    
    if (!stats) {
      logger.warn('Process not found', {
        category: LOG_CATEGORIES.SYSTEM,
        mcpId,
        processId
      });
      return;
    }
    
    // Log resource usage
    logger.debug('Process resource usage', {
      category: LOG_CATEGORIES.SYSTEM,
      mcpId,
      processId,
      cpu: stats.cpu,
      memory: stats.memory,
      uptime: stats.uptime
    });
    
    // Update database with stats
    await this.updateProcessStats(mcpId, {
      cpu_percent: stats.cpu,
      memory_mb: stats.memory,
      uptime_seconds: stats.uptime,
      timestamp: new Date()
    });
    
    // Check for alerts
    this.checkResourceAlerts(mcpId, stats.cpu, stats.memory);
  }
  
  async getProcessStats(pid) {
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec(`ps -p ${pid} -o %cpu,%mem,etime --no-headers`, (error, stdout) => {
        if (error) {
          resolve(null);
          return;
        }
        
        const parts = stdout.trim().split(/\s+/);
        if (parts.length >= 3) {
          resolve({
            cpu: parseFloat(parts[0]),
            memory: parseFloat(parts[1]),
            uptime: this.parseUptime(parts[2])
          });
        } else {
          resolve(null);
        }
      });
    });
  }
  
  parseUptime(etimeStr) {
    // Convert etime format (e.g., "01:23:45" or "45:67") to seconds
    const parts = etimeStr.split(':');
    if (parts.length === 3) {
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    } else if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  }
}
```

### Process Lifecycle Events

#### Event Tracking
```javascript
// Process event listener
class ProcessEventListener {
  constructor() {
    this.monitoredProcesses = new Map();
  }
  
  async startListening() {
    // Monitor process exits using process events
    setInterval(() => {
      this.checkProcessHealth();
    }, 10000); // Check every 10 seconds
  }
  
  async checkProcessHealth() {
    for (const [processId, mcpInfo] of this.monitoredProcesses) {
      try {
        const isRunning = await this.isProcessRunning(processId);
        
        if (!isRunning) {
          this.handleProcessExit(mcpInfo.mcpId, processId);
        }
      } catch (error) {
        logger.error('Process health check error', {
          category: LOG_CATEGORIES.SYSTEM,
          processId,
          error: error.message
        });
      }
    }
  }
  
  async isProcessRunning(pid) {
    try {
      process.kill(pid, 0); // Signal 0 checks existence
      return true;
    } catch (error) {
      return false;
    }
  }
  
  handleProcessExit(mcpId, processId) {
    logger.info('Process exit detected', {
      category: LOG_CATEGORIES.SYSTEM,
      mcpId,
      processId,
      timestamp: new Date()
    });
    
    // Update database status
    this.updateMCPStatus(mcpId, 'disconnected');
    
    // Remove from monitoring
    this.monitoredProcesses.delete(processId);
    
    // Trigger alerts if unexpected
    this.checkUnexpectedExit(mcpId, processId);
  }
}
```

## Performance Metrics

### Response Time Monitoring

#### API Performance Tracking
```javascript
// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e6; // Convert to milliseconds
    
    // Update Prometheus metrics
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow API request', {
        category: LOG_CATEGORIES.API,
        method: req.method,
        url: req.originalUrl,
        duration,
        statusCode: res.statusCode,
        correlationId: req.correlationId
      });
    }
  });
  
  next();
};
```

### Database Performance

#### Query Performance Monitoring
```javascript
// Database performance wrapper
const performanceDB = {
  async query(text, params) {
    const startTime = Date.now();
    
    try {
      const result = await db.query(text, params);
      const duration = Date.now() - startTime;
      
      // Log query performance
      DatabaseLogger.logQuery(text, params, duration, result);
      
      // Update metrics
      dbQueryDuration
        .labels(this.getQueryType(text))
        .observe(duration / 1000);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('Database query failed', {
        category: LOG_CATEGORIES.DATABASE,
        query: text.substring(0, 100),
        duration,
        error: error.message
      });
      
      throw error;
    }
  },
  
  getQueryType(query) {
    const trimmed = query.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) return 'SELECT';
    if (trimmed.startsWith('INSERT')) return 'INSERT';
    if (trimmed.startsWith('UPDATE')) return 'UPDATE';
    if (trimmed.startsWith('DELETE')) return 'DELETE';
    return 'OTHER';
  }
};
```

## Alerting

### Alert Rules

#### Critical Alerts
```javascript
// Alert configuration
const alertRules = {
  // High error rate
  highErrorRate: {
    metric: 'error_rate_5min',
    threshold: 5, // 5% error rate
    duration: '5m',
    severity: 'critical',
    message: 'High error rate detected'
  },
  
  // High response time
  highResponseTime: {
    metric: 'response_time_p95_5min',
    threshold: 2000, // 2 seconds
    duration: '5m',
    severity: 'warning',
    message: 'High response time detected'
  },
  
  // Process failures
  processFailures: {
    metric: 'process_failures_5min',
    threshold: 3,
    duration: '5m',
    severity: 'critical',
    message: 'Multiple process failures detected'
  },
  
  // Database connection issues
  databaseConnections: {
    metric: 'db_connections_percent',
    threshold: 90, // 90% of pool
    duration: '2m',
    severity: 'warning',
    message: 'Database connection pool nearly exhausted'
  }
};

// Alert manager
class AlertManager {
  async checkAlerts() {
    for (const [name, rule] of Object.entries(alertRules)) {
      const value = await this.getMetricValue(rule.metric);
      
      if (value > rule.threshold) {
        await this.triggerAlert(name, rule, value);
      }
    }
  }
  
  async triggerAlert(name, rule, value) {
    const alert = {
      id: uuid(),
      name,
      severity: rule.severity,
      message: rule.message,
      value,
      threshold: rule.threshold,
      timestamp: new Date().toISOString()
    };
    
    // Log alert
    logger.error('Alert triggered', {
      category: LOG_CATEGORIES.SYSTEM,
      alert
    });
    
    // Send notifications based on severity
    switch (rule.severity) {
      case 'critical':
        await this.sendPagerDutyAlert(alert);
        await this.sendSlackAlert(alert);
        break;
      case 'warning':
        await this.sendSlackAlert(alert);
        break;
    }
  }
}
```

### Notification Channels

#### Multi-channel Alerting
```javascript
// Notification service
class NotificationService {
  async sendSlackAlert(alert) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    
    const payload = {
      text: `🚨 ${alert.severity.toUpperCase()}: ${alert.message}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: [
          { title: 'Metric', value: alert.name, short: true },
          { title: 'Value', value: alert.value, short: true },
          { title: 'Threshold', value: alert.threshold, short: true },
          { title: 'Time', value: alert.timestamp, short: true }
        ]
      }]
    };
    
    try {
      await axios.post(webhook, payload);
    } catch (error) {
      logger.error('Failed to send Slack alert', {
        category: LOG_CATEGORIES.SYSTEM,
        error: error.message
      });
    }
  }
  
  async sendEmailAlert(alert, recipients) {
    // Email implementation
  }
}
```

## Log Aggregation

### Simple File-Based Logging

#### Log File Organization
```bash
# Directory structure for process-based logging
logs/
├── application/
│   ├── app.log                    # Main application logs
│   ├── error.log                  # Application errors
│   └── access.log                 # HTTP access logs
├── mcp-instances/
│   ├── user123_mcp456.log         # User-specific MCP logs
│   ├── user123_mcp789.log
│   └── user456_mcp012.log
├── system/
│   ├── process-monitor.log        # Process monitoring
│   └── health-check.log          # Health check results
└── security/
    └── audit.log                  # Security events
```

#### Log Rotation Configuration
```javascript
// Simple log rotation with Winston
const logRotation = {
  maxsize: 10 * 1024 * 1024,  // 10MB
  maxFiles: 5,                 // Keep 5 files
  tailable: true,             // Allow tailing
  zippedArchive: true         // Compress old files
};

// Setup for each log type
const loggers = {
  application: winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: 'logs/application/app.log',
        ...logRotation
      })
    ]
  }),
  
  mcpInstance: (userId, mcpId) => winston.createLogger({
    transports: [
      new winston.transports.File({
        filename: `logs/mcp-instances/${userId}_${mcpId}.log`,
        ...logRotation
      })
    ]
  })
};
```

#### Log Search and Analysis
```javascript
// Simple log search API
app.get('/api/v1/logs/search', authenticateUser, async (req, res) => {
  const { query, level, startDate, endDate } = req.query;
  const userId = req.user.id;
  
  // Search only user's logs
  const searchResults = await db.query(`
    SELECT ml.timestamp, ml.level, ml.message, ml.metadata,
           mi.id as mcp_id, mt.display_name as mcp_type
    FROM mcp_logs ml
    JOIN mcp_instances mi ON ml.mcp_instance_id = mi.id
    JOIN mcp_types mt ON mi.mcp_type_id = mt.id
    WHERE mi.user_id = $1
      AND ($2::text IS NULL OR ml.message ILIKE $2)
      AND ($3::text IS NULL OR ml.level = $3)
      AND ($4::timestamp IS NULL OR ml.timestamp >= $4)
      AND ($5::timestamp IS NULL OR ml.timestamp <= $5)
    ORDER BY ml.timestamp DESC
    LIMIT 100
  `, [userId, query ? `%${query}%` : null, level, startDate, endDate]);
  
  res.json({ data: searchResults.rows });
});
```

## Security Monitoring

### Security Event Detection

#### Suspicious Activity Detection
```javascript
// Security monitoring service
class SecurityMonitor {
  constructor() {
    this.suspiciousPatterns = [
      {
        name: 'multiple_failed_logins',
        pattern: /failed_login/,
        threshold: 5,
        timeWindow: 300000 // 5 minutes
      },
      {
        name: 'unusual_api_usage',
        pattern: /api_request/,
        threshold: 1000,
        timeWindow: 60000 // 1 minute
      }
    ];
  }
  
  async analyzeLogs() {
    for (const pattern of this.suspiciousPatterns) {
      const events = await this.getRecentEvents(pattern);
      
      if (events.length > pattern.threshold) {
        await this.triggerSecurityAlert(pattern, events);
      }
    }
  }
  
  async triggerSecurityAlert(pattern, events) {
    const alert = {
      type: 'security_alert',
      pattern: pattern.name,
      eventCount: events.length,
      threshold: pattern.threshold,
      affectedUsers: [...new Set(events.map(e => e.userId))],
      timestamp: new Date().toISOString()
    };
    
    logger.error('Security alert triggered', {
      category: LOG_CATEGORIES.SECURITY,
      alert
    });
    
    // Immediate response actions
    await this.executeSecurityResponse(alert);
  }
}
```

## Observability Stack

### Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Simple Dashboard                          │
│                (HTTP + Basic Metrics)                       │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 In-Memory Metrics                           │
│                  (Basic Counters)                           │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Application    │   │   Node.js       │   │   MCP Process   │
│   Metrics       │   │   Main Process  │   │   Metrics       │
│  (HTTP Stats)   │   │   Metrics       │   │  (Child Proc)   │
└─────────────────┘   └─────────────────┘   └─────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  File-Based Logging                         │
│                  (Winston + Rotation)                       │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Application    │   │   MCP Process   │   │   System        │
│     Logs        │   │     Logs        │   │    Logs         │
│   (app.log)     │   │ (user_mcp.log)  │   │ (system.log)    │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Grafana Dashboards

#### Key Dashboards
```json
{
  "dashboards": [
    {
      "name": "MiniMCP Overview",
      "panels": [
        "API Request Rate",
        "Error Rate",
        "Response Time P95",
        "Active MCP Instances",
        "Process Resource Usage"
      ]
    },
    {
      "name": "MCP Instances",
      "panels": [
        "Instance Status Distribution",
        "Creation Rate",
        "Expiration Rate",
        "Resource Usage by Type"
      ]
    },
    {
      "name": "Infrastructure",
      "panels": [
        "Database Performance",
        "System Host Metrics",
        "Network Traffic",
        "Disk Usage"
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues and Solutions

#### High Error Rate
```bash
# Investigation steps
1. Check error logs in database/files
   - Query logs by level: "error"
   - Look for patterns in error messages

2. Check health endpoints
   - Error rate by endpoint
   - Database connection errors

3. Check process health
   ps aux | grep mcp
   pm2 list
   pm2 logs <process-name>

4. Check system resources
   top
   df -h
   free -m
```

#### Performance Issues
```javascript
// Performance investigation
class PerformanceInvestigator {
  async investigateSlowness() {
    // Check database slow queries
    const slowQueries = await this.getSlowQueries();
    
    // Check process resource usage
    const processStats = await this.getProcessStats();
    
    // Check API endpoint performance
    const slowEndpoints = await this.getSlowEndpoints();
    
    return {
      slowQueries,
      processStats,
      slowEndpoints,
      recommendations: this.generateRecommendations()
    };
  }
}
```

### Debugging Guide

#### Log Analysis Queries
```javascript
// Database queries for common issues
const debugQueries = {
  // Find all errors for a specific MCP
  mcpErrors: 'mcpId:"550e8400-e29b-41d4-a716-446655440002" AND level:"error"',
  
  // Find slow API requests
  slowRequests: 'category:"api" AND duration:>1000',
  
  // Find authentication failures
  authFailures: 'category:"auth" AND result:"failure"',
  
  // Find process issues
  processIssues: 'category:"process" AND (action:"exit" OR action:"kill")',
  
  // Find database connection issues
  dbIssues: 'category:"database" AND error:*'
};
```

## Next Steps

1. Review [Backend Architecture](./backend-architecture.md) for system overview
2. Check [Security Architecture](./security-architecture.md) for security monitoring
3. See [Implementation Roadmap](./backend-implementation-roadmap.md) for monitoring timeline
4. Consult [API Documentation](./api-documentation.md) for endpoint monitoring