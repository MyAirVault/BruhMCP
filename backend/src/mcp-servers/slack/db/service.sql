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
    'Slack workspace communication and collaboration platform - send messages, manage channels, and interact with your team',
    '/mcp-logos/slack.svg',
    49458,
    'oauth'
);