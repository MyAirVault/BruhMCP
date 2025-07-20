import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CreateMCPModal from '../components/modals/CreateMCPModal';
import EditMCPModal from '../components/modals/EditMCPModal';
import CopyURLModal from '../components/modals/CopyURLModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import PlanLimitModal from '../components/modals/PlanLimitModal';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState';
import DashboardContent, { type DashboardContentRef } from '../components/dashboard/DashboardContent';
import { useDashboardState } from '../components/dashboard/useDashboardState';
import { useDashboardActions } from '../components/dashboard/useDashboardActions';
import { useDashboardKeyboardShortcuts } from '../components/dashboard/useDashboardKeyboardShortcuts';
import { useAuth } from '../hooks/useAuth';
import { useDropdown } from '../hooks/useDropdown';

const Dashboard: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const { openDropdown, handleDropdownToggle, closeDropdowns } = useDropdown();
  const navigate = useNavigate();
  
  // Dashboard state management
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    editModalData,
    setEditModalData,
    copyURLModalData,
    setCopyURLModalData,
    confirmationModal,
    setConfirmationModal,
    planLimitModal,
    setPlanLimitModal,
    currentSection,
    setCurrentSection,
    selectedMCPIndex,
    setSelectedMCPIndex,
    isLoadingMCPs,
    activeMCPs,
    inactiveMCPs,
    expiredMCPs,
    hasAnyMCPs,
    refreshMCPList,
  } = useDashboardState();

  // Refs for auto-scrolling
  const contentRef = useRef<DashboardContentRef>(null);

  // Dashboard action handlers
  const { handleCreateMCP, handleEditMCP, dropdownCallbacks } = useDashboardActions({
    setEditModalData,
    setCopyURLModalData,
    setConfirmationModal,
    setPlanLimitModal,
    setIsCreateModalOpen,
    refreshMCPList,
    editModalData,
  });

  // Handle keyboard shortcuts
  useDashboardKeyboardShortcuts({
    currentSection,
    selectedMCPIndex,
    activeMCPs,
    inactiveMCPs,
    expiredMCPs,
    activeSectionRef: contentRef.current?.activeSectionRef || { current: null },
    inactiveSectionRef: contentRef.current?.inactiveSectionRef || { current: null },
    expiredSectionRef: contentRef.current?.expiredSectionRef || { current: null },
    setCurrentSection,
    setSelectedMCPIndex,
    setIsCreateModalOpen,
    setEditModalData,
    setCopyURLModalData,
    setConfirmationModal,
    closeDropdowns,
  });

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const oauthError = urlParams.get('oauth_error');
    const instanceId = urlParams.get('instance_id');

    if (oauthSuccess === 'true') {
      console.log('OAuth completed successfully for instance:', instanceId);
      // Refresh the MCP list to show the new instance
      refreshMCPList();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthError) {
      console.error('OAuth error:', oauthError);
      // You could show an error notification here
      // For now, just log it and clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshMCPList]);

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

  return (
    <Layout userName={userName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="max-w-[1280px] mx-auto">
          {hasAnyMCPs ? (
            <>
              <DashboardHeader onCreateMCP={() => setIsCreateModalOpen(true)} />
              <DashboardContent
                ref={contentRef}
                activeMCPs={activeMCPs}
                inactiveMCPs={inactiveMCPs}
                expiredMCPs={expiredMCPs}
                openDropdown={openDropdown}
                onDropdownToggle={handleDropdownToggle}
                onDropdownClose={closeDropdowns}
                dropdownCallbacks={dropdownCallbacks}
                getSectionProps={getSectionProps}
              />
            </>
          ) : (
            <DashboardEmptyState onCreateMCP={() => setIsCreateModalOpen(true)} />
          )}
        </div>
      </div>

      <CreateMCPModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateMCP}
        onPlanLimitReached={(title, message) => {
          setPlanLimitModal({
            isOpen: true,
            title,
            message
          });
        }}
        onSuccess={(mcp) => {
          setCopyURLModalData({ isOpen: true, mcp });
        }}
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

      <PlanLimitModal
        isOpen={planLimitModal.isOpen}
        onClose={() => setPlanLimitModal({ isOpen: false, title: '', message: '' })}
        onUpgrade={() => navigate('/billing/checkout')}
        title={planLimitModal.title}
        message={planLimitModal.message}
      />

    </Layout>
  );
};

export default Dashboard;