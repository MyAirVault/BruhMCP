export type Request = import('express').Request;
export type Response = import('express').Response;
export type InstanceData = {
    /**
     * - MCP service name
     */
    mcp_service_name: string;
    /**
     * - Custom instance name
     */
    custom_name: string;
    /**
     * - API key for the instance
     */
    api_key: string;
    /**
     * - Last updated timestamp
     */
    updated_at: string;
};
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
     * - Test endpoint used
     */
    testEndpoint?: string | undefined;
    /**
     * - User information from validation
     */
    userInfo?: Object | undefined;
};
export type NameValidationResult = {
    /**
     * - Whether name validation passed
     */
    isValid: boolean;
    /**
     * - Error message if validation failed
     */
    error?: string | undefined;
    /**
     * - Cleaned version of the name
     */
    cleanedName?: string | undefined;
    /**
     * - Additional validation details
     */
    details?: Object | undefined;
};
/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/**
 * @typedef {Object} InstanceData
 * @property {string} mcp_service_name - MCP service name
 * @property {string} custom_name - Custom instance name
 * @property {string} api_key - API key for the instance
 * @property {string} updated_at - Last updated timestamp
 */
/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [errorCode] - Error code if validation failed
 * @property {Object} [details] - Additional validation details
 * @property {string} [testEndpoint] - Test endpoint used
 * @property {Object} [userInfo] - User information from validation
 */
/**
 * @typedef {Object} NameValidationResult
 * @property {boolean} isValid - Whether name validation passed
 * @property {string} [error] - Error message if validation failed
 * @property {string} [cleanedName] - Cleaned version of the name
 * @property {Object} [details] - Additional validation details
 */
/**
 * Update MCP instance (combined name and credentials update)
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export function updateInstance(req: Request, res: Response): Promise<void>;
/**
 * Sanitize user info for response (remove sensitive data)
 * @param {any} userInfo - User information from API validation
 * @returns {any} Sanitized user info
 */
export function sanitizeUserInfo(userInfo: any): any;
//# sourceMappingURL=updateInstance.d.ts.map