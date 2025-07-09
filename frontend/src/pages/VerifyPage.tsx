import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface VerificationState {
  status: 'loading' | 'success' | 'error';
  message?: string;
}

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>({ status: 'loading' });

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState({
        status: 'error',
        message: 'No authentication token found in URL'
      });
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
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
      } else {
        setState({
          status: 'error',
          message: data.error?.message || 'Verification failed'
        });
      }
    } catch (error) {
      setState({
        status: 'error',
        message: 'Network error occurred'
      });
      console.error('Verification error:', error);
    }
  };

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
            <p className="text-gray-600">You are now authenticated. You can close this window.</p>
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