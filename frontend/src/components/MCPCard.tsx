import React from 'react';
import { type MCPItem, type DropdownItem } from '../types';
import StatusBadge from './StatusBadge';
import Dropdown from './Dropdown';
import Tooltip from './Tooltip';
import { Mail, Server, Database, Cloud, Globe, Settings } from 'lucide-react';

interface MCPCardProps {
  mcp: MCPItem;
  openDropdown: string | null;
  onDropdownToggle: (id: string) => void;
  onDropdownClose: () => void;
  dropdownItems: DropdownItem[];
  isLastItemInExpired?: boolean;
}

// Helper function to get MCP type icon
const getMCPIcon = (mcpType: string) => {
  switch (mcpType.toLowerCase()) {
    case 'gmail':
      return Mail;
    case 'server':
    case 'production':
    case 'backup':
      return Server;
    case 'database':
    case 'storage':
      return Database;
    case 'api':
    case 'gateway':
      return Globe;
    case 'testing':
    case 'legacy':
      return Settings;
    default:
      return Cloud; // Default fallback icon
  }
};

const MCPCard: React.FC<MCPCardProps> = ({
  mcp,
  openDropdown,
  onDropdownToggle,
  onDropdownClose,
  dropdownItems,
  isLastItemInExpired = false
}) => {
  const IconComponent = getMCPIcon(mcp.email);
  return (
    <div className="bg-white border-t border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-1 ml-2">
            <Tooltip content={mcp.name} position="top">
              <h3 className="text-base font-medium text-gray-900 truncate max-w-[200px]">{mcp.name}</h3>
            </Tooltip>
            <div className="flex items-center gap-2 mt-1">
              <IconComponent className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500">{mcp.email}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 flex-shrink-0">
          <StatusBadge status={mcp.status} />
          <div className="relative dropdown-container">
            <button
              className="text-gray-400 hover:text-gray-600 p-2 w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDropdownToggle(mcp.id);
              }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            <Dropdown
              items={dropdownItems}
              isOpen={openDropdown === mcp.id}
              onClose={onDropdownClose}
              className="right-0 sm:right-0 sm:left-auto"
              forceFlipUp={isLastItemInExpired}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPCard;