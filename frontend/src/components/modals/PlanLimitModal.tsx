import { useEffect } from 'react';
import { AlertTriangle, X, CreditCard } from 'lucide-react';

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  title: string;
  message: string;
}

const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  title,
  message
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
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
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
            {message}
          </p>
          
          {/* Plan limitation explanation */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-800 mb-1">
                  Free Plan Limitation
                </h4>
                <p className="text-sm text-orange-700">
                  Your free plan allows only 1 active instance at a time. To activate or renew additional instances, please upgrade to a paid plan.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Upgrade benefits:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Multiple active instances</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Extended instance duration</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Priority support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors font-medium cursor-pointer w-full sm:w-auto"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              onUpgrade();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium cursor-pointer flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <CreditCard className="w-4 h-4" />
            <span>Upgrade Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanLimitModal;