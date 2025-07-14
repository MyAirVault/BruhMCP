/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * Renew expired MCP instance with new expiration date
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function renewInstance(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=renewInstance.d.ts.map