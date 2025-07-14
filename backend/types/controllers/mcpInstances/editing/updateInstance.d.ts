/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * Update MCP instance (combined name and credentials update)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function updateInstance(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=updateInstance.d.ts.map