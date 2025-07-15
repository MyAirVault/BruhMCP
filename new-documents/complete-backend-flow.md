# Complete Backend Flow Documentation

## Overview

This document describes the complete end-to-end flow of the MCP (Model Control Protocol) backend system, from initial user authentication through instance lifecycle management to final deletion. Each step includes the responsible functions, files, and logging mechanisms.

## Flow Phases

### **0. Database Migration and Service Registration Flow**

**Migration Execution**:
- **Command**: `npm run db:migrate`
- **Script**: `backend/src/db/scripts/migrate.js`
- **Core Schema**: Executes `001_complete_database_setup.sql` for tables, indexes, triggers
- **Service Discovery**: Automatically scans `backend/src/mcp-servers/*/db/` for service.sql files

**Service Registration Process**:
- **Auto-Discovery**: Migration script finds all service directories in `backend/src/mcp-servers/`
- **File Loading**: Loads `service.sql` from each service's `db/` folder
- **Port Validation**: Validates port consistency with `mcp-ports/*/config.json`
- **Database Registration**: Executes SQL to register service in `mcp_table`
- **Logging**: Registration events logged with success/failure status

**Post-Migration State**:
- **Service Catalog**: All services available in `mcp_table` with correct metadata
- **Port Consistency**: All ports validated against configuration files
- **Ready for Use**: Services registered and ready for instance creation

### **1. User Authentication Flow**

**Initial Authentication Request**:
- User visits frontend application
- Frontend detects no authentication token
- User redirected to authentication endpoint

**Magic Link Generation**:
- **Function**: `requestAuth()` in `authController.js`
- **Process**: Generates secure token, stores in database
- **Email Service**: Sends magic link via email service
- **Database**: Stores token with expiration in user_tokens table
- **Logging**: Authentication request logged to `security.log`

**Magic Link Verification**:
- **Function**: `verifyAuth()` in `authController.js`
- **JWT Creation**: `generateJWT()` in `jwt.js` utility
- **Cookie Setting**: httpOnly secure cookie with JWT token
- **Database**: Token marked as used, user session created
- **Logging**: Successful authentication logged with IP and user agent

**Request Authentication**:
- **Middleware**: `authenticate()` in `authMiddleware.js`
- **Token Verification**: `verifyJWT()` validates token on each request
- **User Context**: User object attached to request for downstream use
- **Logging**: Authentication failures and successes tracked in real-time

### **2. MCP Instance Creation Flow**

**Service Discovery**:
- **Function**: `getMCPTypes()` in `mcpTypesController.js`
- **Database Query**: `getAllMCPTypes()` retrieves available services
- **Service Registration**: Services automatically registered from `backend/src/mcp-servers/*/db/service.sql`
- **Response**: Available services (Figma, GitHub, etc.) returned to frontend

**Credential Validation**:
- **Function**: `validateCredentialsForService()` in `instanceCredentialValidationService.js`
- **API Testing**: Real API call to external service (e.g., Figma API)
- **Format Validation**: Service-specific credential format checking
- **Result**: Validation success/failure with detailed error messages
- **Logging**: Credential validation attempts logged to `security.log`

**Instance Creation**:
- **Function**: `createMCP()` in `createMCP.js`
- **Database Transaction**: Atomic creation in `mcp_service_table`
- **Log Directory**: `LogFileManager` creates user-specific log directory
- **Cache Initialization**: Empty cache entry prepared for future use
- **Statistics Update**: Service instance counters incremented
- **Logging**: Instance creation audited in `audit.log`

**Directory Structure Creation**:
- **Service**: `LogFileManager` in `log-file-manager.js`
- **Path**: `./logs/users/user_{userId}/mcp_{instanceId}/`
- **Files**: `app.log`, `access.log`, `error.log` files created
- **Permissions**: User-isolated access permissions set

### **3. MCP Service Request Flow**

**Request Routing**:
- **Middleware**: `createCredentialAuthMiddleware()` in `credential-auth.js`
- **Instance Validation**: Instance ownership and status verification
- **User Context**: Request context established with user and instance data

**Credential Cache Check**:
- **Function**: `getCachedCredential()` in `credential-cache.js`
- **Cache Hit**: Credentials returned from memory if available and valid
- **Cache Miss**: Database lookup triggered for credential retrieval
- **Expiration Check**: Cached credentials validated against expiration time

