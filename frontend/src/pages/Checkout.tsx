/**
 * Checkout Page - Shows billing details with Pro plan features for upgrade
 * Displays billing info if available, or shows form to enter details
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Crown,
  MapPin,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import type { BillingDetails, BillingDetailsInput } from '../types/billing';
import { getBillingDetails, saveBillingDetails } from '../services/billingDetailsService';
import { apiService } from '../services/apiService';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { userName, isLoading: authLoading } = useAuth();
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBillingForm, setShowBillingForm] = useState(false);

  // Form state for when billing details don't exist
  const [formData, setFormData] = useState<BillingDetailsInput>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'IN',
    zip_code: ''
  });

  // Load billing details on page load
  useEffect(() => {
    loadBillingDetails();
  }, []);

  const loadBillingDetails = async () => {
    setIsLoading(true);
    try {
      const details = await getBillingDetails();
      setBillingDetails(details);
      
      if (!details) {
        setShowBillingForm(true);
      }
    } catch (error) {
      console.error('Error loading billing details:', error);
      setErrors({ general: 'Failed to load billing details. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.address_line1.trim()) {
      newErrors.address_line1 = 'Address line 1 is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBillingDetails = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const savedDetails = await saveBillingDetails(formData);
      setBillingDetails(savedDetails);
      setShowBillingForm(false);
    } catch (error) {
      console.error('Error saving billing details:', error);
      setErrors({ general: 'Failed to save billing details. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartProPlan = async () => {
    if (!billingDetails) {
      setErrors({ general: 'Please save your billing details first.' });
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Create checkout session
      const checkoutData = await apiService.createCheckoutSession();
      
      // Initialize Razorpay checkout
      const options = {
        key: checkoutData.razorpayKeyId,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: 'MCP Platform',
        description: 'Pro Plan Subscription',
        order_id: checkoutData.orderId,
        prefill: {
          name: checkoutData.customerName,
          email: checkoutData.customerEmail,
        },
        handler: async (paymentResponse: any) => {
          try {
            console.log('Payment successful:', paymentResponse);
            await apiService.handleCheckoutSuccess(checkoutData.subscriptionId);
            
            // Redirect to dashboard with success message
            navigate('/?upgrade=success');
          } catch (error: any) {
            console.error('Error handling payment success:', error);
            setErrors({ general: 'Payment successful but failed to activate plan. Please contact support.' });
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          }
        },
        theme: {
          color: '#4F46E5'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to start checkout';
      setErrors({ general: errorMessage });
      setIsProcessingPayment(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout userName={userName}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="text-gray-600">Loading checkout...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userName={userName}>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Upgrade to Pro Plan
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Billing Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Billing Address
                </h2>
              </div>

              <div className="p-6">
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errors.general}</span>
                    </div>
                  </div>
                )}

                {showBillingForm ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Please enter your billing details to continue with the Pro plan upgrade.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={formData.address_line1}
                        onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          errors.address_line1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Street address, P.O. box, company name"
                      />
                      {errors.address_line1 && (
                        <p className="mt-1 text-sm text-red-600">{errors.address_line1}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.address_line2}
                        onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City"
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.state ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="State"
                        />
                        {errors.state && (
                          <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.country ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="IN">India</option>
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                        </select>
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          value={formData.zip_code}
                          onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            errors.zip_code ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="ZIP code"
                        />
                        {errors.zip_code && (
                          <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveBillingDetails}
                      disabled={isSaving}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Billing Details
                    </button>
                  </div>
                ) : billingDetails ? (
                  <div>
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{billingDetails.address_line1}</div>
                        {billingDetails.address_line2 && <div>{billingDetails.address_line2}</div>}
                        <div>
                          {billingDetails.city}, {billingDetails.state} {billingDetails.zip_code}
                        </div>
                        <div>{billingDetails.country}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/billing')}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit billing details
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No billing details found.</p>
                    <button
                      onClick={() => setShowBillingForm(true)}
                      className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Add billing details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Plan Details */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <div className="bg-gradient-to-br from-indigo-50 to-yellow-50 rounded-lg border border-indigo-200 p-6">
              {/* Company branding */}
              <div className="flex items-center justify-center mb-6">
                <img src="/logo.svg" alt="Logo" className="h-8 w-auto opacity-80" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Crown className="h-8 w-8 text-yellow-500" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Pro Plan</h3>
                  <p className="text-gray-600">Unlimited power for professionals</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₹999</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Billed monthly, cancel anytime</p>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900">What's included:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Unlimited active MCP instances</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Priority customer support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Advanced features and integrations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Early access to new features</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Enhanced security and compliance</span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <button
                onClick={handleStartProPlan}
                disabled={!billingDetails || isProcessingPayment}
                className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5" />
                    Start Pro Plan
                    <ExternalLink className="h-4 w-4 opacity-70" />
                  </>
                )}
              </button>

              {!billingDetails && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Please save your billing details first
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Secure Payment</span>
                </div>
                <img src="/logo.svg" alt="Logo" className="h-4 w-auto opacity-40" />
              </div>
              <p className="text-xs text-gray-600">
                Your payment information is processed securely through Razorpay. 
                We never store your card details on our servers.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};