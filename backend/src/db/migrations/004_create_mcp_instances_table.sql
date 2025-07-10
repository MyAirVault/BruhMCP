-- Create mcp_instances table
CREATE TABLE IF NOT EXISTS mcp_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id),
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    custom_name VARCHAR(255), -- User-defined name for the MCP instance
    instance_number INTEGER NOT NULL DEFAULT 1, -- Instance number for this user/type combination
    process_id INTEGER, -- Node.js process ID
    access_token VARCHAR(255) UNIQUE NOT NULL, -- Unique token for accessing this MCP
    assigned_port INTEGER UNIQUE, -- Port assigned to this MCP process
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, expired
    is_active BOOLEAN DEFAULT true, -- User can toggle active/inactive
    expiration_option VARCHAR(10) NOT NULL DEFAULT '1day', -- never, 1h, 6h, 1day, 30days
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL if expiration_option is 'never'
    last_renewed_at TIMESTAMP WITH TIME ZONE,
    config JSONB DEFAULT '{}', -- Instance-specific configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('active', 'inactive', 'expired')),
    CONSTRAINT check_expiration_option CHECK (expiration_option IN ('never', '1h', '6h', '1day', '30days')),
    CONSTRAINT check_port_range CHECK (assigned_port BETWEEN 3001 AND 4000), -- Accommodates formula: 3001 + (userId * 10) + instanceNum
    CONSTRAINT unique_user_mcp_instance UNIQUE (user_id, mcp_type_id, instance_number),
    CONSTRAINT check_max_instances_per_user CHECK (instance_number <= 10)
);

-- Create indexes for mcp_instances
CREATE INDEX IF NOT EXISTS idx_mcp_instances_user_active ON mcp_instances(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_mcp_instances_status ON mcp_instances(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mcp_instances_expires_at ON mcp_instances(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mcp_instances_process_id ON mcp_instances(process_id) WHERE process_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mcp_instances_expiration_option ON mcp_instances(expiration_option);
CREATE INDEX IF NOT EXISTS idx_mcp_instances_access_token ON mcp_instances(access_token);

-- Create trigger for mcp_instances table
CREATE TRIGGER update_mcp_instances_updated_at 
    BEFORE UPDATE ON mcp_instances 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();