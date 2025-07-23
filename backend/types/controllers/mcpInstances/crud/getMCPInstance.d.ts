/**
 * @typedef {Object} User
 * @property {number} id - User ID
 */
/**
 * @typedef {import('express').Request} AuthenticatedRequest
 */
/** @typedef {import('express').Response} Response */
/**
 * Database instance record from getMCPInstanceById query
 * @typedef {Object} MCPInstanceRecord
 * @property {string} instance_id - The unique instance ID
 * @property {string} custom_name - User-defined custom name
 * @property {number} instance_number - Instance number
 * @property {string} access_token - Access token for the instance
 * @property {string} mcp_service_name - The MCP service name
 * @property {string} status - Current status of the instance
 * @property {string} oauth_status - OAuth status
 * @property {boolean} is_active - Whether the instance is active
 * @property {string} expiration_option - Expiration option setting
 * @property {string|null} expires_at - Expiration timestamp
 * @property {string} display_name - Display name for the service
 * @property {string} type - Service type
 * @property {Object} config - Instance configuration object
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */
/**
 * Get MCP instance by ID
 * @param {AuthenticatedRequest} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function getMCPInstance(req: AuthenticatedRequest, res: Response): Promise<void>;
export type User = {
    /**
     * - User ID
     */
    id: number;
};
export type AuthenticatedRequest = import("express").Request;
export type Response = import("express").Response;
/**
 * Database instance record from getMCPInstanceById query
 */
export type MCPInstanceRecord = {
    /**
     * - The unique instance ID
     */
    instance_id: string;
    /**
     * - User-defined custom name
     */
    custom_name: string;
    /**
     * - Instance number
     */
    instance_number: number;
    /**
     * - Access token for the instance
     */
    access_token: string;
    /**
     * - The MCP service name
     */
    mcp_service_name: string;
    /**
     * - Current status of the instance
     */
    status: string;
    /**
     * - OAuth status
     */
    oauth_status: string;
    /**
     * - Whether the instance is active
     */
    is_active: boolean;
    /**
     * - Expiration option setting
     */
    expiration_option: string;
    /**
     * - Expiration timestamp
     */
    expires_at: string | null;
    /**
     * - Display name for the service
     */
    display_name: string;
    /**
     * - Service type
     */
    type: string;
    /**
     * - Instance configuration object
     */
    config: Object;
    /**
     * - Creation timestamp
     */
    created_at: string;
    /**
     * - Last update timestamp
     */
    updated_at: string;
};
//# sourceMappingURL=getMCPInstance.d.ts.map