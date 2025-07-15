-- Slack service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'slack',
    'Slack',
    'Team communication and collaboration platform',
    '/mcp-logos/slack.svg',
    49458,
    'oauth'
);