import React, { useState, useEffect, useRef } from 'react';
import { type MCPType } from '../../types';
import { type CreateMCPModalProps, type ExpirationOption } from '../../types/createMCPModal';
import { type CreateMCPFormData } from '../dashboard/types';
import { useCreateMCPForm } from '../../hooks/useCreateMCPForm';
import FormField from '../ui/form/FormField';
import TypeDropdown from '../ui/form/TypeDropdown';
import ExpirationDropdown from '../ui/form/ExpirationDropdown';
import CredentialFields from '../ui/form/CredentialFields';

const CreateMCPModal: React.FC<CreateMCPModalProps> = ({ isOpen, onClose, onSubmit, onPlanLimitReached, onSuccess, onRefresh }) => {
  const {
    formData,
    mcpTypes,
    selectedMcpType,
    validationState,
    isSubmitting,
    oAuthState,
    oAuthError,
    planLimits,
    handleInputChange,
    handleCredentialChange,
    handleTypeSelect,
    handleSubmit,
    isFormValid,
    retryValidation,
    isOAuthService
  } = useCreateMCPForm({ isOpen, onClose, onSubmit, onPlanLimitReached, onSuccess, onRefresh });

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [expirationDropdownOpen, setExpirationDropdownOpen] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset dropdown states and focus first field when modal opens
  useEffect(() => {
    if (isOpen) {
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

  const handleTypeSearchChange = (value: string) => {
    setTypeSearchQuery(value);
    if (!typeDropdownOpen) {
      setTypeDropdownOpen(true);
    }
  };

  const handleTypeSelectLocal = (type: MCPType | null) => {
    handleTypeSelect(type);
    setTypeSearchQuery('');
    setTypeDropdownOpen(false);
  };

  const handleExpirationSelect = (option: ExpirationOption) => {
    handleInputChange('expiration', option.value);
    setExpirationDropdownOpen(false);
  };

  const handleCancel = () => {
    onClose();
  };

  // Handle Enter key for form submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isFormValid()) {
        handleSubmit(e as unknown as React.FormEvent);
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
            <FormField label="MCP Name" required>
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
            </FormField>

            <FormField label="MCP Type" required>
              <TypeDropdown
                mcpTypes={mcpTypes}
                selectedType={selectedMcpType}
                searchQuery={typeSearchQuery}
                isOpen={typeDropdownOpen}
                onSearchChange={handleTypeSearchChange}
                onSelect={handleTypeSelectLocal}
                onFocus={() => setTypeDropdownOpen(true)}
                onClose={() => setTypeDropdownOpen(false)}
                onKeyDown={handleKeyDown}
              />
            </FormField>

            <CredentialFields
              selectedMcpType={selectedMcpType}
              formData={formData}
              validationState={validationState}
              onCredentialChange={handleCredentialChange}
              onInputChange={(field: string, value: string) => {
                // Type-safe wrapper for handleInputChange
                if (field === 'apiKey' || field === 'clientId' || field === 'clientSecret' || field === 'name' || field === 'type' || field === 'expiration') {
                  handleInputChange(field as keyof CreateMCPFormData, value);
                }
              }}
              onKeyDown={handleKeyDown}
              onRetryValidation={retryValidation}
            />


            {oAuthError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{oAuthError}</p>
                </div>
              </div>
            )}

            {oAuthState === 'authorizing' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Waiting for authorization...</p>
                    <p className="text-xs text-blue-700 mt-1">Please complete the authorization in the new window that opened.</p>
                  </div>
                </div>
              </div>
            )}

            <FormField label="Expiration Time" required>
              <ExpirationDropdown
                value={formData.expiration}
                isOpen={expirationDropdownOpen}
                onToggle={() => setExpirationDropdownOpen(!expirationDropdownOpen)}
                onSelect={handleExpirationSelect}
                onClose={() => setExpirationDropdownOpen(false)}
              />
            </FormField>
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
              disabled={!isFormValid() || isSubmitting || oAuthState === 'authorizing' || (planLimits ? !planLimits.canCreate : false)}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting || oAuthState === 'authorizing' ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {oAuthState === 'authorizing' ? 'Authorizing...' : isOAuthService(selectedMcpType) ? 'Creating...' : 'Creating...'}
                </div>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
};

export default CreateMCPModal;