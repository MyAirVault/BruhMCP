import { useState, useCallback, useEffect, useRef } from 'react';
import { type MCPItem, type MCPType } from '../types';
import { type ValidationState } from '../types/createMCPModal';
import { apiService } from '../services/apiService';
import { useMCPValidation } from '../utils/mcpValidation';

interface EditMCPFormData {
  name: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  credentials: Record<string, string>;
  expiration: string;
}

interface UseEditMCPFormProps {
  isOpen: boolean;
  mcp: MCPItem | null;
}

/**
 * Custom hook to manage EditMCP form state and validation
 * Now uses the same shared validation logic as CreateMCP for consistency
 */
export const useEditMCPForm = ({ isOpen, mcp }: UseEditMCPFormProps) => {
  const [formData, setFormData] = useState<EditMCPFormData>({
    name: '',
    apiKey: '',
    clientId: '',
    clientSecret: '',
    credentials: {},
    expiration: ''
  });

  const [mcpType, setMcpType] = useState<MCPType | null>(null);
  const [isLoadingMcpType, setIsLoadingMcpType] = useState(false);
  const [mcpTypeError, setMcpTypeError] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: null,
    error: null,
    apiInfo: null,
    failureCount: 0,
    lastFailedCredentials: null
  });

  // Use shared validation utility (same as create modal)
  const {
    getRequiredFields,
    requiresCredentials,
    getCredentialsHash,
    buildCredentialsObject,
    hasAllRequiredFields,
    validateCredentials: sharedValidateCredentials,
    lastValidatedCredentialsRef
  } = useMCPValidation();
  
  // Stable ref to validateCredentials to avoid circular dependencies
  const validateCredentialsRef = useRef<(() => Promise<void>) | null>(null);

  // Load MCP type when modal opens or MCP changes
  useEffect(() => {
    const loadMcpType = async () => {
      if (isOpen && mcp && mcp.mcpType) {
        setIsLoadingMcpType(true);
        setMcpTypeError(null);
        try {
          console.log('Loading MCP type:', mcp.mcpType);
          const mcpTypeData = await apiService.getMCPTypeByName(mcp.mcpType);
          console.log('MCP type loaded successfully:', mcpTypeData);
          setMcpType(mcpTypeData);
          setMcpTypeError(null);
        } catch (error) {
          console.error('Failed to load MCP type:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setMcpTypeError(errorMessage);
          setMcpType(null);
        } finally {
          setIsLoadingMcpType(false);
        }
      } else {
        setMcpType(null);
        setMcpTypeError(null);
        setIsLoadingMcpType(false);
      }
    };

    loadMcpType();
  }, [isOpen, mcp]);

  // Initialize form with MCP data when modal opens
  useEffect(() => {
    if (isOpen && mcp) {
      setFormData({
        name: mcp.name,
        apiKey: '',
        clientId: '',
        clientSecret: '',
        credentials: {},
        expiration: ''
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
      // Reset MCP type loading states when modal opens
      setMcpTypeError(null);
    }
  }, [isOpen, mcp]);

  const handleInputChange = useCallback((field: keyof EditMCPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCredentialChange = useCallback((credentialName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [credentialName]: value
      }
    }));
  }, []);

  // Credential validation function using shared utility (same as create modal)
  const validateCredentials = useCallback(async () => {
    if (!mcpType) return;

    await sharedValidateCredentials(
      mcpType,
      {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      },
      validationState,
      setValidationState
    );
  }, [mcpType, formData, validationState, sharedValidateCredentials]);
  
  // Update the ref whenever validateCredentials changes
  validateCredentialsRef.current = validateCredentials;

  // Reset validation state when credentials change (same logic as create modal)
  useEffect(() => {
    if (mcpType && requiresCredentials(mcpType)) {
      const credentialData = {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      };
      const credentials = buildCredentialsObject(mcpType, credentialData);
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
  }, [mcpType, formData.apiKey, formData.clientId, formData.clientSecret, formData.credentials, requiresCredentials, getCredentialsHash, buildCredentialsObject]);

  // Trigger validation when credentials change (with debouncing - same as create modal)
  useEffect(() => {
    if (mcpType && requiresCredentials(mcpType)) {
      const credentialData = {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      };

      const hasAllFields = hasAllRequiredFields(mcpType, credentialData);
      const credentials = buildCredentialsObject(mcpType, credentialData);
      const credentialsHash = getCredentialsHash(credentials);
      
      // Check if we've already failed validation 2 times for these exact credentials
      const shouldSkipValidation = validationState.failureCount >= 2 && validationState.lastFailedCredentials === credentialsHash;
      
      // Check if we've already validated these exact credentials successfully
      const alreadyValidated = lastValidatedCredentialsRef.current === credentialsHash && validationState.isValid === true;

      if (hasAllFields && !validationState.isValidating && !shouldSkipValidation && !alreadyValidated) {
        const timeoutId = setTimeout(() => {
          validateCredentialsRef.current?.();
        }, 800); // Debounce validation (same as create modal)

        return () => clearTimeout(timeoutId);
      }
    }
  }, [mcpType, formData.apiKey, formData.clientId, formData.clientSecret, formData.credentials, requiresCredentials, hasAllRequiredFields, buildCredentialsObject, validationState.isValidating, validationState.isValid, validationState.failureCount, validationState.lastFailedCredentials, getCredentialsHash]);

  // Check if form is valid for submission (same logic as create modal)
  const isFormValid = useCallback(() => {
    if (!mcp || !formData.name || !mcpType || !formData.expiration) return false;
    
    // Check if credentials are required and valid
    if (requiresCredentials(mcpType)) {
      const credentialData = {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      };
      
      const hasAllFields = hasAllRequiredFields(mcpType, credentialData);
      return hasAllFields && validationState.isValid === true;
    }
    
    return true;
  }, [mcp, formData, mcpType, requiresCredentials, hasAllRequiredFields, validationState]);

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

  // Helper function to get display type name (for backward compatibility with modal)
  const getMCPTypeDisplayName = useCallback(() => {
    return mcpType?.display_name || mcpType?.name || 'Unknown';
  }, [mcpType]);

  return {
    formData,
    validationState,
    handleInputChange,
    handleCredentialChange,
    isFormValid,
    getMCPType: getMCPTypeDisplayName, // For backward compatibility
    getRequiredFields: () => getRequiredFields(mcpType),
    requiresCredentials: () => requiresCredentials(mcpType),
    retryValidation,
    mcpType, // Expose the actual MCP type for advanced usage
    isLoadingMcpType,
    mcpTypeError
  };
};