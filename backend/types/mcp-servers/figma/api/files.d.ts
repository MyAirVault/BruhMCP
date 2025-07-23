/**
 * Get file details from Figma API
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaFile(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get file nodes by their IDs
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs to fetch
 * @returns {Promise<any>}
 */
export function getFigmaNodes(fileKey: string, apiKey: string, nodeIds: string[]): Promise<any>;
/**
 * Get file metadata
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaFileMeta(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get file versions
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaFileVersions(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get file at specific version
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} versionId - Version ID to retrieve
 * @returns {Promise<any>}
 */
export function getFigmaFileWithVersion(fileKey: string, apiKey: string, versionId: string): Promise<any>;
//# sourceMappingURL=files.d.ts.map