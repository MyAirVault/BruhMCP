/**
 * Billing Page - Dedicated page for managing billing details
 * Accessible from the user dropdown "Billings" option
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { BillingDetails, BillingDetailsInput, CardInfo } from '../types/billing';
import {
  getBillingDetails,
  saveBillingDetails,
  removeCard,
  setDefaultCard,
  deleteBillingDetails
} from '../services/billingDetailsService';

export const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="text-gray-600">Loading billing details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">Billing Details</h1>
            <p className="text-gray-600 mt-1">Manage your billing address and payment methods</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Billing details saved successfully!</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
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
                  Payment Methods
                </h2>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Card
                </button>
              </div>
            </div>

            <div className="p-6">
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No payment methods</p>
                  <p className="text-sm">Add a card to get started with Pro features</p>
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
  );
};