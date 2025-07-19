// Dashboard-specific types and interfaces

import { type MCPItem } from '../../types';

export interface CreateMCPFormData {
  name: string;
  type: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  expiration: string;
  credentials: Record<string, string>;
}

export interface EditMCPFormData {
  name: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  credentials: Record<string, string>;
  expiration: string;
}

export interface ConfirmationModalState {
  isOpen: boolean;
  type: 'delete' | 'toggle-active' | 'toggle-inactive' | 'renew';
  title: string;
  message: string;
  confirmText: string;
  mcp: MCPItem | null;
  onConfirm: (data?: { expiration?: string }) => void;
}

export interface ModalState {
  isOpen: boolean;
  mcp: MCPItem | null;
}

export interface PlanLimitModalState {
  isOpen: boolean;
  title: string;
  message: string;
}

export interface DashboardCallbacks {
  onEdit: (mcp: MCPItem) => void;
  onToggleActive: (mcp: MCPItem) => void;
  onToggleInactive: (mcp: MCPItem) => void;
  onRenew: (mcp: MCPItem) => void;
  onDelete: (mcp: MCPItem) => void;
  onViewLogs: (mcp: MCPItem) => void;
  onCopyURL: (mcp: MCPItem) => void;
}

export interface SectionProps {
  isSelected: boolean;
  selectedIndex: number;
}

export type SectionType = 'active' | 'inactive' | 'expired';