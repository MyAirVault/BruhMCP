export class ResponseSimplifier {
    cache: Map<any, any>;
    simplificationRules: {
        removeSystemFields: boolean;
        flattenSingleValues: boolean;
        simplifyAttachments: boolean;
        simplifyCollaborators: boolean;
        simplifyRecordLinks: boolean;
        formatDates: boolean;
        normalizeFieldNames: boolean;
    };
    /**
     * Set simplification rules
     * @param {Object} rules - Simplification rules
     */
    setRules(rules: Object): void;
    /**
     * Simplify records response
     * @param {Object} response - Original response
     * @returns {Object} Simplified response
     */
    simplifyRecordsResponse(response: Object): Object;
    /**
     * Simplify records array
     * @param {Array} records - Array of records
     * @returns {Array} Simplified records
     */
    simplifyRecordsArray(records: any[]): any[];
    /**
     * Simplify single record response
     * @param {Object} response - Original response
     * @returns {Object} Simplified response
     */
    simplifyRecordResponse(response: Object): Object;
    /**
     * Simplify multiple records response
     * @param {Object} response - Original response
     * @returns {Object} Simplified response
     */
    simplifyMultipleRecordsResponse(response: Object): Object;
    /**
     * Simplify single record
     * @param {Object} record - Record object
     * @returns {Object} Simplified record
     */
    simplifyRecord(record: Object): Object;
    /**
     * Simplify field value based on type
     * @param {any} value - Field value
     * @param {string} fieldName - Field name for context
     * @returns {any} Simplified value
     */
    simplifyFieldValue(value: any, fieldName: string): any;
    /**
     * Simplify attachment object
     * @param {Object} attachment - Attachment object
     * @returns {Object} Simplified attachment
     */
    simplifyAttachment(attachment: Object): Object;
    /**
     * Simplify collaborator object
     * @param {Object} collaborator - Collaborator object
     * @returns {Object|string} Simplified collaborator
     */
    simplifyCollaborator(collaborator: Object): Object | string;
    /**
     * Simplify record link object
     * @param {Object} recordLink - Record link object
     * @returns {Object|string} Simplified record link
     */
    simplifyRecordLink(recordLink: Object): Object | string;
    /**
     * Simplify generic object
     * @param {Object} obj - Object to simplify
     * @returns {Object} Simplified object
     */
    simplifyObject(obj: Object): Object;
    /**
     * Check if field is a system field
     * @param {string} fieldName - Field name
     * @returns {boolean}
     */
    isSystemField(fieldName: string): boolean;
    /**
     * Normalize field name
     * @param {string} fieldName - Original field name
     * @returns {string} Normalized field name
     */
    normalizeFieldName(fieldName: string): string;
    /**
     * Check if string is a date
     * @param {string} value - String value
     * @returns {boolean}
     */
    isDateString(value: string): boolean;
    /**
     * Format date string
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    formatDate(dateString: string): string;
    /**
     * Flatten nested objects to a single level
     * @param {Object} obj - Object to flatten
     * @param {string} prefix - Prefix for keys
     * @returns {Object} Flattened object
     */
    flattenObject(obj: Object, prefix?: string): Object;
    /**
     * Create summary view of records
     * @param {Array} records - Array of records
     * @param {Object} options - Summary options
     * @returns {Object} Summary object
     */
    createSummary(records: any[], options?: Object): Object;
    /**
     * Extract field values as arrays
     * @param {Array} records - Array of records
     * @param {string} fieldName - Field name to extract
     * @returns {Array} Array of field values
     */
    extractFieldValues(records: any[], fieldName: string): any[];
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get current rules
     * @returns {Object} Current simplification rules
     */
    getRules(): Object;
}
//# sourceMappingURL=response-simplifier.d.ts.map