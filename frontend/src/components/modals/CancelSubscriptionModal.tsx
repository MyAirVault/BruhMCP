import { useEffect } from 'react';
import { AlertTriangle, X, CreditCard } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Pro Subscription
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel your Pro subscription?
          </p>
          
          {/* Important information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  What happens when you cancel
                </h4>
                <p className="text-sm text-red-700">
                  You will continue to have access to Pro features until the end of your current billing period, after which your account will be downgraded to the free plan.
                </p>
              </div>
            </div>
          </div>

          {/* What you'll lose section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              You'll lose access to:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>Unlimited active instances</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>Extended instance duration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>Priority support</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                <span>Advanced features and integrations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors font-medium cursor-pointer w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium cursor-pointer flex items-center justify-center space-x-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Cancelling...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Yes, Cancel Subscription</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelSubscriptionModal;