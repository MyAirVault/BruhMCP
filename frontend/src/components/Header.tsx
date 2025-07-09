import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropdown } from '../hooks/useDropdown';
import { logout } from '../services/authService';

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-lg sm:text-xl font-normal text-black">Logo</span>
          </div>
          <div className="relative dropdown-container">
            <button
              onClick={handleUserDropdownToggle}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <span className="text-sm font-normal text-black hidden sm:block">{userName}</span>
              <span className="text-sm font-normal text-black sm:hidden">{userName.split(' ')[0]}</span>
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {userDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    console.log('My Profile');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    console.log('Billings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Billings
                </button>
                <button
                  onClick={() => {
                    console.log('Settings');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 bg-gray-50 transition-colors cursor-pointer"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Sign out
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