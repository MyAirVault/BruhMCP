import React, { useRef, useEffect } from 'react';
import { type MCPType } from '../../../types';
import { type DropdownPosition } from '../../../types/createMCPModal';
import { calculateDropdownPosition } from '../../../utils/dropdownUtils';

interface TypeDropdownProps {
  mcpTypes: MCPType[];
  selectedType: MCPType | null;
  searchQuery: string;
  isOpen: boolean;
  onSearchChange: (query: string) => void;
  onSelect: (type: MCPType | null) => void;
  onFocus: () => void;
  onClose: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * MCP type dropdown component with search functionality
 * Handles filtering, selection, and viewport positioning
 */
const TypeDropdown: React.FC<TypeDropdownProps> = ({
  mcpTypes,
  selectedType,
  searchQuery,
  isOpen,
  onSearchChange,
  onSelect,
  onFocus,
  onClose,
  onKeyDown
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 200,
    flipUp: false
  });

  // Filter MCP types based on search query
  const filteredMCPTypes = mcpTypes.filter(type => 
    type.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const position = calculateDropdownPosition(inputRef, filteredMCPTypes.length);
      setDropdownPosition(position);
    }
  }, [isOpen, filteredMCPTypes.length]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isOpen &&
        !inputRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (selectedType && value !== selectedType.display_name) {
      // If user starts typing different from selected, clear selection and search
      onSelect(null); // Clear selection
      onSearchChange(value);
    } else {
      onSearchChange(value);
    }
  };

  const handleFocus = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition(inputRef, filteredMCPTypes.length);
      setDropdownPosition(position);
    }
    onFocus();
  };

  const handleSelect = (type: MCPType) => {
    onSelect(type);
    onSearchChange('');
    onClose();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={selectedType?.display_name || searchQuery}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={onKeyDown}
        placeholder="Search or select MCP type"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        autoComplete="off"
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[70] bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto scrollbar-hide"
          style={{
            top: dropdownPosition.flipUp
              ? dropdownPosition.top - dropdownPosition.maxHeight - 4
              : dropdownPosition.top + 4,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: dropdownPosition.maxHeight
          }}
        >
          {filteredMCPTypes.length > 0 ? (
            filteredMCPTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(type);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center">
                  {type.icon_url && (
                    <img src={type.icon_url} alt={type.name} className="w-4 h-4 mr-2" />
                  )}
                  <div>
                    <div className="font-medium">{type.display_name}</div>
                    {type.description && (
                      <div className="text-xs text-gray-500">{type.description}</div>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TypeDropdown;