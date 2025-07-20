/**
 * Billing Page - Dedicated page for managing billing details
 * Accessible from the user dropdown "Billings" option
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Trash2,
  Star,
  AlertCircle,
  Loader2,
  CheckCircle,
  Crown,
  Calendar,
  Receipt,
  RefreshCw
} from 'lucide-react';
import CountryDropdown from '../components/ui/CountryDropdown';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import type { BillingDetails, BillingDetailsInput, CardInfo } from '../types/billing';
import {
  getBillingDetails,
  saveBillingDetails,
  removeCard,
  setDefaultCard,
  deleteBillingDetails
} from '../services/billingDetailsService';
import { apiService } from '../services/apiService';
import CancelSubscriptionModal from '../components/modals/CancelSubscriptionModal';

export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { userName, isLoading: authLoading } = useAuth();
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [userPlan, setUserPlan] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [razorpaySavedCards, setRazorpaySavedCards] = useState<any[]>([]);
  const [isLoadingSavedCards, setIsLoadingSavedCards] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BillingDetailsInput>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'IN',
    zip_code: ''
  });

  // Load billing details and user plan on page load
  useEffect(() => {
    loadBillingDetails();
    loadUserPlan();
    loadPaymentHistory();
    loadSubscriptionDetails();
  }, []);

  const loadUserPlan = async () => {
    try {
      const plan = await apiService.getUserPlan();
      setUserPlan(plan);
    } catch (error) {
      console.error('Error loading user plan:', error);
    }
  };

  const loadPaymentHistory = async () => {
    setIsLoadingPayments(true);
    try {
      const response = await apiService.getPaymentHistory({ limit: 10 });
      setPaymentHistory(response.payments);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const loadSubscriptionDetails = async () => {
    setIsLoadingSubscription(true);
    try {
      const details = await apiService.getSubscriptionDetails();
      setSubscriptionDetails(details);
      
      // If we have a customer ID, load saved cards
      if (details?.customerId) {
        loadRazorpaySavedCards();
      }
    } catch (error) {
      console.error('Error loading subscription details:', error);
      // Don't show error for users without subscription
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const loadRazorpaySavedCards = async () => {
    setIsLoadingSavedCards(true);
    try {
      const response = await apiService.getRazorpaySavedCards();
      setRazorpaySavedCards(response.cards);
    } catch (error) {
      console.error('Error loading Razorpay saved cards:', error);
      setRazorpaySavedCards([]);
    } finally {
      setIsLoadingSavedCards(false);
    }
  };

  const loadBillingDetails = async () => {
    setIsLoading(true);
    try {
      const details = await getBillingDetails();
      setBillingDetails(details);

      if (details) {
        setFormData({
          address_line1: details.address_line1,
          address_line2: details.address_line2 || '',
          city: details.city,
          state: details.state,
          country: details.country,
          zip_code: details.zip_code
        });
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

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const savedDetails = await saveBillingDetails({
        ...formData,
        cards: billingDetails?.cards || []
      });
      setBillingDetails(savedDetails);
      setSuccessMessage('Billing details saved successfully!');
      setShowSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving billing details:', error);
      setErrors({ general: 'Failed to save billing details. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    if (!billingDetails) return;

    try {
      const updatedDetails = await removeCard(cardId);
      setBillingDetails(updatedDetails);
    } catch (error) {
      console.error('Error removing card:', error);
      setErrors({ general: 'Failed to remove card. Please try again.' });
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    if (!billingDetails) return;

    try {
      const updatedDetails = await setDefaultCard(cardId);
      setBillingDetails(updatedDetails);
    } catch (error) {
      console.error('Error setting default card:', error);
      setErrors({ general: 'Failed to set default card. Please try again.' });
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all billing details? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBillingDetails();
      setBillingDetails(null);
      setFormData({
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        country: 'IN',
        zip_code: ''
      });
    } catch (error) {
      console.error('Error deleting billing details:', error);
      setErrors({ general: 'Failed to delete billing details. Please try again.' });
    }
  };

  const handleStartProPlan = () => {
    navigate('/checkout');
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await apiService.cancelSubscription();
      // Reload user plan to get updated status
      await loadUserPlan();
      await loadSubscriptionDetails();
      setShowCancelModal(false);
      setSuccessMessage('Subscription cancelled successfully. You will continue to have access until the end of your billing period.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setErrors({ general: 'Failed to cancel subscription. Please try again.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRefreshPaymentData = async () => {
    await Promise.all([
      loadBillingDetails(),
      loadPaymentHistory(),
      loadSubscriptionDetails()
    ]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout userName={userName}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="text-gray-600">Loading billing details...</span>
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
              <CreditCard className="w-8 h-8 text-gray-700" />
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Billing Details
              </h1>
            </div>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{successMessage}</span>
                  </div>
                  <img src="/logo.svg" alt="Logo" className="h-5 w-auto opacity-60" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Billing Address Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Billing Address
                </h2>
              </div>

              <div className="p-6">
                {errors.general && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errors.general}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={formData.address_line1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.address_line1 ? 'border-red-500' : 'border-gray-300'
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.city ? 'border-red-500' : 'border-gray-300'
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.state ? 'border-red-500' : 'border-gray-300'
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
                      <CountryDropdown
                        value={formData.country}
                        onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                        error={!!errors.country}
                      />
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
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.zip_code ? 'border-red-500' : 'border-gray-300'
                          }`}
                        placeholder="ZIP code"
                      />
                      {errors.zip_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Save Billing Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payments
                  </h2>
                  <button
                    onClick={handleRefreshPaymentData}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Refresh payment data"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Subscription Status and Actions */}
                <div className="mb-6">
                  {userPlan?.plan?.type === 'pro' && subscriptionDetails?.cancelAtPeriodEnd !== true ? (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Crown className="h-6 w-6 text-yellow-500" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Pro Plan Active</h3>
                            <p className="text-sm text-gray-600">You have access to all Pro features</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
                        >
                          Cancel Subscription
                        </button>
                      </div>
                    </div>
                  ) : userPlan?.plan?.type === 'pro' && subscriptionDetails?.cancelAtPeriodEnd === true ? (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-6 w-6 text-red-500" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Subscription Cancelled</h3>
                            <p className="text-sm text-gray-600">
                              You have access until {subscriptionDetails?.currentPeriodEnd ? formatDate(subscriptionDetails.currentPeriodEnd) : 'the end of your billing period'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleStartProPlan}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
                        >
                          <Crown className="h-4 w-4" />
                          Reactivate Pro Plan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-6 w-6 text-yellow-500" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Upgrade to Pro</h3>
                            <p className="text-sm text-gray-600">Get unlimited instances and premium features</p>
                          </div>
                        </div>
                        <button
                          onClick={handleStartProPlan}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
                        >
                          <Crown className="h-4 w-4" />
                          Start Pro Plan
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Razorpay Saved Cards Section */}
                {userPlan?.plan?.type === 'pro' && subscriptionDetails?.customerId && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Payment Methods from Razorpay</h3>
                    {isLoadingSavedCards ? (
                      <div className="flex items-center justify-center py-4 border border-gray-200 rounded-md">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        <span className="ml-2 text-sm text-gray-600">Loading saved cards...</span>
                      </div>
                    ) : razorpaySavedCards.length > 0 ? (
                      <div className="space-y-2">
                        {razorpaySavedCards.map((card: any) => (
                          <div
                            key={card.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  •••• •••• •••• {card.last4}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {card.network?.toUpperCase()} • Expires {card.expiryMonth}/{card.expiryYear}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-gray-200 rounded-md">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">No saved cards in Razorpay</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Methods */}
                {billingDetails?.cards && billingDetails.cards.length > 0 ? (
                  <div className="space-y-3">
                    {billingDetails.cards.map((card: CardInfo) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCardBrandIcon(card.brand)}</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              •••• •••• •••• {card.last4}
                            </div>
                            <div className="text-sm text-gray-600">
                              {card.brand.toUpperCase()} • Expires {String(card.exp_month).padStart(2, '0')}/{card.exp_year}
                              {billingDetails.default_card_id === card.id && (
                                <span className="ml-2 text-indigo-600 font-medium">Default</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {billingDetails.default_card_id !== card.id && (
                            <button
                              onClick={() => handleSetDefaultCard(card.id)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Set as default"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveCard(card.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove card"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Subscription Details Section */}
            {userPlan?.plan?.type === 'pro' && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Subscription Details
                  </h2>
                </div>
                <div className="p-6">
                  {isLoadingSubscription ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      <span className="ml-2 text-gray-600">Loading subscription details...</span>
                    </div>
                  ) : subscriptionDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Plan</label>
                          <p className="text-lg font-semibold text-gray-900">{subscriptionDetails.planName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Amount</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(subscriptionDetails.amount, subscriptionDetails.currency)} / {subscriptionDetails.interval}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <p className={`text-lg font-semibold capitalize ${
                            subscriptionDetails.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {subscriptionDetails.status}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Current Period</label>
                          <p className="text-gray-900">
                            {formatDate(subscriptionDetails.currentPeriodStart)} - {formatDate(subscriptionDetails.currentPeriodEnd)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Next Billing</label>
                          <p className="text-lg font-semibold text-gray-900">
                            {subscriptionDetails.cancelAtPeriodEnd ? 'Cancelled' : formatDate(subscriptionDetails.nextBilling)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Unable to load subscription details</p>
                  )}
                </div>
              </div>
            )}

            {/* Payment History Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Payment History
                </h2>
              </div>
              <div className="p-6">
                {isLoadingPayments ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                    <span className="ml-2 text-gray-600">Loading payment history...</span>
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {payment.cardBrand && (
                              <span className="text-xl">{getCardBrandIcon(payment.cardBrand)}</span>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {formatCurrency(payment.amount, payment.currency)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {payment.description}
                                {payment.cardLast4 && ` • •••• ${payment.cardLast4}`}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium capitalize ${
                            payment.status === 'captured' ? 'text-green-600' : 
                            payment.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {payment.status}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No payment history</p>
                    <p className="text-sm">Your payment transactions will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            {billingDetails && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200">
                <div className="px-6 py-4 border-b border-red-200">
                  <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Delete all billing details</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        This will permanently delete your billing address and all saved payment methods.
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAll}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Cancellation Modal */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isLoading={isCancelling}
      />
    </Layout>
  );
};