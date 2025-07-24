import { useCallback, useRef } from 'react';
import { type MCPType } from '../types';
import { type ValidationState } from '../types/createMCPModal';
import { apiService } from '../services/apiService';

export interface CredentialData {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  credentials?: Record<string, string>;
}

/**
 * Shared validation utilities for MCP credential validation
 * Used by both create and edit modals for consistency
 */
export const useMCPValidation = () => {
  const lastValidatedCredentialsRef = useRef<string | null>(null);

  const getRequiredFields = useCallback((mcpType: MCPType | null) => {
    if (!mcpType || !mcpType.required_fields) return [];
    return mcpType.required_fields.map(field => field.name);
  }, []);

  const requiresCredentials = useCallback((mcpType: MCPType | null) => {
    return mcpType && mcpType.required_fields && mcpType.required_fields.length > 0;
  }, []);

  const getCredentialsHash = useCallback((credentials: Record<string, string>) => {
    return JSON.stringify(credentials);
  }, []);

  const buildCredentialsObject = useCallback((
    mcpType: MCPType | null,
    credentialData: CredentialData
  ): Record<string, string> => {
    if (!mcpType) return {};

    const requiredFields = getRequiredFields(mcpType);
    const credentials: Record<string, string> = { ...credentialData.credentials };
    
    // Map legacy form fields to new credentials format
    for (const field of requiredFields) {
      if (field === 'api_key' && credentialData.apiKey) {
        credentials.api_key = credentialData.apiKey;
      } else if (field === 'client_id' && credentialData.clientId) {
        credentials.client_id = credentialData.clientId;
      } else if (field === 'client_secret' && credentialData.clientSecret) {
        credentials.client_secret = credentialData.clientSecret;
      }
    }

    return credentials;
  }, [getRequiredFields]);

  const hasAllRequiredFields = useCallback((
    mcpType: MCPType | null,
    credentialData: CredentialData
  ): boolean => {
    if (!mcpType) return true;

    const requiredFields = getRequiredFields(mcpType);
    const credentials = buildCredentialsObject(mcpType, credentialData);

    return requiredFields.every(field => {
      const value = credentials[field];
      return value && value.trim() !== '';
    });
  }, [getRequiredFields, buildCredentialsObject]);

  const validateCredentials = useCallback(async (
    mcpType: MCPType | null,
    credentialData: CredentialData,
    validationState: ValidationState,
    setValidationState: (state: ValidationState | ((prev: ValidationState) => ValidationState)) => void
  ): Promise<void> => {
    if (!mcpType || !requiresCredentials(mcpType)) return;

    const credentials = buildCredentialsObject(mcpType, credentialData);
    
    if (!hasAllRequiredFields(mcpType, credentialData)) {
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
      return;
    }

    setValidationState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      console.log('🔄 Validating credentials for:', mcpType.name, credentials);
      const result = await apiService.validateCredentials({
        mcp_type_id: mcpType.id,
        credentials
      });
      console.log('📥 Validation result:', result);

      setValidationState({
        isValidating: false,
        isValid: result.valid,
        error: null,
        apiInfo: result.api_info || null,
        failureCount: 0,
        lastFailedCredentials: null
      });
      
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
  }, [requiresCredentials, buildCredentialsObject, hasAllRequiredFields, getCredentialsHash]);

  return {
    getRequiredFields,
    requiresCredentials,
    getCredentialsHash,
    buildCredentialsObject,
    hasAllRequiredFields,
    validateCredentials,
    lastValidatedCredentialsRef
  };
};