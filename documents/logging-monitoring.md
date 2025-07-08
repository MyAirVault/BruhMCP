# Simple Logging and Monitoring

## Table of Contents
1. [Overview](#overview)
2. [Simple Logging Strategy](#simple-logging-strategy)
3. [File-Based User/MCP Isolation](#file-based-usermcp-isolation)
4. [Basic Metrics Collection](#basic-metrics-collection)
5. [Process Monitoring](#process-monitoring)
6. [Log Access and Retrieval](#log-access-and-retrieval)
7. [File Management](#file-management)
8. [Simple Health Checks](#simple-health-checks)
9. [Troubleshooting](#troubleshooting)

## Overview

The MiniMCP logging and monitoring system uses a **simple file-based approach** to provide complete isolation between users and MCP instances. This uses basic file-based monitoring while ensuring clear separation and easy debugging.

### Design Principles
- **File-Based Isolation**: Each user/MCP gets dedicated log directories
- **No Complex Infrastructure**: Simple file-based monitoring without external tools
- **Direct File Access**: Simple file I/O for all logging and metrics
- **User Privacy**: Complete separation of user data and logs
- **Easy Debugging**: Direct access to log files for troubleshooting

## Simple Logging Strategy

### File System Structure
```
<project-root>/logs/
├── system/
│   ├── app.log                    # Main application logs
│   ├── error.log                  # System-wide errors
│   └── access.log                 # API access logs
├── users/
│   ├── user_{userId}/
│   │   ├── activity.log           # User activity log
│   │   ├── mcp_456_gmail/
│   │   │   ├── app.log           # MCP application logs
│   │   │   ├── access.log        # MCP access logs
│   │   │   ├── error.log         # MCP errors
│   │   │   ├── metrics.json      # Simple metrics
│   │   │   └── process.log       # Process lifecycle
│   │   └── mcp_789_github/
│   │       ├── app.log
│   │       ├── access.log
│   │       ├── error.log
│   │       ├── metrics.json
│   │       └── process.log
│   └── user_{userId}/
│       └── [similar structure]
└── temp/
    ├── cleanup/                   # Temporary cleanup logs
    └── backups/                   # Log backups
```

### Log Levels
```javascript
const LOG_LEVELS = {
  ERROR: 'error',    // Errors and exceptions
  WARN: 'warn',      // Warning conditions
  INFO: 'info',      # General information
  DEBUG: 'debug'     # Debug information (development only)
};
```

## File-Based User/MCP Isolation

### Logger Creation
```javascript
// Simple logger factory for user/MCP isolation
class SimpleLoggerFactory {
  static createUserMCPLogger(userId, mcpId, mcpType) {
    const logDir = `<project-root>/logs/users/user_${userId}/mcp_${mcpId}_${mcpType}`;
    
    // Ensure directory exists
    fs.mkdirSync(logDir, { recursive: true });
    
    return {
      app: winston.createLogger({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.File({
            filename: `${logDir}/app.log`,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
          })
        ]
      }),
      
      access: winston.createLogger({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.File({
            filename: `${logDir}/access.log`,
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 3
          })
        ]
      }),
      
      error: winston.createLogger({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format.errors({ stack: true })
        ),
        transports: [
          new winston.transports.File({
            filename: `${logDir}/error.log`,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5
          })
        ]
      })
    };
  }
  
  static createSystemLogger() {
    return winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: '<project-root>/logs/system/app.log',
          maxsize: 20 * 1024 * 1024, // 20MB
          maxFiles: 10
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }
}
```

### Usage Example
```javascript
// In MCP server process
const logger = SimpleLoggerFactory.createUserMCPLogger(
  process.env.USER_ID,
  process.env.MCP_ID,
  process.env.MCP_TYPE
);

// Log application events
logger.app.info('Gmail MCP server started', {
  port: process.env.PORT,
  timestamp: new Date().toISOString()
});

// Log access events
logger.access.info('API request received', {
  method: 'GET',
  endpoint: '/emails',
  timestamp: new Date().toISOString()
});

// Log errors
logger.error.error('Gmail API connection failed', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
});
```

## Basic Metrics Collection

### Simple Metrics Structure
```javascript
// Simple metrics without complex infrastructure
class SimpleMetricsCollector {
  constructor(userId, mcpId, mcpType) {
    this.userId = userId;
    this.mcpId = mcpId;
    this.mcpType = mcpType;
    this.metricsFile = `<project-root>/logs/users/user_${userId}/mcp_${mcpId}_${mcpType}/metrics.json`;
    
    this.metrics = {
      startTime: Date.now(),
      requests: 0,
      errors: 0,
      lastActivity: null,
      processStats: {
        memory: 0,
        cpu: 0,
        uptime: 0
      }
    };
    
    // Update metrics every 5 minutes
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 5 * 60 * 1000);
  }
  
  incrementRequests() {
    this.metrics.requests++;
    this.metrics.lastActivity = new Date().toISOString();
  }
  
  incrementErrors() {
    this.metrics.errors++;
  }
  
  updateMetrics() {
    // Get current process stats
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.processStats = {
      memory: Math.round(memUsage.rss / 1024 / 1024), // MB
      cpu: cpuUsage.user + cpuUsage.system,
      uptime: Math.round(process.uptime())
    };
    
    this.metrics.timestamp = new Date().toISOString();
    
    // Write to file
    fs.writeFileSync(
      this.metricsFile,
      JSON.stringify(this.metrics, null, 2)
    );
  }
  
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
```

### Daily Metrics Summary
```javascript
// Create daily summary of metrics
class DailyMetricsSummary {
  static generateDailySummary(date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    const summaryDir = `<project-root>/logs/summaries/${dateStr}`;
    
    fs.mkdirSync(summaryDir, { recursive: true });
    
    // Read all user metrics for the day
    const userDirs = fs.readdirSync('<project-root>/logs/users');
    const summary = {
      date: dateStr,
      totalUsers: userDirs.length,
      totalMCPs: 0,
      totalRequests: 0,
      totalErrors: 0,
      mcpsByType: {},
      users: []
    };
    
    userDirs.forEach(userDir => {
      const userPath = `<project-root>/logs/users/${userDir}`;
      const mcpDirs = fs.readdirSync(userPath).filter(dir => 
        dir.startsWith('mcp_') && fs.statSync(`${userPath}/${dir}`).isDirectory()
      );
      
      summary.totalMCPs += mcpDirs.length;
      
      mcpDirs.forEach(mcpDir => {
        const metricsFile = `${userPath}/${mcpDir}/metrics.json`;
        if (fs.existsSync(metricsFile)) {
          try {
            const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
            summary.totalRequests += metrics.requests || 0;
            summary.totalErrors += metrics.errors || 0;
            
            // Extract MCP type from directory name
            const mcpType = mcpDir.split('_')[2];
            summary.mcpsByType[mcpType] = (summary.mcpsByType[mcpType] || 0) + 1;
          } catch (error) {
            // Skip invalid metrics files
          }
        }
      });
      
      summary.users.push({
        userId: userDir.replace('user_', ''),
        mcpCount: mcpDirs.length
      });
    });
    
    fs.writeFileSync(
      `${summaryDir}/summary.json`,
      JSON.stringify(summary, null, 2)
    );
    
    return summary;
  }
}
```

## Process Monitoring

### Simple Process Manager
```javascript
// Simple process monitoring without complex infrastructure
class SimpleProcessMonitor {
  constructor() {
    this.processes = new Map(); // processId -> { mcpId, userId, startTime, port }
    this.checkInterval = 30000; // 30 seconds
    
    this.startMonitoring();
  }
  
  addProcess(processId, mcpId, userId, port) {
    this.processes.set(processId, {
      mcpId,
      userId,
      port,
      startTime: Date.now(),
      lastCheck: Date.now(),
      status: 'running'
    });
    
    this.logProcessEvent(processId, 'started', { mcpId, userId, port });
  }
  
  removeProcess(processId) {
    const processInfo = this.processes.get(processId);
    if (processInfo) {
      this.logProcessEvent(processId, 'stopped', processInfo);
      this.processes.delete(processId);
    }
  }
  
  startMonitoring() {
    setInterval(() => {
      this.checkAllProcesses();
    }, this.checkInterval);
  }
  
  async checkAllProcesses() {
    for (const [processId, processInfo] of this.processes) {
      try {
        const isRunning = await this.isProcessRunning(processId);
        
        if (!isRunning) {
          this.handleProcessExit(processId, processInfo);
        } else {
          // Update process stats
          const stats = await this.getProcessStats(processId);
          this.updateProcessMetrics(processInfo, stats);
        }
      } catch (error) {
        this.logProcessEvent(processId, 'check_error', { error: error.message });
      }
    }
  }
  
  async isProcessRunning(pid) {
    try {
      process.kill(pid, 0); // Signal 0 just checks if process exists
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async getProcessStats(pid) {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      
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
            uptime: parts[2]
          });
        } else {
          resolve(null);
        }
      });
    });
  }
  
  handleProcessExit(processId, processInfo) {
    this.logProcessEvent(processId, 'unexpected_exit', processInfo);
    this.removeProcess(processId);
    
    // Update MCP status in database
    this.updateMCPStatus(processInfo.mcpId, 'disconnected');
  }
  
  logProcessEvent(processId, event, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      processId,
      event,
      ...data
    };
    
    fs.appendFileSync(
      '<project-root>/logs/system/process.log',
      JSON.stringify(logEntry) + '\n'
    );
  }
  
  updateProcessMetrics(processInfo, stats) {
    if (!stats) return;
    
    const metricsFile = `<project-root>/logs/users/user_${processInfo.userId}/mcp_${processInfo.mcpId}/process_stats.json`;
    
    const processMetrics = {
      timestamp: new Date().toISOString(),
      processId: processInfo.processId,
      cpu: stats.cpu,
      memory: stats.memory,
      uptime: stats.uptime,
      port: processInfo.port
    };
    
    fs.writeFileSync(metricsFile, JSON.stringify(processMetrics, null, 2));
  }
}
```

## Log Access and Retrieval

### Simple Log API
```javascript
// Simple API for log access
class LogAccessService {
  static async getUserMCPLogs(userId, mcpId, options = {}) {
    const logDir = `<project-root>/logs/users/user_${userId}/mcp_${mcpId}`;
    
    if (!fs.existsSync(logDir)) {
      throw new Error('Log directory not found');
    }
    
    const { level = 'all', limit = 100, since } = options;
    const logs = [];
    
    // Read different log files based on level
    const logFiles = level === 'all' 
      ? ['app.log', 'access.log', 'error.log']
      : [`${level}.log`];
    
    for (const logFile of logFiles) {
      const logPath = `${logDir}/${logFile}`;
      if (fs.existsSync(logPath)) {
        const logContent = fs.readFileSync(logPath, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.trim());
        
        logLines.forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            
            // Filter by timestamp if provided
            if (since && new Date(logEntry.timestamp) < new Date(since)) {
              return;
            }
            
            logs.push({
              ...logEntry,
              source: logFile.replace('.log', '')
            });
          } catch (error) {
            // Skip invalid JSON lines
          }
        });
      }
    }
    
    // Sort by timestamp and limit
    return logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
  
  static async getUserMCPMetrics(userId, mcpId) {
    const metricsFile = `<project-root>/logs/users/user_${userId}/mcp_${mcpId}/metrics.json`;
    
    if (!fs.existsSync(metricsFile)) {
      return null;
    }
    
    try {
      return JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
    } catch (error) {
      return null;
    }
  }
  
  static async exportUserLogs(userId, format = 'json') {
    const userDir = `<project-root>/logs/users/user_${userId}`;
    
    if (!fs.existsSync(userDir)) {
      throw new Error('User logs not found');
    }
    
    const exportData = {
      userId,
      exportTime: new Date().toISOString(),
      mcps: []
    };
    
    const mcpDirs = fs.readdirSync(userDir).filter(dir => 
      dir.startsWith('mcp_') && fs.statSync(`${userDir}/${dir}`).isDirectory()
    );
    
    for (const mcpDir of mcpDirs) {
      const mcpPath = `${userDir}/${mcpDir}`;
      const mcpData = {
        mcpId: mcpDir,
        logs: {},
        metrics: null
      };
      
      // Read all log files
      const logFiles = ['app.log', 'access.log', 'error.log'];
      for (const logFile of logFiles) {
        const logPath = `${mcpPath}/${logFile}`;
        if (fs.existsSync(logPath)) {
          mcpData.logs[logFile.replace('.log', '')] = 
            fs.readFileSync(logPath, 'utf8').split('\n').filter(line => line.trim());
        }
      }
      
      // Read metrics
      const metricsPath = `${mcpPath}/metrics.json`;
      if (fs.existsSync(metricsPath)) {
        try {
          mcpData.metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
        } catch (error) {
          // Skip invalid metrics
        }
      }
      
      exportData.mcps.push(mcpData);
    }
    
    return exportData;
  }
}
```

## File Management

### Log Rotation and Cleanup
```javascript
// Simple file management
class LogFileManager {
  static cleanupOldLogs(retentionDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    this.cleanupDirectory('<project-root>/logs/users', cutoffDate);
    this.cleanupDirectory('<project-root>/logs/system', cutoffDate);
  }
  
  static cleanupDirectory(dirPath, cutoffDate) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = `${dirPath}/${item}`;
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Recursively clean subdirectories
        this.cleanupDirectory(itemPath, cutoffDate);
        
        // Remove empty directories
        try {
          const contents = fs.readdirSync(itemPath);
          if (contents.length === 0) {
            fs.rmdirSync(itemPath);
          }
        } catch (error) {
          // Directory not empty or other error
        }
      } else if (stats.isFile()) {
        // Remove old log files
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(itemPath);
        }
      }
    });
  }
  
  static compressOldLogs(ageDays = 7) {
    const zlib = require('zlib');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ageDays);
    
    this.compressDirectoryLogs('<project-root>/logs/users', cutoffDate);
    this.compressDirectoryLogs('<project-root>/logs/system', cutoffDate);
  }
  
  static compressDirectoryLogs(dirPath, cutoffDate) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    items.forEach(item => {
      if (item.isDirectory()) {
        this.compressDirectoryLogs(`${dirPath}/${item.name}`, cutoffDate);
      } else if (item.isFile() && item.name.endsWith('.log')) {
        const filePath = `${dirPath}/${item.name}`;
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate && !item.name.endsWith('.gz')) {
          try {
            const fileData = fs.readFileSync(filePath);
            const compressed = zlib.gzipSync(fileData);
            
            fs.writeFileSync(`${filePath}.gz`, compressed);
            fs.unlinkSync(filePath);
          } catch (error) {
            // Skip compression errors
          }
        }
      }
    });
  }
}

// Run cleanup daily
setInterval(() => {
  LogFileManager.cleanupOldLogs(30);
  LogFileManager.compressOldLogs(7);
}, 24 * 60 * 60 * 1000); // 24 hours
```

## Simple Health Checks

### Basic System Health
```javascript
// Simple health monitoring
class SimpleHealthChecker {
  static async checkSystemHealth() {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        filesystem: await this.checkFilesystem(),
        database: await this.checkDatabase(),
        processes: await this.checkProcesses(),
        diskSpace: await this.checkDiskSpace()
      }
    };
    
    // Determine overall status
    const hasUnhealthy = Object.values(health.checks).some(check => 
      check.status !== 'healthy'
    );
    
    if (hasUnhealthy) {
      health.status = 'unhealthy';
    }
    
    // Log health status
    fs.appendFileSync(
      '<project-root>/logs/system/health.log',
      JSON.stringify(health) + '\n'
    );
    
    return health;
  }
  
  static async checkFilesystem() {
    try {
      // Test file write
      const testFile = '<project-root>/logs/system/.health_test';
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      
      return {
        status: 'healthy',
        message: 'Filesystem read/write working'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Filesystem error',
        error: error.message
      };
    }
  }
  
  static async checkDatabase() {
    try {
      // Simple database ping (implementation depends on your DB client)
      await db.query('SELECT 1');
      
      return {
        status: 'healthy',
        message: 'Database connection working'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        error: error.message
      };
    }
  }
  
  static async checkProcesses() {
    try {
      const runningProcesses = processMonitor.processes.size;
      
      return {
        status: 'healthy',
        message: `${runningProcesses} MCP processes running`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Process monitoring error',
        error: error.message
      };
    }
  }
  
  static async checkDiskSpace() {
    const { exec } = require('child_process');
    
    return new Promise((resolve) => {
      exec('df -h <project-root>/logs/', (error, stdout) => {
        if (error) {
          resolve({
            status: 'unhealthy',
            message: 'Could not check disk space',
            error: error.message
          });
          return;
        }
        
        const lines = stdout.trim().split('\n');
        const dataLine = lines[1];
        const usage = dataLine.split(/\s+/)[4];
        const usagePercent = parseInt(usage.replace('%', ''));
        
        if (usagePercent > 85) {
          resolve({
            status: 'unhealthy',
            message: `Disk usage high: ${usage}`,
            usage: usagePercent
          });
        } else {
          resolve({
            status: 'healthy',
            message: `Disk usage: ${usage}`,
            usage: usagePercent
          });
        }
      });
    });
  }
}

// Run health checks every 5 minutes
setInterval(() => {
  SimpleHealthChecker.checkSystemHealth();
}, 5 * 60 * 1000);
```

## Troubleshooting

### Common Issues and Solutions

#### 1. **Log Files Not Created**
```bash
# Check directory permissions
ls -la <project-root>/logs/
ls -la <project-root>/logs/users/

# Create directories manually if needed
mkdir -p <project-root>/logs/users/user_{userId}/mcp_456_gmail
```

#### 2. **High Disk Usage**
```bash
# Check log directory size
du -sh <project-root>/logs/

# Find large log files
find <project-root>/logs/ -name "*.log" -size +100M

# Manual cleanup
find <project-root>/logs/ -name "*.log" -mtime +30 -delete
```

#### 3. **Process Not Logging**
```javascript
// Debug process logging
const processInfo = processMonitor.processes.get(processId);
console.log('Process info:', processInfo);

// Check if log directory exists
const logDir = `<project-root>/logs/users/user_${userId}/mcp_${mcpId}_${mcpType}`;
console.log('Log directory exists:', fs.existsSync(logDir));

// Check file permissions
const stats = fs.statSync(logDir);
console.log('Directory permissions:', stats.mode.toString(8));
```

#### 4. **Metrics Not Updating**
```javascript
// Check metrics collector
const metricsFile = `<project-root>/logs/users/user_${userId}/mcp_${mcpId}_${mcpType}/metrics.json`;

if (fs.existsSync(metricsFile)) {
  const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
  console.log('Last metrics update:', metrics.timestamp);
} else {
  console.log('Metrics file not found');
}
```

### Debug Commands
```bash
# View recent logs for a specific MCP
tail -f <project-root>/logs/users/user_{userId}/mcp_456_gmail/app.log

# Check process status
ps aux | grep "node.*gmail-server"

# View system health
tail -10 <project-root>/logs/system/health.log

# Check disk space
df -h <project-root>/logs/

# Count log files
find <project-root>/logs/ -name "*.log" | wc -l
```

## Benefits of Simple Approach

### 1. **Complete Isolation**
- Each user's data is completely separated
- No shared monitoring infrastructure
- Independent log files per MCP

### 2. **Easy Debugging**
- Direct file access for troubleshooting
- Clear file structure
- No complex query languages needed

### 3. **Better Performance**
- Direct file I/O is fast
- No complex metrics collection overhead
- Minimal resource usage

### 4. **Simple Maintenance**
- Basic file management operations
- Standard log rotation
- Easy backup and restore

### 5. **Clear Privacy Boundaries**
- File system permissions provide access control
- No cross-user data exposure
- Simple audit trail

## Next Steps

1. Review [Backend Architecture](./backend-architecture.md) for system overview
2. Check [MCP Integration Guide](./mcp-integration-guide.md) for process management
3. See [Implementation Roadmap](./backend-implementation-roadmap.md) for development timeline
4. Consult [Security Architecture](./security-architecture.md) for file security measures