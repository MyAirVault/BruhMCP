-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mcp_type_id UUID NOT NULL REFERENCES mcp_types(id) ON DELETE CASCADE,
    credentials JSONB NOT NULL, -- Plain credentials object (api_key, client_secret, etc.)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
    -- Note: Credentials stored as plain JSON for development - encryption to be added later
);

-- Create indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_type ON api_keys(user_id, mcp_type_id, is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;

-- Create trigger for api_keys table
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();