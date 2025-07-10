import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MCPSection, { type MCPSectionRef } from '../components/MCPSection';
import CreateMCPModal from '../components/CreateMCPModal';
import EditMCPModal from '../components/EditMCPModal';
import CopyURLModal from '../components/CopyURLModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Tooltip from '../components/Tooltip';
import { Zap, FileText, Rocket, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDropdown } from '../hooks/useDropdown';
import { getDropdownItems } from '../utils/dropdownHelpers';
import { type MCPItem, type MCPInstance } from '../types';
import { apiService } from '../services/apiService';

const Dashboard: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const { openDropdown, handleDropdownToggle, closeDropdowns } = useDropdown();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<{ isOpen: boolean; mcp: MCPItem | null }>({
    isOpen: false,
    mcp: null
  });
  const [copyURLModalData, setCopyURLModalData] = useState<{ isOpen: boolean; mcp: MCPItem | null }>({
    isOpen: false,
    mcp: null
  });
  const [currentSection, setCurrentSection] = useState<'active' | 'inactive' | 'expired' | null>(null);
  const [selectedMCPIndex, setSelectedMCPIndex] = useState(0);
  const [mcpInstances, setMCPInstances] = useState<MCPInstance[]>([]);
  const [isLoadingMCPs, setIsLoadingMCPs] = useState(true);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'delete' | 'toggle-active' | 'toggle-inactive' | 'renew';
    title: string;
    message: string;
    confirmText: string;
    mcp: MCPItem | null;
    onConfirm: (data?: { expiration?: string }) => void;
  }>({
    isOpen: false,
    type: 'delete',
    title: '',
    message: '',
    confirmText: '',
    mcp: null,
    onConfirm: () => { }
  });

  // Refs for auto-scrolling
  const activeSectionRef = useRef<MCPSectionRef>(null);
  const inactiveSectionRef = useRef<MCPSectionRef>(null);
  const expiredSectionRef = useRef<MCPSectionRef>(null);

  // Load MCP instances on component mount
  useEffect(() => {
    const loadMCPInstances = async () => {
      try {
        setIsLoadingMCPs(true);
        const instances = await apiService.getMCPInstances();
        setMCPInstances(instances);
      } catch (error) {
        console.error('Failed to load MCP instances:', error);
        // Fallback to mock data on error
        setMCPInstances([]);
      } finally {
        setIsLoadingMCPs(false);
      }
    };

    loadMCPInstances();
  }, []);

  // Convert MCPInstance to MCPItem format (for backward compatibility)
  // Note: 'email' field stores the access_url for historical reasons
  const convertToMCPItem = (instance: MCPInstance): MCPItem => ({
    id: instance.id,
    name: instance.custom_name || `${instance.mcp_type.display_name} #${instance.instance_number}`,
    email: instance.access_url, // This contains the actual MCP server URL
    status: instance.status === 'active' ? 'active' :
      instance.status === 'expired' ? 'expired' : 'inactive'
  });

  // Filter MCPs by status
  const activeMCPs = mcpInstances
    .filter(instance => instance.status === 'active' && instance.is_active)
    .map(convertToMCPItem);

  const inactiveMCPs = mcpInstances
    .filter(instance => instance.status === 'inactive' || !instance.is_active)
    .map(convertToMCPItem);

  const expiredMCPs = mcpInstances
    .filter(instance => instance.status === 'expired')
    .map(convertToMCPItem);

  // Check if user has any MCPs
  const hasAnyMCPs = mcpInstances.length > 0;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K to open Create New MCP modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCreateModalOpen(true);
        return;
      }

      // Ctrl+Down Arrow for navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentSection === null) {
          setCurrentSection('active');
          setSelectedMCPIndex(0);
          setTimeout(() => activeSectionRef.current?.scrollIntoView(), 100);
        } else if (currentSection === 'active') {
          if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView(), 100);
          } else if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView(), 100);
          }
        } else if (currentSection === 'inactive') {
          if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView(), 100);
          } else if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView(), 100);
          }
        } else if (currentSection === 'expired') {
          if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView(), 100);
          } else if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView(), 100);
          }
        }
        return;
      }

      // Ctrl+Up Arrow for navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentSection === null) {
          setCurrentSection('expired');
          setSelectedMCPIndex(0);
          setTimeout(() => expiredSectionRef.current?.scrollIntoView(), 100);
        } else if (currentSection === 'expired') {
          if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView(), 100);
          } else if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView(), 100);
          }
        } else if (currentSection === 'inactive') {
          if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView(), 100);
          } else if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView(), 100);
          }
        } else if (currentSection === 'active') {
          if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView(), 100);
          } else if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView(), 100);
          }
        }
        return;
      }

      // Arrow keys for MCP selection within section
      if (currentSection && e.key === 'ArrowDown') {
        e.preventDefault();
        const currentMCPs = currentSection === 'active' ? activeMCPs :
          currentSection === 'inactive' ? inactiveMCPs : expiredMCPs;
        setSelectedMCPIndex(prev => Math.min(prev + 1, currentMCPs.length - 1));
        return;
      }

      if (currentSection && e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMCPIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      // Escape to clear selection and close dropdowns/modals
      if (e.key === 'Escape') {
        setCurrentSection(null);
        setSelectedMCPIndex(0);
        closeDropdowns(); // Close any open dropdowns
        setIsCreateModalOpen(false); // Close create modal if open
        setEditModalData({ isOpen: false, mcp: null }); // Close edit modal if open
        setCopyURLModalData({ isOpen: false, mcp: null }); // Close copy URL modal if open
        setConfirmationModal(prev => ({ ...prev, isOpen: false })); // Close confirmation modal if open
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSection, selectedMCPIndex, activeMCPs, inactiveMCPs, expiredMCPs, closeDropdowns]);

  if (isLoading || isLoadingMCPs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Helper function to get section props for highlighting
  const getSectionProps = (sectionType: 'active' | 'inactive' | 'expired') => {
    return {
      isSelected: currentSection === sectionType,
      selectedIndex: currentSection === sectionType ? selectedMCPIndex : -1
    };
  };

  interface CreateMCPFormData {
    name: string;
    type: string;
    apiKey: string;
    clientId: string;
    clientSecret: string;
    expiration: string;
  }

  const handleCreateMCP = async (formData: CreateMCPFormData) => {
    // Transform form data to API format
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
      // Refresh the MCP list
      const instances = await apiService.getMCPInstances();
      setMCPInstances(instances);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create MCP:', error);
      // Show error message to user
      throw error; // Re-throw to let the modal handle the error
    }
  };

  const handleEditMCP = async (data: { name: string; apiKey: string; clientId: string; clientSecret: string }) => {
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

      // Refresh the MCP list
      const instances = await apiService.getMCPInstances();
      setMCPInstances(instances);
      setEditModalData({ isOpen: false, mcp: null });
    } catch (error) {
      console.error('Failed to edit MCP:', error);
      // Show error message to user
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

  // Helper function to refresh MCP list
  const refreshMCPList = async () => {
    try {
      const instances = await apiService.getMCPInstances();
      setMCPInstances(instances);
    } catch (error) {
      console.error('Failed to refresh MCP list:', error);
    }
  };

  // Dropdown callback handlers
  const dropdownCallbacks = {
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

  return (
    <Layout userName={userName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="max-w-[1280px] mx-auto">
          {hasAnyMCPs ? (
            // Regular dashboard with MCPs
            <>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                  <p className="text-base lg:text-lg text-gray-600 mb-3">Manage your MCPs</p>
                  <button
                    onClick={() => navigate('/logs')}
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View All Logs</span>
                  </button>
                </div>
                <Tooltip content="Press Ctrl+K (Cmd+K on Mac) to quickly open this modal" position="bottom">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap transition-colors cursor-pointer lg:min-w-[183px]"
                  >
                    <Zap className="w-5 h-5" />
                    <span className='text-sm'>Create new MCP</span>
                  </button>
                </Tooltip>
              </div>

              <div className="space-y-6">
                <MCPSection
                  ref={activeSectionRef}
                  title="Active MCPs"
                  count={activeMCPs.length}
                  mcps={activeMCPs}
                  openDropdown={openDropdown}
                  onDropdownToggle={handleDropdownToggle}
                  onDropdownClose={closeDropdowns}
                  getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns, dropdownCallbacks)}
                  sectionType="active"
                  {...getSectionProps('active')}
                />

                <MCPSection
                  ref={inactiveSectionRef}
                  title="Inactive MCPs"
                  count={inactiveMCPs.length}
                  mcps={inactiveMCPs}
                  openDropdown={openDropdown}
                  onDropdownToggle={handleDropdownToggle}
                  onDropdownClose={closeDropdowns}
                  getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns, dropdownCallbacks)}
                  sectionType="inactive"
                  {...getSectionProps('inactive')}
                />

                <MCPSection
                  ref={expiredSectionRef}
                  title="Expired MCPs"
                  count={expiredMCPs.length}
                  mcps={expiredMCPs}
                  openDropdown={openDropdown}
                  onDropdownToggle={handleDropdownToggle}
                  onDropdownClose={closeDropdowns}
                  getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns, dropdownCallbacks)}
                  sectionType="expired"
                  {...getSectionProps('expired')}
                />
              </div>
            </>
          ) : (
            // Empty state when no MCPs
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="max-w-md mx-auto">
                <div className="mb-8">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Rocket className="w-12 h-12 text-gray-400" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to MiniMCP!</h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Get started by creating your first Model Context Protocol instance.
                    Connect to services like Gmail, Figma, GitHub, and more.
                  </p>
                </div>

                <div className="space-y-4">
                  <Tooltip content="Press Ctrl+K (Cmd+K on Mac) to quickly open this modal" position="bottom">
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="w-full bg-black text-white px-6 py-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-3 shadow-lg transition-colors cursor-pointer text-lg font-medium"
                    >
                      <Zap className="w-6 h-6" />
                      <span>Create Your First MCP</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Tooltip>

                  <div className="text-sm text-gray-500">
                    <p className="mb-2">Popular integrations:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Gmail</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Figma</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">GitHub</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Slack</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateMCPModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMCP}
      />

      <EditMCPModal
        isOpen={editModalData.isOpen}
        onClose={() => setEditModalData({ isOpen: false, mcp: null })}
        onSubmit={handleEditMCP}
        mcp={editModalData.mcp}
      />

      <CopyURLModal
        isOpen={copyURLModalData.isOpen}
        onClose={() => setCopyURLModalData({ isOpen: false, mcp: null })}
        mcp={copyURLModalData.mcp}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        type={confirmationModal.type}
        mcpName={confirmationModal.mcp?.name}
      />

    </Layout>
  );
};

export default Dashboard;