/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * Toggle MCP instance status between active and inactive
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function toggleInstanceStatus(req: Request, res: Response): Promise<import("express").Response<any, Record<string, any>> | undefined>;
export type Request = import("express").Request;
export type Response = import("express").Response;
//# sourceMappingURL=toggleInstanceStatus.d.ts.map