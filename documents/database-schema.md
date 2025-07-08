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

The MiniMCP database uses PostgreSQL to store all persistent data for the MCP management system. The schema is designed to support:
- Multiple MCP types and instances
- Secure API key storage
- Comprehensive logging
- User management (future implementation)
- Audit trails and history

## Database Design Principles

1. **Normalization**: 3NF normalization to reduce redundancy
2. **Audit Fields**: All tables include created_at and updated_at
3. **Soft Deletes**: Use deleted_at for recoverable deletions
4. **UUID Primary Keys**: For better distributed system compatibility
5. **Encrypted Sensitive Data**: API keys are encrypted at rest
6. **Referential Integrity**: Foreign key constraints enforced

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │   mcp_types     │     │   api_keys      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID) PK    │     │ id (UUID) PK    │     │ id (UUID) PK    │
│ email           │     │ name            │     │ user_id FK      │
│ password_hash   │     │ display_name    │     │ mcp_type_id FK  │
│ name            │     │ icon_url        │     │ encrypted_key   │
│ created_at      │     │ config_template │     │ key_hint        │
│ updated_at      │     │ server_script   │     │ created_at      │
│ deleted_at      │     │ required_scopes │     │ updated_at      │
└─────────────────┘     │ created_at      │     │ expires_at      │
         │              │ updated_at      │     └─────────────────┘
         │              └─────────────────┘              │
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
                        │ config          │
                        │ assigned_port   │
                        │ last_accessed   │
                        │ created_at      │
                        │ updated_at      │
                        │ deleted_at      │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   mcp_logs      │
                        ├─────────────────┤
                        │ id (UUID) PK    │
                        │ mcp_instance_id │
                        │ timestamp       │
                        │ level           │
                        │ message         │
                        │ metadata        │
                        │ source          │
                        │ created_at      │
                        └─────────────────┘
```

## Table Schemas

### 1. users (Future Implementation)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

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
    required_scopes JSONB DEFAULT '[]', -- Required OAuth scopes
    resource_limits JSONB DEFAULT '{"cpu": "0.5", "memory": "512m"}',
    max_duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial MCP types
INSERT INTO mcp_types (name, display_name, server_script, config_template) VALUES
('gmail', 'Gmail MCP', './mcp-servers/gmail-mcp-server.js', '{"api_version": "v1"}'),
('figma', 'Figma MCP', './mcp-servers/figma-mcp-server.js', '{"api_version": "v2"}'),
('github', 'GitHub MCP', './mcp-servers/github-mcp-server.js', '{"api_version": "v3"}');
```

### 3. api_keys
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id) ON DELETE CASCADE,
    encrypted_key TEXT NOT NULL, -- Encrypted using AES-256
    key_hint VARCHAR(20), -- Last 4 characters for identification
    encryption_iv VARCHAR(32) NOT NULL, -- Initialization vector for decryption
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, mcp_type_id) -- One key per user per MCP type
);
```

### 4. mcp_instances
```sql
CREATE TABLE mcp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id),
    api_key_id UUID REFERENCES api_keys(id),
    process_id INTEGER, -- Node.js process ID
    access_token VARCHAR(255) UNIQUE NOT NULL, -- Unique token for accessing this MCP
    access_url VARCHAR(500) NOT NULL, -- Direct URL to access the MCP (http://localhost:PORT)
    assigned_port INTEGER UNIQUE, -- Port assigned to this MCP process
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, running, expired, disconnected, error
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    config JSONB DEFAULT '{}', -- Instance-specific configuration
    error_message TEXT,
    last_accessed TIMESTAMP WITH TIME ZONE,
    stats JSONB DEFAULT '{}', -- CPU, memory usage stats
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_status CHECK (status IN ('pending', 'running', 'expired', 'disconnected', 'error')),
    CONSTRAINT check_port_range CHECK (assigned_port BETWEEN 3001 AND 65535)
);

