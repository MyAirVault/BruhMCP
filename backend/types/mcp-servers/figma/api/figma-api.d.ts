/**
 * Get file details from Figma API
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaFile(fileKey: string, apiKey: string): Promise<any>;
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
 * Get comments from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaComments(fileKey: string, apiKey: string): Promise<any>;
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
 * Get rendered images from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs to render
 * @param {string} [format='png'] - Image format (png, jpg, svg, pdf)
 * @param {number} [scale=1] - Image scale factor
 * @returns {Promise<any>}
 */
export function getFigmaImages(fileKey: string, apiKey: string, nodeIds: string[], format?: string, scale?: number): Promise<any>;
/**
 * Get image fills from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaImageFills(fileKey: string, apiKey: string): Promise<any>;
/**
 * Get user information
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaUser(apiKey: string): Promise<any>;
/**
 * Get team projects
 * @param {string} teamId - Team ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaTeamProjects(teamId: string, apiKey: string): Promise<any>;
/**
 * Get project files
 * @param {string} projectId - Project ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaProjectFiles(projectId: string, apiKey: string): Promise<any>;
/**
 * Post a comment to a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} message - Comment message
 * @param {Object} [position] - Comment position with x, y coordinates
 * @returns {Promise<any>}
 */
export function postFigmaComment(fileKey: string, apiKey: string, message: string, position?: Object): Promise<any>;
/**
 * Delete a comment from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} commentId - Comment ID to delete
 * @returns {Promise<any>}
 */
export function deleteFigmaComment(fileKey: string, apiKey: string, commentId: string): Promise<any>;
/**
 * Get team components
 * @param {string} teamId - Team ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaTeamComponents(teamId: string, apiKey: string): Promise<any>;
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
/**
 * Create a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {any} webhookData - Webhook configuration data
 * @returns {Promise<any>}
 */
export function postFigmaWebhook(apiKey: string, webhookData: any): Promise<any>;
/**
 * Get webhooks (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} [teamId] - Optional team ID to filter webhooks
 * @returns {Promise<any>}
 */
export function getFigmaWebhooks(apiKey: string, teamId?: string): Promise<any>;
/**
 * Update a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to update
 * @param {any} webhookData - Updated webhook configuration data
 * @returns {Promise<any>}
 */
export function putFigmaWebhook(apiKey: string, webhookId: string, webhookData: any): Promise<any>;
/**
 * Delete a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to delete
 * @returns {Promise<any>}
 */
export function deleteFigmaWebhook(apiKey: string, webhookId: string): Promise<any>;
/**
 * Get file at specific version
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} versionId - Version ID to retrieve
 * @returns {Promise<any>}
 */
export function getFigmaFileWithVersion(fileKey: string, apiKey: string, versionId: string): Promise<any>;
//# sourceMappingURL=figma-api.d.ts.map