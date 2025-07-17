export class GlobalVariableManager {
    variables: Map<any, any>;
    watchers: Map<any, any>;
    defaultVariables: {
        maxRecordsPerPage: number;
        maxBatchSize: number;
        defaultTimeout: number;
        retryAttempts: number;
        cacheTimeout: number;
        rateLimitDelay: number;
        optimizeResponses: boolean;
        simplifyResponses: boolean;
        enableMetrics: boolean;
        logLevel: string;
    };
    /**
     * Initialize with default variables
     */
    initialize(): void;
    /**
     * Get variable value
     * @param {string} key - Variable key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Variable value
     */
    get(key: string, defaultValue?: any): any;
    /**
     * Set variable value
     * @param {string} key - Variable key
     * @param {any} value - Variable value
     * @param {Object} options - Set options
     */
    set(key: string, value: any, options?: Object): void;
    /**
     * Set multiple variables
     * @param {Object} vars - Variables object
     * @param {Object} options - Set options
     */
    setMany(vars: Object, options?: Object): void;
    /**
     * Delete variable
     * @param {string} key - Variable key
     * @returns {boolean} True if deleted
     */
    delete(key: string): boolean;
    /**
     * Check if variable exists
     * @param {string} key - Variable key
     * @returns {boolean} True if exists
     */
    has(key: string): boolean;
    /**
     * Get all variables
     * @returns {Object} All variables
     */
    getAll(): Object;
    /**
     * Get variable keys
     * @returns {Array} Array of keys
     */
    getKeys(): any[];
    /**
     * Clear all variables
     */
    clear(): void;
    /**
     * Reset to default variables
     */
    reset(): void;
    /**
     * Watch variable changes
     * @param {string} key - Variable key to watch
     * @param {Function} callback - Callback function
     * @returns {string} Watcher ID
     */
    watch(key: string, callback: Function): string;
    /**
     * Unwatch variable changes
     * @param {string} key - Variable key
     * @param {string} watcherId - Watcher ID
     * @returns {boolean} True if unwatched
     */
    unwatch(key: string, watcherId: string): boolean;
    /**
     * Notify watchers of variable change
     * @param {string} key - Variable key
     * @param {any} newValue - New value
     * @param {any} oldValue - Old value
     */
    notifyWatchers(key: string, newValue: any, oldValue: any): void;
    /**
     * Validate variable value
     * @param {string} key - Variable key
     * @param {any} value - Value to validate
     * @returns {boolean} True if valid
     */
    validateValue(key: string, value: any): boolean;
    /**
     * Get configuration object for specific component
     * @param {string} component - Component name
     * @returns {Object} Configuration object
     */
    getConfig(component: string): Object;
    /**
     * Create scoped variable manager
     * @param {string} scope - Scope name
     * @returns {Object} Scoped manager
     */
    createScope(scope: string): Object;
    /**
     * Import variables from object
     * @param {Object} vars - Variables to import
     * @param {Object} options - Import options
     */
    import(vars: Object, options?: Object): void;
    /**
     * Export variables to object
     * @param {Array} keys - Keys to export (optional)
     * @returns {Object} Exported variables
     */
    export(keys?: any[]): Object;
    /**
     * Get variable statistics
     * @returns {Object} Statistics
     */
    getStats(): Object;
    /**
     * Calculate rough memory usage
     * @returns {number} Memory usage in bytes
     */
    calculateMemoryUsage(): number;
}
//# sourceMappingURL=global-variable-manager.d.ts.map