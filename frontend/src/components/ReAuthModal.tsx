/**
 * Re-authentication Modal Component
 * Handles OAuth re-authentication flow when tokens expire
 */

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface ReAuthModalProps {
  isOpen: boolean;
  instanceId: string;
  instanceName?: string;
  serviceName?: string;
  onSuccess: () => void;
  onClose: () => void;
  onError?: (error: string) => void;
}

interface AuthStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export const ReAuthModal: React.FC<ReAuthModalProps> = ({
  isOpen,
  instanceId,
  instanceName,
  serviceName = 'Gmail',
  onSuccess,
  onClose,
  onError
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({ status: 'idle' });
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);

  // Clean up popup window on unmount
  useEffect(() => {
    return () => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

  // Handle OAuth popup messages
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type, instanceId: messageInstanceId, error } = event.data;

      // Only handle messages for this instance
      if (messageInstanceId !== instanceId) {
        return;
      }

      if (type === 'OAUTH_SUCCESS') {
        setAuthStatus({ status: 'success', message: 'Re-authentication successful!' });
        
        // Close popup
        if (popupWindow) {
          popupWindow.close();
          setPopupWindow(null);
        }

        // Delay success callback to show success message
        setTimeout(() => {
          onSuccess();
        }, 1500);

      } else if (type === 'OAUTH_ERROR') {
        const errorMessage = error || 'Authentication failed. Please try again.';
        setAuthStatus({ status: 'error', message: errorMessage });
        
        // Close popup
        if (popupWindow) {
          popupWindow.close();
          setPopupWindow(null);
        }

        if (onError) {
          onError(errorMessage);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, instanceId, popupWindow, onSuccess, onError]);

  const handleReAuthenticate = async () => {
    if (authStatus.status === 'loading') return;

    setAuthStatus({ status: 'loading', message: 'Starting re-authentication...' });

    try {
      // Call re-authentication endpoint
      const response = await fetch(`/api/gmail/${instanceId}/reauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start re-authentication');
      }

      const data = await response.json();
      
      if (!data.authorizationUrl) {
        throw new Error('No authorization URL received');
      }

      setAuthStatus({ status: 'loading', message: 'Opening authentication window...' });

      // Open OAuth popup
      const popup = window.open(
        data.authorizationUrl,
        'oauth_reauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Failed to open authentication window. Please allow popups for this site.');
      }

      setPopupWindow(popup);
      setAuthStatus({ status: 'loading', message: 'Please complete authentication in the popup window...' });

      // Monitor popup for manual closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setPopupWindow(null);
          
          // Only set error if we haven't already received a success/error message
          if (authStatus.status === 'loading') {
            setAuthStatus({ 
              status: 'error', 
              message: 'Authentication window was closed. Please try again.' 
            });
          }
        }
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthStatus({ status: 'error', message: errorMessage });
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleClose = () => {
    // Close popup if open
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
      setPopupWindow(null);
    }
    
    // Reset status
    setAuthStatus({ status: 'idle' });
    
    onClose();
  };

  const getStatusIcon = () => {
    switch (authStatus.status) {
      case 'loading':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (authStatus.status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Re-authentication Required
          </h3>
          <button
            onClick={handleClose}
            disabled={authStatus.status === 'loading'}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Your {serviceName} authorization has expired for:
            </p>
            <p className="font-medium text-gray-900">
              {instanceName || `Instance ${instanceId.substring(0, 8)}...`}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              To continue using this service, you need to re-authenticate with {serviceName}. 
              This will open a new window where you can grant permissions again.
            </p>
          </div>

          {/* Status Display */}
          {authStatus.status !== 'idle' && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {authStatus.message}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleReAuthenticate}
              disabled={authStatus.status === 'loading'}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {authStatus.status === 'loading' ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Re-authenticate'
              )}
            </button>
            
            <button
              onClick={handleClose}
              disabled={authStatus.status === 'loading'}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500">
            💡 If the popup doesn't appear, make sure popup blocking is disabled for this site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReAuthModal;