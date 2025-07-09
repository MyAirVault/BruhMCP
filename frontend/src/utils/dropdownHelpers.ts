import { type MCPItem, type DropdownItem } from '../types';

export const getDropdownItems = (mcp: MCPItem, onDropdownClose: () => void): DropdownItem[] => [
  {
    label: 'Edit',
    onClick: () => {
      console.log('Edit', mcp.name);
      onDropdownClose();
    }
  },
  {
    label: 'Configure',
    onClick: () => {
      console.log('Configure', mcp.name);
      onDropdownClose();
    },
    variant: 'highlighted' as const
  },
  {
    label: 'Delete',
    onClick: () => {
      console.log('Delete', mcp.name);
      onDropdownClose();
    },
    variant: 'danger' as const
  }
];