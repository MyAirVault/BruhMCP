import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto px-4 sm:px-6 md:px-16 lg:px-20 xl:px-32">
        <div className="py-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />
              <span className="text-sm text-gray-500">© 2025 bruhMCP. All rights reserved.</span>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;