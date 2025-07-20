import { useState, useCallback, useEffect, useRef } from 'react';
import { type MCPType, type MCPInstanceCreationResponse } from '../types';
import { type CreateMCPFormData, type ValidationState } from '../types/createMCPModal';
import { apiService } from '../services/apiService';
import { useMCPValidation } from '../utils/mcpValidation';

interface UseCreateMCPFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMCPFormData) => Promise<MCPInstanceCreationResponse>;
  onPlanLimitReached?: (title: string, message: string) => void;
  onSuccess?: (mcp: import('../types').MCPItem) => void;
}

/**
 * Custom hook to manage CreateMCP form state and validation
 * Handles form data, validation state, and submission logic
 */
export const useCreateMCPForm = ({ isOpen, onClose, onSubmit, onPlanLimitReached, onSuccess }: UseCreateMCPFormProps) => {
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
  const [oAuthError, setOAuthError] = useState<string | null>(null);
  const [oAuthState, setOAuthState] = useState<'idle' | 'authorizing' | 'completed' | 'error'>('idle');
  const [oAuthInstanceId, setOAuthInstanceId] = useState<string | null>(null);
  const [planLimits, setPlanLimits] = useState<{
    canCreate: boolean;
    activeInstances: number;
    maxInstances: number | null;
    planType: string;
    message: string;
  } | null>(null);
  
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
  const pollIntervalRef = useRef<number | null>(null);

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

  // Load user plan limits when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadPlanLimits = async () => {
        try {
          const planData = await apiService.getUserPlan();
          setPlanLimits({
            canCreate: planData.canCreate,
            activeInstances: planData.activeInstances,
            maxInstances: planData.maxInstances,
            planType: planData.plan.type,
            message: planData.message
          });

          // If user cannot create instances due to plan limits, trigger the plan limit modal
          if (!planData.canCreate && onPlanLimitReached) {
            onPlanLimitReached('Plan Limit Reached', planData.message);
            // Close the create modal since we're showing the plan limit modal
            onClose();
          }
        } catch (error) {
          console.error('Failed to load plan limits:', error);
          // Set conservative limits if failed to load
          setPlanLimits({
            canCreate: false,
            activeInstances: 0,
            maxInstances: 1,
            planType: 'free',
            message: 'Unable to verify plan limits'
          });

          // Also trigger plan limit modal for failed plan verification
          if (onPlanLimitReached) {
            onPlanLimitReached('Plan Verification Failed', 'Unable to verify plan limits. Please try again or contact support.');
            onClose();
          }
        }
      };

      loadPlanLimits();
    }
  }, [isOpen, onPlanLimitReached, onClose]);

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
      setOAuthError(null);
      setOAuthState('idle');
      setOAuthInstanceId(null);
      lastValidatedCredentialsRef.current = null;
      
      // Clear any existing polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  const handleInputChange = useCallback((field: keyof CreateMCPFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear OAuth error when user makes changes
    if (oAuthError) {
      setOAuthError(null);
    }
  }, [oAuthError]);

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
    // Clear OAuth error when type changes
    if (oAuthError) {
      setOAuthError(null);
    }
  }, [handleInputChange, oAuthError]);

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
    
    // CRITICAL: Check plan limits first - prevent form submission if user has reached their limit
    if (planLimits && !planLimits.canCreate) {
      return false;
    }
    
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
  }, [formData, selectedMcpType, requiresCredentials, hasAllRequiredFields, validationState, planLimits]);

  // OAuth detection functions
  const isOAuthService = useCallback((mcpType: MCPType | null) => {
    return mcpType?.type === 'oauth';
  }, []);

  const isApiKeyService = useCallback((mcpType: MCPType | null) => {
    return mcpType?.type === 'api_key';
  }, []);

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
      
      // For OAuth services, we need to handle the OAuth flow differently
      if (selectedMcpType && isOAuthService(selectedMcpType)) {
        // Call the parent's onSubmit which will create the instance and initiate OAuth
        const response = await onSubmit(transformedData);
        
        // Check if response contains OAuth information
        console.log('OAuth service response:', response); // Debug log
        if (response && response.oauth && response.oauth.requires_user_consent) {
          // OAuth flow initiated - open authorization URL in new window
          console.log('Opening OAuth authorization URL'); // Debug log
          console.log('Authorization URL:', response.oauth.authorization_url);
          console.log('Provider:', response.oauth.provider);
          console.log('Instance ID:', response.instance?.id);
          console.log('Full response structure:', response);
          
          // Validate the authorization URL
          if (!response.oauth.authorization_url || response.oauth.authorization_url === '') {
            console.error('Invalid authorization URL received');
            setOAuthError('Invalid authorization URL received from server');
            setIsSubmitting(false);
            return;
          }
          
          // Get instance ID from the response
          const instanceId = response.instance?.id || response.oauth?.instance_id;
          
          if (!instanceId) {
            console.error('No instance ID found in response:', response);
            setOAuthError('Failed to get instance ID from server response');
            setIsSubmitting(false);
            return;
          }
          
          // Open OAuth URL in new window
          const authWindow = window.open(
            response.oauth.authorization_url,
            `oauth_${response.oauth.provider}_${instanceId}`,
            'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes'
          );
          
          if (!authWindow) {
            setOAuthError('Failed to open authorization window. Please check your popup blocker settings.');
            setIsSubmitting(false);
            return;
          }
          
          // Store instance ID for status polling
          setOAuthInstanceId(instanceId);
          setOAuthState('authorizing');
          
          // Keep modal open - will close after OAuth completes
          return;
        }
      } else {
        // For API key services, use the normal flow
        await onSubmit(transformedData);
      }
      
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
  }, [isFormValid, isSubmitting, selectedMcpType, requiresCredentials, validationState, validateCredentials, formData, onSubmit, onClose, isOAuthService]);

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

  // Poll OAuth status
  useEffect(() => {
    if (oAuthState === 'authorizing' && oAuthInstanceId) {
      console.log('Starting OAuth polling for instance:', oAuthInstanceId);
      
      // Start polling for OAuth completion
      pollIntervalRef.current = setInterval(async () => {
        try {
          const instance = await apiService.getMCPInstance(oAuthInstanceId);
          console.log('Polling - Instance:', instance);
          console.log('Polling - OAuth status:', instance.oauth_status);
          
          if (instance.oauth_status === 'completed') {
            // OAuth completed successfully
            setOAuthState('completed');
            setIsSubmitting(false);
            
            // Clear polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            // Create MCP item for success callback
            if (onSuccess) {
              const newMCP = {
                id: instance.id,
                name: instance.custom_name || instance.mcp_type.display_name,
                email: instance.access_url, // For backward compatibility
                status: instance.status as 'active' | 'inactive' | 'expired',
                mcpType: instance.mcp_type.name,
                access_url: instance.access_url,
                icon_url: instance.mcp_type.icon_url
              };
              onSuccess(newMCP);
            }
            
            // Close modal and refresh
            onClose();
            
            // Optionally trigger a refresh of the MCP list
            window.location.reload();
          } else if (instance.oauth_status === 'failed') {
            // OAuth failed
            setOAuthState('error');
            setOAuthError('OAuth authorization failed. Please try again.');
            setIsSubmitting(false);
            
            // Clear polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          } else if (instance.oauth_status === 'expired') {
            // OAuth expired
            setOAuthState('error');
            setOAuthError('OAuth authorization expired. Please try again.');
            setIsSubmitting(false);
            
            // Clear polling
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
          }
          // If oauth_status is still 'pending', continue polling
        } catch (error) {
          console.error('Error polling OAuth status:', error);
        }
      }, 2000); // Poll every 2 seconds
      
      // Cleanup on unmount
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }
  }, [oAuthState, oAuthInstanceId, onClose, onSuccess]);



  return {
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
    requiresCredentials,
    retryValidation,
    isOAuthService,
    isApiKeyService
  };
};