**Database Credential Retrieval**:
- **Function**: `validateInstanceAccess()` in `database.js`
- **Service Check**: Verify service is active and available
- **Status Validation**: Confirm instance is active (not inactive/expired)
- **Credential Extraction**: Retrieve API keys or OAuth tokens from database
- **Logging**: Database operations logged to `database.log`

**Cache Population**:
- **Function**: `setCachedCredential()` in `credential-cache.js`
- **Memory Storage**: Credentials stored in memory with metadata
- **Performance Optimization**: Subsequent requests avoid database hits
- **Statistics**: Cache hit/miss rates tracked for monitoring

**External API Request**:
- **Service**: Figma API calls via `figma-api.js`
- **Authentication**: User credentials attached to external requests
- **Response Processing**: External API responses processed and returned
- **Error Handling**: Service-specific error handling and user-friendly messages

**Usage Tracking**:
- **Function**: Async usage update in database
- **Metrics**: `last_used_at` and `usage_count` fields updated
- **Performance**: Non-blocking async operation
- **Logging**: API requests logged to `performance.log` and user instance logs

### **4. Instance Status Toggle Flow**

**Toggle Request Processing**:
- **Function**: `toggleInstanceStatus()` in `toggleInstanceStatus.js`
- **Validation**: User ownership verification and current status check
- **Status Logic**: Prevents toggling of expired instances
- **Database Update**: Atomic status change in single transaction

**Cache Invalidation (Active → Inactive)**:
- **Function**: `invalidateInstanceCache()` in `cacheInvalidationService.js`
- **Service Routing**: Service-specific cache cleanup (Figma, GitHub, etc.)
- **Memory Cleanup**: Immediate removal from credential cache
- **Background Safety**: Background watcher provides fallback cleanup

**No Cache Operation (Inactive → Active)**:
- **Strategy**: Cache remains empty until first service request
- **Performance**: Database lookup on reactivation (acceptable trade-off)
- **Security**: No stale credentials remain in memory

**Status Update Response**:
- **Database**: Transaction commit confirms status change
- **Response**: Updated status and timestamp returned to frontend
- **Logging**: Status change audited with old/new status values

### **5. Instance Renewal Flow**

**Renewal Request Validation**:
- **Function**: `renewInstance()` in `renewInstance.js`
- **Expiration Check**: Only expired instances can be renewed
- **Date Validation**: New expiration must be future date within limits
- **User Authorization**: Ownership verification required

**Database Transaction**:
- **Status Update**: Instance status changed from 'expired' to 'active'
- **Expiration Update**: New `expires_at` timestamp set
- **Statistics**: Service statistics updated if previously expired
- **Atomic Operation**: All changes within single database transaction

**Service Statistics Update**:
- **Counter Increment**: `active_instances_count` increased for service
- **Tracking**: Service-level metrics maintained for monitoring
- **Consistency**: Statistics kept in sync with actual instance states

**Response Generation**:
- **Success Confirmation**: Renewal details returned to frontend
- **Cache Strategy**: No immediate cache population (populated on first use)
- **Logging**: Renewal event audited with old/new expiration dates

### **6. Credential Update Flow**

**Credential Submission**:
- **Function**: `updateInstanceCredentials()` in `updateInstanceCredentials.js`
- **Format Validation**: Service-specific credential format checking
- **Security**: No credentials logged in plain text

**Real-time Validation**:
- **Function**: `validateCredentialsWithFormat()` in `instanceCredentialValidationService.js`
- **External API**: Live validation against actual service API
- **User Feedback**: Immediate success/failure response
- **Error Mapping**: Service-specific error messages for users

**Database Update (Validation Success Only)**:
- **Transaction**: Database updated only after successful validation
- **Credential Storage**: New credentials securely stored
- **Rollback**: Failed validations don't affect existing credentials
- **Timestamp**: Update timestamp recorded for auditing

**Cache Invalidation**:
- **Function**: `invalidateInstanceCache()` removes old cached credentials
- **Fresh Fetch**: Next service request will fetch new credentials
- **Performance**: Brief performance impact during cache refresh
- **Security**: Ensures no stale credentials remain in memory

**Audit Logging**:
- **Event Tracking**: Credential update event logged without sensitive data
- **Context**: User, instance, service, and validation result recorded
- **Compliance**: Full audit trail maintained for security compliance

### **7. Instance Deletion Flow**

**Deletion Request Validation**:
- **Function**: `deleteMCP()` in `deleteMCP.js`
- **Authorization**: User ownership verification required
- **Instance Retrieval**: Full instance data retrieved before deletion
- **Context Preservation**: Service type and metadata saved for cleanup

