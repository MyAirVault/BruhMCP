/**
 * Plan Display Component - Shows current user plan (Free/Pro)
 * Replaces the "view all logs" section with plan information
 */

import React, { useState, useEffect } from 'react';
import { Crown, Zap, Users, Shield } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface BillingStatus {
  userId: string;
  plan: {
    type: 'free' | 'pro';
    maxInstances: number | null;
    paymentStatus: string;
    features: any;
    expiresAt: string | null;
    subscriptionId: string | null;
  };
  subscription?: any;
  canUpgrade: boolean;
}

interface PlanDisplayProps {
  onUpgradeClick?: () => void;
  className?: string;
}

export const PlanDisplay: React.FC<PlanDisplayProps> = ({ 
  onUpgradeClick, 
  className = '' 
}) => {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBillingStatus();
  }, []);

  const loadBillingStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get('/subscriptions/current');
      setBillingStatus(response.data);
    } catch (err: any) {
      console.error('Error loading billing status:', err);
      setError(err.message || 'Failed to load plan information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-red-600 text-sm">
          Error loading plan: {error}
        </div>
      </div>
    );
  }

  if (!billingStatus) {
    return null;
  }

  const { plan, canUpgrade } = billingStatus;
  const isPro = plan.type === 'pro' && plan.paymentStatus === 'active';

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Plan Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPro ? (
            <Crown className="h-5 w-5 text-yellow-500" />
          ) : (
            <Users className="h-5 w-5 text-gray-400" />
          )}
          <h3 className="text-lg font-medium">
            {isPro ? 'Pro Plan' : 'Free Plan'}
          </h3>
        </div>
        
        {isPro && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        )}
      </div>

      {/* Plan Features */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Zap className="h-4 w-4" />
          <span>
            {isPro ? 'Unlimited' : '1'} active MCP instance{isPro ? 's' : ''}
          </span>
        </div>
        
        {isPro && (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Crown className="h-4 w-4" />
              <span>Advanced features</span>
            </div>
          </>
        )}
      </div>

      {/* Upgrade Section */}
      {canUpgrade && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Upgrade to Pro
              </p>
              <p className="text-xs text-gray-500">
                Get unlimited instances and premium features
              </p>
            </div>
            <button
              onClick={onUpgradeClick}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Subscription Info for Pro Users */}
      {isPro && plan.expiresAt && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <div className="text-xs text-gray-500">
            Next billing: {new Date(plan.expiresAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};