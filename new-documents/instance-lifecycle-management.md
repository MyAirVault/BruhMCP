# MCP Instance Lifecycle Management

## Overview

This document outlines the complete lifecycle management system for MCP instances, including status toggles (active/inactive) and renewal processes for expired instances. The system implements cache invalidation for non-active instances to ensure optimal memory usage and security.

## Core Principles

### Instance States

**Active State**:
- Instance is fully operational and accepts requests
- Credentials are cached in memory for performance
- All MCP service endpoints are accessible
- Usage tracking and statistics are updated

**Inactive State**:
- Instance is paused by user choice
- All service requests are blocked with 403 Forbidden
- Credentials are removed from cache immediately
- Instance can be reactivated at any time

**Expired State**:
- Instance has passed its expiration date
- All service requests are blocked with 403 Forbidden
- Credentials are removed from cache immediately
- Instance requires renewal with new expiration date

### Cache Management Philosophy

**Cache Only Active Instances**:
- Only active, usable instances have credentials cached
- Inactive and expired instances have no cache entries
- Memory efficiency and security through immediate cache purging
- Cache accurately represents currently usable instances

**Performance vs Security Trade-off**:
- Slight performance cost on reactivation (database lookup)
- Significant security and memory benefits
- Cache population happens automatically on first request after activation

## Status Toggle Flow (Active ↔ Inactive)

### User Interface Actions

**Toggle to Inactive**:
- User clicks toggle switch or "Pause" button on active instance
- Frontend immediately shows loading state
- API call to backend to update status
- UI updates to show inactive state with reactivation option

**Toggle to Active**:
- User clicks toggle switch or "Resume" button on inactive instance
- Frontend immediately shows loading state
- API call to backend to update status
- UI updates to show active state with pause option

### Backend Processing Flow

**Activation Process (Inactive → Active)**:

1. **Request Validation**:
   - Verify user authentication and ownership
   - Confirm instance exists and is currently inactive
   - Validate that instance is not expired

2. **Database Update**:
   - Update instance status to 'active' in mcp_service_table
   - Update last_modified timestamp
   - Commit transaction atomically

3. **Cache Handling**:
   - No immediate cache population
   - Cache will be populated on first service request
   - Leverages existing credential caching system

4. **Response**:
   - Return success confirmation to frontend
   - Include updated instance metadata
   - Log activation event for audit trail

**Deactivation Process (Active → Inactive)**:

1. **Request Validation**:
   - Verify user authentication and ownership
   - Confirm instance exists and is currently active
   - Check for any active service processes

2. **Cache Invalidation**:
   - Remove instance credentials from service cache
   - Use existing cache invalidation service
   - Verify successful cache removal

3. **Database Update**:
   - Update instance status to 'inactive' in mcp_service_table
   - Update last_modified timestamp
   - Commit transaction atomically

4. **Response**:
   - Return success confirmation to frontend
   - Include updated instance metadata
   - Log deactivation event for audit trail

### API Endpoints

**Status Toggle Endpoint**:
```
PATCH /api/v1/mcps/{instanceId}/status
Authorization: Bearer {userToken}
Content-Type: application/json

Request Body:
{
  "status": "active" | "inactive"
}

Success Response (200):
{
  "data": {
    "message": "Instance status updated successfully",
    "instance_id": "uuid",
    "old_status": "active",
    "new_status": "inactive",
    "updated_at": "2025-07-13T15:30:00Z"
  }
}

Error Responses:
- 400: Invalid status value
- 403: Cannot toggle expired instance
- 404: Instance not found
- 500: Database or cache error
```

## Instance Renewal Flow (Expired → Active)

### User Interface Actions

**Renewal Process**:
- User clicks "Renew" button on expired instance
- Frontend shows date picker modal for new expiration
- User selects future expiration date and confirms
- API call to backend with new expiration date
- UI updates to show active state with new expiration

### Backend Processing Flow

**Renewal Process (Expired → Active)**:

