-- Dropbox service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'dropbox',
    'Dropbox',
    'Cloud storage service offering file syncing, sharing, and collaboration across devices with version control',
    '/mcp-logos/dropbox.svg',
    49264,
    'oauth'
);