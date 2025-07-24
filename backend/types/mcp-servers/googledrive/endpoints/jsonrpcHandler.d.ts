export class GoogleDriveMCPJsonRpcHandler {
    constructor(serviceConfig: any, bearerToken: any);
    serviceConfig: any;
    bearerToken: any;
    initialized: boolean;
    /**
     * Process incoming JSON-RPC message
     * @param {Object} message - JSON-RPC message
     * @returns {Object|null} Response object or null for notifications
     */
    processMessage(message: Object): Object | null;
    /**
     * Handle initialize request
     * @param {Object} params - Initialize parameters
     * @param {string|number} id - Request ID
     * @returns {Object} Initialize response
     */
    handleInitialize(params: Object, id: string | number): Object;
    /**
     * Handle tools/list request
     * @param {Object} params - Parameters
     * @param {string|number} id - Request ID
     * @returns {Object} Tools list response
     */
    handleToolsList(params: Object, id: string | number): Object;
    /**
     * Handle tools/call request
     * @param {Object} params - Tool call parameters
     * @param {string|number} id - Request ID
     * @returns {Object} Tool call response
     */
    handleToolsCall(params: Object, id: string | number, ...args: any[]): Object;
    /**
     * Handle resources/list request
     * @param {Object} params - Parameters
     * @param {string|number} id - Request ID
     * @returns {Object} Resources list response
     */
    handleResourcesList(params: Object, id: string | number): Object;
    /**
     * Handle resources/read request
     * @param {Object} params - Parameters
     * @param {string|number} id - Request ID
     * @returns {Object} Resource read response
     */
    handleResourcesRead(params: Object, id: string | number): Object;
    /**
     * Validate JSON-RPC message format
     * @param {Object} message - Message to validate
     * @returns {boolean} True if valid JSON-RPC message
     */
    isValidJsonRpc(message: Object): boolean;
    /**
     * Create JSON-RPC error response
     * @param {string|number|null} id - Request ID
     * @param {number} code - Error code
     * @param {string} message - Error message
     * @param {Object} data - Additional error data
     * @returns {Object} Error response
     */
    createErrorResponse(id: string | number | null, code: number, message: string, data?: Object): Object;
    /**
     * Create JSON-RPC success response
     * @param {string|number} id - Request ID
     * @param {Object} result - Response result
     * @returns {Object} Success response
     */
    createSuccessResponse(id: string | number, result: Object): Object;
}
//# sourceMappingURL=jsonrpcHandler.d.ts.map