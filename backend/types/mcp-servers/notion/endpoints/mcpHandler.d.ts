/**
 * @typedef {import('../utils/notionFormatting.js').NotionRichText} NotionRichText
 * @typedef {import('../utils/notionFormatting.js').NotionUser} NotionUser
 * @typedef {import('../utils/notionFormatting.js').NotionParent} NotionParent
 * @typedef {import('../utils/notionFormatting.js').NotionProperty} NotionProperty
 * @typedef {import('../utils/notionFormatting.js').NotionFilter} NotionFilter
 * @typedef {import('../utils/notionFormatting.js').NotionSort} NotionSort
 * @typedef {import('../utils/notionFormatting.js').NotionPage} NotionPage
 * @typedef {import('../utils/notionFormatting.js').NotionDatabase} NotionDatabase
 * @typedef {import('../utils/notionFormatting.js').NotionBlock} NotionBlock
 * @typedef {import('../utils/notionFormatting.js').NotionSearchResponse} NotionSearchResponse
 * @typedef {import('../utils/notionFormatting.js').NotionBlocksResponse} NotionBlocksResponse
 * @typedef {import('../utils/notionFormatting.js').NotionQueryResponse} NotionQueryResponse
 */
/**
 * @typedef {Object} ServiceConfig
 * @property {string} name
 * @property {string} displayName
 * @property {string} version
 * @property {string[]} scopes
 */
/**
 * @typedef {Object} NotionSearchOptions
 * @property {number} [page_size] - Number of results to return
 * @property {string} [start_cursor] - Pagination cursor
 * @property {ZodSearchSort} [sort] - Sort criteria
 * @property {ZodSearchFilter} [filter] - Filter criteria
 */
/**
 * @typedef {Object} ZodSearchFilter
 * @property {'page'|'database'} [value] - Filter by type
 * @property {string} [property] - Filter property
 */
/**
 * @typedef {Object} ZodSearchSort
 * @property {'ascending'|'descending'} [direction] - Sort direction
 * @property {'created_time'|'last_edited_time'} [timestamp] - Sort timestamp
 */
/**
 * @typedef {Object} ZodParent
 * @property {'page_id'|'database_id'} [type] - Parent type
 * @property {string} [page_id] - Page ID
 * @property {string} [database_id] - Database ID
 */
/**
 * @typedef {Record<string, Object>} ZodProperties
 * Properties from Zod schema as generic objects
 */
/**
 * @typedef {Object[]} ZodBlocks
 * Blocks from Zod schema as generic objects
 */
/**
 * @typedef {Object[]} ZodRichTextArray
 * Rich text from Zod schema as generic objects
 */
/**
 * @typedef {Object[]} ZodSorts
 * Sorts from Zod schema as generic objects
 */
/**
 * @typedef {Object} NotionPageCreateData
 * @property {ZodParent} parent - Parent page or database
 * @property {ZodProperties} [properties] - Page properties
 * @property {ZodBlocks} [children] - Page content blocks
 */
/**
 * @typedef {Object} NotionPageUpdateData
 * @property {ZodProperties} [properties] - Properties to update
 * @property {boolean} [archived] - Archive status
 */
/**
 * @typedef {Object} NotionDatabaseQueryOptions
 * @property {Object} [filter] - Filter criteria
 * @property {ZodSorts} [sorts] - Sort criteria
 * @property {string} [start_cursor] - Pagination cursor
 * @property {number} [page_size] - Number of results
 */
/**
 * @typedef {Object} NotionDatabaseCreateData
 * @property {ZodParent} parent - Parent page
 * @property {ZodRichTextArray} title - Database title
 * @property {ZodProperties} properties - Database properties schema
 */
/**
 * @typedef {Object} NotionDatabaseUpdateData
 * @property {ZodRichTextArray} [title] - Database title
 * @property {ZodProperties} [properties] - Database properties schema
 */
/**
 * @typedef {Object} MCPRequest
 * @property {string} [id] - Request ID
 * @property {string} method - Method name
 * @property {Object} [params] - Parameters
 */
/**
 * @typedef {Object} MCPToolResult
 * @property {Array<{type: string, text: string}>} content - Response content
 * @property {boolean} [isError] - Whether this is an error response
 */
