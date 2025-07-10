import { useEffect } from 'react';
import { type MCPItem } from '../../types';
import { type SectionType, type ConfirmationModalState } from './types';

interface KeyboardShortcutsProps {
  currentSection: SectionType | null;
  selectedMCPIndex: number;
  activeMCPs: MCPItem[];
  inactiveMCPs: MCPItem[];
  expiredMCPs: MCPItem[];
  activeSectionRef: React.RefObject<{ scrollIntoView: () => void } | null>;
  inactiveSectionRef: React.RefObject<{ scrollIntoView: () => void } | null>;
  expiredSectionRef: React.RefObject<{ scrollIntoView: () => void } | null>;
  setCurrentSection: (section: SectionType | null) => void;
  setSelectedMCPIndex: (index: number | ((prev: number) => number)) => void;
  setIsCreateModalOpen: (isOpen: boolean) => void;
  setEditModalData: (data: { isOpen: boolean; mcp: MCPItem | null }) => void;
  setCopyURLModalData: (data: { isOpen: boolean; mcp: MCPItem | null }) => void;
  setConfirmationModal: (fn: (prev: ConfirmationModalState) => ConfirmationModalState) => void;
  closeDropdowns: () => void;
}

export const useDashboardKeyboardShortcuts = ({
  currentSection,
  selectedMCPIndex,
  activeMCPs,
  inactiveMCPs,
  expiredMCPs,
  activeSectionRef,
  inactiveSectionRef,
  expiredSectionRef,
  setCurrentSection,
  setSelectedMCPIndex,
  setIsCreateModalOpen,
  setEditModalData,
  setCopyURLModalData,
  setConfirmationModal,
  closeDropdowns,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K to open Create New MCP modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCreateModalOpen(true);
        return;
      }

      // Ctrl+Down Arrow for section navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentSection === null) {
          setCurrentSection('active');
          setSelectedMCPIndex(0);
          setTimeout(() => activeSectionRef.current?.scrollIntoView?.(), 100);
        } else if (currentSection === 'active') {
          if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView?.(), 100);
          } else if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView?.(), 100);
          }
        } else if (currentSection === 'inactive') {
          if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView?.(), 100);
          } else if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView?.(), 100);
          }
        } else if (currentSection === 'expired') {
          if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView?.(), 100);
          } else if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView?.(), 100);
          }
        }
        return;
      }

      // Ctrl+Up Arrow for section navigation
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentSection === null) {
          setCurrentSection('expired');
          setSelectedMCPIndex(0);
          setTimeout(() => expiredSectionRef.current?.scrollIntoView?.(), 100);
        } else if (currentSection === 'expired') {
          if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView?.(), 100);
          } else if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView?.(), 100);
          }
        } else if (currentSection === 'inactive') {
          if (activeMCPs.length > 0) {
            setCurrentSection('active');
            setSelectedMCPIndex(0);
            setTimeout(() => activeSectionRef.current?.scrollIntoView?.(), 100);
          } else if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView?.(), 100);
          }
        } else if (currentSection === 'active') {
          if (expiredMCPs.length > 0) {
            setCurrentSection('expired');
            setSelectedMCPIndex(0);
            setTimeout(() => expiredSectionRef.current?.scrollIntoView?.(), 100);
          } else if (inactiveMCPs.length > 0) {
            setCurrentSection('inactive');
            setSelectedMCPIndex(0);
            setTimeout(() => inactiveSectionRef.current?.scrollIntoView?.(), 100);
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
        closeDropdowns();
        setIsCreateModalOpen(false);
        setEditModalData({ isOpen: false, mcp: null });
        setCopyURLModalData({ isOpen: false, mcp: null });
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    currentSection,
    selectedMCPIndex,
    activeMCPs,
    inactiveMCPs,
    expiredMCPs,
    activeSectionRef,
    inactiveSectionRef,
    expiredSectionRef,
    setCurrentSection,
    setSelectedMCPIndex,
    setIsCreateModalOpen,
    setEditModalData,
    setCopyURLModalData,
    setConfirmationModal,
    closeDropdowns,
  ]);
};