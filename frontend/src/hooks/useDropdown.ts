import { useState, useEffect } from 'react';

export const useDropdown = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleDropdownToggle = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleUserDropdownToggle = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownOpen || openDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown-container')) {
          closeDropdowns();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen, openDropdown]);

  return {
    openDropdown,
    userDropdownOpen,
    handleDropdownToggle,
    handleUserDropdownToggle,
    closeDropdowns,
    setUserDropdownOpen
  };
};