import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface VerificationState {
  status: 'loading' | 'success' | 'error';
  message?: string;
}

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState>({ status: 'loading' });

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        setState({
          status: 'success',
          message: 'Authentication successful!'
        });
        // Redirect to dashboard after successful verification
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setState({
          status: 'error',
          message: data.error?.message || 'Verification failed'
        });
      }
    } catch (error) {
      // Check if user is actually authenticated despite error
      try {
        const authCheck = await fetch('/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (authCheck.ok) {
          // User is authenticated, redirect to dashboard
          navigate('/dashboard');
          return;
        }
      } catch {
        // Auth check failed, show original error
      }

      setState({
        status: 'error',
        message: 'Network error occurred'
      });
      console.error('Verification error:', error);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated first
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          // User is already authenticated, redirect to dashboard
          navigate('/dashboard');
          return true;
        }
      } catch {
        // User is not authenticated, continue with verification
      }
      return false;
    };

    const handleVerification = async () => {
      // Check if already authenticated first
      if (await checkAuth()) {
        return;
      }

      const token = searchParams.get('token');

      if (!token) {
        setState({
          status: 'error',
          message: 'No authentication token found in URL'
        });
        return;
      }

      verifyToken(token);
    };

    handleVerification();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
        {state.status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your authentication...</p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="text-green-600">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold mb-2">Authentication Successful!</h2>
            <p className="text-gray-600 mb-4">You are now authenticated. Redirecting to dashboard...</p>
            <div className="animate-pulse bg-blue-500 text-white px-4 py-2 rounded-md">
              Redirecting...
            </div>
          </div>
        )}

        {state.status === 'error' && (
          <div className="text-red-600">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-gray-600">{state.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}