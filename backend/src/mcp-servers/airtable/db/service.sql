-- Airtable service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'airtable',
    'Airtable',
    'Merges spreadsheet functionality with database power, enabling teams to organize projects, track tasks, and collaborate',
    '/mcp-logos/airtable.svg',
    49171,
    'api_key'
);