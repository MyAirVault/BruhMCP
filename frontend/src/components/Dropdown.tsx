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

  const getItemStyle = (variant: string = 'default') => {
    switch (variant) {
      case 'highlighted':
        return {
          backgroundColor: '#F7F7F7',
          color: '#374151'
        };
      case 'danger':
        return {
          backgroundColor: '#D45757',
          color: '#514637'
        };
      default:
        return {
          color: '#374151'
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`absolute bg-white rounded-lg shadow-lg focus:outline-none z-50 ${className}`}
      style={{ 
        width: '180px', 
        borderColor: '#EDEDED', 
        borderWidth: '0.6px',
        borderStyle: 'solid',
        padding: '4px 0px',
        // Responsive positioning
        right: '0',
        minWidth: '160px',
        maxWidth: '200px'
      }}
      onClick={handleDropdownClick}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="flex items-center w-full text-left text-sm hover:opacity-80 transition-opacity"
          style={{ 
            width: '100%', 
            height: '36px', 
            padding: '8px 16px',
            minWidth: '160px',
            whiteSpace: 'nowrap',
            ...getItemStyle(item.variant)
          }}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Dropdown;