export class NotionMCPHandler {
    /**
     * @param {ServiceConfig} serviceConfig
     * @param {string} bearerToken
     */
    constructor(serviceConfig: ServiceConfig, bearerToken: string);
    serviceConfig: ServiceConfig;
    bearerToken: string;
    server: McpServer;
    /** @type {Record<string, StreamableHTTPServerTransport>} */
    transports: Record<string, StreamableHTTPServerTransport>;
    initialized: boolean;
    /**
     * Setup MCP tools using Zod schemas
     */
    setupTools(): void;
    /**
     * Handle incoming MCP request using session-based transport
     * @param {import('express').Request} req - Express request object
     * @param {import('express').Response} res - Express response object
     * @param {MCPRequest} message - MCP message
     * @returns {Promise<void>}
     */
    handleMCPRequest(req: import("express").Request, res: import("express").Response, message: MCPRequest): Promise<void>;
}
export type NotionRichText = import("../utils/notionFormatting.js").NotionRichText;
export type NotionUser = import("../utils/notionFormatting.js").NotionUser;
export type NotionParent = import("../utils/notionFormatting.js").NotionParent;
export type NotionProperty = import("../utils/notionFormatting.js").NotionProperty;
export type NotionFilter = import("../utils/notionFormatting.js").NotionFilter;
export type NotionSort = import("../utils/notionFormatting.js").NotionSort;
export type NotionPage = import("../utils/notionFormatting.js").NotionPage;
export type NotionDatabase = import("../utils/notionFormatting.js").NotionDatabase;
export type NotionBlock = import("../utils/notionFormatting.js").NotionBlock;
export type NotionSearchResponse = import("../utils/notionFormatting.js").NotionSearchResponse;
export type NotionBlocksResponse = import("../utils/notionFormatting.js").NotionBlocksResponse;
export type NotionQueryResponse = import("../utils/notionFormatting.js").NotionQueryResponse;
export type ServiceConfig = {
    name: string;
    displayName: string;
    version: string;
    scopes: string[];
};
export type NotionSearchOptions = {
    /**
     * - Number of results to return
     */
    page_size?: number | undefined;
    /**
     * - Pagination cursor
     */
    start_cursor?: string | undefined;
    /**
     * - Sort criteria
     */
    sort?: ZodSearchSort | undefined;
    /**
     * - Filter criteria
     */
    filter?: ZodSearchFilter | undefined;
};
export type ZodSearchFilter = {
    /**
     * - Filter by type
     */
    value?: "database" | "page" | undefined;
    /**
     * - Filter property
     */
    property?: string | undefined;
};
export type ZodSearchSort = {
    /**
     * - Sort direction
     */
    direction?: "ascending" | "descending" | undefined;
    /**
     * - Sort timestamp
     */
    timestamp?: "created_time" | "last_edited_time" | undefined;
};
export type ZodParent = {
    /**
     * - Parent type
     */
    type?: "page_id" | "database_id" | undefined;
    /**
     * - Page ID
     */
    page_id?: string | undefined;
    /**
     * - Database ID
     */
    database_id?: string | undefined;
};
/**
 * Properties from Zod schema as generic objects
 */
export type ZodProperties = Record<string, Object>;
/**
 * Blocks from Zod schema as generic objects
 */
export type ZodBlocks = Object[];
/**
 * Rich text from Zod schema as generic objects
 */
export type ZodRichTextArray = Object[];
/**
 * Sorts from Zod schema as generic objects
 */
export type ZodSorts = Object[];
export type NotionPageCreateData = {
    /**
     * - Parent page or database
     */
    parent: ZodParent;
    /**
     * - Page properties
     */
    properties?: ZodProperties | undefined;
    /**
     * - Page content blocks
     */
    children?: ZodBlocks | undefined;
};
export type NotionPageUpdateData = {
    /**
     * - Properties to update
     */
    properties?: ZodProperties | undefined;
    /**
     * - Archive status
     */
    archived?: boolean | undefined;
};
export type NotionDatabaseQueryOptions = {
    /**
     * - Filter criteria
     */
    filter?: Object | undefined;
    /**
     * - Sort criteria
     */
    sorts?: ZodSorts | undefined;
    /**
     * - Pagination cursor
     */
    start_cursor?: string | undefined;
    /**
     * - Number of results
     */
    page_size?: number | undefined;
};
export type NotionDatabaseCreateData = {
    /**
     * - Parent page
     */
    parent: ZodParent;
    /**
     * - Database title
     */
    title: ZodRichTextArray;
    /**
     * - Database properties schema
     */
    properties: ZodProperties;
};
export type NotionDatabaseUpdateData = {
    /**
     * - Database title
     */
    title?: ZodRichTextArray | undefined;
    /**
     * - Database properties schema
     */
    properties?: ZodProperties | undefined;
};
export type MCPRequest = {
    /**
     * - Request ID
     */
    id?: string | undefined;
    /**
     * - Method name
     */
    method: string;
    /**
     * - Parameters
     */
    params?: Object | undefined;
};
export type MCPToolResult = {
    /**
     * - Response content
     */
    content: Array<{
        type: string;
        text: string;
    }>;
    /**
     * - Whether this is an error response
     */
    isError?: boolean | undefined;
};
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
//# sourceMappingURL=mcpHandler.d.ts.map