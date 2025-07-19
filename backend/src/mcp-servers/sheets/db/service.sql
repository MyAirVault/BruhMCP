-- Google Sheets service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'sheets',
    'Google Sheets',
    'Spreadsheet service for managing Google Sheets',
    '/mcp-logos/sheets.svg',
    49307,
    'oauth'
);