-- Reddit service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'reddit',
    'Reddit',
    'Reddit is a social news platform with user-driven communities (subreddits), offering content sharing, discussions, and viral marketing opportunities',
    '/mcp-logos/reddit.svg',
    49425,
    'oauth'
);