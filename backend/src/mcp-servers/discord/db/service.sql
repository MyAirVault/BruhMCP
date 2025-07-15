-- Discord service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'discord',
    'Discord',
    'Communication platform for communities and gaming',
    '/mcp-logos/discord.svg',
    49260,
    'api_key'
);