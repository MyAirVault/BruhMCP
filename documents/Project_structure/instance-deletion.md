# MCP Instance Deletion Flow

## Overview

This document outlines the complete flow for deleting MCP instances in the multi-tenant Phase 2 architecture. The deletion process handles both database cleanup and service-specific credential cache invalidation to ensure immediate access revocation.

## Deletion Architecture

### Core Principle

Each MCP service (Figma, GitHub, Slack, etc.) operates independently with its own credential cache. When an instance is deleted, only the specific service that cached those credentials needs cache invalidation - no cross-service communication required.

### Service Isolation Benefits

-   **Single Service Scope**: Only the service type of the deleted instance needs cache cleanup
-   **No Broadcasting**: No need to notify all services about deletion
-   **Isolated Impact**: Deletion affects only the specific service cache
-   **Simplified Logic**: One-to-one relationship between instance and service cache

## Detailed Deletion Flow

### Step 1: Frontend Deletion Request

**User Action**: User clicks "Delete" button on MCP instance in frontend interface

**API Call**:

```
DELETE /api/v1/mcps/{instanceId}
Headers: Authorization (user session)
```

**Frontend Responsibilities**:

-   Confirm deletion with user (confirmation dialog)
-   Send authenticated DELETE request to backend
-   Handle success/error responses
-   Update UI to remove deleted instance
-   Show deletion confirmation message

### Step 2: Backend Authentication & Validation

**Controller**: `deleteMCP.js`

**Authentication Check**:

-   Verify user is authenticated
-   Extract user ID from session/token
-   Validate request parameters

**Ownership Validation**:

-   Query database to confirm instance exists
-   Verify instance belongs to authenticated user
-   Return 404 if instance not found
-   Return 403 if user doesn't own instance

**Instance Data Retrieval**:

-   Get complete instance record before deletion
-   Extract service type (`mcp_service_name`) for cache cleanup
-   Store instance metadata for audit logging

### Step 3: Database Transaction Operations

**Transaction Scope**: All database operations in single transaction for data integrity

**Primary Deletion**:

```sql
DELETE FROM mcp_service_table
WHERE instance_id = ? AND user_id = ?
```

**Statistics Update**:

```sql
UPDATE mcp_table
SET active_instances_count = active_instances_count - 1,
    updated_at = NOW()
WHERE mcp_service_id = ?
```

**Audit Logging** (Optional):

-   Log deletion event with timestamp
-   Record user ID, instance ID, and service type
-   Store deletion reason if provided
-   Maintain audit trail for compliance

**Transaction Commit**:

-   Commit all database changes atomically
-   Handle rollback on any failure
-   Ensure data consistency

### Step 4: Service-Specific Cache Invalidation

**Cache Cleanup Strategy**: Target only the specific service that could have cached the deleted instance

**Service Type Identification**:

-   Use `mcp_service_name` from deleted instance record
-   Map service name to cache cleanup function
-   Route to appropriate service cache manager

**Figma Service Cache Cleanup**:

-   Remove instance from Figma credential cache
-   Call `removeCachedCredential(instanceId)` function
-   Update cache statistics
-   Log cache cleanup operation

**Future Service Support**:

-   GitHub: Remove from GitHub service cache
-   Slack: Remove from Slack service cache
-   Generic: Extensible pattern for new services

**Cache Invalidation Flow**:

1. Identify service type from instance data
2. Call service-specific cache removal function
3. Verify successful cache removal
4. Log cache cleanup results
5. Handle cache cleanup failures gracefully

### Step 5: Response and Cleanup

**Success Response**:

```json
{
	"data": {
		"message": "MCP instance deleted successfully",
		"instance_id": "uuid-here",
		"service_type": "figma",
		"deleted_at": "2025-07-13T15:30:00Z"
	}
}
```

**Async Background Tasks**:

-   Background watcher will detect missing instance on next cycle
-   Any stale cache entries cleaned up automatically
-   Usage statistics updated in background
-   Cleanup confirmation logged

## Error Handling

### Authentication Errors

**Unauthorized User (401)**:

-   No valid session or token
-   Return authentication required error
-   Redirect to login if needed

**Forbidden Access (403)**:

-   User doesn't own the instance
-   Return access denied error
-   Log unauthorized deletion attempt

### Instance Errors

**Instance Not Found (404)**:

-   Instance ID doesn't exist in database
-   Instance already deleted
-   Return not found error

**Instance Already Deleted**:

-   Handle idempotent deletion gracefully
-   Return success if already deleted
-   Avoid duplicate deletion errors

### Database Errors

**Transaction Failure**:

