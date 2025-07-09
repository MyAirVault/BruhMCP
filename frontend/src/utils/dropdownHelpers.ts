import { type MCPItem, type DropdownItem } from '../types';
import { 
  Edit, 
  Power, 
  FileText, 
  Download, 
  Copy, 
  Trash2, 
  RotateCcw 
} from 'lucide-react';

export const getDropdownItems = (mcp: MCPItem, onDropdownClose: () => void): DropdownItem[] => {
  const baseActions: DropdownItem[] = [];

  // State-specific options based on MCP status
  switch (mcp.status) {
    case 'active':
      baseActions.push(
        {
          label: 'Edit',
          icon: Edit,
          onClick: () => {
            console.log('Edit MCP:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Toggle to Inactive',
          icon: Power,
          onClick: () => {
            console.log('Toggle to Inactive:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          icon: FileText,
          onClick: () => {
            console.log('View Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Export Logs',
          icon: Download,
          onClick: () => {
            console.log('Export Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Copy URL',
          icon: Copy,
          onClick: () => {
            console.log('Copy URL:', mcp.name);
            // Copy URL to clipboard logic would go here
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          icon: Trash2,
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
          icon: Edit,
          onClick: () => {
            console.log('Edit MCP:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Toggle to Active',
          icon: Power,
          onClick: () => {
            console.log('Toggle to Active:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          icon: FileText,
          onClick: () => {
            console.log('View Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Export Logs',
          icon: Download,
          onClick: () => {
            console.log('Export Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          icon: Trash2,
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
          icon: RotateCcw,
          onClick: () => {
            console.log('Renew MCP:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          icon: FileText,
          onClick: () => {
            console.log('View Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Export Logs',
          icon: Download,
          onClick: () => {
            console.log('Export Logs:', mcp.name);
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          icon: Trash2,
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