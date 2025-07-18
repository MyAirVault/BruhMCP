-- Notion service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'notion',
    'Notion',
    'All-in-one workspace for notes, tasks, and collaboration',
    '/mcp-logos/notion.svg',
    49391,
    'oauth'
);