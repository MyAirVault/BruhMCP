/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * @typedef {Object} MCPService
 * @property {string} mcp_service_id
 * @property {string} mcp_service_name
 * @property {string} display_name
 * @property {'api_key'|'oauth'} type
 * @property {boolean} is_active
 * @property {number} port
 */
/**
 * @typedef {Object} CreationResult
 * @property {boolean} success
 * @property {string} [reason]
 * @property {string} [message]
 * @property {number} [currentCount]
 * @property {number} [maxInstances]
 * @property {MCPInstance} [instance]
 */
/**
 * @typedef {Object} MCPInstance
 * @property {string} instance_id
 * @property {string} custom_name
 * @property {string} status
 * @property {string} [oauth_status]
 * @property {Date} expires_at
 * @property {string} expiration_option
 * @property {number} usage_count
 * @property {Date} created_at
 * @property {Date} updated_at
 */
/**
 * @typedef {Object} OAuthResult
 * @property {boolean} success
 * @property {string} [authorization_url]
 * @property {string} [provider]
 * @property {string} [instance_id]
 * @property {string} [message]
 * @property {string} [error]
 */
/**
 * @typedef {Object} Logger
 * @property {function(string, string, Object): void} app
 */
/**
 * Create new MCP instance with multi-tenant support
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function createMCP(req: Request, res: Response): Promise<void>;
/**
 * Validate credentials against external service (optional)
 * This can be called before instance creation for real-time validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export function validateMCPCredentials(req: Request, res: Response): Promise<void>;
export type Request = import("express").Request;
export type Response = import("express").Response;
export type MCPService = {
    mcp_service_id: string;
    mcp_service_name: string;
    display_name: string;
    type: "api_key" | "oauth";
    is_active: boolean;
    port: number;
};
export type CreationResult = {
    success: boolean;
    reason?: string | undefined;
    message?: string | undefined;
    currentCount?: number | undefined;
    maxInstances?: number | undefined;
    instance?: MCPInstance | undefined;
};
export type MCPInstance = {
    instance_id: string;
    custom_name: string;
    status: string;
    oauth_status?: string | undefined;
    expires_at: Date;
    expiration_option: string;
    usage_count: number;
    created_at: Date;
    updated_at: Date;
};
export type OAuthResult = {
    success: boolean;
    authorization_url?: string | undefined;
    provider?: string | undefined;
    instance_id?: string | undefined;
    message?: string | undefined;
    error?: string | undefined;
};
export type Logger = {
    app: (arg0: string, arg1: string, arg2: Object) => void;
};
//# sourceMappingURL=createMCP.d.ts.map