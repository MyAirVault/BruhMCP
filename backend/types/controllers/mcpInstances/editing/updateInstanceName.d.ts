export type Request = import('express').Request;
export type Response = import('express').Response;
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * Update MCP instance custom name
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function updateInstanceName(req: Request, res: Response): Promise<void>;
/**
 * Validate custom name (standalone function for reuse)
 * @param {string} name - Name to validate
 * @returns {any} Validation result
 */
export function validateInstanceCustomName(name: string): any;
/**
 * Validate custom name format and content
 * @param {string} name - Name to validate
 * @returns {any} Validation result with cleaned name
 */
export function validateCustomName(name: string): any;
//# sourceMappingURL=updateInstanceName.d.ts.map