/**
 * Middleware to check if MCP instance is active and accessible
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
export function checkMCPAccess(req: Request, res: Response, next: Function): Promise<void>;
/**
 * Middleware specifically for MCP routes that extracts instance ID from URL
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
export function mcpRouteAccessControl(req: Request, res: Response, next: Function): void;
//# sourceMappingURL=mcpAccessControl.d.ts.map