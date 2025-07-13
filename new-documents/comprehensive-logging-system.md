# Comprehensive Logging System

## Overview

This document outlines the complete dual-layer logging architecture for the MCP (Model Control Protocol) system, including user instance logging and system-wide monitoring. The system uses file-based logging with structured JSON format, user isolation, and comprehensive system monitoring capabilities.

## Logging Architecture

### Core Principles

**Dual-Layer Design**:
- **User Instance Logging**: Isolated logs for each user's MCP instances
- **System Logging**: Centralized system-wide monitoring and error tracking
- **File-Based Storage**: All logs stored as files for reliability and performance
- **Structured Format**: JSON-based logging for consistency and parsing

**Security and Isolation**:
- Complete user isolation with separate directories
- System logs accessible only to administrators
- File permissions preventing cross-user access
- API authorization ensuring users only see their own logs

**Scalability and Performance**:
- Persistent file streams for high-performance writing
- Log rotation and compression for space management
- Retention policies for automatic cleanup
- Real-time streaming capabilities for monitoring

## User Instance Logging

### Current Implementation

**Storage Structure**:
```
./logs/users/
└── user_{userId}/
    └── mcp_{instanceId}/
        ├── app.log      # General application activity
        ├── access.log   # HTTP requests and API calls
        └── error.log    # Errors and stderr output
```

**Log Format**:
All user logs use structured JSON format:
```json
{
  "timestamp": "2025-07-13T15:30:00.000Z",
  "level": "info|warn|error|debug",
  "message": "Human-readable log message",
  "metadata": {
    "type": "stdout|stderr|system|http",
    "instanceId": "uuid-string",
    "userId": "user-id",
    "service": "figma|github|slack",
    "additional": "context-specific-data"
  }
}
```

### User Logging Flow

**Instance Creation Process**:
1. User creates new MCP instance through frontend
2. Backend creates instance record in database
3. LogFileManager creates dedicated directory structure
4. Persistent file streams established for real-time logging
5. Process Monitor begins capturing stdout/stderr

**Log Generation and Routing**:
1. **Process Output Capture**: Child process stdout/stderr streams monitored
2. **Content Analysis**: Log content analyzed for routing decisions
3. **Smart Routing Logic**:
   - HTTP requests and API calls → `access.log`
   - Errors, exceptions, stderr → `error.log`
   - General application output → `app.log`
4. **Real-time Writing**: Logs written immediately to appropriate files
5. **Format Standardization**: All entries converted to structured JSON

**User Access and Interaction**:
1. **Log Viewing**: Users access logs via frontend dashboard
2. **API Filtering**: Backend provides filtering by time, level, content
3. **Pagination**: Large log files handled with pagination
4. **Export Options**: Users can download logs in multiple formats
5. **Real-time Updates**: WebSocket streaming for live log viewing

### User Logging Features

**Filtering and Search**:
- Time range filtering with start/end dates
- Log level filtering (debug, info, warn, error)
- Full-text search across all log entries
- Regular expression pattern matching
- Metadata-based filtering (service type, error codes)

**Export Capabilities**:
- JSON format for programmatic processing
- CSV format for spreadsheet analysis
- Plain text format for human reading
- Compressed archives for large log sets
- Configurable date ranges and filtering applied to exports

**Performance Optimization**:
- Persistent file streams to avoid repeated file operations
- Indexed log files for faster searching
- Compressed storage for historical logs
- Efficient pagination for large log sets
- Background processing for export generation

## System Logging

### Enhanced System Architecture

**Storage Structure**:
```
./logs/system/
├── application.log    # Main application events and errors
├── pm2.log           # PM2 service management and monitoring
├── security.log      # Authentication and authorization events
├── performance.log   # Performance metrics and monitoring
├── audit.log         # User actions and system changes
├── database.log      # Database operations and issues
└── cache.log         # Cache operations and performance
```

**System Log Categories**:

**Application Logs** (`application.log`):
- Server startup and shutdown events
- Application configuration changes
- Service initialization and health checks
- Background job execution and status
- System-wide error handling and recovery
- Memory usage and resource monitoring

