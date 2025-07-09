import React, { useEffect, useRef, useState } from 'react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'highlighted' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
}

interface DropdownProps {
  items: DropdownItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  forceFlipUp?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ items, isOpen, onClose, className = '', forceFlipUp = false }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ flipUp: false });
  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) {
        onClose();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Check positioning when dropdown opens
  useEffect(() => {
    if (isOpen) {
      if (forceFlipUp) {
        // Immediately set to flip up for last items
        setPosition({ flipUp: true });
      } else if (dropdownRef.current) {
        // Check positioning for other items
        const checkPosition = () => {
          if (!dropdownRef.current) return;

          const dropdown = dropdownRef.current;
          const rect = dropdown.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const dropdownHeight = dropdown.offsetHeight;

          // Check if dropdown would go below viewport with some margin
          const spaceBelow = viewportHeight - rect.top;
          const wouldOverflow = spaceBelow < dropdownHeight + 40; // 40px margin

          setPosition({ flipUp: wouldOverflow });
        };

        // Use requestAnimationFrame to ensure proper timing
        requestAnimationFrame(checkPosition);
      }
    }
  }, [isOpen, items.length, forceFlipUp]);

  const handleDropdownClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute rounded-lg shadow-lg focus:outline-none z-50 py-1 ${className} ${position.flipUp ? 'bottom-full -mb-32' : 'top-full mt-1'
        }`}
      style={{
        backgroundColor: 'var(--dropdown-bg-default)',
        border: '1px solid var(--dropdown-border)',
        minWidth: '160px',
        maxWidth: '220px',
        width: 'max-content'
      }}
      onClick={handleDropdownClick}
    >
      {items.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <button
            key={index}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors cursor-pointer"
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
            {IconComponent && (
              <IconComponent className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Dropdown;