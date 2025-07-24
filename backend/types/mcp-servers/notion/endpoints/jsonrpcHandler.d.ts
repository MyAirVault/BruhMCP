/**
 * Handle JSON-RPC endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export function handleJsonRpcEndpoint(req: Object, res: Object): Promise<any>;
/**
 * Validate JSON-RPC request format
 * @param {Object} request - JSON-RPC request object
 * @returns {Object} Validation result
 */
export function validateJsonRpcRequest(request: Object): Object;
/**
 * Create JSON-RPC error response
 * @param {number} code - Error code
 * @param {string} message - Error message
 * @param {*} data - Additional error data
 * @param {*} id - Request ID
 * @returns {Object} JSON-RPC error response
 */
export function createJsonRpcErrorResponse(code: number, message: string, data: any, id: any): Object;
/**
 * Create JSON-RPC success response
 * @param {*} result - Response result
 * @param {*} id - Request ID
 * @returns {Object} JSON-RPC success response
 */
export function createJsonRpcSuccessResponse(result: any, id: any): Object;
//# sourceMappingURL=jsonrpcHandler.d.ts.map