**PM2 Service Logs** (`pm2.log`):
- Service process starts and stops
- Process crashes and automatic restarts
- Memory leak detection and alerts
- CPU usage monitoring and thresholds
- Service deployment and update events
- Cluster management and load balancing

**Security Logs** (`security.log`):
- User authentication attempts (success/failure)
- Session creation and termination
- API key validation attempts
- Credential update events
- Suspicious activity detection
- Rate limiting triggers and blocks
- Authorization failures and access denials

**Performance Logs** (`performance.log`):
- API endpoint response times
- Database query execution times
- Cache hit and miss rates
- Memory usage patterns and alerts
- CPU utilization monitoring
- Network latency measurements
- Background task performance metrics

**Audit Logs** (`audit.log`):
- MCP instance creation and deletion
- Instance status changes (active/inactive/expired)
- Credential updates and validation results
- User profile modifications
- Administrative actions and configuration changes
- Data export and import operations
- System maintenance and update events

**Database Logs** (`database.log`):
- Connection pool status and health
- Query performance and slow query detection
- Transaction failures and rollbacks
- Connection errors and recovery attempts
- Schema migration events
- Backup and restore operations
- Index usage and optimization events

**Cache Logs** (`cache.log`):
- Cache population and invalidation events
- Cache hit/miss ratios and patterns
- Memory usage and cleanup operations
- Background cache maintenance tasks
- Cache performance metrics
- Service-specific cache operations (Figma, GitHub, etc.)

### System Logging Implementation

**Logging Infrastructure**:
- Winston logger integration for structured logging
- Multiple transport layers (file, console, external services)
- Configurable log levels and filtering
- Automatic log rotation and archival
- Error aggregation and alerting

**Real-time Monitoring**:
- WebSocket streams for live system monitoring
- Dashboard integration for visual monitoring
- Alert triggers for critical events
- Performance threshold monitoring
- Health check status reporting

**Security and Compliance**:
- Tamper-proof log entries with checksums
- Secure log storage with encryption
- Access control for log viewing and export
- Compliance reporting and audit trails
- Privacy protection for sensitive data

## Log Management and Maintenance

### Log Rotation Strategy

**User Instance Logs**:
- **Rotation Trigger**: File size (50MB) or daily basis
- **Retention Period**: 30 days for active instances, 7 days for deleted instances
- **Compression**: Automatic gzip compression for rotated files
- **Naming Convention**: `app.log.2025-07-13.gz`
- **Cleanup Process**: Background job removes expired logs

**System Logs**:
- **Rotation Trigger**: Daily rotation at midnight
- **Retention Period**: 90 days for critical logs, 30 days for debug logs
- **Compression**: Automatic compression after 7 days
- **Naming Convention**: `application.log.2025-07-13.gz`
- **Archival**: Long-term storage for audit logs (1 year retention)

**Rotation Implementation**:
- Graceful stream handling during rotation
- Atomic file operations to prevent data loss
- Verification of rotated file integrity
- Automatic cleanup of corrupted files
- Monitoring of rotation process health

### Storage Management

**Directory Structure Organization**:
- Logical separation by user and instance
- System logs in dedicated protected directories
- Temporary storage for export generation
- Archive storage for historical data
- Backup storage for critical system logs

**Space Management**:
- Automatic space monitoring and alerts
- Compression algorithms for space optimization
- Intelligent cleanup based on usage patterns
- Storage quota management per user
- Emergency cleanup procedures for space issues

**Performance Optimization**:
- SSD storage for active logs
- Hierarchical storage management
- Efficient file system organization
- Indexed search capabilities
- Cached metadata for fast access

### Backup and Recovery

**Backup Strategy**:
- Daily incremental backups for system logs
- Weekly full backups for user logs
- Off-site backup storage for critical data
- Automated backup verification
- Recovery testing and procedures

**Recovery Procedures**:
- Point-in-time recovery capabilities
- Selective recovery by user or instance
- Automated recovery verification
- Recovery testing and validation
- Documentation and runbook procedures

