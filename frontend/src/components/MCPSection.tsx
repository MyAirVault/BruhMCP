import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { type MCPItem, type DropdownItem } from '../types';
import MCPCard from './MCPCard';
import Tooltip from './Tooltip';

interface MCPSectionProps {
  title: string;
  count: number;
  mcps: MCPItem[];
  openDropdown: string | null;
  onDropdownToggle: (id: string) => void;
  onDropdownClose: () => void;
  getDropdownItems: (mcp: MCPItem) => DropdownItem[];
  isSelected?: boolean;
  selectedIndex?: number;
  sectionType?: 'active' | 'inactive' | 'expired';
}

export interface MCPSectionRef {
  scrollIntoView: () => void;
}

const MCPSection = forwardRef<MCPSectionRef, MCPSectionProps>((
  {
    title,
    count,
    mcps,
    openDropdown,
    onDropdownToggle,
    onDropdownClose,
    getDropdownItems,
    isSelected = false,
    selectedIndex = -1,
    sectionType
  },
  ref
) => {
  const sectionRef = useRef<HTMLElement>(null);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  }));
  return (
    <section ref={sectionRef}>
      <div className="flex items-center justify-between mb-3">
        <Tooltip content="Use Ctrl+↑/↓ (Cmd+↑/↓ on Mac) to navigate sections" position="top">
          <h2 className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors">{title}</h2>
        </Tooltip>
        <span className="text-sm text-gray-500">{count} MCPs</span>
      </div>
      <div className="space-y-3">
        {mcps.map((mcp, index) => (
          <div key={mcp.id} className={`${isSelected && selectedIndex === index ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}>
            <MCPCard
              mcp={mcp}
              openDropdown={openDropdown}
              onDropdownToggle={onDropdownToggle}
              onDropdownClose={onDropdownClose}
              dropdownItems={getDropdownItems(mcp)}
              isLastItemInExpired={sectionType === 'expired' && index === mcps.length - 1}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

MCPSection.displayName = 'MCPSection';

export default MCPSection;