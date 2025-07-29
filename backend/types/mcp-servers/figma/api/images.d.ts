/**
 * Get rendered images from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs to render
 * @param {string} [format='png'] - Image format (png, jpg, svg, pdf)
 * @param {number} [scale=1] - Image scale factor
 * @returns {Promise<any>}
 */
export function getFigmaImages(fileKey: string, apiKey: string, nodeIds: string[], format?: string | undefined, scale?: number | undefined): Promise<any>;
/**
 * Get image fills from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaImageFills(fileKey: string, apiKey: string): Promise<any>;
//# sourceMappingURL=images.d.ts.map