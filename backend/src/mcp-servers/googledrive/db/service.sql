-- Google Drive service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'googledrive',
    'Google Drive',
    'Google Drive is a cloud storage solution for uploading, sharing, and collaborating on files across devices',
    '/mcp-logos/googledrive.svg',
    49303,
    'oauth'
);