## API Endpoints and User Interface

### User Log Access APIs

**Log Viewing Endpoint**:
```
GET /api/v1/mcps/{instanceId}/logs
Query Parameters:
- start_time: ISO datetime string
- end_time: ISO datetime string  
- level: debug|info|warn|error
- limit: Number of entries (default: 100, max: 1000)
- offset: Pagination offset
- search: Full-text search query
- format: json|csv|txt

Response:
{
  "data": {
    "logs": [...],
    "pagination": {
      "total": 1500,
      "limit": 100,
      "offset": 0,
      "has_more": true
    },
    "filters_applied": {
      "start_time": "2025-07-13T00:00:00Z",
      "end_time": "2025-07-13T23:59:59Z",
      "level": "error"
    }
  }
}
```

**Log Export Endpoint**:
```
POST /api/v1/mcps/{instanceId}/logs/export
Request Body:
{
  "format": "json|csv|txt|zip",
  "filters": {
    "start_time": "2025-07-13T00:00:00Z",
    "end_time": "2025-07-13T23:59:59Z",
    "level": "error",
    "search": "authentication"
  },
  "compression": true
}

Response:
- File download with appropriate headers
- Progress tracking for large exports
- Email notification when export ready
```

**Real-time Log Streaming**:
```
WebSocket: /ws/mcps/{instanceId}/logs
Messages:
{
  "type": "log_entry",
  "data": {
    "timestamp": "2025-07-13T15:30:00Z",
    "level": "info",
    "message": "API request completed",
    "metadata": {...}
  }
}
```

### System Log Access APIs (Admin Only)

**System Log Dashboard**:
```
GET /api/v1/admin/logs/system
Query Parameters:
- category: application|pm2|security|performance|audit
- level: debug|info|warn|error|critical
- time_range: 1h|6h|24h|7d|30d
- search: Full-text search across all system logs

Response:
{
  "data": {
    "summary": {
      "total_entries": 50000,
      "error_count": 125,
      "warning_count": 890,
      "critical_alerts": 3
    },
    "logs": [...],
    "trends": {
      "error_rate": 0.025,
      "performance_degradation": false,
      "security_incidents": 1
    }
  }
}
```

**System Health Monitoring**:
```
GET /api/v1/admin/logs/health
Response:
{
  "data": {
    "log_system_health": "healthy|degraded|critical",
    "disk_usage": {
      "total_space": "100GB",
      "used_space": "45GB",
      "user_logs": "30GB",
      "system_logs": "15GB"
    },
    "rotation_status": "healthy",
    "backup_status": "completed_2025-07-13_02:00",
    "alerts": [...]
  }
}
```

## Error Handling and Recovery

### Log System Resilience

**Error Scenarios and Handling**:
- **Disk Space Full**: Automatic cleanup and alerting
- **File Permission Issues**: Fallback to alternative storage
- **Stream Corruption**: Automatic stream recreation
- **Process Crashes**: Graceful restart with log continuity
- **Network Issues**: Local buffering and retry mechanisms

**Recovery Procedures**:
- Automatic detection of log system issues
- Self-healing capabilities for common problems
- Manual recovery procedures for complex issues
- Data integrity verification after recovery
- Post-recovery health checks and validation

**Backup Systems**:
- Redundant logging streams for critical events
- Emergency logging to alternative storage
- In-memory buffering for temporary outages
- Fallback to syslog for system emergencies
- Remote logging for disaster scenarios

### Data Integrity and Verification

**Integrity Monitoring**:
- Checksum verification for log files
- Corruption detection and alerts
- Automatic repair of minor corruption
- Quarantine of severely corrupted files
- Integrity reporting and dashboards

**Verification Procedures**:
- Daily integrity checks for all log files
- Hash verification for archived logs
- Cross-reference checks between systems
- Audit trail verification procedures
- Compliance validation and reporting

## Security and Privacy

### Access Control

**User Log Access**:
- Strict user isolation and ownership verification
- Session-based authentication for all log access
- API rate limiting to prevent abuse
- Audit logging of all log access attempts
- Privacy protection for sensitive data in logs

