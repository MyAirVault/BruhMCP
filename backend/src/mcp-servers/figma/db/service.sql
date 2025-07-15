-- Figma service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'figma',
    'Figma',
    'Design collaboration platform for creating and sharing designs',
    '/mcp-logos/figma.svg',
    49280,
    'api_key'
);