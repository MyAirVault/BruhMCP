import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { type MCPType } from '../types';

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

interface ValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
  apiInfo: {
    service?: string;
    quota_remaining?: number;
    permissions?: string[];
  } | null;
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
  const [mcpTypes, setMcpTypes] = useState<MCPType[]>([]);
  const [selectedMcpType, setSelectedMcpType] = useState<MCPType | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: null,
    error: null,
    apiInfo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const typeInputRef = useRef<HTMLInputElement>(null);
  const expirationButtonRef = useRef<HTMLButtonElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const expirationDropdownRef = useRef<HTMLDivElement>(null);

  // Load MCP types from backend
  useEffect(() => {
    const loadMcpTypes = async () => {
      try {
        const types = await apiService.getMCPTypes();
        setMcpTypes(types);
      } catch (error) {
        console.error('Failed to load MCP types:', error);
      }
    };

    loadMcpTypes();
  }, []);

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
      setSelectedMcpType(null);
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        apiInfo: null
      });
      setIsSubmitting(false);
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

  // Filter MCP types based on search query
  const filteredMCPTypes = mcpTypes.filter(type => 
    type.display_name.toLowerCase().includes(typeSearchQuery.toLowerCase()) ||
    type.name.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );
  
  // Map expiration options to backend format
  const expirationOptions = [
    { label: '1 Hour', value: '1h' },
    { label: '6 Hours', value: '6h' },
    { label: '1 Day', value: '1day' },
    { label: '30 Days', value: '30days' },
    { label: 'Never', value: 'never' }
  ];

  const getRequiredFields = (mcpType: MCPType | null) => {
    if (!mcpType || !mcpType.required_fields) return [];
    return mcpType.required_fields.map(field => field.name);
  };

  const requiresCredentials = (mcpType: MCPType | null) => {
    return mcpType && mcpType.required_fields && mcpType.required_fields.length > 0;
  };

  // Credential validation function
  const validateCredentials = useCallback(async () => {
    if (!selectedMcpType || !requiresCredentials(selectedMcpType)) return;

    const credentials: Record<string, string> = {};
    
    // Build credentials object based on required fields
    const requiredFields = getRequiredFields(selectedMcpType);
    for (const field of requiredFields) {
      if (field === 'api_key') {
        credentials.api_key = formData.apiKey;
      } else if (field === 'client_id') {
        credentials.client_id = formData.clientId;
      } else if (field === 'client_secret') {
        credentials.client_secret = formData.clientSecret;
      }
    }

    // Check if all required fields are filled
    const hasAllFields = requiredFields.every(field => {
      if (field === 'api_key') return formData.apiKey.trim() !== '';
      if (field === 'client_id') return formData.clientId.trim() !== '';
      if (field === 'client_secret') return formData.clientSecret.trim() !== '';
      return true;
    });

    if (!hasAllFields) {
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        apiInfo: null
      });
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      const result = await apiService.validateCredentials({
        mcp_type_id: selectedMcpType.id,
        credentials
      });

      setValidationState({
        isValidating: false,
        isValid: result.valid,
        error: null,
        apiInfo: result.api_info
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setValidationState({
        isValidating: false,
        isValid: false,
        error: errorMessage,
        apiInfo: null
      });
    }
  }, [selectedMcpType, formData.apiKey, formData.clientId, formData.clientSecret]);

  const handleInputChange = (field: keyof CreateMCPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Trigger validation when credentials change
  useEffect(() => {
    if (selectedMcpType && requiresCredentials(selectedMcpType)) {
      const timeoutId = setTimeout(() => {
        validateCredentials();
      }, 500); // Debounce validation

      return () => clearTimeout(timeoutId);
    }
  }, [validateCredentials, selectedMcpType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // First validate credentials if not already validated
      if (selectedMcpType && requiresCredentials(selectedMcpType) && validationState.isValid !== true) {
        await validateCredentials();
        // Wait for validation to complete
        return;
      }
      
      // Transform form data to match backend expected format
      const transformedData = {
        ...formData,
        type: selectedMcpType?.name || formData.type,
        expiration: expirationOptions.find(opt => opt.label === formData.expiration)?.value || formData.expiration
      };
      
      await onSubmit(transformedData);
      
      // Reset form
      setFormData({ name: '', type: '', apiKey: '', clientId: '', clientSecret: '', expiration: '' });
      setSelectedMcpType(null);
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        apiInfo: null
      });
      onClose();
    } catch (error) {
      console.error('Failed to create MCP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!formData.name || !selectedMcpType || !formData.expiration) return false;
    
    // Check if credentials are required and valid
    if (requiresCredentials(selectedMcpType)) {
      const requiredFields = getRequiredFields(selectedMcpType);
      const hasAllFields = requiredFields.every(field => {
        if (field === 'api_key') return formData.apiKey.trim() !== '';
        if (field === 'client_id') return formData.clientId.trim() !== '';
        if (field === 'client_secret') return formData.clientSecret.trim() !== '';
        return true;
      });
      
      return hasAllFields && (validationState.isValid === true || validationState.isValidating);
    }
    
    return true;
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
                  value={selectedMcpType?.display_name || typeSearchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (selectedMcpType && value !== selectedMcpType.display_name) {
                      // If user starts typing different from selected, clear selection and search
                      setSelectedMcpType(null);
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

            {requiresCredentials(selectedMcpType) && (
              <div>
                {getRequiredFields(selectedMcpType).includes('client_id') && (
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
                
                {getRequiredFields(selectedMcpType).includes('client_secret') && (
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
                
                {getRequiredFields(selectedMcpType).includes('api_key') && (
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
                
                {/* Validation feedback */}
                <div className="mt-3">
                  {validationState.isValidating && (
                    <div className="flex items-center text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Validating credentials...
                    </div>
                  )}
                  
                  {validationState.isValid === true && (
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Credentials validated successfully!
                      {validationState.apiInfo && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({validationState.apiInfo.service})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {validationState.isValid === false && validationState.error && (
                    <div className="flex items-center text-sm text-red-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {validationState.error}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
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
              disabled={!isFormValid() || isSubmitting}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Done'
              )}
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
                  key={type.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMcpType(type);
                    handleInputChange('type', type.name);
                    setTypeSearchQuery('');
                    setTypeDropdownOpen(false);
                    // Reset validation state when type changes
                    setValidationState({
                      isValidating: false,
                      isValid: null,
                      error: null,
                      apiInfo: null
                    });
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center">
                    {type.icon_url && (
                      <img src={type.icon_url} alt={type.name} className="w-4 h-4 mr-2" />
                    )}
                    <div>
                      <div className="font-medium">{type.display_name}</div>
                      {type.description && (
                        <div className="text-xs text-gray-500">{type.description}</div>
                      )}
                    </div>
                  </div>
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
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInputChange('expiration', option.label);
                  setExpirationDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors cursor-pointer"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default CreateMCPModal;