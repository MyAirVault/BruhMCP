-- Reddit MCP Service Database Schema Registration
-- This file registers the Reddit service in the MCP system

-- Insert Reddit service into mcp_table if it doesn't exist
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type,
    is_active,
    created_at,
    updated_at
) VALUES (
    'reddit',
    'Reddit',
    'Reddit social media platform, featuring posts, comments, voting, and community management',
    '/mcp-logos/reddit.svg',
    49297,
    'oauth',
    true,
    NOW(),
    NOW()
) ON CONFLICT (mcp_service_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon_url_path = EXCLUDED.icon_url_path,
    port = EXCLUDED.port,
    type = EXCLUDED.type,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Add any Reddit-specific extensions to the schema if needed
-- For now, Reddit uses the same OAuth flow as other services