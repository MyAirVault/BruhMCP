# Database Schema Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Design Principles](#database-design-principles)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Table Schemas](#table-schemas)
5. [Indexes and Performance](#indexes-and-performance)
6. [Migration Strategy](#migration-strategy)
7. [Sample Queries](#sample-queries)

## Overview

The MiniMCP database uses PostgreSQL with a **simplified schema** to store only essential data for the MCP management system. The schema focuses on:
- Core MCP types and instances
- Secure API key storage
- Basic user management (future implementation)
- **File-based logging** (not database logging)
- Minimal essential tables only

## Simplified Database Design Principles

1. **Essential Tables Only**: Only core tables needed for operation
2. **Basic Audit Fields**: created_at and updated_at where necessary
3. **Hard Deletes**: Simple deletion, use file logs for audit trails
4. **UUID Primary Keys**: For better distributed system compatibility
5. **Encrypted API Keys**: Only API keys are encrypted at rest
6. **File-Based Logging**: All logs and metrics stored as files, not in database

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │   mcp_types     │     │   api_keys      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID) PK    │     │ id (UUID) PK    │     │ id (UUID) PK    │
│ email           │     │ name            │     │ user_id FK      │
│ (no password)   │     │ display_name    │     │ mcp_type_id FK  │
│ name            │     │ server_script   │     │ credentials     │
│ created_at      │     │ config_template │     │ is_active       │
│ updated_at      │     │ created_at      │     │ created_at      │
└─────────────────┘     │ updated_at      │     │ updated_at      │
         │              └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └─────────────▶│ mcp_instances   │◀─────────────┘
                        ├─────────────────┤
                        │ id (UUID) PK    │
                        │ user_id FK      │
                        │ mcp_type_id FK  │
                        │ api_key_id FK   │
                        │ process_id      │
                        │ access_token    │
                        │ status          │
                        │ expires_at      │
                        │ assigned_port   │
                        │ created_at      │
                        │ updated_at      │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   File System   │
                        ├─────────────────┤
                        │ ./logs/users/ │
                        │ ├─user_123/     │
                        │ │ ├─mcp_456/    │
                        │ │ │ ├─app.log   │
                        │ │ │ └─metrics   │
                        │ │ └─activity    │
                        │ └─user_456/     │
                        └─────────────────┘
```

## Table Schemas

### 1. users (Current Schema)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Note**: This schema is aligned with the token-based authentication approach. No password storage is required.

### 2. mcp_types
```sql
CREATE TABLE mcp_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'gmail', 'figma', 'github'
    display_name VARCHAR(100) NOT NULL, -- e.g., 'Gmail MCP', 'Figma MCP'
    description TEXT,
    icon_url VARCHAR(500),
    server_script VARCHAR(255) NOT NULL, -- e.g., './mcp-servers/gmail-mcp-server.js'
    config_template JSONB NOT NULL DEFAULT '{}', -- Default configuration
    required_credentials JSONB DEFAULT '[]', -- Required credential fields (api_key, client_secret, etc.)
    resource_limits JSONB DEFAULT '{"max_memory_mb": 512, "max_cpu_percent": 50}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial MCP types
INSERT INTO mcp_types (name, display_name, server_script, config_template, required_credentials) VALUES
('gmail', 'Gmail MCP', './mcp-servers/gmail-mcp-server.js', 
 '{"api_version": "v1"}', 
 '["api_key", "client_secret", "client_id"]'),
('figma', 'Figma MCP', './mcp-servers/figma-mcp-server.js', 
 '{"api_version": "v2"}', 
 '["api_key"]'),
('github', 'GitHub MCP', './mcp-servers/github-mcp-server.js', 
 '{"api_version": "v3"}', 
 '["personal_access_token"]');
```

### 3. api_keys
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id) ON DELETE CASCADE,
    credentials JSONB NOT NULL, -- Plain credentials object (api_key, client_secret, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
    -- Removed unique constraint to allow multiple credentials per user/type
    -- Note: Credentials stored as plain JSON for development - encryption to be added later
);
```

**API Response Mapping:**
- Database `mcp_type_id` → API response includes both `mcp_type_id` and nested `mcp_type` object
- Database `credentials` → API **NEVER** returns any credential information to users
- Database timestamps → API response includes `created_at`, `updated_at`, `expires_at`
- **Security Policy**: Once credentials are validated and stored, they are never displayed to users again

### 4. mcp_instances (Enhanced)
```sql
CREATE TABLE mcp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    custom_name VARCHAR(255), -- User-defined name for the MCP instance
    instance_number INTEGER NOT NULL DEFAULT 1, -- Instance number for this user/type combination
    process_id INTEGER, -- Node.js process ID
    access_token VARCHAR(255) UNIQUE NOT NULL, -- Unique token for accessing this MCP
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, expired
    is_active BOOLEAN DEFAULT true, -- User can toggle active/inactive
    expiration_option VARCHAR(10) NOT NULL DEFAULT '1day', -- never, 1h, 6h, 1day, 30days
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL if expiration_option is 'never'
    last_renewed_at TIMESTAMP WITH TIME ZONE,
    config JSONB DEFAULT '{}', -- Instance-specific configuration (stored in database)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('active', 'inactive', 'expired')),
    CONSTRAINT check_expiration_option CHECK (expiration_option IN ('never', '1h', '6h', '1day', '30days')),
    CONSTRAINT unique_user_mcp_instance UNIQUE (user_id, mcp_type_id, instance_number),
    CONSTRAINT check_max_instances_per_user CHECK (instance_number <= 10)
);

-- Essential indexes only
CREATE INDEX idx_mcp_instances_user_active ON mcp_instances(user_id, is_active);
CREATE INDEX idx_mcp_instances_status ON mcp_instances(status) WHERE is_active = true;
CREATE INDEX idx_mcp_instances_expires_at ON mcp_instances(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_mcp_instances_expiration_option ON mcp_instances(expiration_option);
```

### 5. File-Based Logging (No Database Table)
```bash
# Logs are stored in file system, not database
# Structure: ./logs/users/user_{id}/mcp_{id}_{type}_{instanceNum}/
# Files: app.log, access.log, error.log, metrics.json

# No mcp_logs table needed - use file system instead
# Benefits:
# - Complete user isolation
# - Better performance
# - Easier debugging
# - No database overhead
```

### 6. File-Based Audit Trail (No Database Table)
```bash
# Audit events stored in file system
# Structure: ./logs/users/user_{id}/activity.log
# System events: ./logs/system/audit.log

# No mcp_events table needed - use file-based logging
# Benefits:
# - Simpler architecture
# - User-specific audit files
# - No complex database queries
# - Direct file access for debugging
```

### 7. Simple Route Management (In-Memory)
```javascript
// Route management in application memory - no database table needed
class SimpleRouteManager {
  constructor() {
    this.registeredRoutes = new Map();
  }
  
  registerRoute(instanceId, handler) {
    const route = `/mcp/${instanceId}`;
    this.registeredRoutes.set(instanceId, { route, handler });
    return route;
  }
  
  unregisterRoute(instanceId) {
    this.registeredRoutes.delete(instanceId);
  }
}

// No route_allocations table needed - simpler in-memory management
```

### 8. Environment-Based Configuration (No Database Table)
```javascript
// Configuration via environment variables - no database table needed
const config = {
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    masterKey: process.env.MASTER_KEY
  },
  mcp: {
    defaultDurationMinutes: parseInt(process.env.MCP_DEFAULT_DURATION) || 60,
    maxInstancesPerUser: parseInt(process.env.MCP_MAX_INSTANCES) || 10
  },
  cleanup: {
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 30
  },
  routes: {
    basePath: process.env.MCP_BASE_PATH || '/mcp'
  },
  process: {
    maxMemoryMB: parseInt(process.env.PROCESS_MAX_MEMORY) || 512,
    maxCPUPercent: parseInt(process.env.PROCESS_MAX_CPU) || 50
  }
};

// No system_settings table needed - use environment variables
```

## Indexes and Performance

### Primary Indexes
- All primary keys are automatically indexed
- Foreign keys have indexes for join performance

### Essential Indexes Only
```sql
-- User queries (future authentication)
CREATE INDEX idx_users_email ON users(email);

-- MCP instance queries
CREATE INDEX idx_mcp_instances_user_status ON mcp_instances(user_id, status);
CREATE INDEX idx_mcp_instances_expires_at ON mcp_instances(expires_at);

-- Credentials lookups
CREATE INDEX idx_api_keys_user_type ON api_keys(user_id, mcp_type_id, is_active);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- No log indexes needed - using file system for logs
```

### No Partitioning Needed
With file-based logging:
- **No mcp_logs table**: All logs in file system
- **No mcp_events table**: Audit trails in files
- **Simpler maintenance**: Basic file rotation and cleanup
- **Better performance**: No database overhead for logs

## Migration Strategy

### Migration Files Structure
```
/backend/src/db/migrations/
├── 001_initial_schema.sql
├── 002_add_mcp_types.sql
├── 003_add_indexes.sql
├── 004_add_partitioning.sql
└── 005_seed_data.sql
```

### Migration Tool
Use node-pg-migrate for version control:
```javascript
// Migration configuration
module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  dir: 'src/db/migrations',
  direction: 'up',
  count: 'all',
  schema: 'public',
  createSchema: false,
  migrationsTable: 'pgmigrations'
};
```

### Rollback Strategy
Each migration should include:
- UP migration (forward)
- DOWN migration (rollback)
- Transaction wrapping for atomicity

## Sample Queries

### Get Active MCP Instances for User
```sql
SELECT 
    mi.id,
    mi.access_token,
    CONCAT('http://localhost:3000/mcp/', mi.id) as access_url,
    mi.process_id,
    mi.status,
    mi.expires_at,
    mi.last_accessed,
    mt.name as mcp_type,
    mt.display_name,
    mt.icon_url
FROM mcp_instances mi
JOIN mcp_types mt ON mi.mcp_type_id = mt.id
WHERE mi.user_id = $1
    AND mi.deleted_at IS NULL
    AND mi.status IN ('running', 'pending')
ORDER BY mi.created_at DESC;
```

### Get MCP Instance (File-based logs)
```sql
SELECT mi.*
FROM mcp_instances mi
WHERE mi.access_token = $1;
-- Note: Logs are read from file system at ./logs/users/user_{userId}/mcp_{mcpId}/
```

### Expired MCP Cleanup
```sql
UPDATE mcp_instances
SET status = 'expired',
    updated_at = CURRENT_TIMESTAMP
WHERE expires_at < CURRENT_TIMESTAMP
    AND status = 'running'
    AND deleted_at IS NULL
RETURNING id, process_id, assigned_port;
```

### Route Management Queries
```sql
-- Get MCP instance route information
SELECT 
    mi.id,
    CONCAT('http://localhost:3000/mcp/', mi.id) as access_url,
    mi.status
FROM mcp_instances mi
WHERE mi.user_id = $1
    AND mi.status = 'active';

-- No route allocation tables needed - routes are based on instance IDs
```

### Process Health Check
```sql
-- Get all running processes for health check
SELECT 
    mi.id,
    mi.process_id,
    mi.status,
    mi.created_at
FROM mcp_instances mi
WHERE mi.status = 'running'
    AND mi.deleted_at IS NULL
    AND mi.process_id IS NOT NULL;
```

### API Key Usage Check
```sql
SELECT 
    ak.id,
    mt.display_name as mcp_type,
    COUNT(mi.id) as active_instances,
    MAX(mi.created_at) as last_used
FROM api_keys ak
JOIN mcp_types mt ON ak.mcp_type_id = mt.id
LEFT JOIN mcp_instances mi ON ak.id = mi.api_key_id 
    AND mi.status = 'running'
WHERE ak.user_id = $1
    AND ak.is_active = true
GROUP BY ak.id, mt.display_name;
```

## Security Considerations

### Encryption
- API keys stored as plain text for development (encryption to be added later)
- Unique IV per key stored separately
- Master key stored in environment variable

### Access Control
- Row-level security for multi-tenancy
- User can only access their own resources
- Prepared statements to prevent SQL injection

### Data Retention
- Automatic cleanup of old logs
- Soft deletes for audit trail
- GDPR compliance considerations

## Next Steps

1. Review [API Documentation](./api-documentation.md) for endpoint implementations
2. Check [Security Architecture](./security-architecture.md) for encryption details
3. See [Backend Architecture](./backend-architecture.md) for implementation details