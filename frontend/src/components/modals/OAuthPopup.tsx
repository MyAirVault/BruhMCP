import React, { useEffect, useState, useRef } from 'react';

interface OAuthPopupProps {
  authorizationUrl: string;
  provider: string;
  instanceId: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

const OAuthPopup: React.FC<OAuthPopupProps> = ({ 
  authorizationUrl, 
  provider, 
  instanceId, 
  onSuccess, 
  onError, 
  onClose 
}) => {
  const [status, setStatus] = useState<'opening' | 'waiting' | 'processing' | 'success' | 'error'>('opening');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Provider-specific branding
  const getProviderInfo = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return {
          name: 'Google',
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case 'microsoft':
        return {
          name: 'Microsoft',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          name: provider,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const providerInfo = getProviderInfo(provider);

  // Handle OAuth flow
  useEffect(() => {
    const openPopup = () => {
      try {
        const popup = window.open(
          authorizationUrl,
          `oauth_${provider}_${instanceId}`,
          'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes'
        );

        if (!popup) {
          setStatus('error');
          setErrorMessage('Popup blocked. Please allow popups and try again.');
          return;
        }

        popupRef.current = popup;
        setStatus('waiting');

        // Monitor popup for completion
        intervalRef.current = setInterval(() => {
          try {
            if (popup.closed) {
              setStatus('error');
              setErrorMessage('OAuth cancelled by user');
              clearInterval(intervalRef.current!);
              return;
            }

            // Check if popup redirected back to our domain
            try {
              const popupUrl = popup.location.href;
              if (popupUrl.includes(window.location.origin)) {
                // OAuth callback received, close popup and process result
                popup.close();
                setStatus('processing');
                clearInterval(intervalRef.current!);
                
                // Give a moment for the callback to process
                setTimeout(() => {
                  setStatus('success');
                  onSuccess({ instanceId, provider });
                }, 1000);
              }
            } catch (e) {
              // Cross-origin error is expected during OAuth flow
              // Continue monitoring
            }
          } catch (error) {
            console.error('Error monitoring popup:', error);
          }
        }, 1000);

      } catch (error) {
        setStatus('error');
        setErrorMessage('Failed to open OAuth popup');
        console.error('OAuth popup error:', error);
      }
    };

    openPopup();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, [authorizationUrl, provider, instanceId, onSuccess]);

  // Listen for OAuth completion messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS') {
        if (event.data.instanceId === instanceId) {
          setStatus('success');
          onSuccess(event.data);
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        if (event.data.instanceId === instanceId) {
          setStatus('error');
          setErrorMessage(event.data.error || 'OAuth failed');
          onError(event.data.error || 'OAuth failed');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [instanceId, onSuccess, onError]);

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    onClose();
  };

  const handleRetry = () => {
    setStatus('opening');
    setErrorMessage('');
    // Component will re-open popup via useEffect
  };

  return (
    <div
      className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg z-50 flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center">
        {/* Provider badge */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${providerInfo.bgColor} ${providerInfo.textColor} ${providerInfo.borderColor} border mb-4`}>
          {providerInfo.name} OAuth
        </div>

        {status === 'opening' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Opening {providerInfo.name} Authorization
            </h3>
            <p className="text-sm text-gray-500">
              A popup window should open shortly...
            </p>
          </>
        )}

        {status === 'waiting' && (
          <>
            <div className="animate-pulse rounded-full h-12 w-12 bg-blue-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Waiting for Authorization
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please complete the authorization in the popup window.
            </p>
            <p className="text-xs text-gray-400">
              This window will close automatically when complete.
            </p>
          </>
        )}

        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Processing Authorization
            </h3>
            <p className="text-sm text-gray-500">
              Completing setup...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="rounded-full h-12 w-12 bg-green-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Authorization Successful!
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Your {providerInfo.name} account has been connected.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium transition-colors"
            >
              Continue
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="rounded-full h-12 w-12 bg-red-100 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Authorization Failed
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {errorMessage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthPopup;