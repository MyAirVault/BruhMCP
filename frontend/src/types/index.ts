export interface MCPItem {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'expired';
}

export interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'highlighted' | 'danger';
}