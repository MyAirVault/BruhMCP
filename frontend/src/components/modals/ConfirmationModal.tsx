import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, RotateCcw, Play, Pause, Trash2, X, ChevronDown } from 'lucide-react';
import { EXPIRATION_LABELS, DEFAULT_EXPIRATION } from '../../constants/expirationOptions';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data?: { expiration?: string }) => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  type: 'delete' | 'toggle-active' | 'toggle-inactive' | 'renew';
  mcpName?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  type,
  mcpName
}) => {
  const [selectedExpiration, setSelectedExpiration] = useState(DEFAULT_EXPIRATION);
  const [expirationDropdownOpen, setExpirationDropdownOpen] = useState(false);
  const [expirationDropdownPosition, setExpirationDropdownPosition] = useState({ 
    top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false 
  });
  const expirationButtonRef = useRef<HTMLButtonElement>(null);
  const expirationDropdownRef = useRef<HTMLDivElement>(null);

  const expirationOptions = EXPIRATION_LABELS;

  // Reset expiration selection when modal opens
  useEffect(() => {
    if (isOpen && type === 'renew') {
      setSelectedExpiration(DEFAULT_EXPIRATION);
      setExpirationDropdownOpen(false);
    }
  }, [isOpen, type]);

  // Calculate dropdown position to handle viewport boundaries
  const calculateDropdownPosition = (elementRef: React.RefObject<HTMLElement | null>, itemCount: number = 5) => {
    if (!elementRef.current) return { top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false };

    const elementRect = elementRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(200, itemCount * 40);
    
    const spaceBelow = viewportHeight - elementRect.bottom;
    const spaceAbove = elementRect.top;
    const flipUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    const maxHeight = flipUp ? Math.min(spaceAbove - 10, 200) : Math.min(spaceBelow - 10, 200);
    
    return {
      top: elementRect.bottom,
      left: elementRect.left,
      width: elementRect.width,
      maxHeight,
      flipUp
    };
  };

  const handleExpirationDropdownToggle = () => {
    if (!expirationDropdownOpen) {
      const position = calculateDropdownPosition(expirationButtonRef, expirationOptions.length);
      setExpirationDropdownPosition(position);
    }
    setExpirationDropdownOpen(!expirationDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (expirationDropdownOpen) {
        if (!expirationButtonRef.current?.contains(target) && !expirationDropdownRef.current?.contains(target)) {
          setExpirationDropdownOpen(false);
        }
      }
    };

    if (isOpen && type === 'renew') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, type, expirationDropdownOpen]);

  // Handle escape key to close modal and dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (expirationDropdownOpen) {
          setExpirationDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, expirationDropdownOpen]);

  // Get icon and colors based on action type
  const getActionIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case 'toggle-active':
        return <Play className="w-6 h-6 text-green-600" />;
      case 'toggle-inactive':
        return <Pause className="w-6 h-6 text-orange-500" />;
      case 'renew':
        return <RotateCcw className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'toggle-active':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'toggle-inactive':
        return 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400';
      case 'renew':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      default:
        return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
    }
  };

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
            {getActionIcon()}
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
          
          {mcpName && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900">
                MCP: {mcpName}
              </p>
            </div>
          )}

          {/* Expiration selector for renew type */}
          {type === 'renew' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Expiration Time
              </label>
              <div className="relative">
                <button
                  ref={expirationButtonRef}
                  type="button"
                  onClick={handleExpirationDropdownToggle}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="text-gray-900">
                    {selectedExpiration}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${expirationDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors font-medium cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              const data = type === 'renew' ? { expiration: selectedExpiration } : undefined;
              onConfirm(data);
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium cursor-pointer ${getConfirmButtonStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      {/* Expiration Dropdown - positioned absolutely to handle viewport boundaries */}
      {type === 'renew' && expirationDropdownOpen && (
        <div 
          ref={expirationDropdownRef}
          className="fixed z-[80] bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto scrollbar-hide"
          style={{
            top: expirationDropdownPosition.flipUp 
              ? expirationDropdownPosition.top - expirationDropdownPosition.maxHeight - 4
              : expirationDropdownPosition.top + 4,
            left: expirationDropdownPosition.left,
            width: expirationDropdownPosition.width,
            maxHeight: expirationDropdownPosition.maxHeight
          }}
        >
          {expirationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedExpiration(option);
                setExpirationDropdownOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfirmationModal;