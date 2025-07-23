/**
 * Get published components from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaComponents(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get published styles from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaStyles(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get component sets from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaComponentSets(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get individual component information
 * @param {string} componentKey - Component key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaComponentInfo(componentKey: string, apiKey: string): Promise<any>;
/**
 * Get component set information
 * @param {string} componentSetKey - Component set key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaComponentSetInfo(componentSetKey: string, apiKey: string): Promise<any>;
//# sourceMappingURL=components.d.ts.map