-   Rollback all database changes
-   Return internal server error
-   Log detailed error information
-   Preserve data integrity

**Foreign Key Constraints**:

-   Handle cascade deletion properly
-   Ensure referential integrity
-   Clean up related records

### Cache Cleanup Errors

**Cache Service Unavailable**:

-   Database deletion succeeds
-   Cache cleanup fails
-   Background watcher provides fallback
-   Return success to user (cache will be cleaned eventually)

**Partial Cache Cleanup**:

-   Some cache operations succeed, others fail
-   Log failed operations for retry
-   Background watcher handles missed cleanups
-   Don't fail entire deletion for cache issues

## Security Considerations

### Access Control

**User Ownership Validation**:

-   Strict validation that user owns instance
-   No instance access across user boundaries
-   Audit trail for all deletion attempts

**Instance Isolation**:

-   User can only delete their own instances
-   No admin override capabilities (unless explicitly designed)
-   Session-based authentication required

### Data Protection

**Immediate Access Revocation**:

-   Instance becomes unusable immediately after deletion
-   Cached credentials removed from memory
-   No residual access possible

**Credential Cleanup**:

-   All stored credentials permanently deleted
-   No credential recovery after deletion
-   Secure memory cleanup

### Audit Requirements

**Deletion Logging**:

-   Who deleted the instance
-   When deletion occurred
-   Which instance was deleted
-   Success/failure status

**Compliance Tracking**:

-   Maintain deletion records for audit
-   Track credential lifecycle
-   Monitor deletion patterns

## Performance Considerations

### Database Optimization

**Query Performance**:

-   Use indexed lookups for instance retrieval
-   Efficient foreign key cascade operations
-   Minimal transaction scope

**Connection Management**:

-   Use connection pooling
-   Handle database timeouts
-   Optimize query execution

### Cache Performance

**Immediate Invalidation**:

-   Fast cache removal operations
-   O(1) cache lookup and removal
-   Minimal memory impact

**Memory Management**:

-   Free cached credential memory immediately
-   Update cache statistics
-   Prevent memory leaks

### Response Time

**Target Performance**:

-   Total deletion time < 500ms
-   Database operations < 200ms
-   Cache cleanup < 50ms
-   Response to user < 300ms

**Async Operations**:

-   Background cleanup doesn't block response
-   Audit logging happens asynchronously
-   Statistics updates can be batched

## Background Cleanup

### Watcher Integration

**Automatic Detection**:

-   Background watcher detects deleted instances
-   Removes any missed cache entries
-   Provides redundant cleanup safety

**Cleanup Verification**:

-   Periodic scan for orphaned cache entries
-   Remove entries for non-existent instances
-   Log cleanup statistics

### Fallback Mechanisms

**Cache Expiration**:

-   Natural cache expiration removes stale entries
-   Instance expiration removes deleted instances
-   Background maintenance prevents accumulation

**Manual Cleanup**:

-   Admin tools for cache inspection
-   Manual cache invalidation capabilities
-   Debug endpoints for troubleshooting

## Integration Points

### Frontend Integration

**UI Updates**:

-   Remove deleted instance from lists immediately
-   Update instance counts and statistics
-   Show deletion confirmation

**Error Handling**:

-   Display appropriate error messages
-   Handle network failures gracefully
-   Provide retry mechanisms

### Backend Integration

**Controller Updates**:

-   Enhance existing `deleteMCP.js` controller
-   Add cache invalidation logic
-   Maintain backward compatibility

**Service Integration**:

-   Import cache management functions
-   Add service-specific cleanup
-   Handle multiple service types

### Database Integration

**Schema Compliance**:

-   Work with existing database schema
-   Maintain foreign key relationships
-   Support cascade operations

**Statistics Management**:

-   Keep service statistics accurate
-   Update counters consistently
-   Handle concurrent modifications

## Future Enhancements

### Multi-Service Support

**Service Registry**:

-   Dynamic service discovery
-   Automated cache cleanup routing
-   Extensible service addition

**Service Health Monitoring**:

-   Check service availability before cleanup
-   Retry failed cache operations
-   Monitor cleanup success rates

### Advanced Features

**Soft Deletion**:

-   Mark instances as deleted without removing
-   Support undelete operations
-   Maintain deletion history

**Bulk Deletion**:

-   Delete multiple instances atomically
-   Batch cache cleanup operations
-   Optimize for bulk operations

### Monitoring and Alerting

**Deletion Metrics**:

-   Track deletion success rates
-   Monitor cache cleanup performance
-   Alert on deletion failures

**Audit Analytics**:

-   Deletion pattern analysis
-   User behavior insights
-   Compliance reporting
