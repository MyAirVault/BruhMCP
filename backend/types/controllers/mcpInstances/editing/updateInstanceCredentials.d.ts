/** @typedef {import('express').Request & {user?: {id: string}}} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [errorCode] - Error code if validation failed
 * @property {Object} [details] - Additional validation details
 * @property {string} [testEndpoint] - Test endpoint used for validation
 * @property {Object} [userInfo] - User information from validation
 * @property {string} [validatedAt] - Validation timestamp
 */
/** @typedef {Object} MCPInstance
 * @property {string} mcp_service_name - Service name
 * @property {string} api_key - Current API key
 * @property {string} updated_at - Last update timestamp
 * @property {string} instance_id - Instance ID
 */
/** @typedef {Object} DatabaseUpdateResult
 * @property {number} rowCount - Number of affected rows
 * @property {any[]} rows - Result rows
 */
/** @typedef {Object} UserInfo
 * @property {string} [email] - User email
 * @property {string} [handle] - User handle
 * @property {string} [service] - Service name
 * @property {any[]} [permissions] - User permissions
 * @property {string} [user_id] - User ID
 */
/**
 * Update MCP instance credentials with validation
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function updateInstanceCredentials(req: Request, res: Response): Promise<void>;
/**
 * Validate credentials only (without updating database)
 * Useful for testing credentials before committing to update
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function validateInstanceCredentialsOnly(req: Request, res: Response): Promise<void>;
export type Request = import("express").Request & {
    user?: {
        id: string;
    };
};
export type Response = import("express").Response;
export type ValidationResult = {
    /**
     * - Whether validation passed
     */
    isValid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - Error code if validation failed
     */
    errorCode?: string | undefined;
    /**
     * - Additional validation details
     */
    details?: Object | undefined;
    /**
     * - Test endpoint used for validation
     */
    testEndpoint?: string | undefined;
    /**
     * - User information from validation
     */
    userInfo?: Object | undefined;
    /**
     * - Validation timestamp
     */
    validatedAt?: string | undefined;
};
export type MCPInstance = {
    /**
     * - Service name
     */
    mcp_service_name: string;
    /**
     * - Current API key
     */
    api_key: string;
    /**
     * - Last update timestamp
     */
    updated_at: string;
    /**
     * - Instance ID
     */
    instance_id: string;
};
export type DatabaseUpdateResult = {
    /**
     * - Number of affected rows
     */
    rowCount: number;
    /**
     * - Result rows
     */
    rows: any[];
};
export type UserInfo = {
    /**
     * - User email
     */
    email?: string | undefined;
    /**
     * - User handle
     */
    handle?: string | undefined;
    /**
     * - Service name
     */
    service?: string | undefined;
    /**
     * - User permissions
     */
    permissions?: any[] | undefined;
    /**
     * - User ID
     */
    user_id?: string | undefined;
};
//# sourceMappingURL=updateInstanceCredentials.d.ts.map