import { type MCPItem, type DropdownItem } from '../types';

export const getDropdownItems = (mcp: MCPItem, onDropdownClose: () => void): DropdownItem[] => {
  const baseActions: DropdownItem[] = [];

  // State-specific options based on MCP status
  switch (mcp.status) {
    case 'active':
      baseActions.push(
        {
          label: 'Edit',
          onClick: () => {
            console.log('Edit MCP:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Toggle to Inactive',
          onClick: () => {
            console.log('Toggle to Inactive:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          onClick: () => {
            console.log('View Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Export Logs',
          onClick: () => {
            console.log('Export Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Copy URL',
          onClick: () => {
            console.log('Copy URL:', mcp.name);
            // Copy URL to clipboard logic would go here
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          onClick: () => {
            console.log('Delete MCP:', mcp.name);
            onDropdownClose();
          },
          variant: 'danger' as const
        }
      );
      break;

    case 'inactive':
      baseActions.push(
        {
          label: 'Edit',
          onClick: () => {
            console.log('Edit MCP:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Toggle to Active',
          onClick: () => {
            console.log('Toggle to Active:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          onClick: () => {
            console.log('View Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Export Logs',
          onClick: () => {
            console.log('Export Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          onClick: () => {
            console.log('Delete MCP:', mcp.name);
            onDropdownClose();
          },
          variant: 'danger' as const
        }
      );
      break;

    case 'expired':
      baseActions.push(
        {
          label: 'Renew',
          onClick: () => {
            console.log('Renew MCP:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          onClick: () => {
            console.log('View Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Export Logs',
          onClick: () => {
            console.log('Export Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          onClick: () => {
            console.log('Delete MCP:', mcp.name);
            onDropdownClose();
          },
          variant: 'danger' as const
        }
      );
      break;

    default:
      break;
  }

  return baseActions;
};