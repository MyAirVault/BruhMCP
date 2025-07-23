/**
 * Get local variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaLocalVariables(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get published variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaPublishedVariables(fileKey: string, apiKey: string): Promise<any>;
/**
 * Create variables in a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data to create
 * @returns {Promise<any>}
 */
export function postFigmaVariables(fileKey: string, apiKey: string, variableData: any): Promise<any>;
/**
 * Update variables in a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data to update
 * @returns {Promise<any>}
 */
export function putFigmaVariables(fileKey: string, apiKey: string, variableData: any): Promise<any>;
/**
 * Delete variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data specifying what to delete
 * @returns {Promise<any>}
 */
export function deleteFigmaVariables(fileKey: string, apiKey: string, variableData: any): Promise<any>;
//# sourceMappingURL=variables.d.ts.map