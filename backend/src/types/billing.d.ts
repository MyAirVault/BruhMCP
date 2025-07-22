/**
 * Billing and payment related type definitions
 */

export interface UserPlan {
  plan_id?: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  max_instances: number | null;
  payment_status: 'active' | 'inactive' | 'cancelled' | 'processing';
  features: Record<string, any>;
  expires_at?: string | null;
  subscription_id?: string | null;
  customer_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RazorpayConfig {
  valid: boolean;
  missingVars?: string[];
}

export interface CheckoutSession {
  subscriptionId: string;
  amount: number;
  currency: string;
  customerId: string;
  razorpayKeyId: string;
  customerEmail: string;
  customerName: string;
}

export interface SubscriptionDetails {
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface CancellationResult {
  cancelledAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  cardLast4?: string;
  cardBrand?: string;
  createdAt: string;
  description?: string;
}