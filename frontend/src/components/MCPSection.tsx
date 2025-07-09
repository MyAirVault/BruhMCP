import React from 'react';
import { type MCPItem, type DropdownItem } from '../types';
import MCPCard from './MCPCard';

interface MCPSectionProps {
  title: string;
  count: number;
  mcps: MCPItem[];
  openDropdown: string | null;
  onDropdownToggle: (id: string) => void;
  onDropdownClose: () => void;
  getDropdownItems: (mcp: MCPItem) => DropdownItem[];
}

const MCPSection: React.FC<MCPSectionProps> = ({
  title,
  count,
  mcps,
  openDropdown,
  onDropdownToggle,
  onDropdownClose,
  getDropdownItems
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{count} MCPs</span>
      </div>
      <div className="space-y-3">
        {mcps.map(mcp => (
          <MCPCard
            key={mcp.id}
            mcp={mcp}
            openDropdown={openDropdown}
            onDropdownToggle={onDropdownToggle}
            onDropdownClose={onDropdownClose}
            dropdownItems={getDropdownItems(mcp)}
          />
        ))}
      </div>
    </section>
  );
};

export default MCPSection;