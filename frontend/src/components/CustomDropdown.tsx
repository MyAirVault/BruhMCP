import React, { useState, useEffect, useRef } from 'react';

interface CustomDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ 
    top: 0, 
    left: 0, 
    width: 0, 
    maxHeight: 200, 
    flipUp: false 
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position to handle viewport boundaries
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false };

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(200, options.length * 40); // Estimate dropdown height
    
    // Check if dropdown would go below viewport
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    const flipUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    const maxHeight = flipUp ? Math.min(spaceAbove - 10, 200) : Math.min(spaceBelow - 10, 200);
    
    return {
      top: buttonRect.bottom,
      left: buttonRect.left,
      width: buttonRect.width,
      maxHeight,
      flipUp
    };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (isOpen) {
        if (!buttonRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <>
      <div className={`relative ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between transition-colors bg-white cursor-pointer"
          >
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {displayValue}
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
        </div>
      </div>

      {/* Dropdown Menu - positioned absolutely to handle viewport boundaries */}
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
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.value);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default CustomDropdown;