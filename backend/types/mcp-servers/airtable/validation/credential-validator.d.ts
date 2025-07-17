export class CredentialValidator {
    validationCache: Map<any, any>;
    cacheTimeout: number;
    validationRules: {
        enforceTokenFormat: boolean;
        requireActiveToken: boolean;
        checkTokenScopes: boolean;
        validateBaseAccess: boolean;
        maxTokenAge: null;
        allowedTokenTypes: string[];
    };
    /**
     * Set validation rules
     * @param {Object} rules - Validation rules
     */
    setValidationRules(rules: Object): void;
    /**
     * Validate credentials
     * @param {Object} credentials - Credentials to validate
     * @param {Object} options - Validation options
     * @returns {Promise<Object>} Validation result
     */
    validateCredentials(credentials: Object, options?: Object): Promise<Object>;
    /**
     * Validate credential structure
     * @param {Object} credentials - Credentials to validate
     * @returns {Object} Structure validation result
     */
    validateCredentialStructure(credentials: Object): Object;
    /**
     * Validate token with Airtable API
     * @param {string} apiKey - API key to validate
     * @returns {Promise<Object>} Token validation result
     */
    validateTokenWithAPI(apiKey: string): Promise<Object>;
    /**
     * Perform additional validations
     * @param {Object} credentials - Credentials
     * @param {Object} tokenValidation - Token validation result
     * @returns {Promise<Object>} Additional validation results
     */
    performAdditionalValidations(credentials: Object, tokenValidation: Object): Promise<Object>;
    /**
     * Validate base access
     * @param {string} apiKey - API key
     * @param {string} baseId - Base ID
     * @returns {Promise<Object>} Base access validation result
     */
    validateBaseAccess(apiKey: string, baseId: string): Promise<Object>;
    /**
     * Validate token age
     * @param {Object} tokenValidation - Token validation result
     * @returns {Object} Token age validation result
     */
    validateTokenAge(tokenValidation: Object): Object;
    /**
     * Validate required scopes
     * @param {Array} tokenScopes - Token scopes
     * @returns {Object} Scope validation result
     */
    validateRequiredScopes(tokenScopes: any[]): Object;
    /**
     * Validate instance ID format
     * @param {string} instanceId - Instance ID
     * @returns {boolean} True if valid
     */
    isValidInstanceId(instanceId: string): boolean;
    /**
     * Validate multiple credentials
     * @param {Array} credentialsList - Array of credentials
     * @param {Object} options - Validation options
     * @returns {Promise<Array>} Array of validation results
     */
    validateMultipleCredentials(credentialsList: any[], options?: Object): Promise<any[]>;
    /**
     * Refresh credential validation
     * @param {Object} credentials - Credentials to refresh
     * @returns {Promise<Object>} Refreshed validation result
     */
    refreshCredentialValidation(credentials: Object): Promise<Object>;
    /**
     * Get validation rules
     * @returns {Object} Current validation rules
     */
    getValidationRules(): Object;
    /**
     * Clear validation cache
     */
    clearValidationCache(): void;
    /**
     * Get validation cache statistics
     * @returns {Object} Cache statistics
     */
    getValidationCacheStats(): Object;
    /**
     * Cleanup expired cache entries
     */
    cleanupExpiredEntries(): number;
    /**
     * Create validation report
     * @param {Object} validationResult - Validation result
     * @returns {Object} Validation report
     */
    createValidationReport(validationResult: Object): Object;
    /**
     * Generate recommendations based on validation result
     * @param {Object} validationResult - Validation result
     * @returns {Array} Array of recommendations
     */
    generateRecommendations(validationResult: Object): any[];
}
//# sourceMappingURL=credential-validator.d.ts.map