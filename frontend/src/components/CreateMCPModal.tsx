import React, { useState, useEffect, useRef } from 'react';

interface CreateMCPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMCPFormData) => void;
}

interface CreateMCPFormData {
  name: string;
  type: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  expiration: string;
}

const CreateMCPModal: React.FC<CreateMCPModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateMCPFormData>({
    name: '',
    type: '',
    apiKey: '',
    clientId: '',
    clientSecret: '',
    expiration: ''
  });

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [expirationDropdownOpen, setExpirationDropdownOpen] = useState(false);
  const [typeDropdownPosition, setTypeDropdownPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false });
  const [expirationDropdownPosition, setExpirationDropdownPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false });
  const firstInputRef = useRef<HTMLInputElement>(null);
  const typeInputRef = useRef<HTMLInputElement>(null);
  const expirationButtonRef = useRef<HTMLButtonElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const expirationDropdownRef = useRef<HTMLDivElement>(null);

  // Reset form state and focus first field when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: '',
        apiKey: '',
        clientId: '',
        clientSecret: '',
        expiration: ''
      });
      setTypeDropdownOpen(false);
      setExpirationDropdownOpen(false);
      setTypeSearchQuery('');
      // Focus first field after modal animation
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

  // Calculate dropdown position to handle viewport boundaries
  const calculateDropdownPosition = (elementRef: React.RefObject<HTMLElement | null>, itemCount: number = 6) => {
    if (!elementRef.current) return { top: 0, left: 0, width: 0, maxHeight: 200, flipUp: false };

    const elementRect = elementRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(200, itemCount * 40); // Estimate dropdown height
    
    // Check if dropdown would go below viewport
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (typeDropdownOpen) {
        if (!typeInputRef.current?.contains(target) && !typeDropdownRef.current?.contains(target)) {
          setTypeDropdownOpen(false);
        }
      }
      
      if (expirationDropdownOpen) {
        if (!expirationButtonRef.current?.contains(target) && !expirationDropdownRef.current?.contains(target)) {
          setExpirationDropdownOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, typeDropdownOpen, expirationDropdownOpen]);

  const handleTypeInputFocus = () => {
    if (!typeDropdownOpen) {
      const position = calculateDropdownPosition(typeInputRef, filteredMCPTypes.length);
      setTypeDropdownPosition(position);
    }
    setTypeDropdownOpen(true);
    setExpirationDropdownOpen(false);
  };

  const handleTypeSearchChange = (value: string) => {
    setTypeSearchQuery(value);
    if (!typeDropdownOpen) {
      const position = calculateDropdownPosition(typeInputRef, filteredMCPTypes.length);
      setTypeDropdownPosition(position);
      setTypeDropdownOpen(true);
    }
  };

  const handleExpirationDropdownToggle = () => {
    if (!expirationDropdownOpen) {
      const position = calculateDropdownPosition(expirationButtonRef, expirationOptions.length);
      setExpirationDropdownPosition(position);
    }
    setExpirationDropdownOpen(!expirationDropdownOpen);
    setTypeDropdownOpen(false);
  };

  const mcpTypes = [
    'Gmail', 'Figma', 'API Gateway', 'Server Control', 'Database', 'Storage',
    'Slack', 'Discord', 'Trello', 'Asana', 'Notion', 'Google Drive',
    'Dropbox', 'OneDrive', 'GitHub', 'GitLab', 'Bitbucket', 'Jira',
    'Confluence', 'Zendesk', 'Intercom', 'Stripe', 'PayPal', 'Shopify'
  ];
  
  // Filter MCP types based on search query
  const filteredMCPTypes = mcpTypes.filter(type => 
    type.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );
  const expirationOptions = ['24 Hours', '7 Days', '30 Days', '90 Days', 'Never'];

  const getRequiredFields = (type: string) => {
    switch (type) {
      case 'Gmail':
        return ['clientId', 'clientSecret'];
      case 'Figma':
        return ['apiKey'];
      default:
        return ['apiKey'];
    }
  };

  const requiresCredentials = (type: string) => {
    return type && type !== '';
  };

  const handleInputChange = (field: keyof CreateMCPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', type: '', apiKey: '', clientId: '', clientSecret: '', expiration: '' });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return formData.name && 
           formData.type && 
           formData.expiration &&
           ((formData.type === 'Gmail' && formData.clientId && formData.clientSecret) ||
            (formData.type === 'Figma' && formData.apiKey) ||
            (formData.type !== 'Gmail' && formData.type !== 'Figma' && formData.type !== '' && formData.apiKey));
  };

  // Handle Enter key for form submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isFormValid()) {
        onSubmit(formData);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/50 "
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Create New MCP
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MCP Name
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter MCP name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MCP Type
              </label>
              <div className="relative">
                <input
                  ref={typeInputRef}
                  type="text"
                  value={formData.type || typeSearchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (formData.type && value !== formData.type) {
                      // If user starts typing different from selected, clear selection and search
                      handleInputChange('type', '');
                      handleTypeSearchChange(value);
                    } else {
                      handleTypeSearchChange(value);
                    }
                  }}
                  onFocus={handleTypeInputFocus}
                  onKeyDown={handleKeyDown}
                  placeholder="Search or select MCP type"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  autoComplete="off"
                />
              </div>
            </div>

            {requiresCredentials(formData.type) && (
              <div>
                {getRequiredFields(formData.type).includes('clientId') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) => handleInputChange('clientId', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your Client ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                )}
                
                {getRequiredFields(formData.type).includes('clientSecret') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your Client Secret"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                )}
                
                {getRequiredFields(formData.type).includes('apiKey') && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your API key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      required
                    />
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  These credentials will be stored securely and not requested again for this MCP type
                </p>
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Time
              </label>
              <div className="relative">
                <button
                  ref={expirationButtonRef}
                  type="button"
                  onClick={handleExpirationDropdownToggle}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex items-center justify-between transition-colors"
                >
                  <span className={formData.expiration ? 'text-gray-900' : 'text-gray-500'}>
                    {formData.expiration || 'Select expiration time'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expirationDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Done
            </button>
          </div>
        </form>
        </div>
      </div>

      {/* Type Dropdown - positioned absolutely to handle viewport boundaries */}
      {typeDropdownOpen && (
        <>
          <div 
            ref={typeDropdownRef}
            className="fixed z-[70] bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto scrollbar-hide"
            style={{
              top: typeDropdownPosition.flipUp 
                ? typeDropdownPosition.top - typeDropdownPosition.maxHeight - 4
                : typeDropdownPosition.top + 4,
              left: typeDropdownPosition.left,
              width: typeDropdownPosition.width,
              maxHeight: typeDropdownPosition.maxHeight
            }}
          >
            {filteredMCPTypes.length > 0 ? (
              filteredMCPTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInputChange('type', type);
                    setTypeSearchQuery('');
                    setTypeDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
                >
                  {type}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                No results found
              </div>
            )}
          </div>
        </>
      )}

      {/* Expiration Dropdown - positioned absolutely to handle viewport boundaries */}
      {expirationDropdownOpen && (
        <>
          <div 
            ref={expirationDropdownRef}
            className="fixed z-[70] bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto scrollbar-hide"
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
                  handleInputChange('expiration', option);
                  setExpirationDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default CreateMCPModal;