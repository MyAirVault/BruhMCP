/**
 * Types for billing details and related functionality
 */

export interface BillingDetails {
  billing_id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  cards: CardInfo[];
  default_card_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BillingDetailsInput {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  cards?: CardInfo[];
  default_card_id?: string;
}

export interface CardInfo {
  id: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  fingerprint?: string;
  funding?: string;
  name?: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}