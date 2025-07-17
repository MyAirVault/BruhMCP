export class GlobalVariableManager {
    variables: Map<any, any>;
    cache: Object;
    sessionData: Map<any, any>;
    eventListeners: Map<any, any>;
    /**
     * Initialize default variables
     */
    initializeDefaults(): void;
    /**
     * Set a global variable
     * @param {string} key - Variable key
     * @param {*} value - Variable value
     * @param {Object} options - Set options
     */
    setVariable(key: string, value: any, options?: Object): void;
    /**
     * Get a global variable
     * @param {string} key - Variable key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Variable value
     */
    getVariable(key: string, defaultValue?: any): any;
    /**
     * Delete a global variable
     * @param {string} key - Variable key
     * @returns {boolean} True if deleted
     */
    deleteVariable(key: string): boolean;
    /**
     * Check if variable exists
     * @param {string} key - Variable key
     * @returns {boolean} True if exists
     */
    hasVariable(key: string): boolean;
    /**
     * Get all variables in namespace
     * @param {string} namespace - Namespace
     * @returns {Object} Variables object
     */
    getNamespaceVariables(namespace?: string): Object;
    /**
     * Clear all variables in namespace
     * @param {string} namespace - Namespace
     * @returns {number} Number of variables cleared
     */
    clearNamespace(namespace?: string): number;
    /**
     * Set session data
     * @param {string} sessionId - Session ID
     * @param {string} key - Data key
     * @param {*} value - Data value
     */
    setSessionData(sessionId: string, key: string, value: any): void;
    /**
     * Get session data
     * @param {string} sessionId - Session ID
     * @param {string} key - Data key
     * @param {*} defaultValue - Default value
     * @returns {*} Data value
     */
    getSessionData(sessionId: string, key: string, defaultValue?: any): any;
    /**
     * Clear session data
     * @param {string} sessionId - Session ID
     */
    clearSessionData(sessionId: string): void;
    /**
     * Get all session IDs
     * @returns {Array<string>} Session IDs
     */
    getSessionIds(): Array<string>;
    /**
     * Cache a value
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    cacheValue(key: string, value: any, ttl?: number): void;
    /**
     * Get cached value
     * @param {string} key - Cache key
     * @param {*} defaultValue - Default value
     * @returns {*} Cached value
     */
    getCachedValue(key: string, defaultValue?: any): any;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    addEventListener(event: string, callback: Function): void;
    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    removeEventListener(event: string, callback: Function): void;
    /**
     * Trigger event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    triggerEvent(event: string, data: any): void;
    /**
     * Get variable metadata
     * @param {string} key - Variable key
     * @returns {Object} Variable metadata
     */
    getVariableMetadata(key: string): Object;
    /**
     * Get all variable keys
     * @param {string} namespace - Optional namespace filter
     * @returns {Array<string>} Variable keys
     */
    getVariableKeys(namespace?: string): Array<string>;
    /**
     * Export variables to JSON
     * @param {Object} options - Export options
     * @returns {string} JSON string
     */
    exportVariables(options?: Object): string;
    /**
     * Import variables from JSON
     * @param {string} jsonString - JSON string
     * @param {Object} options - Import options
     */
    importVariables(jsonString: string, options?: Object): void;
    /**
     * Get statistics
     * @returns {Object} Statistics
     */
    getStatistics(): Object;
    /**
     * Clear all data
     */
    clear(): void;
    /**
     * Reset to defaults
     */
    reset(): void;
}
export default GlobalVariableManager;
//# sourceMappingURL=global-variable-manager.d.ts.map