-- Todoist service registration
INSERT INTO mcp_table (
    mcp_service_name,
    display_name,
    description,
    icon_url_path,
    port,
    type
) VALUES (
    'todoist',
    'Todoist',
    'Todoist is a task management tool allowing users to create to-do lists, set deadlines, and collaborate on projects with reminders and cross-platform syncing',
    '/mcp-logos/todoist.svg',
    49491,
    'oauth'
);