export type ExpressRequest = import('../middleware/types.js').ExpressRequest;
export type ExpressResponse = import('../middleware/types.js').ExpressResponse;
export type SearchArgs = {
    /**
     * - Search query string
     */
    query?: string | undefined;
    /**
     * - Filter conditions
     */
    filter?: {
        value: string;
        property: string;
    } | undefined;
    /**
     * - Sort conditions
     */
    sort?: {
        direction: 'ascending' | 'descending';
        timestamp: 'last_edited_time';
    } | undefined;
    /**
     * - Number of results per page
     */
    page_size?: number | undefined;
    /**
     * - Pagination cursor
     */
    start_cursor?: string | undefined;
};
export type GetPageArgs = {
    /**
     * - The page ID to retrieve
     */
    pageId: string;
};
export type GetPageBlocksArgs = {
    /**
     * - The page ID to get blocks from
     */
    pageId: string;
    /**
     * - Pagination cursor
     */
    start_cursor?: string | undefined;
    /**
     * - Number of blocks per page
     */
    page_size?: number | undefined;
};
export type CreatePageArgs = {
    /**
     * - Parent page or database
     */
    parent: import('../utils/notionFormatting.js').NotionParent;
    /**
     * - Page properties
     */
    properties: Record<string, import('../utils/notionFormatting.js').NotionProperty>;
    /**
     * - Page content blocks
     */
    children?: import("../utils/notionFormatting.js").NotionBlock[] | undefined;
};
export type UpdatePageArgs = {
    /**
     * - The page ID to update
     */
    pageId: string;
    /**
     * - Updated properties
     */
    properties?: Record<string, import("../utils/notionFormatting.js").NotionProperty> | undefined;
    /**
     * - Whether the page is archived
     */
    archived?: boolean | undefined;
};
export type AppendBlocksArgs = {
    /**
     * - The page ID to append blocks to
     */
    pageId: string;
    /**
     * - Blocks to append
     */
    children: import('../utils/notionFormatting.js').NotionBlock[];
};
export type DeleteBlockArgs = {
    /**
     * - The block ID to delete
     */
    blockId: string;
};
export type GetCurrentUserArgs = Record<string, never>;
export type ListUsersArgs = {
    /**
     * - Pagination cursor
     */
    start_cursor?: string | undefined;
    /**
     * - Number of users per page
     */
    page_size?: number | undefined;
};
export type GetDatabaseArgs = {
    /**
     * - The database ID to retrieve
     */
    databaseId: string;
};
export type QueryDatabaseArgs = {
    /**
     * - The database ID to query
     */
    databaseId: string;
    /**
     * - Filter conditions for the query
     */
    filter?: Record<string, unknown> | undefined;
    /**
     * - Sort conditions for the query
     */
    sorts?: {
        direction: 'ascending' | 'descending';
        property?: string | undefined;
        timestamp?: "created_time" | "last_edited_time" | undefined;
    }[] | undefined;
    /**
     * - Number of results per page (max 100)
     */
    page_size?: number | undefined;
    /**
     * - Pagination cursor
     */
    start_cursor?: string | undefined;
};
export type CreateDatabaseArgs = {
    /**
     * - Parent page or workspace information
     */
    parent: {
        type: string;
        page_id?: string;
        workspace?: string;
        database_id?: string;
    };
    /**
     * - Database title as rich text array
     */
    title: Array<{
        type: 'text';
        text: {
            content: string;
        };
        plain_text: string;
    }>;
    /**
     * - Database properties schema
     */
    properties: Record<string, import('../utils/notionFormatting.js').NotionProperty>;
    /**
     * - Whether the database is inline
     */
    is_inline?: boolean | undefined;
};
export type UpdateDatabaseArgs = {
    /**
     * - The database ID to update
     */
    databaseId: string;
    /**
     * - Updated title as rich text array
     */
    title?: {
        type: 'text';
        text: {
            content: string;
        };
        plain_text: string;
    }[] | undefined;
    /**
     * - Updated properties schema
     */
    properties?: Record<string, import("../utils/notionFormatting.js").NotionProperty> | undefined;
    /**
     * - Whether the database is inline
     */
    is_inline?: boolean | undefined;
};
export type RawApiCallArgs = {
    /**
     * - API endpoint path
     */
    endpoint: string;
    /**
     * - HTTP method (GET, POST, PATCH, DELETE)
     */
    method?: "GET" | "POST" | "DELETE" | "PATCH" | undefined;
    /**
     * - Request body/parameters
     */
    body?: Record<string, unknown> | undefined;
};
export type ToolArgs = SearchArgs | GetPageArgs | GetPageBlocksArgs | CreatePageArgs | UpdatePageArgs | GetDatabaseArgs | QueryDatabaseArgs | CreateDatabaseArgs | UpdateDatabaseArgs | AppendBlocksArgs | DeleteBlockArgs | GetCurrentUserArgs | ListUsersArgs | RawApiCallArgs;
export type ErrorInfo = {
    /**
     * - HTTP status code
     */
    statusCode?: number | undefined;
    /**
     * - JSON-RPC error code
     */
    code?: number | undefined;
    /**
     * - Error message
     */
    message: string;
    /**
     * - Additional error details
     */
    details?: unknown;
};
/**
 * Handle call endpoint - provides direct API access and tool execution
 * @param {ExpressRequest} req - Express request object with auth data
 * @param {ExpressResponse} res - Express response object
 * @returns {Promise<void>}
 */
export function handleCallEndpoint(req: ExpressRequest, res: ExpressResponse, ...args: any[]): Promise<void>;
//# sourceMappingURL=call.d.ts.map