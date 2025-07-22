/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/** @typedef {import('express').ErrorRequestHandler} ErrorRequestHandler */
/**
 * @typedef {Object} MCPLogger
 * @property {string} instanceId - Instance ID
 * @property {string} userId - User ID
 * @property {string} logDir - Log directory path
 * @property {(level: string, message: string, metadata?: Object) => void} app - Log application events
 * @property {(method: string, url: string, statusCode: number, responseTime: number, metadata?: Object) => void} access - Log HTTP access
 * @property {(error: Error | string, metadata?: Object) => void} error - Log errors
 * @property {(message: string, metadata?: Object) => void} info - Log info messages
 * @property {(message: string, metadata?: Object) => void} warn - Log warning messages
 * @property {(message: string, metadata?: Object) => void} debug - Log debug messages
 * @property {(operation: string, data?: Object) => void} mcpOperation - Log MCP operations
 */
/**
 * Create MCP request logging middleware for a specific service
 * @param {string} serviceName - Name of the MCP service (e.g., 'figma', 'github')
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createMCPLoggingMiddleware(serviceName: string): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Create MCP error logging middleware for a specific service
 * @param {string} serviceName - Name of the MCP service
 * @returns {(err: Error, req: Request, res: Response, next: NextFunction) => void} Express error middleware function
 */
export function createMCPErrorMiddleware(serviceName: string): (err: Error, req: Request, res: Response, next: NextFunction) => void;
/**
 * Create MCP operation logging middleware for JSON-RPC operations
 * @param {string} serviceName - Name of the MCP service
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function
 */
export function createMCPOperationMiddleware(serviceName: string): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Create startup logging function for MCP services
 * @param {string} serviceName - Name of the MCP service
 * @param {Object} _serviceConfig - Service configuration (unused)
 * @returns {{logServiceStartup: (activeInstances?: string[]) => void, logInstanceEvent: (instanceId: string, event: string, data?: Object) => void}} Service logger object
 */
export function createMCPServiceLogger(serviceName: string, _serviceConfig: Object): {
    logServiceStartup: (activeInstances?: string[]) => void;
    logInstanceEvent: (instanceId: string, event: string, data?: Object) => void;
};
declare namespace _default {
    export { createMCPLoggingMiddleware };
    export { createMCPErrorMiddleware };
    export { createMCPOperationMiddleware };
    export { createMCPServiceLogger };
}
export default _default;
export type Request = import("express").Request;
export type Response = import("express").Response;
export type NextFunction = import("express").NextFunction;
export type ErrorRequestHandler = import("express").ErrorRequestHandler;
export type MCPLogger = {
    /**
     * - Instance ID
     */
    instanceId: string;
    /**
     * - User ID
     */
    userId: string;
    /**
     * - Log directory path
     */
    logDir: string;
    /**
     * - Log application events
     */
    app: (level: string, message: string, metadata?: Object) => void;
    /**
     * - Log HTTP access
     */
    access: (method: string, url: string, statusCode: number, responseTime: number, metadata?: Object) => void;
    /**
     * - Log errors
     */
    error: (error: Error | string, metadata?: Object) => void;
    /**
     * - Log info messages
     */
    info: (message: string, metadata?: Object) => void;
    /**
     * - Log warning messages
     */
    warn: (message: string, metadata?: Object) => void;
    /**
     * - Log debug messages
     */
    debug: (message: string, metadata?: Object) => void;
    /**
     * - Log MCP operations
     */
    mcpOperation: (operation: string, data?: Object) => void;
};
//# sourceMappingURL=mcpLoggingMiddleware.d.ts.map