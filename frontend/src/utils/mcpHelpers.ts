import { type MCPItem } from '../types';

export const mockMCPs: MCPItem[] = [
  { id: '1', name: 'Personal Gmail MCP', email: 'GMAIL', status: 'active' },
  { id: '2', name: 'API Gateway Control', email: 'GMAIL', status: 'active' },
  { id: '3', name: 'Production Server MCP', email: 'GMAIL', status: 'active' },
  { id: '4', name: 'Backup Server MCP', email: 'GMAIL', status: 'inactive' },
  { id: '5', name: 'Testing Environment', email: 'GMAIL', status: 'inactive' },
  { id: '6', name: 'Legacy System MCP', email: 'GMAIL', status: 'expired' },
];

export const filterMCPsByStatus = (mcps: MCPItem[], status: MCPItem['status']) => {
  return mcps.filter(mcp => mcp.status === status);
};