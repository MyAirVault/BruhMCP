-- Gmail service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'gmail',
    'Gmail',
    'Email service for reading and managing Gmail messages',
    '/mcp-logos/gmail.svg',
    49296,
    'oauth'
);