1. **Request Validation**:
   - Verify user authentication and ownership
   - Confirm instance exists and is currently expired
   - Validate new expiration date is in the future
   - Check expiration date is reasonable (not too far in future)

2. **Database Update**:
   - Update instance status to 'active' in mcp_service_table
   - Set new expires_at timestamp
   - Update last_modified timestamp
   - Commit transaction atomically

3. **Cache Handling**:
   - No immediate cache population
   - Cache will be populated on first service request
   - New expiration time will be cached with credentials

4. **Statistics Update**:
   - Update service statistics if needed
   - Track renewal event for analytics
   - Log renewal for audit purposes

5. **Response**:
   - Return success confirmation to frontend
   - Include updated instance metadata with new expiration
   - Log renewal event for audit trail

### API Endpoints

**Instance Renewal Endpoint**:
```
PATCH /api/v1/mcps/{instanceId}/renew
Authorization: Bearer {userToken}
Content-Type: application/json

Request Body:
{
  "expires_at": "2025-12-31T23:59:59Z"
}

Success Response (200):
{
  "data": {
    "message": "Instance renewed successfully",
    "instance_id": "uuid",
    "old_status": "expired",
    "new_status": "active",
    "old_expires_at": "2025-07-13T00:00:00Z",
    "new_expires_at": "2025-12-31T23:59:59Z",
    "renewed_at": "2025-07-13T15:30:00Z"
  }
}

Error Responses:
- 400: Invalid expiration date (past date or too far future)
- 403: Instance not expired or user doesn't own instance
- 404: Instance not found
- 500: Database error
```

## Service Request Handling

### Request Flow for Different States

**Active Instance Request**:
1. Request arrives at service endpoint
2. Instance validation checks status = 'active'
3. Expiration check passes (expires_at > now)
4. Credential cache lookup or database fetch
5. Request processed normally
6. Usage statistics updated

**Inactive Instance Request**:
1. Request arrives at service endpoint
2. Instance validation detects status = 'inactive'
3. Request immediately rejected with 403 Forbidden
4. Error response: "Instance is paused"
5. No credential lookup or processing

**Expired Instance Request**:
1. Request arrives at service endpoint
2. Instance validation detects status = 'expired' OR expires_at < now
3. Request immediately rejected with 403 Forbidden
4. Error response: "Instance has expired"
5. No credential lookup or processing

### Error Response Format

**Inactive Instance Response**:
```json
{
  "error": "Instance is paused",
  "status": 403,
  "code": "INSTANCE_INACTIVE",
  "instance_id": "uuid",
  "message": "This instance has been paused. Please activate it to continue."
}
```

**Expired Instance Response**:
```json
{
  "error": "Instance has expired",
  "status": 403,
  "code": "INSTANCE_EXPIRED", 
  "instance_id": "uuid",
  "expired_at": "2025-07-13T00:00:00Z",
  "message": "This instance has expired. Please renew it to continue."
}
```

## Cache Invalidation Strategy

### When Cache is Removed

**Immediate Cache Removal**:
- User toggles instance from active to inactive
- Instance expires (background watcher or manual expiration)
- Instance is deleted
- Service-wide cache clearing (emergency situations)

**Cache Removal Benefits**:
- Memory efficiency - no unused credentials in memory
- Security - inactive instances don't have accessible credentials
- Consistency - cache only contains usable instances
- Resource optimization - better scalability

### When Cache is Populated

**Automatic Cache Population**:
- First service request after instance activation
- First service request after instance renewal
- Cache miss during normal operation
- Background cache warming (if implemented)

**Cache Population Flow**:
1. Service request arrives for active instance
2. Cache lookup returns null (cache miss)
3. Database query fetches credentials and metadata
4. Credential validation with external service
5. Cache entry created with credentials and expiration
6. Request processed with cached credentials

## Background Maintenance

### Automatic Expiration Detection

**Background Watcher Integration**:
- 30-second background watcher detects expired instances
- Automatic status update from 'active' to 'expired'
- Automatic cache invalidation for expired instances
- Statistics and audit logging for auto-expiration

