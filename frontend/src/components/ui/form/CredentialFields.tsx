import React from 'react';
import { type MCPType } from '../../../types';
import { type ValidationState } from '../../../types/createMCPModal';
import FormField from './FormField';
import ValidationFeedback from './ValidationFeedback';

// Generic form data type that includes the common fields between CreateMCPFormData and EditMCPFormData
type CredentialFormData = {
  apiKey: string;
  clientId: string;
  clientSecret: string;
  credentials: Record<string, string>;
};

interface CredentialFieldsProps {
  selectedMcpType: MCPType | null;
  formData: CredentialFormData;
  validationState: ValidationState;
  onCredentialChange: (credentialName: string, value: string) => void;
  onInputChange: (field: string, value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onRetryValidation?: () => void;
  isLoadingMcpType?: boolean;
  mcpTypeError?: string | null;
}

/**
 * Renders credential input fields based on selected MCP type
 * Handles field mapping and validation feedback display
 */
const CredentialFields: React.FC<CredentialFieldsProps> = ({
  selectedMcpType,
  formData,
  validationState,
  onCredentialChange,
  onInputChange,
  onKeyDown,
  onRetryValidation,
  isLoadingMcpType,
  mcpTypeError
}) => {
  // Show loading state while fetching MCP type data
  if (isLoadingMcpType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading credential fields...</span>
        </div>
      </div>
    );
  }

  // Show error state if MCP type failed to load
  if (mcpTypeError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              <strong>Error loading credential fields:</strong> {mcpTypeError}
            </div>
          </div>
          <p className="text-xs text-red-500 mt-1">
            Unable to determine required credentials for this MCP type.
          </p>
        </div>
      </div>
    );
  }

  // Check if credentials are required for the selected MCP type
  const requiresCredentials = selectedMcpType && selectedMcpType.required_fields && selectedMcpType.required_fields.length > 0;

  // Show helpful message if no credentials are required
  if (!requiresCredentials) {
    if (selectedMcpType) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-700 text-sm">
              No credentials required for this MCP type.
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

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

  const handleCredentialChange = (fieldName: string, value: string) => {
    // Update new credentials object
    onCredentialChange(fieldName, value);
    
    // Also update legacy fields for backward compatibility
    if (fieldName === 'api_key') onInputChange('apiKey', value);
    else if (fieldName === 'client_id') onInputChange('clientId', value);
    else if (fieldName === 'client_secret') onInputChange('clientSecret', value);
  };

  const getFieldValue = (fieldName: string) => {
    // Get value from new credentials object or fall back to legacy fields
    let fieldValue = formData.credentials[fieldName] || '';
    if (!fieldValue) {
      if (fieldName === 'api_key') fieldValue = formData.apiKey;
      else if (fieldName === 'client_id') fieldValue = formData.clientId;
      else if (fieldName === 'client_secret') fieldValue = formData.clientSecret;
    }
    return fieldValue;
  };

  return (
    <div className="space-y-4">
      {selectedMcpType.required_fields?.map((field) => {
        const fieldName = field.name;
        const fieldValue = getFieldValue(fieldName);

        return (
          <FormField
            key={fieldName}
            label={getFieldLabel(fieldName)}
            required={field.required}
          >
            <input
              type={field.type === 'password' ? 'password' : 'text'}
              value={fieldValue}
              onChange={(e) => handleCredentialChange(fieldName, e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={field.description || `Enter your ${getFieldLabel(fieldName).toLowerCase()}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required={field.required}
            />
            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}
          </FormField>
        );
      })}
      
      {/* Validation feedback */}
      <div className="mt-3">
        <ValidationFeedback validationState={validationState} onRetryValidation={onRetryValidation} selectedMcpType={selectedMcpType} />
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        These credentials will be stored securely and not requested again for this MCP type
      </p>
    </div>
  );
};

export default CredentialFields;