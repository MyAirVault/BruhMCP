import { useState, useEffect } from 'react';
import { type MCPItem, type MCPInstance } from '../../types';
import { type ConfirmationModalState, type ModalState, type SectionType } from './types';
import { apiService } from '../../services/apiService';

export const useDashboardState = () => {
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<ModalState>({
    isOpen: false,
    mcp: null
  });
  const [copyURLModalData, setCopyURLModalData] = useState<ModalState>({
    isOpen: false,
    mcp: null
  });

  // Navigation states
  const [currentSection, setCurrentSection] = useState<SectionType | null>(null);
  const [selectedMCPIndex, setSelectedMCPIndex] = useState(0);

  // MCP data states
  const [mcpInstances, setMCPInstances] = useState<MCPInstance[]>([]);
  const [isLoadingMCPs, setIsLoadingMCPs] = useState(true);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
    isOpen: false,
    type: 'delete',
    title: '',
    message: '',
    confirmText: '',
    mcp: null,
    onConfirm: () => { }
  });

  // Load MCP instances on component mount
  useEffect(() => {
    const loadMCPInstances = async () => {
      try {
        setIsLoadingMCPs(true);
        const instances = await apiService.getMCPInstances();
        setMCPInstances(instances);
      } catch (error) {
        console.error('Failed to load MCP instances:', error);
        setMCPInstances([]);
      } finally {
        setIsLoadingMCPs(false);
      }
    };

    loadMCPInstances();
  }, []);

  // Convert MCPInstance to MCPItem format (for backward compatibility)
  const convertToMCPItem = (instance: MCPInstance): MCPItem => ({
    id: instance.id,
    name: instance.custom_name || `${instance.mcp_type.display_name} #${instance.instance_number}`,
    email: instance.access_url, // This contains the actual MCP server URL (for backward compatibility)
    status: instance.status === 'active' ? 'active' :
      instance.status === 'expired' ? 'expired' : 'inactive',
    mcpType: instance.mcp_type.name, // Add MCP type for proper display
    access_url: instance.access_url, // Add direct access to URL
    icon_url: instance.mcp_type.icon_url // Add icon URL from backend
  });

  // Filter MCPs by status (priority: expired > inactive > active)
  const activeMCPs = mcpInstances
    .filter(instance => instance.status === 'active')
    .map(convertToMCPItem);

  const inactiveMCPs = mcpInstances
    .filter(instance => instance.status === 'inactive')
    .map(convertToMCPItem);

  const expiredMCPs = mcpInstances
    .filter(instance => instance.status === 'expired')
    .map(convertToMCPItem);

  // Helper function to refresh MCP list
  const refreshMCPList = async () => {
    try {
      const instances = await apiService.getMCPInstances();
      setMCPInstances(instances);
    } catch (error) {
      console.error('Failed to refresh MCP list:', error);
    }
  };

  // Check if user has any MCPs
  const hasAnyMCPs = mcpInstances.length > 0;

  return {
    // Modal states
    isCreateModalOpen,
    setIsCreateModalOpen,
    editModalData,
    setEditModalData,
    copyURLModalData,
    setCopyURLModalData,
    confirmationModal,
    setConfirmationModal,

    // Navigation states
    currentSection,
    setCurrentSection,
    selectedMCPIndex,
    setSelectedMCPIndex,

    // MCP data
    mcpInstances,
    setMCPInstances,
    isLoadingMCPs,
    activeMCPs,
    inactiveMCPs,
    expiredMCPs,
    hasAnyMCPs,

    // Utility functions
    refreshMCPList,
    convertToMCPItem,
  };
};