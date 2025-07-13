# Database Schema Changes

## Overview
This document outlines the database schema changes required for the shared instances architecture migration.

## Current Schema Analysis

### Existing Tables (Pre-Migration)
```sql
-- Current mcp_instances table
CREATE TABLE mcp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id),
    name VARCHAR(255) NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'inactive',
    process_id INTEGER,
    access_token VARCHAR(255) UNIQUE,
    encrypted_credentials TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MCP types reference table
CREATE TABLE mcp_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (unchanged)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## New Schema Design

### 1. User Service Instances Table
```sql
-- New table for shared instance model
CREATE TABLE user_service_instances (
    instance_id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    encrypted_api_key TEXT NOT NULL,
    encrypted_additional_credentials JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    
    -- Ensure one instance per user per service
    UNIQUE(user_id, service_type)
);

-- Indexes for performance
CREATE INDEX idx_user_service_instances_user_id ON user_service_instances(user_id);
CREATE INDEX idx_user_service_instances_service_type ON user_service_instances(service_type);
CREATE INDEX idx_user_service_instances_active ON user_service_instances(is_active);
CREATE INDEX idx_user_service_instances_last_used ON user_service_instances(last_used_at);
```

### 2. Service Registry Table
```sql
-- Static service registry (replaces dynamic mcp_types)
CREATE TABLE service_registry (
    service_type VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    category VARCHAR(100),
    port INTEGER UNIQUE NOT NULL,
    base_url VARCHAR(255),
    health_check_endpoint VARCHAR(255) DEFAULT '/health',
    auth_type VARCHAR(50) DEFAULT 'api_key', -- api_key, oauth2, basic_auth
    auth_config JSONB DEFAULT '{}',
    service_config JSONB DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for service lookups
CREATE INDEX idx_service_registry_category ON service_registry(category);
CREATE INDEX idx_service_registry_available ON service_registry(is_available);
```

### 3. Service Health Monitoring Table
```sql
-- Track service health and status
CREATE TABLE service_health_status (
    service_type VARCHAR(50) REFERENCES service_registry(service_type),
    is_healthy BOOLEAN DEFAULT true,
    last_health_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,
    error_message TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (service_type)
);

-- Index for health monitoring
CREATE INDEX idx_service_health_status_healthy ON service_health_status(is_healthy);
CREATE INDEX idx_service_health_status_last_check ON service_health_status(last_health_check);
```

### 4. Service Usage Analytics Table
```sql
-- Track service usage patterns
CREATE TABLE service_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL REFERENCES service_registry(service_type),
    instance_id VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Partition by date for performance
    created_date DATE GENERATED ALWAYS AS (timestamp::date) STORED
);

-- Indexes for analytics queries
CREATE INDEX idx_service_usage_analytics_user_service ON service_usage_analytics(user_id, service_type);
CREATE INDEX idx_service_usage_analytics_timestamp ON service_usage_analytics(timestamp);
CREATE INDEX idx_service_usage_analytics_service_type ON service_usage_analytics(service_type);

-- Partition table by month for large datasets
CREATE TABLE service_usage_analytics_y2024m01 PARTITION OF service_usage_analytics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- Additional partitions as needed
```

### 5. API Key Validation Cache Table
```sql
-- Cache API key validation results to reduce external API calls
CREATE TABLE api_key_validation_cache (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL REFERENCES service_registry(service_type),
    key_hash VARCHAR(255) NOT NULL, -- Hash of the API key for security
    is_valid BOOLEAN NOT NULL,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    validation_response JSONB DEFAULT '{}',
    
    PRIMARY KEY (user_id, service_type, key_hash)
);

-- TTL index for automatic cleanup
CREATE INDEX idx_api_key_validation_cache_expires ON api_key_validation_cache(expires_at);
```

## Migration Scripts

### Migration 008: Create Shared Instances Schema
```sql
-- File: backend/src/db/migrations/008_create_shared_instances.sql

BEGIN;

