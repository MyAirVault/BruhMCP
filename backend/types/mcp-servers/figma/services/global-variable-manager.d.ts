/**
 * Manages global variables for deduplicating repeated content in Figma responses
 */
export class GlobalVariableManager {
    variables: {
        styles: {};
        fills: {};
        strokes: {};
        effects: {};
        layouts: {};
        textStyles: {};
    };
    counters: {
        style: number;
        fill: number;
        stroke: number;
        effect: number;
        layout: number;
        textStyle: number;
    };
    /**
     * Find existing variable or create new one for given value
     * @param {any} value - Value to store or find
     * @param {string} prefix - Variable type prefix
     * @returns {string} Variable ID
     */
    findOrCreateVariable(value: any, prefix: string): string;
    /**
     * Find existing variable by hash
     * @param {string} hash - Value hash
     * @param {string} prefix - Variable type prefix
     * @returns {string|null} Variable ID if found
     */
    findExistingVariable(hash: string, prefix: string): string | null;
    /**
     * Store variable in appropriate category
     * @param {string} variableId - Variable ID
     * @param {any} value - Value to store
     * @param {string} prefix - Variable type prefix
     * @param {string} hash - Value hash
     */
    storeVariable(variableId: string, value: any, prefix: string, hash: string): void;
    /**
     * Generate unique variable ID
     * @param {string} prefix - Variable type prefix
     * @returns {string} Variable ID
     */
    generateVariableId(prefix: string): string;
    /**
     * Generate hash for value deduplication
     * @param {any} value - Value to hash
     * @returns {string} Hash string
     */
    generateHash(value: any): string;
    /**
     * Normalize value for consistent hashing
     * @param {any} value - Value to normalize
     * @returns {any} Normalized value
     */
    normalizeValue(value: any): any;
    /**
     * Get category name for variable type
     * @param {string} prefix - Variable type prefix
     * @returns {string} Category name
     */
    getCategoryName(prefix: string): string;
    /**
     * Get variable by ID
     * @param {string} variableId - Variable ID
     * @returns {any} Variable value
     */
    getVariable(variableId: string): any;
    /**
     * Get all variables organized by category
     * @returns {object} All variables
     */
    getAllVariables(): object;
    /**
     * Get statistics about variable usage
     * @returns {object} Usage statistics
     */
    getStatistics(): object;
    /**
     * Clear all variables
     */
    clear(): void;
}
//# sourceMappingURL=global-variable-manager.d.ts.map