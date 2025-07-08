# MCP Duplication and Isolation

## Overview

Users can create multiple instances of the same MCP type (e.g., 2 Gmail MCPs) that run independently using simple process isolation.

## MCP Duplication

### Instance Management
- Users can create multiple instances of the same MCP type
- Each instance gets a simple instance number: 1, 2, 3, etc.
- Example: Gmail instance 1, Gmail instance 2

### Instance Limits
- Maximum 10 instances per user (aligned with existing database schema)
- Simple instance numbering: 1, 2, 3, etc.
- Instance cleanup on user deletion

## Process Isolation

### Simple Process Management
- Each instance runs in its own Node.js process
- Use existing `child_process.spawn()` approach
- Process naming: `mcp-{userId}-{mcpType}-{instanceNum}`
- Process monitoring with basic health checks

### Port Allocation
- Use existing simple port range: 3001-3100
- Basic port recycling for multiple instances
- Port assignment: `basePort + (userId * 10) + instanceNum`
- Example: User 1, Gmail instance 2 = port 3012

## File System Isolation

### Directory Structure
Align with existing pattern:
```
logs/
├── users/
│   ├── user_123/
│   │   ├── mcp_001_gmail_1/
│   │   │   ├── access.log
│   │   │   └── error.log
│   │   └── mcp_002_gmail_2/
│   │       ├── access.log
│   │       └── error.log
│   └── user_456/
│       └── mcp_001_gmail_1/
```

### File Isolation
- Each instance gets its own log directory
- No shared files between instances
- Simple file cleanup on instance deletion

## Database Schema

### Simple Schema Addition
Add to existing `mcp_instances` table:
```sql
-- Add instance number column
ALTER TABLE mcp_instances 
ADD COLUMN instance_number INTEGER DEFAULT 1;

-- Add unique constraint
ALTER TABLE mcp_instances 
ADD CONSTRAINT unique_user_mcp_instance 
UNIQUE (user_id, mcp_type, instance_number);
```

### Data Isolation
- Use existing foreign key relationships
- Add instance_number to queries
- No complex tenant isolation needed

## API Endpoints

### Instance Management
- `POST /api/v1/mcps` - Create instance
- `GET /api/v1/mcps` - List instances
- `DELETE /api/v1/mcps/:id` - Delete instance

### Instance Operations
- `GET /api/v1/mcps/:id` - Get status
- `POST /api/v1/mcps/:id/toggle` - Toggle instance
- `POST /api/v1/mcps/:id/toggle` - Toggle instance

## Implementation

### Instance Creation
```javascript
// Simple instance creation
const instanceNum = getNextInstanceNumber(userId, mcpType);
const instanceNum = getNextInstanceNumber(userId, mcpType);
const port = 3001 + (userId * 10) + instanceNum;
const logDir = `logs/users/user_${userId}/mcp_${mcpType}_${instanceNum}`;

// Spawn process with existing approach
const process = spawn('node', [mcpScript], {
  env: { ...process.env, PORT: port, LOG_DIR: logDir }
});
```

### Instance Tracking
```javascript
// Simple in-memory tracking
const activeInstances = new Map();
// Format: instanceId -> {process, port, logDir, createdAt}
```

## Security

### Basic Isolation
- Process-level isolation (no shared memory)
- File system isolation (separate directories)
- Port isolation (unique ports per instance)
- Database isolation (instance_number in queries)

### Access Control
- Users can only access their own instances
- Instance operations require user authentication
- Basic rate limiting per user

## Monitoring

### Simple Health Checks
- Process status monitoring
- Basic resource usage tracking
- Log file size monitoring
- Port availability checking

### Error Handling
- Process restart on failure
- Log rotation for large files
- Port conflict resolution
- Instance cleanup on errors

## Cleanup

### Instance Deletion
1. Stop the process
2. Remove from active instances map
3. Delete log directory
4. Remove database entry
5. Release port

### User Deletion
1. Stop all user's instances
2. Delete user's log directory
3. Remove all database entries
4. Release all ports

This approach maintains simplicity while providing the isolation needed for multiple MCP instances per user.