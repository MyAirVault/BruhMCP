/**
 * Billing Information Form - Collects user billing details before checkout
 * Handles billing address and card management before directing to Razorpay
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  MapPin, 
  Check, 
  Plus,
  AlertCircle
} from 'lucide-react';
import { getBillingDetails, saveBillingDetails } from '../../services/billingDetailsService';
import type { CardInfo } from '../../types/billing';

interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface BillingInfoFormProps {
  onSubmit: (data: { billingAddress: BillingAddress; selectedCardId?: string }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const BillingInfoForm: React.FC<BillingInfoFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  // Form state
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'IN', // Default to India for Razorpay
    zipCode: ''
  });

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [errors, setErrors] = useState<Partial<BillingAddress & { general: string }>>({});

  // Load billing details and saved cards on component mount
  useEffect(() => {
    loadBillingDetails();
  }, []);

  const loadBillingDetails = async () => {
    try {
      const billingDetails = await getBillingDetails();
      
      if (billingDetails) {
        // Pre-fill form with existing billing details
        setBillingAddress({
          line1: billingDetails.address_line1,
          line2: billingDetails.address_line2 || '',
          city: billingDetails.city,
          state: billingDetails.state,
          country: billingDetails.country,
          zipCode: billingDetails.zip_code
        });

        // Convert CardInfo to SavedCard format
        const convertedCards: SavedCard[] = billingDetails.cards.map((card: CardInfo) => ({
          id: card.id,
          last4: card.last4,
          brand: card.brand,
          expMonth: card.exp_month,
          expYear: card.exp_year,
          isDefault: card.id === billingDetails.default_card_id
        }));
        
        setSavedCards(convertedCards);
        
        // Set default card as selected
        if (billingDetails.default_card_id) {
          setSelectedCardId(billingDetails.default_card_id);
        }
      }
    } catch (error) {
      console.error('Error loading billing details:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BillingAddress & { general: string }> = {};

    if (!billingAddress.line1.trim()) {
      newErrors.line1 = 'Address line 1 is required';
    }

    if (!billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!billingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!billingAddress.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Save billing details to backend
      await saveBillingDetails({
        address_line1: billingAddress.line1,
        address_line2: billingAddress.line2,
        city: billingAddress.city,
        state: billingAddress.state,
        country: billingAddress.country,
        zip_code: billingAddress.zipCode
      });

      // Call parent callback with form data
      onSubmit({
        billingAddress,
        selectedCardId: selectedCardId || undefined
      });
    } catch (error) {
      console.error('Error saving billing details:', error);
      setErrors({ general: 'Failed to save billing details. Please try again.' });
    }
  };

  const handleAddressChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">Billing Information</h2>
          <p className="text-indigo-100">Please provide your billing details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Saved Cards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h3>
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add New Card
              </button>
            </div>

            {/* Saved Cards List */}
            {savedCards.length > 0 ? (
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <label
                    key={card.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCardId === card.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedCard"
                      value={card.id}
                      checked={selectedCardId === card.id}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center flex-1 gap-3">
                      <span className="text-2xl">{getCardBrandIcon(card.brand)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          •••• •••• •••• {card.last4}
                        </div>
                        <div className="text-sm text-gray-600">
                          {card.brand.toUpperCase()} • Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                          {card.isDefault && (
                            <span className="ml-2 text-indigo-600 font-medium">Default</span>
                          )}
                        </div>
                      </div>
                      {selectedCardId === card.id && (
                        <Check className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No saved cards found. You'll add a payment method during checkout.
              </div>
            )}

            {/* Add New Card Option */}
            <label
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedCardId === 'new'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="selectedCard"
                value="new"
                checked={selectedCardId === 'new'}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center flex-1 gap-3">
                <Plus className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Add new payment method</div>
                  <div className="text-sm text-gray-600">You'll be prompted to add a card during checkout</div>
                </div>
                {selectedCardId === 'new' && (
                  <Check className="h-5 w-5 text-indigo-600" />
                )}
              </div>
            </label>
          </div>

          {/* Billing Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Billing Address
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Address Line 1 */}
              <div>
                <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  id="line1"
                  value={billingAddress.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.line1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Street address, P.O. box, company name"
                />
                {errors.line1 && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.line1}
                  </p>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label htmlFor="line2" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  id="line2"
                  value={billingAddress.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={billingAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={billingAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Country and ZIP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    id="country"
                    value={billingAddress.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
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
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.country}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    value={billingAddress.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ZIP code"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue to Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};