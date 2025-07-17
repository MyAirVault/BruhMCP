export class TokenManager {
    tokens: Map<any, any>;
    validationCache: Map<any, any>;
    cacheTimeout: number;
    cleanupInterval: number;
    /**
     * Add token to manager
     * @param {string} instanceId - Instance ID
     * @param {string} token - API token
     * @param {Object} metadata - Token metadata
     * @returns {Promise<Object>} Token info
     */
    addToken(instanceId: string, token: string, metadata?: Object): Promise<Object>;
    /**
     * Get token for instance
     * @param {string} instanceId - Instance ID
     * @returns {string|null} Token or null if not found
     */
    getToken(instanceId: string): string | null;
    /**
     * Get token info for instance
     * @param {string} instanceId - Instance ID
     * @returns {Object|null} Token info or null if not found
     */
    getTokenInfo(instanceId: string): Object | null;
    /**
     * Validate token for instance
     * @param {string} instanceId - Instance ID
     * @param {boolean} useCache - Whether to use cached validation
     * @returns {Promise<Object>} Validation result
     */
    validateInstanceToken(instanceId: string, useCache?: boolean): Promise<Object>;
    /**
     * Remove token for instance
     * @param {string} instanceId - Instance ID
     * @returns {boolean} True if removed
     */
    removeToken(instanceId: string): boolean;
    /**
     * Update token metadata
     * @param {string} instanceId - Instance ID
     * @param {Object} metadata - Metadata to update
     * @returns {boolean} True if updated
     */
    updateTokenMetadata(instanceId: string, metadata: Object): boolean;
    /**
     * Check if token exists for instance
     * @param {string} instanceId - Instance ID
     * @returns {boolean} True if exists
     */
    hasToken(instanceId: string): boolean;
    /**
     * Get all instance IDs
     * @returns {Array} Array of instance IDs
     */
    getInstanceIds(): any[];
    /**
     * Get token count
     * @returns {number} Number of tokens
     */
    getTokenCount(): number;
    /**
     * Get tokens by type
     * @param {string} type - Token type
     * @returns {Array} Array of token info objects
     */
    getTokensByType(type: string): any[];
    /**
     * Get tokens by user ID
     * @param {string} userId - User ID
     * @returns {Array} Array of token info objects
     */
    getTokensByUserId(userId: string): any[];
    /**
     * Refresh all token validations
     * @returns {Promise<Object>} Refresh results
     */
    refreshAllValidations(): Promise<Object>;
    /**
     * Clean up expired cache entries
     */
    cleanup(): void;
    /**
     * Start cleanup interval
     */
    startCleanup(): void;
    cleanupIntervalId: NodeJS.Timeout | null | undefined;
    /**
     * Stop cleanup interval
     */
    stopCleanup(): void;
    /**
     * Get statistics
     * @returns {Object} Statistics
     */
    getStatistics(): Object;
    /**
     * Clear all tokens
     */
    clearAllTokens(): void;
    /**
     * Export tokens (without sensitive data)
     * @returns {Array} Array of token info
     */
    exportTokens(): any[];
    /**
     * Health check
     * @returns {Object} Health status
     */
    getHealthStatus(): Object;
    /**
     * Shutdown token manager
     */
    shutdown(): void;
}
//# sourceMappingURL=token-manager.d.ts.map