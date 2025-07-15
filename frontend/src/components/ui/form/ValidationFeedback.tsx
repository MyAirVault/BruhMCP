import React from 'react';
import { type ValidationState } from '../../../types/createMCPModal';
import { type MCPType } from '../../../types';

interface ValidationFeedbackProps {
  validationState: ValidationState;
  onRetryValidation?: () => void;
  selectedMcpType?: MCPType | null;
}

/**
 * Displays validation feedback for credential validation
 * Shows loading, success, or error states with appropriate styling
 */
const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({ validationState, onRetryValidation, selectedMcpType }) => {
  const isOAuthService = selectedMcpType?.type === 'oauth';
  
  if (validationState.isValidating) {
    return (
      <div className="flex items-center text-sm text-blue-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        {isOAuthService ? 'Validating OAuth credentials...' : 'Validating credentials...'}
      </div>
    );
  }

  if (validationState.isValid === true) {
    return (
      <div className="flex items-center text-sm text-green-600">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {isOAuthService ? 'OAuth credentials validated successfully!' : 'Credentials validated successfully!'}
        {validationState.apiInfo && (
          <span className="ml-2 text-xs text-gray-500">
            ({validationState.apiInfo.service})
          </span>
        )}
      </div>
    );
  }

  if (validationState.isValid === false && validationState.error) {
    const hasReachedMaxFailures = validationState.failureCount >= 2;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center text-sm text-red-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {validationState.error}
        </div>
        {hasReachedMaxFailures && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            Auto-validation stopped after 2 attempts. Please check your credentials and retry manually.
          </div>
        )}
        {onRetryValidation && (
          <button
            type="button"
            onClick={onRetryValidation}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {hasReachedMaxFailures ? 'Retry validation' : 'Retry now'}
          </button>
        )}
      </div>
    );
  }

  return null;
};

export default ValidationFeedback;