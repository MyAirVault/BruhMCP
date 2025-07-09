import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MagicLinkPopupProps {
  email: string;
  onClose: () => void;
}

const MagicLinkPopup: React.FC<MagicLinkPopupProps> = ({ email, onClose }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  // Poll for authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setIsVerifying(true);
          // User is now authenticated, redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } catch {
        // Still not authenticated, continue waiting
      }
    };

    // Start polling every 2 seconds
    const interval = setInterval(checkAuthStatus, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Verification Successful!
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting you to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg 
              className="h-6 w-6 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Magic Link Sent!
          </h3>
          
          <p className="text-sm text-gray-500 mb-4">
            We've sent a magic link to <span className="font-medium text-gray-900">{email}</span>
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            Check your email and click the link to sign in. The link will expire in 15 minutes.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Development Note:</span> Check your console for the magic link in development mode.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkPopup;