export class SlackMCPJsonRpcHandler {
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
     * Validate JSON-RPC 2.0 message format
     */
    isValidJsonRpc(message: any): any;
    /**
     * Handle initialize method
     */
    handleInitialize(params: any, id: any): Promise<{
        jsonrpc: string;
        id: any;
        error: {
            code: any;
            message: any;
        };
    } | {
        jsonrpc: string;
        id: any;
        result: any;
    }>;
    /**
     * Handle tools/list method
     */
    handleToolsList(params: any, id: any): Promise<{
        jsonrpc: string;
        id: any;
        error: {
            code: any;
            message: any;
        };
    } | {
        jsonrpc: string;
        id: any;
        result: any;
    }>;
    /**
     * Handle tools/call method
     */
    handleToolsCall(params: any, id: any, ...args: any[]): Promise<{
        jsonrpc: string;
        id: any;
        error: {
            code: any;
            message: any;
        };
    } | {
        jsonrpc: string;
        id: any;
        result: any;
    }>;
    /**
     * Create success response
     */
    createSuccessResponse(id: any, result: any): {
        jsonrpc: string;
        id: any;
        result: any;
    };
    /**
     * Create error response
     */
    createErrorResponse(id: any, code: any, message: any, data?: null): {
        jsonrpc: string;
        id: any;
        error: {
            code: any;
            message: any;
        };
    };
    /**
     * Handle resources/list method
     */
    handleResourcesList(params: any, id: any): Promise<{
        jsonrpc: string;
        id: any;
        error: {
            code: any;
            message: any;
        };
    } | {
        jsonrpc: string;
        id: any;
        result: any;
    }>;
    /**
     * Handle resources/read method
     */
    handleResourcesRead(params: any, id: any): Promise<{
        jsonrpc: string;
        id: any;
        error: {
            code: any;
            message: any;
        };
    }>;
}
//# sourceMappingURL=jsonrpc-handler.d.ts.map