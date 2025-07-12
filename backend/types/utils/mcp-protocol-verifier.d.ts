/**
 * Verify MCP protocol compliance for a server
 * @param {string} baseUrl - Base URL of the MCP server
 * @returns {Object} Test results
 */
export function verifyMCPCompliance(baseUrl: string): Object;
/**
 * MCP Protocol Compliance Verifier
 * Tests MCP servers for proper JSON-RPC 2.0 protocol implementation
 */
export class MCPProtocolVerifier {
    constructor(baseUrl: any);
    baseUrl: any;
    testResults: any[];
    /**
     * Run all protocol compliance tests
     * @returns {Object} Test results summary
     */
    runAllTests(): Object;
    /**
     * Test basic server connectivity
     */
    testConnectivity(): Promise<void>;
    /**
     * Test JSON-RPC format validation
     */
    testJsonRpcFormatValidation(): Promise<void>;
    /**
     * Test initialize method
     */
    testInitializeMethod(): Promise<void>;
    /**
     * Test tools/list method
     */
    testToolsListMethod(): Promise<void>;
    /**
     * Test tools/call method
     */
    testToolsCallMethod(): Promise<void>;
    /**
     * Test resources/list method
     */
    testResourcesListMethod(): Promise<void>;
    /**
     * Test error handling
     */
    testErrorHandling(): Promise<void>;
    /**
     * Send JSON-RPC message to server
     */
    sendJsonRpcMessage(message: any): Promise<unknown>;
    /**
     * Add test result
     */
    addTestResult(testName: any, status: any, message: any): void;
    /**
     * Generate test report
     */
    generateTestReport(): {
        summary: {
            total: number;
            passed: number;
            failed: number;
            skipped: number;
            success_rate: number;
        };
        details: any[];
        compliance: string;
        timestamp: string;
    };
}
//# sourceMappingURL=mcp-protocol-verifier.d.ts.map