**Expiration Process**:
1. Background watcher checks all active instances
2. Compares expires_at with current timestamp
3. Updates expired instances to status = 'expired'
4. Removes expired instances from cache
5. Logs expiration events for audit

### Cache Cleanup

**Periodic Cache Validation**:
- Remove cache entries for instances that no longer exist
- Validate cached expiration times against database
- Clean up orphaned cache entries
- Report cache health statistics

## Security Considerations

### Access Control

**Status Change Authorization**:
- Only instance owner can toggle status
- No admin override for status changes
- Session-based authentication required
- Audit logging for all status changes

**Renewal Authorization**:
- Only instance owner can renew expired instances
- No cross-user instance renewal
- Reasonable expiration date limits (e.g., max 1 year)
- Audit logging for all renewal events

### Credential Security

**Immediate Credential Removal**:
- Inactive instances have no cached credentials
- Expired instances have no cached credentials
- No credential residue in memory
- Secure cleanup of credential data

**Credential Re-validation**:
- No credential validation during status changes
- Service-level credential errors handled gracefully
- User receives clear credential error messages
- Frontend prompts for credential updates when needed

## Performance Considerations

### Database Optimization

**Efficient Status Updates**:
- Single database query for status changes
- Indexed lookups on instance_id and user_id
- Minimal transaction scope
- Optimized query patterns

**Cache Performance**:
- O(1) cache removal operations
- No unnecessary cache warming
- Memory-efficient cache management
- Cache statistics for monitoring

### Response Time Targets

**Status Toggle Performance**:
- Total response time < 200ms
- Database update < 100ms
- Cache invalidation < 50ms
- Frontend update immediate

**Renewal Performance**:
- Total response time < 300ms
- Database update < 150ms
- Validation < 50ms
- Frontend update immediate

## Error Handling and Recovery

### Partial Failure Scenarios

**Database Success, Cache Failure**:
- Status change succeeds in database
- Cache invalidation fails
- Background watcher provides fallback cleanup
- User sees success message (eventually consistent)

**Status Change Rollback**:
- Database transaction failure triggers rollback
- No partial state changes
- Error message returned to user
- Retry mechanism available

### User Experience

**Graceful Degradation**:
- Cache failures don't block status changes
- Background cleanup handles missed operations
- Clear error messages for user actions
- Retry options for failed operations

**Feedback and Notifications**:
- Immediate UI feedback for status changes
- Loading states during API calls
- Success confirmations for completed actions
- Clear error messages with resolution steps

## Monitoring and Observability

### Audit Trail

**Status Change Logging**:
- Log all activation and deactivation events
- Track renewal events with old and new expiration
- Record user, timestamp, and instance details
- Maintain compliance audit trail

**Performance Metrics**:
- Track status change response times
- Monitor cache invalidation success rates
- Measure database operation performance
- Alert on unusual patterns or failures

### Health Monitoring

**System Health Indicators**:
- Cache hit/miss rates for active instances
- Status change success rates
- Background watcher performance
- Database connection health

**User Behavior Analytics**:
- Instance activation/deactivation patterns
- Renewal frequency and timing
- Service usage after status changes
- Error rates and resolution patterns

## Future Enhancements

### Advanced Features

**Bulk Operations**:
- Bulk status changes for multiple instances
- Bulk renewal with same expiration date
- Batch cache invalidation operations
- Optimized database transactions

**Automated Management**:
- Auto-renewal for instances approaching expiration
- Smart expiration warnings and notifications
- Usage-based automatic deactivation
- Intelligent cache warming strategies

### Integration Improvements

**Enhanced Monitoring**:
- Real-time cache statistics dashboard
- Instance lifecycle visualization
- Performance analytics and reporting
- Predictive expiration management

**User Experience**:
- Bulk instance management interface
- Renewal reminders and notifications
- Usage analytics for instance optimization
- Simplified credential management flows