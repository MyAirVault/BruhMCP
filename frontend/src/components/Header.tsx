import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropdown } from '../hooks/useDropdown';
import { logout } from '../services/authService';
import { User, CreditCard, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ userName = 'John Smith' }) => {
  const { userDropdownOpen, handleUserDropdownToggle, setUserDropdownOpen } = useDropdown();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="shadow-sm" style={{ backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--header-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src="/logo.svg" alt="airvault-logo" />
          </div>
          <div className="relative dropdown-container">
            <button
              onClick={handleUserDropdownToggle}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--header-button-bg)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--header-button-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--header-button-bg)';
              }}
            >
              <span className="text-sm font-normal text-black hidden sm:block">{userName}</span>
              <span className="text-sm font-normal text-black sm:hidden">{userName.split(' ')[0]}</span>
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-[180px] rounded-lg shadow-lg py-1 z-50"
                style={{ 
                  backgroundColor: 'var(--dropdown-bg-default)', 
                  border: '1px solid var(--dropdown-border)' 
                }}
              >
                <button
                  onClick={() => {
                    console.log('My Profile');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer flex items-center gap-3"
                  style={{ color: 'var(--dropdown-text-default)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dropdown-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">My Profile</span>
                </button>
                <button
                  onClick={() => {
                    console.log('Billings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer flex items-center gap-3"
                  style={{ color: 'var(--dropdown-text-default)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dropdown-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <CreditCard className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Billings</span>
                </button>
                <button
                  onClick={() => {
                    console.log('Settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer flex items-center gap-3"
                  style={{ color: 'var(--dropdown-text-default)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dropdown-bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Settings</span>
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer flex items-center gap-3"
                  style={{ color: 'var(--dropdown-text-danger)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dropdown-bg-hover-danger)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;