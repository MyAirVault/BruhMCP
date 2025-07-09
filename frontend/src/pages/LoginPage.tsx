
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MagicLinkPopup from '../components/MagicLinkPopup';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          // User is already authenticated, redirect to dashboard
          navigate('/dashboard');
        }
      } catch {
        // User is not authenticated, stay on login page
        console.log('Not authenticated, staying on login page');
      }
    };

    // Add a small delay to allow logout to complete properly
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowMagicLink(true);
      } else {
        setError(data.error?.message || 'Failed to send magic link');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header with logo */}
      <div className="p-4 sm:p-6 lg:p-8">
        <img
          src="/logo.svg"
          alt="Logo"
          className="h-8 sm:h-10 w-auto"
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-12">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
              Log in
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Continue to your workspace
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Enter your work email"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Sending...' : 'Continue with email'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                We'll email you a magic link for a password-free sign in.
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By clicking "Continue", you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Background overlay when popup is shown */}
      {showMagicLink && (
        <div
          className="fixed inset-0 bg-[#6B6B6B]/95 z-40"
          onClick={() => setShowMagicLink(false)}
        />
      )}

      {/* Magic Link Popup */}
      {showMagicLink && (
        <div className="fixed inset-0 flex items-center justify-center px-4 z-50">
          <MagicLinkPopup email={email} onClose={() => setShowMagicLink(false)} />
        </div>
      )}
    </div>
  );
};

export default LoginPage;