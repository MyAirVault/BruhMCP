import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import MCPSection, { type MCPSectionRef } from '../components/MCPSection';
import CreateMCPModal from '../components/CreateMCPModal';
import Tooltip from '../components/Tooltip';
import { Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDropdown } from '../hooks/useDropdown';
import { mockMCPs, filterMCPsByStatus } from '../utils/mcpHelpers';
import { getDropdownItems } from '../utils/dropdownHelpers';

const Dashboard: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const { openDropdown, handleDropdownToggle, closeDropdowns } = useDropdown();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<'active' | 'inactive' | 'expired' | null>(null);
  const [selectedMCPIndex, setSelectedMCPIndex] = useState(0);
  
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

  return (
    <Layout userName={userName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-base lg:text-lg text-gray-600">Manage your MCPs</p>
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
              getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns)}
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
              getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns)}
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
              getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns)}
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
      
    </Layout>
  );
};

export default Dashboard;