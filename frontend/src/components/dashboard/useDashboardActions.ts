import { useNavigate } from 'react-router-dom';
import { type MCPItem } from '../../types';
import { type CreateMCPFormData, type EditMCPFormData, type ConfirmationModalState, type ModalState, type DashboardCallbacks } from './types';
import { apiService } from '../../services/apiService';

interface DashboardActionsProps {
  setEditModalData: (data: ModalState) => void;
  setCopyURLModalData: (data: ModalState) => void;
  setConfirmationModal: (data: ConfirmationModalState) => void;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  refreshMCPList: () => Promise<void>;
  editModalData: ModalState;
}

export const useDashboardActions = ({
  setEditModalData,
  setCopyURLModalData,
  setConfirmationModal,
  setIsCreateModalOpen,
  refreshMCPList,
  editModalData,
}: DashboardActionsProps) => {
  const navigate = useNavigate();

  // Handle create MCP form submission
  const handleCreateMCP = async (formData: CreateMCPFormData) => {
    const data = {
      mcp_type: formData.type,
      custom_name: formData.name || undefined,
      expiration_option: formData.expiration,
      credentials: {} as Record<string, string>
    };

    // Only add non-empty credentials
    if (formData.apiKey?.trim()) {
      data.credentials.api_key = formData.apiKey.trim();
    }
    if (formData.clientId?.trim()) {
      data.credentials.client_id = formData.clientId.trim();
    }
    if (formData.clientSecret?.trim()) {
      data.credentials.client_secret = formData.clientSecret.trim();
    }

    try {
      const newInstance = await apiService.createMCP(data);
      console.log('Created MCP:', newInstance);
      await refreshMCPList();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create MCP:', error);
      throw error;
    }
  };

  // Handle edit MCP form submission
  const handleEditMCP = async (data: EditMCPFormData) => {
    if (!editModalData.mcp) return;

    try {
      await apiService.editMCP(editModalData.mcp.id, {
        custom_name: data.name,
        credentials: {
          api_key: data.apiKey,
          client_id: data.clientId,
          client_secret: data.clientSecret
        }
      });

      await refreshMCPList();
      setEditModalData({ isOpen: false, mcp: null });
    } catch (error) {
      console.error('Failed to edit MCP:', error);
    }
  };

  // Confirmation modal helper
  const openConfirmationModal = (
    type: 'delete' | 'toggle-active' | 'toggle-inactive' | 'renew',
    mcp: MCPItem,
    onConfirm: (data?: { expiration?: string }) => void
  ) => {
    let title: string;
    let message: string;
    let confirmText: string;

    switch (type) {
      case 'delete':
        title = 'Delete MCP';
        message = `Are you sure you want to delete this MCP? This action cannot be undone.`;
        confirmText = 'Delete';
        break;
      case 'toggle-active':
        title = 'Activate MCP';
        message = `Are you sure you want to activate this MCP?`;
        confirmText = 'Activate';
        break;
      case 'toggle-inactive':
        title = 'Deactivate MCP';
        message = `Are you sure you want to deactivate this MCP?`;
        confirmText = 'Deactivate';
        break;
      case 'renew':
        title = 'Renew MCP';
        message = `Select a new expiration time for this MCP.`;
        confirmText = 'Renew';
        break;
    }

    setConfirmationModal({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      mcp,
      onConfirm
    });
  };

  // Dropdown callback handlers
  const dropdownCallbacks: DashboardCallbacks = {
    onEdit: (mcp: MCPItem) => {
      setEditModalData({ isOpen: true, mcp });
    },
    onToggleActive: (mcp: MCPItem) => {
      openConfirmationModal('toggle-active', mcp, async () => {
        try {
          await apiService.toggleMCP(mcp.id, { is_active: true });
          await refreshMCPList();
        } catch (error) {
          console.error('Failed to toggle MCP to active:', error);
        }
      });
    },
    onToggleInactive: (mcp: MCPItem) => {
      openConfirmationModal('toggle-inactive', mcp, async () => {
        try {
          await apiService.toggleMCP(mcp.id, { is_active: false });
          await refreshMCPList();
        } catch (error) {
          console.error('Failed to toggle MCP to inactive:', error);
        }
      });
    },
    onRenew: (mcp: MCPItem) => {
      openConfirmationModal('renew', mcp, async (data) => {
        try {
          if (data?.expiration) {
            await apiService.renewMCP(mcp.id, { expiration_option: data.expiration });
            await refreshMCPList();
          }
        } catch (error) {
          console.error('Failed to renew MCP:', error);
        }
      });
    },
    onDelete: (mcp: MCPItem) => {
      openConfirmationModal('delete', mcp, async () => {
        try {
          await apiService.deleteMCP(mcp.id);
          await refreshMCPList();
        } catch (error) {
          console.error('Failed to delete MCP:', error);
        }
      });
    },
    onViewLogs: (mcp: MCPItem) => {
      navigate(`/logs?mcp=${mcp.id}&name=${encodeURIComponent(mcp.name)}`);
    },
    onCopyURL: (mcp: MCPItem) => {
      setCopyURLModalData({ isOpen: true, mcp });
    }
  };

  return {
    handleCreateMCP,
    handleEditMCP,
    dropdownCallbacks,
    openConfirmationModal,
  };
};