-- 1. Create service registry table
CREATE TABLE service_registry (
    service_type VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    category VARCHAR(100),
    port INTEGER UNIQUE NOT NULL,
    base_url VARCHAR(255),
    health_check_endpoint VARCHAR(255) DEFAULT '/health',
    auth_type VARCHAR(50) DEFAULT 'api_key',
    auth_config JSONB DEFAULT '{}',
    service_config JSONB DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create user service instances table
CREATE TABLE user_service_instances (
    instance_id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL REFERENCES service_registry(service_type),
    encrypted_api_key TEXT NOT NULL,
    encrypted_additional_credentials JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    UNIQUE(user_id, service_type)
);

-- 3. Create service health status table
CREATE TABLE service_health_status (
    service_type VARCHAR(50) REFERENCES service_registry(service_type),
    is_healthy BOOLEAN DEFAULT true,
    last_health_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER,
    error_message TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (service_type)
);

-- 4. Create service usage analytics table
CREATE TABLE service_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL REFERENCES service_registry(service_type),
    instance_id VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_date DATE GENERATED ALWAYS AS (timestamp::date) STORED
);

-- 5. Create API key validation cache table
CREATE TABLE api_key_validation_cache (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL REFERENCES service_registry(service_type),
    key_hash VARCHAR(255) NOT NULL,
    is_valid BOOLEAN NOT NULL,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    validation_response JSONB DEFAULT '{}',
    PRIMARY KEY (user_id, service_type, key_hash)
);

-- Create all indexes
CREATE INDEX idx_user_service_instances_user_id ON user_service_instances(user_id);
CREATE INDEX idx_user_service_instances_service_type ON user_service_instances(service_type);
CREATE INDEX idx_user_service_instances_active ON user_service_instances(is_active);
CREATE INDEX idx_user_service_instances_last_used ON user_service_instances(last_used_at);

CREATE INDEX idx_service_registry_category ON service_registry(category);
CREATE INDEX idx_service_registry_available ON service_registry(is_available);

CREATE INDEX idx_service_health_status_healthy ON service_health_status(is_healthy);
CREATE INDEX idx_service_health_status_last_check ON service_health_status(last_health_check);

CREATE INDEX idx_service_usage_analytics_user_service ON service_usage_analytics(user_id, service_type);
CREATE INDEX idx_service_usage_analytics_timestamp ON service_usage_analytics(timestamp);
CREATE INDEX idx_service_usage_analytics_service_type ON service_usage_analytics(service_type);

CREATE INDEX idx_api_key_validation_cache_expires ON api_key_validation_cache(expires_at);

COMMIT;
```

### Migration 009: Populate Service Registry
```sql
-- File: backend/src/db/migrations/009_populate_service_registry.sql

BEGIN;

