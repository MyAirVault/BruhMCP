# MCP Instance Isolation Architecture

## Overview

Users can create multiple instances of the same MCP type (e.g., 2 Gmail MCPs) that run independently using UUID-based instance isolation. Each instance gets a unique UUID and runs on its own isolated route.

## MCP Duplication

### Instance Management
- Users can create multiple instances of the same MCP type
- Each instance gets a unique UUID (automatically generated)
- Example: Gmail instance `550e8400-e29b-41d4-a716-446655440000`, Gmail instance `6ba7b810-9dad-11d1-80b4-00c04fd430c8`
- Instance numbering: Sequential instance_number for display purposes (1, 2, 3, etc.)

### Instance Limits
- Maximum 10 instances per user (aligned with existing database schema)
- UUID-based identification: Each instance has a unique UUID
- Instance assignment: UUID generated automatically, instance_number assigned sequentially
- Instance recycling: Instance numbers reused when instances are deleted
- Instance cleanup on user deletion

## Process Isolation

### UUID-Based Handler Management
- Each instance runs as its own Express router handler
- Use Express routing and middleware approach
- Handler identification: Uses instance UUID for all operations
- Handler context: `MCP_ID={instanceUUID}`, `USER_ID={userId}`, `MCP_TYPE={mcpType}`
- Handler monitoring with UUID-based health checks

### Instance-Based Routing
- **New Architecture**: `localhost:3000/mcp/{instanceUUID}`
- **Example URLs**:
  - `localhost:3000/mcp/550e8400-e29b-41d4-a716-446655440000`
  - `localhost:3000/mcp/6ba7b810-9dad-11d1-80b4-00c04fd430c8`
- Each instance is completely isolated from others
- Route allocation: Uses instance UUID for unique routing within main Express server

## File System Isolation

### Directory Structure
UUID-based directory isolation:
```
./logs/
├── users/
│   ├── user_{userId}/
│   │   ├── mcp_{instanceUUID}_{mcpType}/
│   │   │   ├── access.log
│   │   │   ├── error.log
│   │   │   └── metrics.json
│   │   └── mcp_{instanceUUID}_{mcpType}/
│   │       ├── access.log
│   │       ├── error.log
│   │       └── shutdown-metrics.json
│   └── user_{userId}/
│       └── mcp_{instanceUUID}_{mcpType}/
```

### File Isolation
- Each instance gets its own log directory based on UUID
- Complete isolation between instances (no shared files)
- UUID-based file cleanup on instance deletion
- Consistent logging with instance UUIDs throughout all operations

## Database Schema

### UUID-Based Instance Isolation
Current `mcp_instances` table already supports UUID-based isolation:
```sql
CREATE TABLE mcp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Instance UUID
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    custom_name VARCHAR(255),
    instance_number INTEGER NOT NULL DEFAULT 1,     -- For display purposes
    process_id INTEGER,
    access_token VARCHAR(255) UNIQUE NOT NULL,
    assigned_port INTEGER UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- ... other fields
    CONSTRAINT unique_user_mcp_instance UNIQUE (user_id, mcp_type_id, instance_number)
);
```

### Data Isolation
- Primary isolation via UUID (`id` field)
- All operations reference instances by UUID
- `instance_number` used only for display/ordering
- Complete isolation between instances in database

## API Endpoints

### Instance Management
- `POST /api/v1/mcps` - Create instance (returns UUID and instance-based URL)
- `GET /api/v1/mcps` - List instances (includes UUIDs and access URLs)
- `DELETE /api/v1/mcps/:uuid` - Delete instance by UUID

### Instance Operations
- `GET /api/v1/mcps/:uuid` - Get status by UUID
- `PUT /api/v1/mcps/:uuid/toggle` - Toggle instance by UUID
- `PUT /api/v1/mcps/:uuid/renew` - Renew instance by UUID

### Instance Access URLs
- **Main Pattern**: `localhost:3000/mcp/{instanceUUID}`
- **MCP Protocol Endpoints**:
  - `/mcp/{instanceUUID}/info` - Server information
  - `/mcp/{instanceUUID}/tools` - Available tools
  - `/mcp/{instanceUUID}/resources` - Available resources
  - `/mcp/{instanceUUID}/tools/{toolName}` - Execute tool

## Implementation

### Instance Creation
```javascript
// UUID-based instance creation
const instanceUUID = await createMCPInstance({
  userId,
  mcpTypeId,
  apiKeyId,
  customName,
  instanceNumber: await getNextInstanceNumber(userId, mcpTypeId),
  accessToken: await generateUniqueAccessToken(),
  expirationOption,
  expiresAt,
  config
});

// Handler creation with UUID isolation
const handlerInfo = await handlerManager.createHandler({
  mcpType,
  instanceId: instanceUUID.id,  // UUID used for all operations
  userId,
  credentials,
  config
});

// Handler context
const context = {
  MCP_ID: instanceUUID.id,      // Instance UUID
  USER_ID: userId,
  MCP_TYPE: mcpType,
  CREDENTIALS: credentials
};
```

### Instance Tracking
```javascript
// UUID-based in-memory tracking
const activeHandlers = new Map();
// Format: instanceUUID -> {handlerId, accessUrl, mcpType, userId, handler, startTime}
```

## Security

### UUID-Based Isolation
- **Handler-level isolation**: Each instance runs as separate Express handler
- **URL isolation**: Each instance has unique UUID-based route
- **File system isolation**: UUID-based log directories  
- **Route isolation**: Unique routes per instance
- **Database isolation**: All queries use instance UUID

### Access Control
- **Instance access**: Only users can access their own instances
- **UUID-based auth**: All operations require instance UUID verification
- **Route isolation**: `/mcp/{instanceUUID}` prevents cross-instance access
- **Authentication**: All instance operations require user authentication
- **Rate limiting**: Basic rate limiting per user and per instance

## Monitoring

### UUID-Based Health Checks
- **Handler monitoring**: UUID-based handler status tracking
- **Resource tracking**: Per-instance resource usage monitoring
- **Log monitoring**: UUID-based log file tracking and rotation
- **Route monitoring**: Dedicated route availability per instance

### Error Handling & Logging
- **Handler restart**: UUID-based handler restart on failure
- **Consistent logging**: All logs include instance UUID for traceability
- **Error isolation**: Failures in one instance don't affect others
- **Route management**: Automatic route cleanup and reassignment
- **Cleanup procedures**: UUID-based cleanup on errors

## Cleanup

### Instance Deletion
1. **Handler termination**: Stop handler using instance UUID
2. **Memory cleanup**: Remove from active instances map (by UUID)
3. **File cleanup**: Delete UUID-based log directory
4. **Database cleanup**: Remove database entry by UUID
5. **Route release**: Release assigned route
6. **Logging**: Log all cleanup operations with instance UUID

### User Deletion
1. **Instance enumeration**: Find all instances by user ID
2. **Bulk termination**: Stop all user's handlers (by UUID)
3. **Directory cleanup**: Delete user's entire log directory tree
4. **Database cleanup**: Remove all user's database entries (CASCADE)
5. **Route cleanup**: Release all assigned routes
6. **Audit logging**: Log user deletion with all affected instance UUIDs

## Summary

This UUID-based instance isolation architecture provides:
- **Complete isolation** between MCP instances
- **Unique routing** per instance (`/mcp/{instanceUUID}`)
- **Consistent identification** using UUIDs throughout the system
- **Scalable architecture** supporting multiple instances per user
- **Comprehensive logging** with instance UUID traceability
- **Secure access control** preventing cross-instance access

Every MCP instance is completely separated and identified by its UUID, ensuring robust isolation and easy tracking throughout the application lifecycle.