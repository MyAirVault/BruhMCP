-- Complete Database Setup Migration
-- Creates all tables, triggers, constraints, and initial data for the static service architecture

BEGIN;

-- Drop all existing tables (order matters due to foreign keys)
DROP TABLE IF EXISTS mcp_service_table CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS mcp_table CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create or replace the timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Users table (magic link authentication, no password)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp for users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create MCP Table (Service Registry)
CREATE TABLE mcp_table (
    mcp_service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mcp_service_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url_path VARCHAR(500),
    port INTEGER UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('api_key', 'oauth')),
    is_active BOOLEAN DEFAULT true,
    total_instances_created INTEGER DEFAULT 0,
    active_instances_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp for mcp_table
CREATE TRIGGER update_mcp_table_updated_at BEFORE UPDATE ON mcp_table
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create MCP Service Table (User Instances)
CREATE TABLE mcp_service_table (
    instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mcp_service_id UUID NOT NULL REFERENCES mcp_table(mcp_service_id) ON DELETE CASCADE,
    api_key VARCHAR(500),
    client_id VARCHAR(500),
    client_secret VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    custom_name VARCHAR(255),
    renewed_count INTEGER DEFAULT 0,
    last_renewed_at TIMESTAMP,
    credentials_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Basic authentication field constraints (service type validation done at application level)
    CONSTRAINT check_credentials_not_all_null CHECK (
        api_key IS NOT NULL OR (client_id IS NOT NULL AND client_secret IS NOT NULL)
    )
);

-- Create trigger to update updated_at timestamp for mcp_service_table
CREATE TRIGGER update_mcp_service_table_updated_at BEFORE UPDATE ON mcp_service_table
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_mcp_table_service_name ON mcp_table(mcp_service_name);
CREATE INDEX idx_mcp_table_port ON mcp_table(port);
CREATE INDEX idx_mcp_table_is_active ON mcp_table(is_active);
CREATE INDEX idx_mcp_service_table_user_id ON mcp_service_table(user_id);
CREATE INDEX idx_mcp_service_table_instance_id ON mcp_service_table(instance_id);
CREATE INDEX idx_mcp_service_table_mcp_service_id ON mcp_service_table(mcp_service_id);
CREATE INDEX idx_mcp_service_table_status ON mcp_service_table(status);
CREATE INDEX idx_mcp_service_table_expires_at ON mcp_service_table(expires_at);
CREATE INDEX idx_mcp_service_table_last_used_at ON mcp_service_table(last_used_at);
CREATE INDEX idx_mcp_service_table_custom_name ON mcp_service_table(custom_name);
CREATE INDEX idx_mcp_service_table_last_renewed_at ON mcp_service_table(last_renewed_at);

-- Add column comments for documentation
COMMENT ON COLUMN mcp_table.is_active IS 'Global service enable/disable control - when false, no new instances can be created';
COMMENT ON COLUMN mcp_table.total_instances_created IS 'Total number of instances ever created for this service across all users';
COMMENT ON COLUMN mcp_table.active_instances_count IS 'Current number of active instances for this service across all users';
COMMENT ON COLUMN mcp_service_table.status IS 'Instance status: active (usable), inactive (user disabled), expired (automatically disabled)';
COMMENT ON COLUMN mcp_service_table.expires_at IS 'When this instance expires (NULL = never expires)';
COMMENT ON COLUMN mcp_service_table.last_used_at IS 'Last time this instance was accessed via API';
COMMENT ON COLUMN mcp_service_table.usage_count IS 'Total number of API calls made through this instance';
COMMENT ON COLUMN mcp_service_table.custom_name IS 'User-defined name for the instance (e.g., "Work Figma", "Personal GitHub")';
COMMENT ON COLUMN mcp_service_table.renewed_count IS 'Number of times this instance has been renewed';
COMMENT ON COLUMN mcp_service_table.last_renewed_at IS 'Last time this instance was renewed from expired status';
COMMENT ON COLUMN mcp_service_table.credentials_updated_at IS 'Last time credentials were updated (edit functionality)';

-- Insert Figma service into registry
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'figma',
    'Figma',
    'Design collaboration platform for creating and sharing designs',
    '/mcp-logos/figma.svg',
    49160,
    'api_key'
);

COMMIT;