**System Log Access**:
- Role-based access control for administrators
- Multi-factor authentication for sensitive logs
- IP whitelist restrictions for system access
- Time-limited access tokens for maintenance
- Complete audit trail of administrative access

### Data Protection

**Sensitive Data Handling**:
- Automatic detection and masking of credentials
- PII (Personally Identifiable Information) protection
- Encryption of logs containing sensitive data
- Secure deletion of expired sensitive logs
- Privacy compliance and reporting

**Encryption and Security**:
- At-rest encryption for all log files
- In-transit encryption for log streaming
- Secure key management and rotation
- Access logging and monitoring
- Compliance with security standards

## Performance Monitoring and Optimization

### Log System Performance

**Performance Metrics**:
- Log write throughput and latency
- File system performance monitoring
- Memory usage optimization
- CPU utilization tracking
- Network bandwidth usage for streaming

**Optimization Strategies**:
- Asynchronous log writing for performance
- Batch processing for high-volume logs
- Efficient file system organization
- Memory management and garbage collection
- Background processing for maintenance tasks

**Scalability Planning**:
- Horizontal scaling for high-volume environments
- Load balancing for log processing
- Distributed storage for enterprise deployments
- Microservice architecture for log components
- Cloud integration for unlimited scaling

### Health Monitoring

**System Health Indicators**:
- Log system availability and uptime
- Performance degradation detection
- Resource usage trends and alerts
- Error rate monitoring and thresholds
- User satisfaction and response times

**Alerting and Notifications**:
- Real-time alerts for critical issues
- Escalation procedures for unresolved problems
- Integration with monitoring systems
- Automated remediation for common issues
- Reporting and analytics dashboards

## Future Enhancements

### Advanced Features

**Machine Learning Integration**:
- Anomaly detection in log patterns
- Predictive analytics for system issues
- Automated categorization of log entries
- Intelligent alerting based on patterns
- Performance optimization recommendations

**Analytics and Insights**:
- User behavior analysis from logs
- System performance trend analysis
- Error pattern recognition and prevention
- Capacity planning based on usage data
- Business intelligence from operational data

### Integration Capabilities

**External System Integration**:
- SIEM (Security Information and Event Management) integration
- APM (Application Performance Monitoring) tools
- Business intelligence platforms
- Compliance reporting systems
- Third-party analytics services

**API and Automation**:
- RESTful APIs for all log operations
- Webhook integrations for real-time notifications
- Automated response to critical events
- Scheduled reporting and analysis
- Custom dashboard and visualization support

## Implementation Strategy

### Development Phases

**Phase 1: Enhanced System Logging**:
- Implement Winston-based system logging
- Create system log categories and storage
- Develop admin dashboard for system monitoring
- Implement basic log rotation and cleanup
- Add security and audit logging

**Phase 2: Advanced User Features**:
- Real-time log streaming via WebSocket
- Enhanced search and filtering capabilities
- Improved export options and formats
- Performance optimization and caching
- Mobile-responsive log viewing interface

**Phase 3: Analytics and Intelligence**:
- Advanced analytics and reporting
- Machine learning for anomaly detection
- Predictive maintenance capabilities
- Custom dashboard builder
- Integration with external monitoring tools

**Phase 4: Enterprise Features**:
- Multi-tenant scaling enhancements
- Advanced security and compliance features
- High availability and disaster recovery
- Custom alerting and notification systems
- Enterprise integration capabilities

### Testing and Validation

**Testing Strategy**:
- Unit tests for all logging components
- Integration tests for end-to-end workflows
- Performance testing under load
- Security testing and penetration testing
- User acceptance testing with real scenarios

**Quality Assurance**:
- Code review processes for logging changes
- Automated testing in CI/CD pipeline
- Performance benchmarking and regression testing
- Security scanning and vulnerability assessment
- Documentation and training materials

This comprehensive logging system provides robust, scalable, and secure logging capabilities for both user instances and system-wide monitoring, ensuring complete visibility into system operations while maintaining user privacy and security.