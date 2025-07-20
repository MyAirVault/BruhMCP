/**
 * Billing Details Modal - Manage billing address and cards
 * Accessible from the user dropdown "Billings" option
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  CreditCard,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { BillingDetails, BillingDetailsInput, CardInfo } from '../../types/billing';
import {
  getBillingDetails,
  saveBillingDetails,
  removeCard,
  setDefaultCard,
  deleteBillingDetails
} from '../../services/billingDetailsService';

interface BillingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillingDetailsModal: React.FC<BillingDetailsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BillingDetailsInput>({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: 'IN',
    zip_code: ''
  });

  // Load billing details on modal open
  useEffect(() => {
    if (isOpen) {
      loadBillingDetails();
    }
  }, [isOpen]);

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
      } else {
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Error loading billing details:', error);
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
      setShowAddressForm(false);
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
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    if (!billingDetails) return;

    try {
      const updatedDetails = await setDefaultCard(cardId);
      setBillingDetails(updatedDetails);
    } catch (error) {
      console.error('Error setting default card:', error);
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
      setShowAddressForm(true);
    } catch (error) {
      console.error('Error deleting billing details:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Billing Details</h2>
            <p className="text-indigo-100">Manage your billing address and payment methods</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading billing details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Billing Address Section */}
              <div className="border-b pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Billing Address
                  </h3>
                  {billingDetails && !showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit Address
                    </button>
                  )}
                </div>

                {showAddressForm ? (
                  <div className="space-y-4">
                    {errors.general && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{errors.general}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Address
                      </button>
                      {billingDetails && (
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ) : billingDetails ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-900">
                      <div>{billingDetails.address_line1}</div>
                      {billingDetails.address_line2 && <div>{billingDetails.address_line2}</div>}
                      <div>
                        {billingDetails.city}, {billingDetails.state} {billingDetails.zip_code}
                      </div>
                      <div>{billingDetails.country}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No billing address found. Please add your billing details.
                  </div>
                )}
              </div>

              {/* Payment Methods Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                  </h3>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Card
                  </button>
                </div>

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
                  <div className="text-center py-4 text-gray-500">
                    No payment methods found. Add a card to get started.
                  </div>
                )}
              </div>

              {/* Danger Zone */}
              {billingDetails && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <button
                    onClick={handleDeleteAll}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Delete All Billing Details
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    This will permanently delete your billing address and all saved payment methods.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};