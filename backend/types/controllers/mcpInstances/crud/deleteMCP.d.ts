/**
 * @typedef {Object} User
 * @property {number} id - User ID
 */
/**
 * @typedef {import('express').Request & {user?: User}} AuthenticatedRequest
 */
/** @typedef {import('express').Response} Response */
/**
 * Database instance object from getMCPInstanceById query
 * @typedef {Object} MCPInstanceRecord
 * @property {string} instance_id - The unique instance ID
 * @property {string} mcp_service_name - The MCP service name
 * @property {string} mcp_service_id - The MCP service ID
 * @property {string} custom_name - User-defined custom name
 * @property {number} user_id - The user ID who owns the instance
 */
/**
 * Delete MCP instance
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function deleteMCP(req: AuthenticatedRequest, res: Response): Promise<void>;
export type User = {
    /**
     * - User ID
     */
    id: number;
};
export type AuthenticatedRequest = import("express").Request & {
    user?: User;
};
export type Response = import("express").Response;
/**
 * Database instance object from getMCPInstanceById query
 */
export type MCPInstanceRecord = {
    /**
     * - The unique instance ID
     */
    instance_id: string;
    /**
     * - The MCP service name
     */
    mcp_service_name: string;
    /**
     * - The MCP service ID
     */
    mcp_service_id: string;
    /**
     * - User-defined custom name
     */
    custom_name: string;
    /**
     * - The user ID who owns the instance
     */
    user_id: number;
};
//# sourceMappingURL=deleteMCP.d.ts.map