import { type MCPItem, type DropdownItem } from '../types';
import { 
  Edit, 
  Power, 
  FileText, 
  Copy, 
  Trash2, 
  RotateCcw 
} from 'lucide-react';

interface DropdownCallbacks {
  onEdit: (mcp: MCPItem) => void;
  onToggleActive: (mcp: MCPItem) => void;
  onToggleInactive: (mcp: MCPItem) => void;
  onRenew: (mcp: MCPItem) => void;
  onDelete: (mcp: MCPItem) => void;
  onViewLogs: (mcp: MCPItem) => void;
  onCopyURL: (mcp: MCPItem) => void;
}

export const getDropdownItems = (
  mcp: MCPItem, 
  onDropdownClose: () => void,
  callbacks: DropdownCallbacks
): DropdownItem[] => {
  const baseActions: DropdownItem[] = [];

  // State-specific options based on MCP status
  switch (mcp.status) {
    case 'active':
      baseActions.push(
        {
          label: 'Edit',
          icon: Edit,
          onClick: () => {
            callbacks.onEdit(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'Toggle to Inactive',
          icon: Power,
          onClick: () => {
            callbacks.onToggleInactive(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          icon: FileText,
          onClick: () => {
            callbacks.onViewLogs(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'Copy URL',
          icon: Copy,
          onClick: () => {
            callbacks.onCopyURL(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          icon: Trash2,
          onClick: () => {
            callbacks.onDelete(mcp);
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
            callbacks.onEdit(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'Toggle to Active',
          icon: Power,
          onClick: () => {
            callbacks.onToggleActive(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          icon: FileText,
          onClick: () => {
            callbacks.onViewLogs(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          icon: Trash2,
          onClick: () => {
            callbacks.onDelete(mcp);
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
            callbacks.onRenew(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'View Logs',
          icon: FileText,
          onClick: () => {
            callbacks.onViewLogs(mcp);
            onDropdownClose();
          }
        },
        {
          label: 'Delete',
          icon: Trash2,
          onClick: () => {
            callbacks.onDelete(mcp);
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