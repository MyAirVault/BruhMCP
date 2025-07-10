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
        const response = await fetch('/auth/me', {
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md h-[300px] shadow-lg z-50 flex flex-col justify-center">
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
    );
  }

  return (
    <div
      className="bg-white rounded-lg p-6 w-full max-w-md h-[300px] relative shadow-lg z-50 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center flex-1 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Check your inbox
        </h3>

        <p className="text-sm text-gray-700 mb-2">
          We've sent a sign in link to:
        </p>

        <p className="text-sm font-medium text-gray-900 mb-6">
          {email}
        </p>

        <p className="text-sm text-gray-600 mb-6">
          Click the link in the email to sign in instantly. The link expires in 24 hours.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-black text-white px-4 py-3 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MagicLinkPopup;