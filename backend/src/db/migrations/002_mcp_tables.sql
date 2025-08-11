-- MCP Service Tables Migration
-- Creates MCP-specific tables that work with the existing auth system from 001_microsaas_auth.sql
-- This migration assumes the users table already exists from 001

BEGIN;

-- Drop MCP tables if they exist (clean slate for MCP tables only)
DROP TABLE IF EXISTS mcp_credentials CASCADE;
DROP TABLE IF EXISTS mcp_service_table CASCADE;
DROP TABLE IF EXISTS mcp_table CASCADE;

-- Create or replace the timestamp trigger function (if not exists from 001)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Create MCP Service Table (User Instances) - WITHOUT credential fields
CREATE TABLE mcp_service_table (
    instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mcp_service_id UUID NOT NULL REFERENCES mcp_table(mcp_service_id) ON DELETE CASCADE,
    oauth_status VARCHAR(20) DEFAULT 'completed' CHECK (oauth_status IN ('pending', 'completed', 'failed')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    custom_name VARCHAR(255),
    renewed_count INTEGER DEFAULT 0,
    last_renewed_at TIMESTAMP,
    credentials_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp for mcp_service_table
CREATE TRIGGER update_mcp_service_table_updated_at BEFORE UPDATE ON mcp_service_table
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create new MCP Credentials table
CREATE TABLE mcp_credentials (
    credential_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES mcp_service_table(instance_id) ON DELETE CASCADE,
    
    -- API Key authentication
    api_key VARCHAR(500),
    
    -- OAuth authentication  
    client_id VARCHAR(500),
    client_secret VARCHAR(500),
    access_token VARCHAR(1000),
    refresh_token VARCHAR(500),
    token_expires_at TIMESTAMP,
    token_scope TEXT,
    
    -- OAuth flow tracking
    oauth_status VARCHAR(20) DEFAULT 'pending' CHECK (oauth_status IN ('pending', 'completed', 'failed', 'expired')),
    oauth_completed_at TIMESTAMP,
    oauth_authorization_url TEXT,
    oauth_state VARCHAR(100), -- For OAuth state verification
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure proper credential types
    CONSTRAINT check_credential_type CHECK (
        (api_key IS NOT NULL AND client_id IS NULL AND client_secret IS NULL) OR
        (api_key IS NULL AND client_id IS NOT NULL AND client_secret IS NOT NULL)
    ),
    
    -- OAuth tokens require client credentials
    CONSTRAINT check_oauth_tokens CHECK (
        (access_token IS NULL AND refresh_token IS NULL) OR
        (client_id IS NOT NULL AND client_secret IS NOT NULL)
    ),
    
    -- OAuth status consistency
    CONSTRAINT check_oauth_status_consistency CHECK (
        (oauth_status = 'pending' AND oauth_completed_at IS NULL) OR
        (oauth_status IN ('completed', 'failed', 'expired') AND oauth_completed_at IS NOT NULL) OR
        (api_key IS NOT NULL AND oauth_status = 'completed' AND oauth_completed_at IS NOT NULL)
    )
);

-- Create unique index for one credential per instance
CREATE UNIQUE INDEX idx_mcp_credentials_instance_id ON mcp_credentials(instance_id);

-- Create indexes for performance
CREATE INDEX idx_mcp_credentials_oauth_status ON mcp_credentials(oauth_status);
CREATE INDEX idx_mcp_credentials_token_expires_at ON mcp_credentials(token_expires_at);
CREATE INDEX idx_mcp_credentials_oauth_completed_at ON mcp_credentials(oauth_completed_at);
CREATE INDEX idx_mcp_credentials_oauth_state ON mcp_credentials(oauth_state);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_mcp_credentials_updated_at BEFORE UPDATE ON mcp_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_mcp_table_service_name ON mcp_table(mcp_service_name);
CREATE INDEX idx_mcp_table_port ON mcp_table(port);
CREATE INDEX idx_mcp_table_is_active ON mcp_table(is_active);
CREATE INDEX idx_mcp_service_table_user_id ON mcp_service_table(user_id);
CREATE INDEX idx_mcp_service_table_instance_id ON mcp_service_table(instance_id);
CREATE INDEX idx_mcp_service_table_mcp_service_id ON mcp_service_table(mcp_service_id);
CREATE INDEX idx_mcp_service_table_status ON mcp_service_table(status);
CREATE INDEX idx_mcp_service_table_oauth_status ON mcp_service_table(oauth_status);
CREATE INDEX idx_mcp_service_table_expires_at ON mcp_service_table(expires_at);
CREATE INDEX idx_mcp_service_table_last_used_at ON mcp_service_table(last_used_at);
CREATE INDEX idx_mcp_service_table_custom_name ON mcp_service_table(custom_name);
CREATE INDEX idx_mcp_service_table_last_renewed_at ON mcp_service_table(last_renewed_at);

-- Add comments for documentation
COMMENT ON TABLE mcp_credentials IS 'Stores all authentication credentials for MCP instances';
COMMENT ON COLUMN mcp_credentials.oauth_status IS 'OAuth flow status: pending (not completed), completed (tokens obtained), failed (OAuth failed), expired (tokens expired)';
COMMENT ON COLUMN mcp_credentials.oauth_completed_at IS 'When OAuth flow was successfully completed';
COMMENT ON COLUMN mcp_credentials.oauth_authorization_url IS 'OAuth authorization URL for pending flows';
COMMENT ON COLUMN mcp_credentials.oauth_state IS 'OAuth state parameter for security verification';
COMMENT ON COLUMN mcp_credentials.token_expires_at IS 'When OAuth access token expires';
COMMENT ON COLUMN mcp_credentials.token_scope IS 'OAuth scopes granted to the application';
COMMENT ON COLUMN mcp_service_table.oauth_status IS 'Quick reference OAuth status for filtering (synced from mcp_credentials)';
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

COMMIT;