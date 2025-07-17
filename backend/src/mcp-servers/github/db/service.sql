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
    'GitHub is a code hosting platform for version control and collaboration, offering Git-based repository management',
    '/mcp-logos/github.svg',
    49294,
    'oauth'
);