-- Populate service registry from existing mcp_types and mcp-ports configs
-- This would be generated by a script that reads all mcp-ports/*/config.json files

INSERT INTO service_registry (service_type, name, display_name, port, category, auth_type) VALUES
('figma', 'figma', 'Figma', 49160, 'design', 'api_key'),
('github', 'github', 'GitHub', 49294, 'development', 'oauth2'),
('slack', 'slack', 'Slack', 49320, 'communication', 'oauth2'),
('gmail', 'gmail', 'Gmail', 49250, 'communication', 'oauth2'),
('trello', 'trello', 'Trello', 49330, 'productivity', 'api_key'),
-- ... all 373+ services
;

-- Populate initial health status for all services
INSERT INTO service_health_status (service_type)
SELECT service_type FROM service_registry;

COMMIT;
```

### Migration 010: Data Migration from Old Schema
```sql
-- File: backend/src/db/migrations/010_migrate_existing_data.sql

BEGIN;

-- Migrate active mcp_instances to user_service_instances
INSERT INTO user_service_instances (
    instance_id,
    user_id,
    service_type,
    encrypted_api_key,
    is_active,
    config,
    created_at,
    updated_at,
    last_used_at
)
SELECT 
    -- Generate instance ID from existing data
    CONCAT(
        SUBSTRING(mt.name, 1, 3), '_user_', 
        SUBSTRING(REPLACE(mi.user_id::text, '-', ''), 1, 8), '_',
        SUBSTRING(md5(mi.id::text), 1, 6)
    ) as instance_id,
    mi.user_id,
    mt.name as service_type,
    COALESCE(mi.encrypted_credentials, '') as encrypted_api_key,
    mi.is_active,
    mi.config,
    mi.created_at,
    mi.updated_at,
    mi.updated_at as last_used_at
FROM mcp_instances mi
JOIN mcp_types mt ON mi.mcp_type_id = mt.id
WHERE mi.is_active = true
ON CONFLICT (user_id, service_type) DO NOTHING;

COMMIT;
```

### Migration 011: Cleanup Old Tables
```sql
-- File: backend/src/db/migrations/011_cleanup_old_schema.sql

BEGIN;

-- Archive old data (optional)
CREATE TABLE mcp_instances_archive AS SELECT * FROM mcp_instances;
CREATE TABLE mcp_types_archive AS SELECT * FROM mcp_types;

-- Drop old tables after confirming migration success
DROP TABLE IF EXISTS mcp_instances CASCADE;
DROP TABLE IF EXISTS mcp_types CASCADE;

COMMIT;
```

## Database Views

### User Service Summary View
```sql
-- View for easy access to user service information
CREATE VIEW user_services_summary AS
SELECT 
    usi.user_id,
    usi.service_type,
    sr.display_name,
    sr.category,
    usi.instance_id,
    usi.is_active,
    usi.created_at,
    usi.last_used_at,
    usi.usage_count,
    shs.is_healthy as service_healthy,
    CONCAT('https://yourdomain.com/', usi.instance_id, '/', usi.service_type, '/') as instance_url
FROM user_service_instances usi
JOIN service_registry sr ON usi.service_type = sr.service_type
LEFT JOIN service_health_status shs ON sr.service_type = shs.service_type;
```

### Service Health Dashboard View
```sql
-- View for service health monitoring dashboard
CREATE VIEW service_health_dashboard AS
SELECT 
    sr.service_type,
    sr.display_name,
    sr.category,
    sr.port,
    shs.is_healthy,
    shs.last_health_check,
    shs.response_time_ms,
    shs.consecutive_failures,
    shs.uptime_percentage,
    COUNT(usi.instance_id) as active_users
FROM service_registry sr
LEFT JOIN service_health_status shs ON sr.service_type = shs.service_type
LEFT JOIN user_service_instances usi ON sr.service_type = usi.service_type AND usi.is_active = true
GROUP BY sr.service_type, sr.display_name, sr.category, sr.port, 
         shs.is_healthy, shs.last_health_check, shs.response_time_ms, 
         shs.consecutive_failures, shs.uptime_percentage
ORDER BY sr.category, sr.display_name;
```

## Data Retention Policies

### Usage Analytics Cleanup
```sql
-- Function to clean up old usage analytics data
CREATE OR REPLACE FUNCTION cleanup_old_usage_analytics()
RETURNS void AS $$
BEGIN
    -- Delete analytics data older than 6 months
    DELETE FROM service_usage_analytics 
    WHERE timestamp < NOW() - INTERVAL '6 months';
    
    -- Log cleanup action
    INSERT INTO service_usage_analytics (
        user_id, service_type, instance_id, endpoint, method, status_code
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', 
        'system', 
        'cleanup', 
        '/admin/cleanup', 
        'DELETE', 
        200
    );
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run monthly
SELECT cron.schedule('cleanup-analytics', '0 0 1 * *', 'SELECT cleanup_old_usage_analytics();');
```

### API Key Validation Cache Cleanup
```sql
-- Function to clean up expired validation cache entries
CREATE OR REPLACE FUNCTION cleanup_validation_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM api_key_validation_cache 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup to run daily
SELECT cron.schedule('cleanup-validation-cache', '0 2 * * *', 'SELECT cleanup_validation_cache();');
```

## Performance Considerations

### Database Optimization
1. **Partitioning**: Service usage analytics partitioned by month
2. **Indexing**: Optimized indexes for common query patterns
3. **Connection Pooling**: Shared database connections across services
4. **Caching**: API key validation caching to reduce external calls

### Query Optimization Examples
```sql
-- Efficient user instance lookup
EXPLAIN ANALYZE
SELECT instance_id, service_type 
FROM user_service_instances 
WHERE user_id = $1 AND is_active = true;

-- Service health monitoring query
EXPLAIN ANALYZE
SELECT service_type, is_healthy, response_time_ms
FROM service_health_status 
WHERE last_health_check > NOW() - INTERVAL '5 minutes';

-- Usage analytics aggregation
EXPLAIN ANALYZE
SELECT service_type, COUNT(*), AVG(response_time_ms)
FROM service_usage_analytics 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY service_type;
```

## Security Considerations

### Encryption Requirements
- API keys encrypted at rest using AES-256
- Additional credentials stored as encrypted JSONB
- Database connection encryption (SSL/TLS)
- Regular key rotation procedures

### Access Control
- Row-level security for user data isolation
- Service account permissions minimization
- Audit logging for sensitive operations
- Regular security assessments