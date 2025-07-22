/**
 * Middleware to check if MCP instance is active and accessible
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export function checkMCPAccess(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): Promise<void>;
/**
 * Middleware specifically for MCP routes that extracts instance ID from URL
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export function mcpRouteAccessControl(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void;
//# sourceMappingURL=mcpAccessControl.d.ts.map