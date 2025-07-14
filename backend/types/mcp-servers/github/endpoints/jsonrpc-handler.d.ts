/**
 * MCP JSON-RPC protocol handler
 * Implements proper JSON-RPC 2.0 message handling for MCP servers
 */
export class MCPJsonRpcHandler {
    constructor(serviceConfig: any, mcpType: any, apiKey: any, port: any);
    serviceConfig: any;
    mcpType: any;
    apiKey: any;
    port: any;
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
        result: any;
    }>;
    /**
     * Handle tools/list method
     */
    handleToolsList(id: any): Promise<{
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
     * Handle resources/list method
     */
    handleResourcesList(id: any): Promise<{
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
}
//# sourceMappingURL=jsonrpc-handler.d.ts.map