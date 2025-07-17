export class NotionMCPHandler {
    /**
     * @param {Object} serviceConfig - Service configuration
     * @param {string} bearerToken - OAuth Bearer token
     */
    constructor(serviceConfig: Object, bearerToken: string);
    serviceConfig: Object;
    bearerToken: string;
    notionService: NotionService;
    server: McpServer;
    /** @type {Record<string, StreamableHTTPServerTransport>} */
    transports: Record<string, StreamableHTTPServerTransport>;
    initialized: boolean;
    /**
     * Setup MCP tools using new SDK .tool() pattern
     */
    setupTools(): void;
    /**
     * Handle search requests
     */
    handleSearch(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle get page requests
     */
    handleGetPage(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle get page blocks requests
     */
    handleGetPageBlocks(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle create page requests
     */
    handleCreatePage(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle update page requests
     */
    handleUpdatePage(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle get database requests
     */
    handleGetDatabase(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle query database requests
     */
    handleQueryDatabase(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle create database requests
     */
    handleCreateDatabase(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle update database requests
     */
    handleUpdateDatabase(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle append blocks requests
     */
    handleAppendBlocks(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle delete block requests
     */
    handleDeleteBlock(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle get current user requests
     */
    handleGetCurrentUser(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle list users requests
     */
    handleListUsers(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    /**
     * Handle MCP request (Express route handler)
     */
    handleMCPRequest(req: any, res: any, body: any): Promise<void>;
}
import { NotionService } from '../api/notion-api.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
//# sourceMappingURL=mcp-handler.d.ts.map