**Database Transaction**:
- **Primary Deletion**: Instance record removed from `mcp_service_table`
- **Statistics Update**: Service instance count decremented
- **Referential Integrity**: Related records cleaned up appropriately
- **Atomic Operation**: All database changes within single transaction

**Cache Invalidation**:
- **Service-Specific**: Only relevant service cache cleaned (no broadcasting)
- **Immediate Removal**: Instance credentials removed from memory
- **Background Safety**: Background watcher provides redundant cleanup
- **Performance**: Non-blocking async operation

**Log File Retention**:
- **Directory Preservation**: User instance logs remain for retention period
- **Cleanup Schedule**: Logs cleaned by maintenance service after 30 days
- **Audit Trail**: Deletion event logged before log directory cleanup
- **Recovery**: No recovery possible after successful deletion

**Response Confirmation**:
- **Success Message**: Deletion confirmed to frontend
- **Instance Details**: Summary of deleted instance returned
- **Timestamp**: Deletion timestamp for user records
- **Logging**: Complete deletion event audited with full context

### **8. Background Maintenance Flow**

**Expiration Monitoring**:
- **Service**: `expirationMonitor` runs every 30 seconds
- **Function**: `checkExpiredInstances()` scans for expired instances
- **Status Update**: Expired instances marked as 'expired' status
- **Cache Cleanup**: Expired instance credentials removed from cache
- **Logging**: Expiration events logged to `audit.log`

**Log Maintenance**:
- **Service**: `logMaintenanceService` runs every 24 hours
- **File Rotation**: Daily log rotation with compression
- **Cleanup**: Old log files removed based on retention policies
- **Integrity**: Log file validation and corruption detection
- **Disk Monitoring**: Storage usage tracked and reported

**Cache Maintenance**:
- **Background Cleanup**: Invalid cache entries removed periodically
- **Memory Management**: Cache size monitoring and optimization
- **Statistics**: Cache performance metrics tracked
- **Health Checks**: Cache system health validated regularly

**Performance Monitoring**:
- **Metrics Collection**: System performance data aggregated
- **Alerting**: Performance threshold monitoring
- **Resource Tracking**: Memory, CPU, and disk usage monitored
- **Trend Analysis**: Performance trends tracked over time

### **9. Admin Monitoring Flow**

**Dashboard Access**:
- **Function**: `getSystemLogsDashboard()` in `systemLogs.js`
- **Authorization**: Admin role verification required
- **Metrics Aggregation**: Real-time system metrics compiled
- **Performance Data**: API response times and error rates calculated

**Log Access**:
- **Function**: `getSystemLogs()` with filtering and pagination
- **Category Routing**: Different log categories (security, performance, audit)
- **Search Functionality**: Full-text search across log entries
- **Export Capability**: Multi-format export (JSON, CSV, TXT)

**Health Monitoring**:
- **System Status**: Overall system health assessment
- **Resource Usage**: Disk, memory, and CPU utilization
- **Error Tracking**: Critical error identification and alerting
- **Trend Analysis**: Performance and usage trend reporting

**Maintenance Controls**:
- **Manual Triggers**: Admin-initiated maintenance operations
- **Status Monitoring**: Maintenance job status and progress
- **Configuration**: Maintenance schedule and policy configuration
- **Reporting**: Maintenance activity reporting and logging

## Cross-Cutting Concerns

### **Security Logging**
- **Authentication Events**: All login attempts and token validations
- **Authorization Failures**: Unauthorized access attempts
- **Suspicious Activity**: Rate limiting triggers and unusual patterns
- **Credential Operations**: Validation attempts and updates (without sensitive data)

### **Performance Logging**
- **API Response Times**: All endpoint performance tracking
- **Database Query Performance**: Slow query detection and logging
- **Cache Performance**: Hit/miss rates and response times
- **Resource Utilization**: System resource usage monitoring

### **Audit Logging**
- **User Actions**: All instance lifecycle operations
- **Configuration Changes**: System configuration modifications
- **Administrative Actions**: Admin operations and access
- **Data Operations**: Create, update, delete operations with context

### **Error Handling**
- **Global Error Handler**: Comprehensive error logging with context
- **Service Error Mapping**: External service errors mapped to user-friendly messages
- **Recovery Procedures**: Automatic recovery attempts and fallback mechanisms
- **Error Aggregation**: Error pattern analysis and alerting

This complete flow ensures comprehensive monitoring, security, and auditability throughout the entire MCP instance lifecycle while maintaining performance and user experience.