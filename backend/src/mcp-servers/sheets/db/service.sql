-- Google Sheets MCP Service Database Schema
-- Based on Gmail MCP implementation patterns

-- Insert Google Sheets service configuration into mcp_table
-- This assumes the table structure already exists from the main application

INSERT INTO mcp_table (
  mcp_service_id,
  mcp_service_name,
  display_name,
  type,
  is_active,
  port,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'sheets',
  'Google Sheets',
  'oauth',
  true,
  49307,
  NOW(),
  NOW()
) ON CONFLICT (mcp_service_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  type = EXCLUDED.type,
  is_active = EXCLUDED.is_active,
  port = EXCLUDED.port,
  updated_at = NOW();

-- Create indexes for better performance on Google Sheets specific queries
CREATE INDEX IF NOT EXISTS idx_mcp_service_table_sheets_active 
ON mcp_service_table (instance_id, oauth_status) 
WHERE mcp_service_id IN (
  SELECT mcp_service_id FROM mcp_table WHERE mcp_service_name = 'sheets'
);

CREATE INDEX IF NOT EXISTS idx_mcp_credentials_sheets_tokens
ON mcp_credentials (instance_id, access_token, refresh_token)
WHERE instance_id IN (
  SELECT instance_id FROM mcp_service_table 
  WHERE mcp_service_id IN (
    SELECT mcp_service_id FROM mcp_table WHERE mcp_service_name = 'sheets'
  )
);

-- Create a view for easy Google Sheets instance lookup
CREATE OR REPLACE VIEW sheets_instances_view AS
SELECT 
  ms.instance_id,
  ms.user_id,
  ms.oauth_status,
  ms.status,
  ms.expires_at,
  ms.usage_count,
  ms.custom_name,
  ms.last_used_at,
  ms.created_at,
  ms.updated_at,
  m.mcp_service_name,
  m.display_name,
  m.type as auth_type,
  m.is_active as service_active,
  m.port,
  c.client_id,
  c.client_secret,
  c.access_token,
  c.refresh_token,
  c.token_expires_at,
  c.oauth_completed_at,
  c.created_at as credentials_created_at,
  c.updated_at as credentials_updated_at
FROM mcp_service_table ms
JOIN mcp_table m ON ms.mcp_service_id = m.mcp_service_id
LEFT JOIN mcp_credentials c ON ms.instance_id = c.instance_id
WHERE m.mcp_service_name = 'sheets';

-- Grant necessary permissions (adjust as needed for your user/role setup)
-- GRANT SELECT, INSERT, UPDATE ON mcp_table TO sheets_service_user;
-- GRANT SELECT, INSERT, UPDATE ON mcp_service_table TO sheets_service_user;
-- GRANT SELECT, INSERT, UPDATE ON mcp_credentials TO sheets_service_user;
-- GRANT SELECT ON sheets_instances_view TO sheets_service_user;

-- Add comments for documentation
COMMENT ON VIEW sheets_instances_view IS 'Consolidated view of Google Sheets MCP instances with credentials and service information';

-- Optional: Create a function to get active Google Sheets instances
CREATE OR REPLACE FUNCTION get_active_sheets_instances()
RETURNS TABLE (
  instance_id UUID,
  user_id UUID,
  custom_name VARCHAR,
  usage_count INTEGER,
  last_used_at TIMESTAMP WITH TIME ZONE,
  has_valid_tokens BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.instance_id,
    v.user_id,
    v.custom_name,
    v.usage_count,
    v.last_used_at,
    (v.access_token IS NOT NULL AND v.refresh_token IS NOT NULL) as has_valid_tokens
  FROM sheets_instances_view v
  WHERE v.status = 'active'
    AND v.oauth_status = 'completed'
    AND v.service_active = true
    AND (v.expires_at IS NULL OR v.expires_at > NOW())
  ORDER BY v.last_used_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_sheets_instances() IS 'Returns all active Google Sheets MCP instances with basic usage information';

-- Optional: Create a function to cleanup expired Google Sheets instances
CREATE OR REPLACE FUNCTION cleanup_expired_sheets_instances()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE mcp_service_table 
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW()
    AND mcp_service_id IN (
      SELECT mcp_service_id FROM mcp_table WHERE mcp_service_name = 'sheets'
    );
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sheets_instances() IS 'Marks expired Google Sheets instances as expired and returns count of updated records';