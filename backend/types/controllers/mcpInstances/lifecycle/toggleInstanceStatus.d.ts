export type Request = import("express").Request;
export type Response = import("express").Response;
export type MCPInstance = {
    /**
     * - The instance ID
     */
    instance_id: string;
    /**
     * - Current status of the instance
     */
    status: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string;
    /**
     * - Name of the MCP service
     */
    mcp_service_name: string;
    /**
     * - ID of the MCP service
     */
    mcp_service_id: string;
    /**
     * - Last updated timestamp
     */
    updated_at: string;
    /**
     * - Owner user ID
     */
    user_id: string;
};
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * @typedef {Object} MCPInstance
 * @property {string} instance_id - The instance ID
 * @property {string} status - Current status of the instance
 * @property {string} expires_at - Expiration timestamp
 * @property {string} mcp_service_name - Name of the MCP service
 * @property {string} mcp_service_id - ID of the MCP service
 * @property {string} updated_at - Last updated timestamp
 * @property {string} user_id - Owner user ID
 */
/**
 * Toggle MCP instance status between active and inactive
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function toggleInstanceStatus(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=toggleInstanceStatus.d.ts.map