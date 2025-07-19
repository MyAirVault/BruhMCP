/**
 * Checkout Page Component - Payment page for Pro plan subscription
 * Handles the checkout flow and success/error states
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Check, 
  ArrowLeft, 
  AlertCircle, 
  Loader2,
  CreditCard,
  Shield,
  Zap
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { UpgradeButton } from './UpgradeButton';

type CheckoutState = 'loading' | 'checkout' | 'processing' | 'success' | 'error' | 'cancelled';

interface CheckoutPageProps {
  onBack?: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [state, setState] = useState<CheckoutState>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const cancelled = searchParams.get('cancelled');

    if (cancelled === 'true') {
      setState('cancelled');
    } else if (sessionId) {
      handleCheckoutSuccess(sessionId);
    } else {
      setState('checkout');
    }
  }, [searchParams]);

  const handleCheckoutSuccess = async (sessionId: string) => {
    try {
      setState('processing');
      
      // Notify backend of successful checkout
      await apiService.post('/billing/success', { sessionId });
      
      setState('success');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error processing checkout success:', error);
      setError(error.response?.data?.error?.message || 'Failed to process payment');
      setState('error');
    }
  };

  const handleUpgradeError = (errorMessage: string) => {
    setError(errorMessage);
    setState('error');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Setting up your checkout</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pro!</h2>
          <p className="text-gray-600 mb-4">
            Your Pro plan is now active. You can create unlimited MCP instances.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <UpgradeButton
              fullWidth
              onError={handleUpgradeError}
            >
              Try Again
            </UpgradeButton>
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled state
  if (state === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Cancelled</h2>
          <p className="text-gray-600 mb-4">
            Your payment was cancelled. No charges were made.
          </p>
          <div className="space-y-3">
            <UpgradeButton
              fullWidth
              onError={handleUpgradeError}
            >
              Try Again
            </UpgradeButton>
            <button
              onClick={handleBack}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  if (state === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment...</h2>
            <p className="text-gray-600">Please wait while we activate your Pro plan</p>
          </div>
        </div>
      </div>
    );
  }

  // Default checkout state
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Upgrade to Pro Plan</h1>
                <p className="text-indigo-100">Unlock unlimited MCP instances and premium features</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Features */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What's included:</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Unlimited MCP Instances</div>
                    <div className="text-sm text-gray-600">Create as many instances as you need</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Priority Support</div>
                    <div className="text-sm text-gray-600">Get help when you need it most</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Crown className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Advanced Features</div>
                    <div className="text-sm text-gray-600">Access to premium integrations and tools</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Cancel Anytime</div>
                    <div className="text-sm text-gray-600">No long-term commitment required</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing and Checkout */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">₹999</div>
                <div className="text-gray-600">per month</div>
                <div className="text-sm text-gray-500 mt-1">Billed monthly, cancel anytime</div>
              </div>

              <UpgradeButton
                variant="primary"
                size="lg"
                fullWidth
                onError={handleUpgradeError}
              >
                Start Pro Plan
              </UpgradeButton>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Secure payment powered by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};