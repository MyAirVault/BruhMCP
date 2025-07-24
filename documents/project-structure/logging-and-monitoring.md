# Logging and Monitoring Infrastructure

## Overview

The MCP Registry application implements a comprehensive, multi-layered logging and monitoring system designed for scalability, reliability, and compliance. The infrastructure supports both system-wide operational monitoring and user-specific instance logging with sophisticated error detection and performance tracking.

## System Architecture

### Core Components
- **System Logger** (`/src/services/logging/systemLogger.js`) - Central logging system using Winston
- **Logging Service** (`/src/services/logging/loggingService.js`) - High-level logging abstraction
- **Log Maintenance Service** (`/src/services/logging/logMaintenanceService.js`) - Automated cleanup and rotation
- **MCP Instance Logger** (`/src/utils/mcpInstanceLogger.js`) - Per-instance logging
- **Circuit Breaker** (`/src/utils/circuitBreaker.js`) - Service monitoring and failure prevention
- **Plan Monitoring Service** (`/src/services/planMonitoringService.js`) - Resource usage monitoring

## Logging Systems

### System-Wide Logging

**Technology Stack:**
- **Winston** framework for structured logging
- **winston-daily-rotate-file** for automatic log rotation
- JSON format for structured data processing
- Daily rotation with compression (90-day retention)

**Log Categories and Structure:**
```
/logs/system/
├── application-YYYY-MM-DD.log    # General application events
├── security-YYYY-MM-DD.log       # Authentication & security events
├── performance-YYYY-MM-DD.log    # Performance metrics and timing
├── audit-YYYY-MM-DD.log          # Audit trail events
├── database-YYYY-MM-DD.log       # Database operations and queries
└── cache-YYYY-MM-DD.log          # Cache operations and invalidation
```

**Log Entry Format:**
```json
{
  "timestamp": "2025-07-24T08:58:44.270+01:00",
  "level": "info",
  "message": "System startup initiated",
  "service": "mcp-backend",
  "category": "application",
  "metadata": {
    "nodeVersion": "v22.17.0",
    "platform": "linux",
    "environment": "development",
    "processId": 10494
  }
}
```

### User-Specific Instance Logging

**Directory Structure:**
```
/logs/users/
└── user_{userId}/
    └── mcp_{instanceId}/
        ├── app.log      # Application-specific events
        ├── access.log   # HTTP request/response logs
        └── error.log    # Error-specific events
```

**Features:**
- Complete per-user, per-instance isolation
- Automatic directory creation and cleanup
- 30-day retention policy for user logs
- JSON-structured logging with contextual metadata
- Credential sanitization and privacy protection

### MCP Service-Specific Logging

Each MCP service implements standardized logging:

**Service Logger Implementation** (e.g., `/mcp-servers/airtable/utils/logger.js`):
- Component-specific logging with data sanitization
- HTTP request/response logging middleware
- Performance monitoring with operation timing
- Structured error reporting and categorization

**Common Logging Patterns:**
```javascript
// API call logging with timing
logger.apiCall('GET', '/api/bases', 150, 200, {
  method: 'GET',
  duration: 150,
  status: 200
});

// Performance measurement wrapper
const measuredFunction = measurePerformance('fetchBases', originalFunction);

// MCP operation logging
logger.mcpOperation('tools-list', { toolCount: 5 });
```

## Monitoring Systems

### Circuit Breaker Pattern Implementation

**File:** `/src/utils/circuitBreaker.js`

**States and Configuration:**
- **CLOSED** - Normal operation, all requests allowed
- **OPEN** - Service failure detected, fail-fast mode
- **HALF_OPEN** - Testing service recovery

**Configuration Parameters:**
```javascript
{
  failureThreshold: 5,        // Failures before opening circuit
  resetTimeout: 60000,        // 1 minute recovery window
  halfOpenMaxCalls: 3,        // Test calls in half-open state
  successThreshold: 2         // Successes needed to close circuit
}
```

**Metrics Tracked:**
- Total calls and success rate percentage
- Failure counts and error patterns
- State transitions and timing analysis
- Circuit open events and recovery times

### Performance Monitoring

**System Health Metrics:**
- Memory usage and CPU consumption tracking
- Database connection pool status and utilization
- API response times and throughput analysis
- Cache hit/miss ratios and performance

**API Request Monitoring:**
- Complete request/response logging with timing
- Slow request detection (>5 second threshold)
- Error rate monitoring and trend analysis
- User agent and IP address tracking

### Resource and Plan Monitoring

**Plan Monitoring Service** (`/src/services/planMonitoringService.js`):
- Automated plan expiration checking (hourly intervals)
- User resource usage tracking and analytics
- Billing event monitoring and compliance
- Subscription lifecycle management

**Monitoring Features:**
- Configurable check intervals
- Manual execution capability for admin operations
- Status reporting endpoints for health checks
- Automated user lifecycle management

## Integration Points

### OAuth Service Integration

**Token Management Monitoring:**
- Token refresh attempts and failure tracking
- Authentication success/failure rate analysis
- Provider-specific error pattern detection
- Rate limiting compliance monitoring

**Example OAuth Monitoring:**
```javascript
// Token refresh monitoring
logger.tokenRefresh('success', {
  provider: 'google',
  instanceId: 'uuid',
  refreshAttempt: 1,
  duration: 250
});
```

### Database Integration

**Query Monitoring:**
- SQL query logging with parameter sanitization
- Connection pool metrics and health monitoring
- Transaction timing and performance analysis
- Slow query detection (>1 second threshold)

**Database Operation Logging:**
```javascript
loggingService.logDatabaseOperation('user_lookup', {
  query: 'SELECT * FROM users WHERE id = $1',
  duration: 25,
  affectedRows: 1
});
```

### MCP Protocol Integration

**JSON-RPC Monitoring:**
- MCP method call tracking and analysis
- Parameter validation logging
- Response success/error rate monitoring
- Protocol compliance verification

## Infrastructure Components

### Log Storage and Archival

**Storage Configuration:**
- Daily log rotation with automatic compression
- Automated cleanup (90 days system logs, 30 days user logs)
- Log file integrity validation
- Storage space usage monitoring and alerting

**Maintenance Features:**
- Automatic log compression for files older than 7 days
- Corrupted file detection and quarantine
- Directory cleanup for deleted user instances
- Storage statistics reporting and monitoring

### Log Analysis and Export

**Query Capabilities:**
- Time-range filtering with millisecond precision
- Log level filtering (error, warn, info, debug)
- Full-text search across structured log entries
- Pagination support for large result sets

**Export Formats:**
- JSON format for programmatic access and analysis
- CSV format for spreadsheet analysis
- Plain text format for human reading

**API Endpoints:**
```javascript
GET /api/instances/{id}/logs           # Retrieve instance logs
POST /api/instances/{id}/logs/export   # Export logs in specified format
```

### Health Check System

**Health Monitoring Endpoints:**
- System logger health status and configuration
- Circuit breaker status for all registered services
- Log maintenance statistics and performance
- Storage utilization metrics and alerts

**Health Check Response Format:**
```javascript
{
  systemLogger: {
    status: "healthy",
    loggers: ["application", "security", "performance"],
    diskUsage: { totalMB: 0.48, fileCount: 36 }
  },
  circuitBreakers: {
    "oauth-service": {
      state: "CLOSED",
      successRate: "99.5%",
      totalCalls: 1250,
      lastFailure: null
    }
  },
  planMonitoring: {
    status: "active",
    lastCheck: "2025-07-24T08:58:44.270Z",
    nextCheck: "2025-07-24T09:58:44.270Z"
  }
}
```

## Security and Privacy

### Data Sanitization

**Credential Protection:**
- Automatic sanitization of passwords, API keys, OAuth tokens
- Email address masking with partial visibility
- Query parameter sanitization for sensitive data
- Stack trace filtering to remove sensitive information

