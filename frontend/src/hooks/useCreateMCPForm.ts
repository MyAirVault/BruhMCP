import { useState, useCallback, useEffect, useRef } from 'react';
import { type MCPType } from '../types';
import { type CreateMCPFormData, type ValidationState } from '../types/createMCPModal';
import { apiService } from '../services/apiService';
import { useMCPValidation } from '../utils/mcpValidation';

interface UseCreateMCPFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMCPFormData) => void;
}

/**
 * Custom hook to manage CreateMCP form state and validation
 * Handles form data, validation state, and submission logic
 */
export const useCreateMCPForm = ({ isOpen, onClose, onSubmit }: UseCreateMCPFormProps) => {
  const [formData, setFormData] = useState<CreateMCPFormData>({
    name: '',
    type: '',
    apiKey: '',
    clientId: '',
    clientSecret: '',
    expiration: '',
    credentials: {}
  });

  const [mcpTypes, setMcpTypes] = useState<MCPType[]>([]);
  const [selectedMcpType, setSelectedMcpType] = useState<MCPType | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: null,
    error: null,
    apiInfo: null,
    failureCount: 0,
    lastFailedCredentials: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use shared validation utility
  const {
    requiresCredentials,
    getCredentialsHash,
    buildCredentialsObject,
    hasAllRequiredFields,
    validateCredentials: sharedValidateCredentials,
    lastValidatedCredentialsRef
  } = useMCPValidation();
  
  // Stable ref to validateCredentials to avoid circular dependencies
  const validateCredentialsRef = useRef<(() => Promise<void>) | null>(null);

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

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: '',
        apiKey: '',
        clientId: '',
        clientSecret: '',
        expiration: '',
        credentials: {}
      });
      setSelectedMcpType(null);
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        apiInfo: null,
        failureCount: 0,
        lastFailedCredentials: null
      });
      setIsSubmitting(false);
      lastValidatedCredentialsRef.current = null;
    }
  }, [isOpen]);

  const handleInputChange = useCallback((field: keyof CreateMCPFormData, value: string) => {
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

  const handleTypeSelect = useCallback((type: MCPType | null) => {
    setSelectedMcpType(type);
    handleInputChange('type', type?.name || '');
    // Reset validation state when type changes
    setValidationState({
      isValidating: false,
      isValid: null,
      error: null,
      apiInfo: null,
      failureCount: 0,
      lastFailedCredentials: null
    });
    lastValidatedCredentialsRef.current = null;
  }, [handleInputChange]);

  // Validation functions are now provided by useMCPValidation hook

  // Credential validation function using shared utility
  const validateCredentials = useCallback(async () => {
    await sharedValidateCredentials(
      selectedMcpType,
      {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      },
      validationState,
      setValidationState
    );
  }, [selectedMcpType, formData, validationState, sharedValidateCredentials]);
  
  // Update the ref whenever validateCredentials changes
  validateCredentialsRef.current = validateCredentials;

  // Reset validation state when credentials change
  useEffect(() => {
    if (selectedMcpType && requiresCredentials(selectedMcpType)) {
      const credentialData = {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      };
      const credentials = buildCredentialsObject(selectedMcpType, credentialData);
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
  }, [selectedMcpType, formData.apiKey, formData.clientId, formData.clientSecret, formData.credentials, requiresCredentials, getCredentialsHash, buildCredentialsObject]);

  // Trigger validation when credentials change (with debouncing)
  useEffect(() => {
    if (selectedMcpType && requiresCredentials(selectedMcpType)) {
      const credentialData = {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      };

      const hasAllFields = hasAllRequiredFields(selectedMcpType, credentialData);
      const credentials = buildCredentialsObject(selectedMcpType, credentialData);
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
  }, [selectedMcpType, formData.apiKey, formData.clientId, formData.clientSecret, formData.credentials, requiresCredentials, hasAllRequiredFields, buildCredentialsObject, validationState.isValidating, validationState.isValid, validationState.failureCount, validationState.lastFailedCredentials, getCredentialsHash]);

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    if (!formData.name || !selectedMcpType || !formData.expiration) return false;
    
    // Check if credentials are required and valid
    if (requiresCredentials(selectedMcpType)) {
      const credentialData = {
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret,
        credentials: formData.credentials
      };
      
      const hasAllFields = hasAllRequiredFields(selectedMcpType, credentialData);
      return hasAllFields && validationState.isValid === true;
    }
    
    return true;
  }, [formData, selectedMcpType, requiresCredentials, hasAllRequiredFields, validationState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        expiration: formData.expiration
      };
      
      onSubmit(transformedData);
      
      // Reset form
      setFormData({ name: '', type: '', apiKey: '', clientId: '', clientSecret: '', expiration: '', credentials: {} });
      setSelectedMcpType(null);
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        apiInfo: null,
        failureCount: 0,
        lastFailedCredentials: null
      });
      onClose();
    } catch (error) {
      console.error('Failed to create MCP:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isFormValid, isSubmitting, selectedMcpType, requiresCredentials, validationState, validateCredentials, formData, onSubmit, onClose]);

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
    mcpTypes,
    selectedMcpType,
    validationState,
    isSubmitting,
    handleInputChange,
    handleCredentialChange,
    handleTypeSelect,
    handleSubmit,
    isFormValid,
    requiresCredentials,
    retryValidation
  };
};