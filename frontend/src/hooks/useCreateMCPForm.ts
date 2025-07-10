import { useState, useCallback, useEffect } from 'react';
import { type MCPType } from '../types';
import { type CreateMCPFormData, type ValidationState } from '../types/createMCPModal';
import { apiService } from '../services/apiService';

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
  }, [handleInputChange]);

  const getRequiredFields = useCallback((mcpType: MCPType | null) => {
    if (!mcpType || !mcpType.required_fields) return [];
    return mcpType.required_fields.map(field => field.name);
  }, []);

  const requiresCredentials = useCallback((mcpType: MCPType | null) => {
    return mcpType && mcpType.required_fields && mcpType.required_fields.length > 0;
  }, []);

  // Create a simple hash of credentials for tracking failures
  const getCredentialsHash = useCallback((credentials: Record<string, string>) => {
    return JSON.stringify(credentials);
  }, []);

  // Credential validation function
  const validateCredentials = useCallback(async () => {
    if (!selectedMcpType || !requiresCredentials(selectedMcpType)) return;

    const credentials: Record<string, string> = { ...formData.credentials };
    
    // Build credentials object based on required fields
    const requiredFields = getRequiredFields(selectedMcpType);
    
    // Map legacy form fields to new credentials format
    for (const field of requiredFields) {
      if (field === 'api_key' && formData.apiKey) {
        credentials.api_key = formData.apiKey;
      } else if (field === 'client_id' && formData.clientId) {
        credentials.client_id = formData.clientId;
      } else if (field === 'client_secret' && formData.clientSecret) {
        credentials.client_secret = formData.clientSecret;
      }
    }

    // Check if all required fields are filled
    const hasAllFields = requiredFields.every(field => {
      const value = credentials[field];
      return value && value.trim() !== '';
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
      const result = await apiService.validateCredentials({
        mcp_type_id: selectedMcpType.id,
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
  }, [selectedMcpType, formData, requiresCredentials, getRequiredFields]);

  // Reset validation state when credentials change
  useEffect(() => {
    if (selectedMcpType && requiresCredentials(selectedMcpType)) {
      const requiredFields = getRequiredFields(selectedMcpType);
      const credentials: Record<string, string> = { ...formData.credentials };
      
      // Map legacy form fields to new credentials format
      for (const field of requiredFields) {
        if (field === 'api_key' && formData.apiKey) {
          credentials.api_key = formData.apiKey;
        } else if (field === 'client_id' && formData.clientId) {
          credentials.client_id = formData.clientId;
        } else if (field === 'client_secret' && formData.clientSecret) {
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
    }
  }, [selectedMcpType, formData.apiKey, formData.clientId, formData.clientSecret, formData.credentials, requiresCredentials, getRequiredFields, getCredentialsHash]);

  // Trigger validation when credentials change (with debouncing)
  useEffect(() => {
    if (selectedMcpType && requiresCredentials(selectedMcpType)) {
      const requiredFields = getRequiredFields(selectedMcpType);
      const credentials: Record<string, string> = { ...formData.credentials };
      
      // Map legacy form fields to new credentials format
      for (const field of requiredFields) {
        if (field === 'api_key' && formData.apiKey) {
          credentials.api_key = formData.apiKey;
        } else if (field === 'client_id' && formData.clientId) {
          credentials.client_id = formData.clientId;
        } else if (field === 'client_secret' && formData.clientSecret) {
          credentials.client_secret = formData.clientSecret;
        }
      }

      const hasAllFields = requiredFields.every(field => {
        const value = credentials[field];
        return value && value.trim() !== '';
      });

      if (hasAllFields && !validationState.isValidating) {
        const timeoutId = setTimeout(() => {
          validateCredentials();
        }, 800); // Debounce validation

        return () => clearTimeout(timeoutId);
      }
    }
  }, [selectedMcpType, formData.apiKey, formData.clientId, formData.clientSecret, formData.credentials, requiresCredentials, getRequiredFields, validationState.isValidating, validateCredentials]);

  // Check if form is valid for submission
  const isFormValid = useCallback(() => {
    if (!formData.name || !selectedMcpType || !formData.expiration) return false;
    
    // Check if credentials are required and valid
    if (requiresCredentials(selectedMcpType)) {
      const requiredFields = getRequiredFields(selectedMcpType);
      const hasAllFields = requiredFields.every(field => {
        // Check in new credentials object first, then fall back to legacy fields
        const credentialValue = formData.credentials[field];
        if (credentialValue && credentialValue.trim() !== '') return true;
        
        // Legacy field mapping
        if (field === 'api_key') return formData.apiKey.trim() !== '';
        if (field === 'client_id') return formData.clientId.trim() !== '';
        if (field === 'client_secret') return formData.clientSecret.trim() !== '';
        return false;
      });
      
      return hasAllFields && validationState.isValid === true;
    }
    
    return true;
  }, [formData, selectedMcpType, requiresCredentials, getRequiredFields, validationState]);

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
      
      await onSubmit(transformedData);
      
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