**Sanitization Implementation:**
```javascript
// Automatic credential sanitization
const sanitizedData = sanitizeCredentials({
  email: 'user@example.com',      // → 'u***@example.com'
  apiKey: 'sk-1234567890',        // → 'sk-***'
  password: 'secretpass',         // → '[REDACTED]'
  refreshToken: 'token123'        // → '[REDACTED]'
});
```

### Access Control

**Log Access Security:**
- User-specific log isolation and access control
- Authentication required for all log access operations
- Instance ownership validation before log retrieval
- Admin-only access to system-wide logs

## Configuration and Deployment

### Environment Configuration

**Key Environment Variables:**
```bash
LOG_LEVEL=info                           # Logging verbosity level
PLAN_MONITORING_AUTO_START=true          # Auto-start monitoring services
PLAN_MONITORING_INTERVAL_MINUTES=60      # Monitoring check frequency
NODE_ENV=development                     # Environment mode
LOG_RETENTION_DAYS=90                    # System log retention period
USER_LOG_RETENTION_DAYS=30               # User log retention period
```

### Automated Maintenance

**Scheduled Operations:**
- Daily log maintenance and cleanup (24-hour cycle)
- Plan expiration monitoring (hourly execution)
- Health status reporting and alerting
- Circuit breaker metrics collection and analysis

## Alerting and Monitoring

### Error Detection and Alerting

**Automatic Alert Triggers:**
- Unhandled exceptions and critical errors
- Circuit breaker state changes to OPEN
- Resource usage threshold breaches
- Service availability degradation

### Performance Alerting

**Performance Thresholds:**
- Slow API requests exceeding 5 seconds
- Database queries exceeding 1 second
- Error rates exceeding 5% failure rate
- Memory/CPU usage approaching limits

## Usage Examples

### Application Logging
```javascript
import loggingService from './services/logging/loggingService.js';

// Authentication success logging
loggingService.logAuthSuccess(userId, { 
  ip: req.ip, 
  userAgent: req.get('User-Agent') 
});

// API request logging with timing
loggingService.logAPIRequest(req, res, responseTime);

// Error logging with context
loggingService.logError(error, { 
  userId, 
  operation: 'createInstance',
  instanceId: 'uuid-here'
});
```

### Instance-Specific Logging
```javascript
import mcpInstanceLogger from './utils/mcpInstanceLogger.js';

// Initialize logger for specific MCP instance
const logger = mcpInstanceLogger.initializeLogger(instanceId, userId);

// Log application events
logger.info('Service started', { port: 3000, service: 'gmail' });

// Log MCP protocol operations
logger.mcpOperation('tools-list', { toolCount: 5, duration: 150 });

// Log API operations with sanitization
logger.apiCall('POST', '/gmail/send', 200, { duration: 300 });
```

### Circuit Breaker Usage
```javascript
import circuitBreakerManager from './utils/circuitBreaker.js';

// Create circuit breaker for external service
const breaker = circuitBreakerManager.getOrCreate('gmail-api', {
  failureThreshold: 5,
  resetTimeout: 60000
});

// Execute protected function with monitoring
try {
  const result = await breaker.execute(gmailApiCall, params);
  return result;
} catch (error) {
  // Handle circuit breaker or service error
  logger.error('Gmail API call failed', { 
    error: error.message,
    circuitState: breaker.getState()
  });
  throw error;
}
```

## Monitoring Integration for MCP Services

### Required Logging Components for MCP Services

Each MCP service must implement:

1. **Service Logger** - Component-specific logging utilities
2. **Request Logging** - HTTP middleware for request/response logging
3. **Performance Monitoring** - Operation timing and metrics
4. **Error Tracking** - Structured error reporting
5. **Circuit Breaker Integration** - External API failure protection

### Standard Logging Interface

```javascript
// Required logging methods for MCP services
logger.info(message, metadata);           // General information
logger.error(message, error, metadata);   // Error events
logger.apiCall(method, endpoint, status, timing); // API operations
logger.mcpOperation(operation, metadata); // MCP protocol operations
logger.performance(operation, duration);  // Performance metrics
```

This comprehensive logging and monitoring infrastructure ensures reliable operation, effective troubleshooting, and complete observability across the entire MCP Registry application.