-- GitHub service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'github',
    'GitHub',
    'Version control and collaboration platform for software development',
    '/mcp-logos/github.svg',
    49294,
    'api_key'
);