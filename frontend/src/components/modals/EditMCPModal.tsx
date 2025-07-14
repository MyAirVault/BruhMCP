import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { type MCPItem } from '../../types';
import { useEditMCPForm } from '../../hooks/useEditMCPForm';
import ValidationFeedback from '../ui/form/ValidationFeedback';
import { EXPIRATION_OPTIONS } from '../../constants/expirationOptions';

interface EditMCPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditMCPFormData) => void;
  mcp: MCPItem | null;
}

interface EditMCPFormData {
  name: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  credentials: Record<string, string>;
  expiration: string;
}

const EditMCPModal: React.FC<EditMCPModalProps> = ({ isOpen, onClose, onSubmit, mcp }) => {
  const {
    formData,
    validationState,
    handleInputChange,
    handleCredentialChange,
    isFormValid,
    getMCPType,
    getRequiredFields,
    requiresCredentials,
    retryValidation
  } = useEditMCPForm({ isOpen, mcp });

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first field when modal opens
  useEffect(() => {
    if (isOpen) {
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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcp) return;
    
    onSubmit(formData);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };


  // Handle Enter key for form submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isFormValid()) {
        handleSubmit(e);
      }
    }
  };

  if (!isOpen || !mcp) return null;

  const mcpType = getMCPType();
  const requiredFields = getRequiredFields();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit MCP
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* MCP Name */}
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

              {/* MCP Type Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MCP Type
                </label>
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                  {mcpType}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type cannot be changed after creation
                </p>
              </div>

              {/* Credentials Section */}
              {requiresCredentials() && (
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Update Credentials
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Enter new credentials to update the existing ones
                    </p>
                  </div>

                  {/* Dynamic credential fields based on MCP type */}
                  {requiredFields.map((field) => {
                    // Convert field name to readable label
                    const getFieldLabel = (name: string) => {
                      switch (name) {
                        case 'api_key': return 'API Key';
                        case 'client_id': return 'Client ID';
                        case 'client_secret': return 'Client Secret';
                        case 'personal_access_token': return 'Personal Access Token';
                        case 'bot_token': return 'Bot Token';
                        case 'refresh_token': return 'Refresh Token';
                        default: return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                      }
                    };

                    // Get current value - check both new credentials object and legacy fields
                    const getCurrentValue = (fieldName: string) => {
                      if (formData.credentials[fieldName]) {
                        return formData.credentials[fieldName];
                      }
                      
                      // Fallback to legacy field mapping
                      switch (fieldName) {
                        case 'api_key': return formData.apiKey;
                        case 'client_id': return formData.clientId;
                        case 'client_secret': return formData.clientSecret;
                        default: return '';
                      }
                    };

                    // Determine if field should be password type
                    const isPasswordField = (name: string) => {
                      const passwordFields = ['api_key', 'client_secret', 'personal_access_token', 'bot_token', 'refresh_token'];
                      return passwordFields.includes(name);
                    };

                    const currentValue = getCurrentValue(field);

                    return (
                      <div key={field} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {getFieldLabel(field)}
                        </label>
                        <input
                          type={isPasswordField(field) ? 'password' : 'text'}
                          value={currentValue}
                          onChange={(e) => {
                            // Update both the new credentials object and legacy fields for backward compatibility
                            handleCredentialChange(field, e.target.value);
                            
                            // Also update legacy fields
                            if (field === 'api_key') {
                              handleInputChange('apiKey', e.target.value);
                            } else if (field === 'client_id') {
                              handleInputChange('clientId', e.target.value);
                            } else if (field === 'client_secret') {
                              handleInputChange('clientSecret', e.target.value);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder={`Enter your ${getFieldLabel(field)}`}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          required
                        />
                      </div>
                    );
                  })}

                  {/* Validation Feedback */}
                  {requiresCredentials() && (
                    <div className="mb-4">
                      <ValidationFeedback
                        validationState={validationState}
                        onRetryValidation={retryValidation}
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    These credentials will be stored securely and replace the existing ones
                  </p>
                </div>
              )}

              {/* Expiration Extension */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extend Expiration By
                </label>
                <select
                  value={formData.expiration}
                  onChange={(e) => handleInputChange('expiration', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  required
                >
                  <option value="">Select extension period</option>
                  {EXPIRATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The MCP instance expiration will be extended by the selected amount
                </p>
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditMCPModal;