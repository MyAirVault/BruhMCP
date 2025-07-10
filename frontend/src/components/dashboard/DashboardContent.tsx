import React, { useRef } from 'react';
import MCPSection, { type MCPSectionRef } from '../mcp/MCPSection';
import { type MCPItem } from '../../types';
import { type SectionProps, type DashboardCallbacks } from './types';
import { getDropdownItems } from '../../utils/dropdownHelpers';

interface DashboardContentProps {
  activeMCPs: MCPItem[];
  inactiveMCPs: MCPItem[];
  expiredMCPs: MCPItem[];
  openDropdown: string | null;
  onDropdownToggle: (id: string) => void;
  onDropdownClose: () => void;
  dropdownCallbacks: DashboardCallbacks;
  getSectionProps: (sectionType: 'active' | 'inactive' | 'expired') => SectionProps;
}

export interface DashboardContentRef {
  activeSectionRef: React.RefObject<MCPSectionRef | null>;
  inactiveSectionRef: React.RefObject<MCPSectionRef | null>;
  expiredSectionRef: React.RefObject<MCPSectionRef | null>;
}

const DashboardContent = React.forwardRef<DashboardContentRef, DashboardContentProps>(({
  activeMCPs,
  inactiveMCPs,
  expiredMCPs,
  openDropdown,
  onDropdownToggle,
  onDropdownClose,
  dropdownCallbacks,
  getSectionProps,
}, ref) => {
  const activeSectionRef = useRef<MCPSectionRef | null>(null);
  const inactiveSectionRef = useRef<MCPSectionRef | null>(null);
  const expiredSectionRef = useRef<MCPSectionRef | null>(null);

  React.useImperativeHandle(ref, () => ({
    activeSectionRef,
    inactiveSectionRef,
    expiredSectionRef,
  }));

  return (
    <div className="space-y-6">
      <MCPSection
        ref={activeSectionRef}
        title="Active MCPs"
        count={activeMCPs.length}
        mcps={activeMCPs}
        openDropdown={openDropdown}
        onDropdownToggle={onDropdownToggle}
        onDropdownClose={onDropdownClose}
        getDropdownItems={(mcp) => getDropdownItems(mcp, onDropdownClose, dropdownCallbacks)}
        sectionType="active"
        {...getSectionProps('active')}
      />

      <MCPSection
        ref={inactiveSectionRef}
        title="Inactive MCPs"
        count={inactiveMCPs.length}
        mcps={inactiveMCPs}
        openDropdown={openDropdown}
        onDropdownToggle={onDropdownToggle}
        onDropdownClose={onDropdownClose}
        getDropdownItems={(mcp) => getDropdownItems(mcp, onDropdownClose, dropdownCallbacks)}
        sectionType="inactive"
        {...getSectionProps('inactive')}
      />

      <MCPSection
        ref={expiredSectionRef}
        title="Expired MCPs"
        count={expiredMCPs.length}
        mcps={expiredMCPs}
        openDropdown={openDropdown}
        onDropdownToggle={onDropdownToggle}
        onDropdownClose={onDropdownClose}
        getDropdownItems={(mcp) => getDropdownItems(mcp, onDropdownClose, dropdownCallbacks)}
        sectionType="expired"
        {...getSectionProps('expired')}
      />
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;