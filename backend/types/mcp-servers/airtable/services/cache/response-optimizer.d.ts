export class ResponseOptimizer {
    cache: Map<any, any>;
    compressionStats: {
        totalRequests: number;
        totalOriginalSize: number;
        totalOptimizedSize: number;
        compressionRatio: number;
    };
    /**
     * Optimize bases response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeBasesResponse(response: Object): Object;
    /**
     * Optimize schema response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeSchemaResponse(response: Object): Object;
    /**
     * Optimize field options
     * @param {Object} options - Field options
     * @returns {Object} Optimized options
     */
    optimizeFieldOptions(options: Object): Object;
    /**
     * Optimize records response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeRecordsResponse(response: Object): Object;
    /**
     * Optimize records array
     * @param {Array} records - Array of records
     * @returns {Array} Optimized records
     */
    optimizeRecordsArray(records: any[]): any[];
    /**
     * Optimize single record
     * @param {Object} record - Record object
     * @returns {Object} Optimized record
     */
    optimizeRecord(record: Object): Object;
    /**
     * Optimize single record response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeRecordResponse(response: Object): Object;
    /**
     * Optimize multiple records response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeMultipleRecordsResponse(response: Object): Object;
    /**
     * Optimize field value based on type
     * @param {any} value - Field value
     * @returns {any} Optimized value
     */
    optimizeFieldValue(value: any): any;
    /**
     * Generic response optimization
     * @param {Object} response - Response to optimize
     * @param {Object} options - Optimization options
     * @returns {Object} Optimized response
     */
    optimizeResponse(response: Object, options?: Object): Object;
    /**
     * Check if value is empty
     * @param {any} value - Value to check
     * @returns {boolean}
     */
    isEmpty(value: any): boolean;
    /**
     * Check if field is metadata
     * @param {string} fieldName - Field name
     * @returns {boolean}
     */
    isMetadataField(fieldName: string): boolean;
    /**
     * Calculate response size (rough estimate)
     * @param {any} response - Response object
     * @returns {number} Size in bytes
     */
    calculateResponseSize(response: any): number;
    /**
     * Update compression statistics
     * @param {number} originalSize - Original size
     * @param {number} optimizedSize - Optimized size
     */
    updateCompressionStats(originalSize: number, optimizedSize: number): void;
    /**
     * Get compression statistics
     * @returns {Object}
     */
    getCompressionStats(): Object;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Reset statistics
     */
    resetStats(): void;
}
//# sourceMappingURL=response-optimizer.d.ts.map