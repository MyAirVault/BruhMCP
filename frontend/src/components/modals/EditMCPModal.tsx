import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { type MCPItem } from '../../types';
import { type EditMCPFormData } from '../dashboard/types';
import { type ExpirationOption } from '../../types/createMCPModal';
import { useEditMCPForm } from '../../hooks/useEditMCPForm';
import CredentialFields from '../ui/form/CredentialFields';
import FormField from '../ui/form/FormField';
import ExpirationDropdown from '../ui/form/ExpirationDropdown';

interface EditMCPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditMCPFormData) => void;
  mcp: MCPItem | null;
}


const EditMCPModal: React.FC<EditMCPModalProps> = ({ isOpen, onClose, onSubmit, mcp }) => {
  const {
    formData,
    validationState,
    handleInputChange,
    handleCredentialChange,
    isFormValid,
    retryValidation,
    mcpType
  } = useEditMCPForm({ isOpen, mcp });

  const firstInputRef = useRef<HTMLInputElement>(null);
  const [expirationDropdownOpen, setExpirationDropdownOpen] = useState(false);

  // Reset dropdown states and focus first field when modal opens
  useEffect(() => {
    if (isOpen) {
      setExpirationDropdownOpen(false);
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
        handleSubmit(e);
      }
    }
  };

  if (!isOpen || !mcp) return null;

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
                  {mcpType?.display_name || mcpType?.name || 'Unknown'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type cannot be changed after creation
                </p>
              </div>

              {/* Credentials Section */}
              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Update Credentials
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Enter new credentials to update the existing ones
                  </p>
                </div>

                <CredentialFields
                  selectedMcpType={mcpType}
                  formData={formData}
                  validationState={validationState}
                  onCredentialChange={handleCredentialChange}
                  onInputChange={(field: string, value: string) => {
                    // Type-safe wrapper for handleInputChange
                    if (field === 'apiKey' || field === 'clientId' || field === 'clientSecret' || field === 'name' || field === 'expiration') {
                      handleInputChange(field as keyof EditMCPFormData, value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onRetryValidation={retryValidation}
                />
              </div>

              {/* Expiration Extension */}
              <FormField label="Extend Expiration By" required>
                <ExpirationDropdown
                  value={formData.expiration}
                  isOpen={expirationDropdownOpen}
                  onToggle={() => setExpirationDropdownOpen(!expirationDropdownOpen)}
                  onSelect={handleExpirationSelect}
                  onClose={() => setExpirationDropdownOpen(false)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The MCP instance expiration will be extended by the selected amount
                </p>
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