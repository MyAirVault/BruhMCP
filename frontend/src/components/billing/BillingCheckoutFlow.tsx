/**
 * Billing Checkout Flow - Multi-step checkout process with billing info collection
 * Handles billing address collection before directing to Razorpay
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown } from 'lucide-react';
import { BillingInfoForm } from './BillingInfoForm';
import { UpgradeButton } from './UpgradeButton';

type CheckoutStep = 'billing' | 'payment';

interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface BillingCheckoutFlowProps {
  onBack?: () => void;
}

export const BillingCheckoutFlow: React.FC<BillingCheckoutFlowProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('billing');
  const [billingData, setBillingData] = useState<{
    billingAddress: BillingAddress;
    selectedCardId?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('billing');
    } else if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleBillingSubmit = (data: { billingAddress: BillingAddress; selectedCardId?: string }) => {
    setBillingData(data);
    setCurrentStep('payment');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  const handlePaymentSuccess = () => {
    // This will be handled by the UpgradeButton component
    // which redirects to the success page
  };

  if (currentStep === 'billing') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <BillingInfoForm
            onSubmit={handleBillingSubmit}
            onCancel={onBack}
            isLoading={isProcessing}
          />
        </div>
      </div>
    );
  }

  // Payment step
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Billing Info
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Complete Your Purchase</h1>
                <p className="text-indigo-100">Confirm your billing information and proceed to payment</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}

            {/* Billing Address Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>
              {billingData && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{billingData.billingAddress.line1}</div>
                  {billingData.billingAddress.line2 && (
                    <div>{billingData.billingAddress.line2}</div>
                  )}
                  <div>
                    {billingData.billingAddress.city}, {billingData.billingAddress.state} {billingData.billingAddress.zipCode}
                  </div>
                  <div>{billingData.billingAddress.country}</div>
                </div>
              )}
              <button
                onClick={() => setCurrentStep('billing')}
                className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Edit billing address
              </button>
            </div>

            {/* Payment Method Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="text-sm text-gray-600">
                {billingData?.selectedCardId === 'new' || !billingData?.selectedCardId ? (
                  <div className="flex items-center gap-2">
                    <span>💳</span>
                    <span>New payment method will be added during checkout</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>💳</span>
                    <span>Saved card ending in ••••</span>
                  </div>
                )}
              </div>
            </div>

            {/* Plan Summary */}
            <div className="bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">Pro Plan</div>
                  <div className="text-sm text-gray-600">Monthly subscription</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">₹999/month</div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                • Unlimited MCP instances
                • Priority support
                • Advanced features
                • Cancel anytime
              </div>
            </div>

            {/* Payment Button */}
            <div className="pt-4">
              <UpgradeButton
                variant="primary"
                size="lg"
                fullWidth
                onError={handlePaymentError}
                onSuccess={handlePaymentSuccess}
              >
                Complete Purchase - ₹999/month
              </UpgradeButton>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Secure payment powered by Razorpay. Your subscription will start immediately.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};