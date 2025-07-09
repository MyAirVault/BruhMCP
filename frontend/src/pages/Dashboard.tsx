import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MCPSection, { type MCPSectionRef } from '../components/MCPSection';
import CreateMCPModal from '../components/CreateMCPModal';
import EditMCPModal from '../components/EditMCPModal';
import CopyURLModal from '../components/CopyURLModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Tooltip from '../components/Tooltip';
import { Zap, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDropdown } from '../hooks/useDropdown';
import { mockMCPs, filterMCPsByStatus } from '../utils/mcpHelpers';
import { getDropdownItems } from '../utils/dropdownHelpers';
import { type MCPItem } from '../types';

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
    onConfirm: () => {}
  });
  
  // Refs for auto-scrolling
  const activeSectionRef = useRef<MCPSectionRef>(null);
  const inactiveSectionRef = useRef<MCPSectionRef>(null);
  const expiredSectionRef = useRef<MCPSectionRef>(null);

  // Filter MCPs by status
  const activeMCPs = filterMCPsByStatus(mockMCPs, 'active');
  const inactiveMCPs = filterMCPsByStatus(mockMCPs, 'inactive');
  const expiredMCPs = filterMCPsByStatus(mockMCPs, 'expired');

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
  }, [currentSection, selectedMCPIndex, activeMCPs.length, inactiveMCPs.length, expiredMCPs.length]);

  if (isLoading) {
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

  const handleCreateMCP = (data: unknown) => {
    console.log('Creating MCP:', data);
  };

  const handleEditMCP = (data: { name: string; apiKey: string; clientId: string; clientSecret: string }) => {
    console.log('Editing MCP:', editModalData.mcp?.name, 'with data:', data);
    setEditModalData({ isOpen: false, mcp: null });
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
  const dropdownCallbacks = {
    onEdit: (mcp: MCPItem) => {
      setEditModalData({ isOpen: true, mcp });
    },
    onToggleActive: (mcp: MCPItem) => {
      openConfirmationModal('toggle-active', mcp, () => {
        console.log('Toggling MCP to active:', mcp.name);
      });
    },
    onToggleInactive: (mcp: MCPItem) => {
      openConfirmationModal('toggle-inactive', mcp, () => {
        console.log('Toggling MCP to inactive:', mcp.name);
      });
    },
    onRenew: (mcp: MCPItem) => {
      openConfirmationModal('renew', mcp, (data) => {
        console.log('Renewing MCP:', mcp.name, 'with expiration:', data?.expiration);
      });
    },
    onDelete: (mcp: MCPItem) => {
      openConfirmationModal('delete', mcp, () => {
        console.log('Deleting MCP:', mcp.name);
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