-- Index for quick status queries
CREATE INDEX idx_mcp_instances_status ON mcp_instances(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_mcp_instances_expires_at ON mcp_instances(expires_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_mcp_instances_access_token ON mcp_instances(access_token) WHERE deleted_at IS NULL;
CREATE INDEX idx_mcp_instances_port ON mcp_instances(assigned_port) WHERE deleted_at IS NULL;
CREATE INDEX idx_mcp_instances_process_id ON mcp_instances(process_id) WHERE deleted_at IS NULL;
```

### 5. mcp_logs
```sql
CREATE TABLE mcp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mcp_instance_id UUID NOT NULL REFERENCES mcp_instances(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(10) NOT NULL DEFAULT 'info', -- debug, info, warn, error
    source VARCHAR(50) DEFAULT 'process', -- process, system, api
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- Additional structured data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_level CHECK (level IN ('debug', 'info', 'warn', 'error'))
);

-- Partitioning for better performance (by month)
CREATE INDEX idx_mcp_logs_instance_timestamp ON mcp_logs(mcp_instance_id, timestamp DESC);
CREATE INDEX idx_mcp_logs_timestamp ON mcp_logs(timestamp DESC);
```

### 6. mcp_events (Audit Trail)
```sql
CREATE TABLE mcp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mcp_instance_id UUID NOT NULL REFERENCES mcp_instances(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- created, started, restored, expired, deleted, error
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mcp_events_instance ON mcp_events(mcp_instance_id, created_at DESC);
```

### 7. port_allocations (Port Management)
```sql
CREATE TABLE port_allocations (
    port INTEGER PRIMARY KEY CHECK (port BETWEEN 3001 AND 65535),
    mcp_instance_id UUID REFERENCES mcp_instances(id) ON DELETE SET NULL,
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP WITH TIME ZONE,
    is_available BOOLEAN DEFAULT false,
    last_health_check TIMESTAMP WITH TIME ZONE
);

-- Initialize port pool (3001-3100 for example)
INSERT INTO port_allocations (port, is_available) 
SELECT port_num, true 
FROM generate_series(3001, 3100) AS port_num;

CREATE INDEX idx_port_allocations_available ON port_allocations(is_available, port);
CREATE INDEX idx_port_allocations_mcp ON port_allocations(mcp_instance_id);
```

### 8. system_settings (Configuration)
```sql
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO system_settings (key, value, description) VALUES
('encryption.algorithm', '"aes-256-gcm"', 'Encryption algorithm for API keys'),
('mcp.default_duration_minutes', '60', 'Default MCP instance duration'),
('mcp.max_instances_per_user', '10', 'Maximum concurrent MCP instances per user'),
('cleanup.retention_days', '30', 'Days to retain logs and expired instances'),
('port.range_start', '3001', 'Starting port for MCP instances'),
('port.range_end', '3100', 'Ending port for MCP instances'),
('process.max_memory_mb', '512', 'Maximum memory per MCP process in MB'),
('process.max_cpu_percent', '50', 'Maximum CPU usage per MCP process');
```

## Indexes and Performance

### Primary Indexes
- All primary keys are automatically indexed
- Foreign keys have indexes for join performance

### Additional Indexes
```sql
-- User queries
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- MCP instance queries
CREATE INDEX idx_mcp_instances_user_status ON mcp_instances(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_mcp_instances_type ON mcp_instances(mcp_type_id) WHERE deleted_at IS NULL;

-- Log queries
CREATE INDEX idx_mcp_logs_level ON mcp_logs(level) WHERE level IN ('warn', 'error');

-- API key lookups
CREATE INDEX idx_api_keys_user_type ON api_keys(user_id, mcp_type_id) WHERE is_active = true;
```

### Partitioning Strategy
For high-volume tables:
- **mcp_logs**: Partition by month
- **mcp_events**: Partition by month
- Automatic partition creation via pg_partman extension

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
    mi.access_url,
    mi.assigned_port,
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

### Get MCP Instance with Logs
```sql
SELECT 
    mi.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', ml.id,
                'timestamp', ml.timestamp,
                'level', ml.level,
                'message', ml.message
            ) ORDER BY ml.timestamp DESC
        ) FILTER (WHERE ml.id IS NOT NULL),
        '[]'
    ) as logs
FROM mcp_instances mi
LEFT JOIN mcp_logs ml ON mi.id = ml.mcp_instance_id
WHERE mi.access_token = $1
GROUP BY mi.id;
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

### Port Allocation Queries
```sql
-- Get next available port
SELECT port 
FROM port_allocations 
WHERE is_available = true 
ORDER BY port 
LIMIT 1;

-- Allocate port to MCP instance
UPDATE port_allocations 
SET is_available = false, 
    mcp_instance_id = $1, 
    allocated_at = CURRENT_TIMESTAMP
WHERE port = $2;

-- Release port when MCP terminates
UPDATE port_allocations 
SET is_available = true, 
    mcp_instance_id = NULL, 
    released_at = CURRENT_TIMESTAMP
WHERE port = $1;
```

### Process Health Check
```sql
-- Get all running processes for health check
SELECT 
    mi.id,
    mi.process_id,
    mi.assigned_port,
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
    ak.key_hint,
    mt.display_name as mcp_type,
    COUNT(mi.id) as active_instances,
    MAX(mi.created_at) as last_used
FROM api_keys ak
JOIN mcp_types mt ON ak.mcp_type_id = mt.id
LEFT JOIN mcp_instances mi ON ak.id = mi.api_key_id 
    AND mi.status = 'running'
WHERE ak.user_id = $1
    AND ak.is_active = true
GROUP BY ak.id, ak.key_hint, mt.display_name;
```

## Security Considerations

### Encryption
- API keys encrypted using AES-256-GCM
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
3. See [Implementation Roadmap](./backend-implementation-roadmap.md) for migration timeline