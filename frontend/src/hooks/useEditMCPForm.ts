import { useState, useCallback, useEffect, useRef } from 'react';
import { type MCPItem } from '../types';
import { type ValidationState } from '../types/createMCPModal';
import { apiService } from '../services/apiService';

interface EditMCPFormData {
  name: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
}


interface UseEditMCPFormProps {
  isOpen: boolean;
  mcp: MCPItem | null;
}

/**
 * Custom hook to manage EditMCP form state and validation
 * Similar to useCreateMCPForm but adapted for editing existing MCPs
 */
export const useEditMCPForm = ({ isOpen, mcp }: UseEditMCPFormProps) => {
  const [formData, setFormData] = useState<EditMCPFormData>({
    name: '',
    apiKey: '',
    clientId: '',
    clientSecret: ''
  });

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: null,
    error: null,
    apiInfo: null,
    failureCount: 0,
    lastFailedCredentials: null
  });

  // Track last validated credentials to prevent unnecessary re-validation
  const lastValidatedCredentialsRef = useRef<string | null>(null);
  
  // Stable ref to validateCredentials to avoid circular dependencies
  const validateCredentialsRef = useRef<(() => Promise<void>) | null>(null);

  // Initialize form with MCP data when modal opens
  useEffect(() => {
    if (isOpen && mcp) {
      setFormData({
        name: mcp.name,
        apiKey: '',
        clientId: '',
        clientSecret: ''
      });
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        apiInfo: null,
        failureCount: 0,
        lastFailedCredentials: null
      });
      lastValidatedCredentialsRef.current = null;
    }
  }, [isOpen, mcp]);

  // Get MCP type from email field (using same logic as edit modal)
  const getMCPType = useCallback((email: string): string => {
    if (email.toLowerCase().includes('gmail')) return 'Gmail';
    if (email.toLowerCase().includes('figma')) return 'Figma';
    return 'API Gateway'; // Default fallback
  }, []);

  const getRequiredFields = useCallback((type: string) => {
    switch (type) {
      case 'Gmail':
        return ['clientId', 'clientSecret'];
      case 'Figma':
        return ['apiKey'];
      default:
        return ['apiKey'];
    }
  }, []);

  const requiresCredentials = useCallback((type: string) => {
    return type && type !== '';
  }, []);

  const handleInputChange = useCallback((field: keyof EditMCPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Create a simple hash of credentials for tracking failures
  const getCredentialsHash = useCallback((credentials: Record<string, string>) => {
    return JSON.stringify(credentials);
  }, []);

  // Credential validation function
  const validateCredentials = useCallback(async () => {
    if (!mcp) return;

    const mcpType = getMCPType(mcp.email);
    if (!requiresCredentials(mcpType)) return;

    const requiredFields = getRequiredFields(mcpType);
    const credentials: Record<string, string> = {};

    // Build credentials object based on required fields
    for (const field of requiredFields) {
      if (field === 'apiKey' && formData.apiKey) {
        credentials.api_key = formData.apiKey;
      } else if (field === 'clientId' && formData.clientId) {
        credentials.client_id = formData.clientId;
      } else if (field === 'clientSecret' && formData.clientSecret) {
        credentials.client_secret = formData.clientSecret;
      }
    }

    // Check if all required fields are filled
    const hasAllFields = requiredFields.every(field => {
      if (field === 'apiKey') return formData.apiKey.trim() !== '';
      if (field === 'clientId') return formData.clientId.trim() !== '';
      if (field === 'clientSecret') return formData.clientSecret.trim() !== '';
      return false;
    });

    if (!hasAllFields) {
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        apiInfo: null,
        failureCount: 0,
        lastFailedCredentials: null
      });
      return;
    }

    const credentialsHash = getCredentialsHash(credentials);
    
    // Check if we've already failed validation 2 times for these exact credentials
    if (validationState.failureCount >= 2 && validationState.lastFailedCredentials === credentialsHash) {
      // Don't auto-retry, user must manually retry
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      // Use the same validation endpoint as create modal for consistency
      // First get the MCP type by name to get the ID
      const serviceTypeName = mcp.mcpType || mcpType.toLowerCase();
      
      let mcpTypeData;
      try {
        mcpTypeData = await apiService.getMCPTypeByName(serviceTypeName);
      } catch (mcpTypeError) {
        throw new Error(`Failed to find MCP type '${serviceTypeName}'. Please check the service type.`);
      }
      
      // Use the same validation as create modal with mcp_type_id
      const result = await apiService.validateCredentials({
        mcp_type_id: mcpTypeData.id,
        credentials
      });

      setValidationState({
        isValidating: false,
        isValid: result.valid,
        error: null,
        apiInfo: result.api_info || null,
        failureCount: 0, // Reset failure count on success
        lastFailedCredentials: null
      });
      
      // Update last validated credentials
      lastValidatedCredentialsRef.current = credentialsHash;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setValidationState(prev => ({
        isValidating: false,
        isValid: false,
        error: errorMessage,
        apiInfo: null,
        failureCount: prev.lastFailedCredentials === credentialsHash ? prev.failureCount + 1 : 1,
        lastFailedCredentials: credentialsHash
      }));
    }
  }, [mcp, formData, getMCPType, requiresCredentials, getRequiredFields, getCredentialsHash, validationState.failureCount, validationState.lastFailedCredentials]);
  
  // Update the ref whenever validateCredentials changes
  validateCredentialsRef.current = validateCredentials;

  // Reset validation state when credentials change
  useEffect(() => {
    if (mcp) {
      const mcpType = getMCPType(mcp.email);
      if (requiresCredentials(mcpType)) {
        const requiredFields = getRequiredFields(mcpType);
        const credentials: Record<string, string> = {};
        
        // Build credentials for hash comparison
        for (const field of requiredFields) {
          if (field === 'apiKey' && formData.apiKey) {
            credentials.api_key = formData.apiKey;
          } else if (field === 'clientId' && formData.clientId) {
            credentials.client_id = formData.clientId;
          } else if (field === 'clientSecret' && formData.clientSecret) {
            credentials.client_secret = formData.clientSecret;
          }
        }

        const credentialsHash = getCredentialsHash(credentials);
        
        setValidationState(prev => ({
          ...prev,
          isValid: null,
          error: null,
          // Only reset failure count if credentials actually changed
          failureCount: prev.lastFailedCredentials === credentialsHash ? prev.failureCount : 0,
          lastFailedCredentials: prev.lastFailedCredentials === credentialsHash ? prev.lastFailedCredentials : null
        }));
        
        // Reset validated credentials ref if credentials changed
        if (lastValidatedCredentialsRef.current !== credentialsHash) {
          lastValidatedCredentialsRef.current = null;
        }
      }
    }
  }, [mcp, formData.apiKey, formData.clientId, formData.clientSecret, getMCPType, requiresCredentials, getRequiredFields, getCredentialsHash]);

  // Trigger validation when credentials change (with debouncing)
  useEffect(() => {
    if (mcp) {
      const mcpType = getMCPType(mcp.email);
      if (requiresCredentials(mcpType)) {
        const requiredFields = getRequiredFields(mcpType);

        const hasAllFields = requiredFields.every(field => {
          if (field === 'apiKey') return formData.apiKey.trim() !== '';
          if (field === 'clientId') return formData.clientId.trim() !== '';
          if (field === 'clientSecret') return formData.clientSecret.trim() !== '';
          return false;
        });

        const credentials: Record<string, string> = {};
        for (const field of requiredFields) {
          if (field === 'apiKey' && formData.apiKey) {
            credentials.api_key = formData.apiKey;
          } else if (field === 'clientId' && formData.clientId) {
            credentials.client_id = formData.clientId;
          } else if (field === 'clientSecret' && formData.clientSecret) {
            credentials.client_secret = formData.clientSecret;
          }
        }

        const credentialsHash = getCredentialsHash(credentials);
        
        // Check if we've already failed validation 2 times for these exact credentials
        const shouldSkipValidation = validationState.failureCount >= 2 && validationState.lastFailedCredentials === credentialsHash;
        
        // Check if we've already validated these exact credentials successfully
        const alreadyValidated = lastValidatedCredentialsRef.current === credentialsHash && validationState.isValid === true;

        if (hasAllFields && !validationState.isValidating && !shouldSkipValidation && !alreadyValidated) {
          const timeoutId = setTimeout(() => {
            validateCredentialsRef.current?.();
          }, 800); // Debounce validation

          return () => clearTimeout(timeoutId);
        }
      }
    }
  }, [mcp, formData.apiKey, formData.clientId, formData.clientSecret, getMCPType, requiresCredentials, getRequiredFields, validationState.isValidating, validationState.isValid, validationState.failureCount, validationState.lastFailedCredentials, getCredentialsHash]);

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    if (!mcp || !formData.name) return false;
    
    const mcpType = getMCPType(mcp.email);
    const requiredFields = getRequiredFields(mcpType);
    
    // Check if credentials are required and filled
    const hasCredentials = ((requiredFields.includes('clientId') && formData.clientId && formData.clientSecret) ||
                           (requiredFields.includes('apiKey') && formData.apiKey));
    
    // If credentials are required, they must be valid
    if (requiresCredentials(mcpType)) {
      return hasCredentials && validationState.isValid === true;
    }
    
    return true;
  }, [mcp, formData, getMCPType, getRequiredFields, requiresCredentials, validationState.isValid]);

  const retryValidation = useCallback(() => {
    setValidationState(prev => ({ 
      ...prev, 
      isValid: null, 
      error: null,
      failureCount: 0,
      lastFailedCredentials: null
    }));
    lastValidatedCredentialsRef.current = null;
    validateCredentials();
  }, [validateCredentials]);

  return {
    formData,
    validationState,
    handleInputChange,
    isFormValid,
    getMCPType,
    getRequiredFields,
    requiresCredentials,
    retryValidation
  };
};