/**
 * Billing Details Service - Handles API calls for user billing information
 */

import type { BillingDetails, BillingDetailsInput } from '../types/billing';

const API_BASE = '/api/v1/billing-details';

/**
 * Get billing details for the authenticated user
 */
export const getBillingDetails = async (): Promise<BillingDetails | null> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // No billing details found
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch billing details: ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching billing details:', error);
    throw error;
  }
};

/**
 * Create or update billing details for the authenticated user
 */
export const saveBillingDetails = async (billingData: BillingDetailsInput): Promise<BillingDetails> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billingData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to save billing details: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error saving billing details:', error);
    throw error;
  }
};

/**
 * Add a card to user's billing details
 */
export const addCard = async (cardData: any, setAsDefault: boolean = false): Promise<BillingDetails> => {
  try {
    const response = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardData,
        setAsDefault,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add card: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error adding card:', error);
    throw error;
  }
};

/**
 * Remove a card from user's billing details
 */
export const removeCard = async (cardId: string): Promise<BillingDetails> => {
  try {
    const response = await fetch(`${API_BASE}/cards/${cardId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to remove card: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error removing card:', error);
    throw error;
  }
};

/**
 * Set a card as default
 */
export const setDefaultCard = async (cardId: string): Promise<BillingDetails> => {
  try {
    const response = await fetch(`${API_BASE}/cards/${cardId}/default`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to set default card: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error setting default card:', error);
    throw error;
  }
};

/**
 * Delete billing details for the authenticated user
 */
export const deleteBillingDetails = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_BASE, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete billing details: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting billing details:', error);
    throw error;
  }
};