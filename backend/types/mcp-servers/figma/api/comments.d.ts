/**
 * Get comments from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export function getFigmaComments(fileKey: string, apiKey: string): Promise<any>;
/**
 * Post a comment to a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} message - Comment message
 * @param {import('./common.js').CommentPosition} [position] - Comment position with x, y coordinates
 * @returns {Promise<any>}
 */
export function postFigmaComment(fileKey: string, apiKey: string, message: string, position?: import("./common.js").CommentPosition | undefined): Promise<any>;
/**
 * Delete a comment from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} commentId - Comment ID to delete
 * @returns {Promise<any>}
 */
export function deleteFigmaComment(fileKey: string, apiKey: string, commentId: string): Promise<any>;
//# sourceMappingURL=comments.d.ts.map