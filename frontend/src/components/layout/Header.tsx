import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDropdown } from '../../hooks/useDropdown';
import { logout } from '../../services/authService';
import { CreditCard, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  userName?: string;
}

const Header: React.FC<HeaderProps> = ({ userName = 'John Smith' }) => {
  const { userDropdownOpen, handleUserDropdownToggle, setUserDropdownOpen } = useDropdown();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isProfilePage = location.pathname === '/profile';

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
          {!isProfilePage && (
            <div className="relative dropdown-container">
              <button
                onClick={handleUserDropdownToggle}
                className="flex items-center space-x-2 p-2 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-icon lucide-user">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="text-sm font-normal text-black hidden sm:block">{userName}</span>
                <span className="text-sm font-normal text-black sm:hidden">{userName.split(' ')[0]}</span>
              </button>

              {userDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-[180px] rounded-lg shadow-lg py-1 z-50"
                style={{ 
                  backgroundColor: 'var(--dropdown-bg-default)', 
                  border: '1px solid var(--dropdown-border)' 
                }}
              >
                {/* Profile navigation commented out as profile section is not implemented yet */}
                {/* <button
                  onClick={() => {
                    navigate('/profile');
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
                </button> */}
                <button
                  onClick={() => {
                    navigate('/billing');
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
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;