/**
 * Create MCP request logging middleware for a specific service
 * @param {string} serviceName - Name of the MCP service (e.g., 'figma', 'github')
 * @returns {Function} Express middleware function
 */
export function createMCPLoggingMiddleware(serviceName: string): Function;
/**
 * Create MCP error logging middleware for a specific service
 * @param {string} serviceName - Name of the MCP service
 * @returns {Function} Express error middleware function
 */
export function createMCPErrorMiddleware(serviceName: string): Function;
/**
 * Create MCP operation logging middleware for JSON-RPC operations
 * @param {string} serviceName - Name of the MCP service
 * @returns {Function} Express middleware function
 */
export function createMCPOperationMiddleware(serviceName: string): Function;
/**
 * Create startup logging function for MCP services
 * @param {string} serviceName - Name of the MCP service
 * @param {Object} serviceConfig - Service configuration
 * @returns {Function} Function to call on service startup
 */
export function createMCPServiceLogger(serviceName: string, serviceConfig: Object): Function;
declare namespace _default {
    export { createMCPLoggingMiddleware };
    export { createMCPErrorMiddleware };
    export { createMCPOperationMiddleware };
    export { createMCPServiceLogger };
}
export default _default;
//# sourceMappingURL=mcpLoggingMiddleware.d.ts.map