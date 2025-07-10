import React, { useRef, useEffect } from 'react';
import { type ExpirationOption, type DropdownPosition } from '../../../types/createMCPModal';
import { calculateDropdownPosition } from '../../../utils/dropdownUtils';

interface ExpirationDropdownProps {
  value: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (option: ExpirationOption) => void;
  onClose: () => void;
}

/**
 * Expiration time dropdown component with absolute positioning
 * Handles viewport boundaries and click outside detection
 */
const ExpirationDropdown: React.FC<ExpirationDropdownProps> = ({
  value,
  isOpen,
  onToggle,
  onSelect,
  onClose
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 200,
    flipUp: false
  });

  // Expiration options mapping to backend format
  const expirationOptions: ExpirationOption[] = [
    { label: '1 Hour', value: '1h' },
    { label: '6 Hours', value: '6h' },
    { label: '1 Day', value: '1day' },
    { label: '30 Days', value: '30days' },
    { label: 'Never', value: 'never' }
  ];

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const position = calculateDropdownPosition(buttonRef, expirationOptions.length);
      setDropdownPosition(position);
    }
  }, [isOpen, expirationOptions.length]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isOpen &&
        !buttonRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleToggle = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition(buttonRef, expirationOptions.length);
      setDropdownPosition(position);
    }
    onToggle();
  };

  const handleSelect = (option: ExpirationOption) => {
    onSelect(option);
    onClose();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between transition-colors"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || 'Select expiration time'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

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
          {expirationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpirationDropdown;