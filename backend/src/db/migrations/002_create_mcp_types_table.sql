-- Create mcp_types table
CREATE TABLE IF NOT EXISTS mcp_types (
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

-- Create indexes for mcp_types
CREATE INDEX IF NOT EXISTS idx_mcp_types_name ON mcp_types(name);
CREATE INDEX IF NOT EXISTS idx_mcp_types_active ON mcp_types(is_active);

-- Create trigger for mcp_types table
CREATE TRIGGER update_mcp_types_updated_at 
    BEFORE UPDATE ON mcp_types 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial MCP types
INSERT INTO mcp_types (name, display_name, description, server_script, config_template, required_credentials) VALUES
('gmail', 'Gmail MCP', 'Access Gmail API through MCP', './mcp-servers/gmail-mcp-server.js', 
 '{"api_version": "v1", "scopes": ["gmail.readonly", "gmail.send"]}', 
 '["api_key", "client_secret", "client_id"]'),
('figma', 'Figma MCP', 'Access Figma API through MCP', './mcp-servers/figma-mcp-server.js', 
 '{"api_version": "v2"}', 
 '["api_key"]'),
('github', 'GitHub MCP', 'Access GitHub API through MCP', './mcp-servers/github-mcp-server.js', 
 '{"api_version": "v3", "scopes": ["repo", "read:org"]}', 
 '["personal_access_token"]');