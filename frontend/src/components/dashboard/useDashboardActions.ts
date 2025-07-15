import { useNavigate } from 'react-router-dom';
import { type MCPItem, type MCPInstanceCreationResponse } from '../../types';
import { type CreateMCPFormData, type EditMCPFormData, type ConfirmationModalState, type ModalState, type DashboardCallbacks } from './types';
import { apiService } from '../../services/apiService';
import { convertExpirationToISODate } from '../../utils/dateHelpers';

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
  const handleCreateMCP = async (formData: CreateMCPFormData): Promise<MCPInstanceCreationResponse> => {
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
      const response = await apiService.createMCP(data);
      
      // Check if this is an OAuth service that requires user consent
      if (response && response.oauth && response.oauth.requires_user_consent) {
        console.log('OAuth flow initiated for MCP:', response.instance.id);
        // Close the modal since OAuth will redirect the user
        setIsCreateModalOpen(false);
        // Return the response for OAuth handling in the form
        return response;
      } else {
        // For API key services, handle normally
        console.log('Created MCP:', response);
        await refreshMCPList();
        setIsCreateModalOpen(false);
        return response;
      }
    } catch (error) {
      console.error('Failed to create MCP:', error);
      throw error;
    }
  };

  // Handle edit MCP form submission
  const handleEditMCP = async (data: EditMCPFormData) => {
    if (!editModalData.mcp) return;

    try {
      // Build credentials object from both new credentials format and legacy fields
      const credentials: Record<string, string> = { ...data.credentials };
      
      // Add legacy field mapping for backward compatibility
      if (data.apiKey?.trim()) {
        credentials.api_key = data.apiKey.trim();
      }
      if (data.clientId?.trim()) {
        credentials.client_id = data.clientId.trim();
      }
      if (data.clientSecret?.trim()) {
        credentials.client_secret = data.clientSecret.trim();
      }

      // Update MCP name and credentials
      await apiService.editMCP(editModalData.mcp.id, {
        custom_name: data.name,
        credentials: credentials
      });

      // If expiration is provided, also renew the MCP instance
      if (data.expiration?.trim()) {
        const newExpiresAt = convertExpirationToISODate(data.expiration);
        
        await apiService.renewMCP(editModalData.mcp.id, {
          expires_at: newExpiresAt
        });
      }

      await refreshMCPList();
      setEditModalData({ isOpen: false, mcp: null });
    } catch (error) {
      console.error('Failed to edit MCP:', error);
      throw error; // Re-throw so the modal can handle the error
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
          await apiService.toggleMCP(mcp.id, { status: 'active' });
          await refreshMCPList();
        } catch (error) {
          console.error('Failed to toggle MCP to active:', error);
        }
      });
    },
    onToggleInactive: (mcp: MCPItem) => {
      openConfirmationModal('toggle-inactive', mcp, async () => {
        try {
          await apiService.toggleMCP(mcp.id, { status: 'inactive' });
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
            // Convert expiration option to ISO date string
            const expiresAt = convertExpirationToISODate(data.expiration);
            
            console.log(`🔄 Renewing MCP ${mcp.id} with expiration: ${data.expiration} -> ${expiresAt}`);
            
            await apiService.renewMCP(mcp.id, { expires_at: expiresAt });
            await refreshMCPList();
            
            console.log(`✅ Successfully renewed MCP ${mcp.id}`);
          }
        } catch (error) {
          console.error('Failed to renew MCP:', error);
          
          // Extract meaningful error message for user display
          let errorMessage = 'Failed to renew MCP. Please try again.';
          if (error instanceof Error) {
            // Check if it's an API error with a specific message
            if (error.message.includes('INSTANCE_NOT_EXPIRED')) {
              errorMessage = 'This MCP instance is not expired and cannot be renewed.';
            } else if (error.message.includes('INVALID_DATE')) {
              errorMessage = 'Invalid expiration date selected. Please try again.';
            } else if (error.message.includes('NOT_FOUND')) {
              errorMessage = 'MCP instance not found. It may have been deleted.';
            }
          }
          
          // TODO: Show error message to user via toast or modal
          // For now, we'll log it and the console error above will help debug
          console.error('User-friendly error:', errorMessage);
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