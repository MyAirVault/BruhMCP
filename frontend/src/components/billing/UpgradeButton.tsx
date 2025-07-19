/**
 * Upgrade Button Component - CTA button for upgrading to Pro plan
 * Used in plan limit error messages and other upgrade prompts
 */

import React, { useState } from 'react';
import { Crown, ExternalLink, Loader2 } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface UpgradeButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);
      
      // Create checkout session
      const response = await apiService.post('/billing/checkout');
      const { checkoutUrl } = response.data;
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to start checkout';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Button style variants
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent',
    secondary: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent',
    outline: 'bg-white hover:bg-gray-50 text-indigo-600 border-indigo-600'
  };

  // Button sizes
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const buttonClasses = `
    inline-flex items-center justify-center gap-2 
    border font-medium rounded-md 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      onClick={handleUpgradeClick}
      disabled={isLoading}
      className={buttonClasses}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Crown className="h-4 w-4" />
      )}
      
      {children || 'Upgrade to Pro'}
      
      {!isLoading && (
        <ExternalLink className="h-3 w-3 opacity-70" />
      )}
    </button>
  );
};

/**
 * Upgrade CTA Component - Full upgrade call-to-action with pricing
 * Used in plan limit modals and error messages
 */
interface UpgradeCTAProps {
  title?: string;
  description?: string;
  showFeatures?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export const UpgradeCTA: React.FC<UpgradeCTAProps> = ({
  title = "Upgrade to Pro Plan",
  description = "Get unlimited MCP instances and premium features",
  showFeatures = true,
  onSuccess,
  onError,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-br from-indigo-50 to-yellow-50 rounded-lg p-6 border border-indigo-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0">
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      {/* Features List */}
      {showFeatures && (
        <div className="mb-6">
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              Unlimited active MCP instances
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              Priority customer support
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              Advanced features and integrations
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
              Early access to new features
            </li>
          </ul>
        </div>
      )}

      {/* Pricing and CTA */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">₹999</div>
          <div className="text-sm text-gray-500">per month</div>
        </div>
        
        <UpgradeButton
          variant="secondary"
          size="lg"
          onSuccess={onSuccess}
          onError={onError}
        >
          Start Pro Plan
        </UpgradeButton>
      </div>
    </div>
  );
};