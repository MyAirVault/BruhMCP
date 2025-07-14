/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * Update MCP instance custom name
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function updateInstanceName(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
/**
 * Validate custom name (standalone function for reuse)
 * @param {string} name - Name to validate
 * @returns {Object} Validation result
 */
export function validateInstanceCustomName(name: string): Object;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=updateInstanceName.d.ts.map