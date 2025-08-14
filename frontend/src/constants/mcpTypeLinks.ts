// Configuration for MCP type external links
// Only includes services that are available in backend/scripts/start-all-services.sh
export interface MCPTypeLink {
  type: string;
  displayName: string;
  url: string;
  description: string;
}

export const MCP_TYPE_LINKS: MCPTypeLink[] = [
  {
    type: 'figma',
    displayName: 'Figma',
    url: 'https://www.figma.com',
    description: 'Open Figma design tool'
  },
  {
    type: 'gmail',
    displayName: 'Gmail',
    url: 'https://mail.google.com',
    description: 'Open Gmail'
  },
  {
    type: 'sheets',
    displayName: 'Google Sheets',
    url: 'https://docs.google.com/spreadsheets',
    description: 'Open Google Sheets'
  },
  {
    type: 'airtable',
    displayName: 'Airtable',
    url: 'https://airtable.com',
    description: 'Open Airtable'
  },
  {
    type: 'dropbox',
    displayName: 'Dropbox',
    url: 'https://www.dropbox.com',
    description: 'Open Dropbox'
  },
  {
    type: 'googledrive',
    displayName: 'Google Drive',
    url: 'https://drive.google.com',
    description: 'Open Google Drive'
  },
  {
    type: 'reddit',
    displayName: 'Reddit',
    url: 'https://www.reddit.com',
    description: 'Open Reddit'
  },
  {
    type: 'notion',
    displayName: 'Notion',
    url: 'https://www.notion.so',
    description: 'Open Notion'
  },
  {
    type: 'slack',
    displayName: 'Slack',
    url: 'https://slack.com',
    description: 'Open Slack'
  }
];

// Helper function to get link configuration for a given MCP type
export const getMCPTypeLink = (mcpType: string): MCPTypeLink | null => {
  const normalizedType = mcpType.toLowerCase();
  return MCP_TYPE_LINKS.find(link => link.type === normalizedType) || null;
};