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
export type PlanLimitCheck = {
    /**
     * - Whether user can create/activate instance
     */
    canCreate: boolean;
    /**
     * - Reason for limit check result
     */
    reason: string;
    /**
     * - Descriptive message
     */
    message: string;
    /**
     * - Additional details about the plan
     */
    details: {
        plan: string;
        activeInstances: number;
        maxInstances: number;
    };
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
 * @typedef {Object} PlanLimitCheck
 * @property {boolean} canCreate - Whether user can create/activate instance
 * @property {string} reason - Reason for limit check result
 * @property {string} message - Descriptive message
 * @property {Object} details - Additional details about the plan
 * @property {string} details.plan - User's plan type
 * @property {number} details.activeInstances - Current active instances
 * @property {number} details.maxInstances - Maximum allowed instances
 */
/**
 * Renew expired MCP instance with new expiration date
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function renewInstance(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=renewInstance.d.ts.map