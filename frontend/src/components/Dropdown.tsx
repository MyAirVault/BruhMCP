import React, { useEffect } from 'react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'highlighted' | 'danger';
}

interface DropdownProps {
  items: DropdownItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ items, isOpen, onClose, className = '' }) => {
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleDropdownClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`absolute rounded-lg shadow-lg focus:outline-none z-50 py-1 ${className}`}
      style={{
        backgroundColor: 'var(--dropdown-bg-default)',
        border: '1px solid var(--dropdown-border)',
        minWidth: '160px',
        maxWidth: '220px',
        width: 'max-content'
      }}
      onClick={handleDropdownClick}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="w-full px-4 py-2 text-left text-sm flex items-center transition-colors cursor-pointer"
          style={{
            color: item.variant === 'danger' ? 'var(--dropdown-text-danger)' : 'var(--dropdown-text-default)',
            backgroundColor: item.variant === 'highlighted' ? 'var(--dropdown-bg-highlighted)' : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (item.variant === 'danger') {
              e.currentTarget.style.backgroundColor = 'var(--dropdown-bg-hover-danger)';
            } else {
              e.currentTarget.style.backgroundColor = 'var(--dropdown-bg-hover)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = item.variant === 'highlighted' ? 'var(--dropdown-bg-highlighted)' : 'transparent';
          }}
          onClick={item.onClick}
        >
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Dropdown;