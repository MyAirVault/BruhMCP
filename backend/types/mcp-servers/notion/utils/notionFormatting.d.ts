export type NotionRichText = {
    /**
     * - Plain text content
     */
    plain_text: string;
    /**
     * - Text type
     */
    type: string;
};
export type NotionUser = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User name
     */
    name: string;
    /**
     * - Avatar URL
     */
    avatar_url: string;
    /**
     * - User type
     */
    type: string;
    /**
     * - Person details
     */
    person?: Object | undefined;
    /**
     * - Bot details
     */
    bot?: Object | undefined;
};
export type NotionParent = {
    /**
     * - Parent type
     */
    type: string;
    /**
     * - Database ID
     */
    database_id?: string | undefined;
    /**
     * - Page ID
     */
    page_id?: string | undefined;
    /**
     * - Workspace flag
     */
    workspace?: string | undefined;
};
export type NotionProperty = {
    /**
     * - Property type
     */
    type: string;
    /**
     * - Title content
     */
    title?: NotionRichText[] | undefined;
    /**
     * - Rich text content
     */
    rich_text?: NotionRichText[] | undefined;
    /**
     * - Number value
     */
    number?: number | undefined;
    /**
     * - Checkbox value
     */
    checkbox?: boolean | undefined;
    /**
     * - Select value
     */
    select?: Object | undefined;
    /**
     * - Multi-select values
     */
    multi_select?: Object[] | undefined;
    /**
     * - Date value
     */
    date?: Object | undefined;
    /**
     * - People values
     */
    people?: NotionUser[] | undefined;
    /**
     * - File values
     */
    files?: Object[] | undefined;
    /**
     * - URL value
     */
    url?: string | undefined;
    /**
     * - Email value
     */
    email?: string | undefined;
    /**
     * - Phone number value
     */
    phone_number?: string | undefined;
    /**
     * - Formula value
     */
    formula?: Object | undefined;
    /**
     * - Relation value
     */
    relation?: Object | undefined;
    /**
     * - Rollup value
     */
    rollup?: Object | undefined;
};
export type NotionFilter = {
    /**
     * - Property name to filter
     */
    property?: string | undefined;
    /**
     * - Relation filter
     */
    relation?: string | undefined;
    /**
     * - Rollup filter
     */
    rollup?: string | undefined;
    /**
     * - Formula filter
     */
    formula?: string | undefined;
    /**
     * - Timestamp filter
     */
    timestamp?: string | undefined;
    /**
     * - AND filter condition
     */
    and?: Object | undefined;
    /**
     * - OR filter condition
     */
    or?: Object | undefined;
};
export type NotionSort = {
    /**
     * - Property name to sort by
     */
    property?: string | undefined;
    /**
     * - Timestamp to sort by ('created_time' or 'last_edited_time')
     */
    timestamp?: string | undefined;
    /**
     * - Sort direction
     */
    direction: "ascending" | "descending";
};
export type NotionPage = {
    /**
     * - Page ID
     */
    id: string;
    /**
     * - Object type
     */
    object: string;
    /**
     * - Page URL
     */
    url: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Creator user
     */
    created_by: NotionUser;
    /**
     * - Last editor user
     */
    last_edited_by: NotionUser;
    /**
     * - Parent object
     */
    parent: NotionParent;
    /**
     * - Page properties
     */
    properties: Record<string, NotionProperty>;
    /**
     * - Archive status
     */
    archived: boolean;
    /**
     * - Page title
     */
    title?: NotionRichText[] | undefined;
};
export type NotionDatabase = {
    /**
     * - Database ID
     */
    id: string;
    /**
     * - Object type
     */
    object: string;
    /**
     * - Database URL
     */
    url: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Creator user
     */
    created_by: NotionUser;
    /**
     * - Last editor user
     */
    last_edited_by: NotionUser;
    /**
     * - Parent object
     */
    parent: NotionParent;
    /**
     * - Database properties
     */
    properties: Record<string, NotionProperty>;
    /**
     * - Archive status
     */
    archived: boolean;
    /**
     * - Database title
     */
    title?: NotionRichText[] | undefined;
};
export type NotionBlock = {
    /**
     * - Block ID
     */
    id: string;
    /**
     * - Object type
     */
    object: string;
    /**
     * - Block type
     */
    type: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Has children flag
     */
    has_children: boolean;
    /**
     * - Paragraph block data
     */
    paragraph?: Object | undefined;
    /**
     * - Heading 1 block data
     */
    heading_1?: Object | undefined;
    /**
     * - Heading 2 block data
     */
    heading_2?: Object | undefined;
    /**
     * - Heading 3 block data
     */
    heading_3?: Object | undefined;
    /**
     * - Bulleted list item data
     */
    bulleted_list_item?: Object | undefined;
    /**
     * - Numbered list item data
     */
    numbered_list_item?: Object | undefined;
    /**
     * - To-do block data
     */
    to_do?: Object | undefined;
    /**
     * - Quote block data
     */
    quote?: Object | undefined;
    /**
     * - Callout block data
     */
    callout?: Object | undefined;
    /**
     * - Code block data
     */
    code?: Object | undefined;
    /**
     * - Image block data
     */
    image?: Object | undefined;
    /**
     * - File block data
     */
    file?: Object | undefined;
    /**
     * - Embed block data
     */
    embed?: Object | undefined;
};
export type NotionSearchResponse = {
    /**
     * - Search results
     */
    results: (NotionPage | NotionDatabase)[];
    /**
     * - Has more results flag
     */
    has_more: boolean;
    /**
     * - Next cursor for pagination
     */
    next_cursor?: string | undefined;
};
export type NotionBlocksResponse = {
    /**
     * - Block results
     */
    results: NotionBlock[];
    /**
     * - Has more results flag
     */
    has_more: boolean;
    /**
     * - Next cursor for pagination
     */
    next_cursor?: string | undefined;
};
export type NotionQueryResponse = {
    /**
     * - Query results
     */
    results: NotionPage[];
    /**
     * - Has more results flag
     */
    has_more: boolean;
    /**
     * - Next cursor for pagination
     */
    next_cursor?: string | undefined;
};
export type FormattedSearchResult = {
    /**
     * - Result ID
     */
    id: string;
    /**
     * - Object type
     */
    type: string;
    /**
     * - Extracted title
     */
    title: string;
    /**
     * - Result URL
     */
    url: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Parent object
     */
    parent: NotionParent;
};
export type FormattedSearchResults = {
    /**
     * - Formatted results
     */
    results: FormattedSearchResult[];
    /**
     * - Has more results flag
     */
    has_more: boolean;
    /**
     * - Next cursor for pagination
     */
    next_cursor?: string | undefined;
};
export type FormattedPageData = {
    /**
     * - Page ID
     */
    id: string;
    /**
     * - Page title
     */
    title: string;
    /**
     * - Page URL
     */
    url: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Creator user
     */
    created_by: NotionUser;
    /**
     * - Last editor user
     */
    last_edited_by: NotionUser;
    /**
     * - Parent object
     */
    parent: NotionParent;
    /**
     * - Page properties
     */
    properties: Record<string, NotionProperty>;
    /**
     * - Archive status
     */
    archived: boolean;
};
export type FormattedDatabaseData = {
    /**
     * - Database ID
     */
    id: string;
    /**
     * - Database title
     */
    title: string;
    /**
     * - Database URL
     */
    url: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Creator user
     */
    created_by: NotionUser;
    /**
     * - Last editor user
     */
    last_edited_by: NotionUser;
    /**
     * - Parent object
     */
    parent: NotionParent;
    /**
     * - Database properties
     */
    properties: Record<string, NotionProperty>;
    /**
     * - Archive status
     */
    archived: boolean;
};
export type FormattedBlock = {
    /**
     * - Block ID
     */
    id: string;
    /**
     * - Block type
     */
    type: string;
    /**
     * - Extracted content
     */
    content: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Has children flag
     */
    has_children: boolean;
};
export type FormattedBlocksData = {
    /**
     * - Formatted blocks
     */
    blocks: FormattedBlock[];
    /**
     * - Has more results flag
     */
    has_more: boolean;
    /**
     * - Next cursor for pagination
     */
    next_cursor?: string | undefined;
};
export type FormattedQueryResult = {
    /**
     * - Result ID
     */
    id: string;
    /**
     * - Result title
     */
    title: string;
    /**
     * - Result URL
     */
    url: string;
    /**
     * - Creation timestamp
     */
    created_time: string;
    /**
     * - Last edit timestamp
     */
    last_edited_time: string;
    /**
     * - Result properties
     */
    properties: Record<string, NotionProperty>;
    /**
     * - Archive status
     */
    archived: boolean;
};
export type FormattedQueryResults = {
    /**
     * - Formatted results
     */
    results: FormattedQueryResult[];
    /**
     * - Has more results flag
     */
    has_more: boolean;
    /**
     * - Next cursor for pagination
     */
    next_cursor?: string | undefined;
};
export type FormattedUserData = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User name
     */
    name: string;
    /**
     * - Avatar URL
     */
    avatar_url: string;
    /**
     * - User type
     */
    type: string;
    /**
     * - Person details
     */
    person?: Object | undefined;
    /**
     * - Bot details
     */
    bot?: Object | undefined;
};
export type NotionResponseData = {
    /**
     * - Action type
     */
    action: string;
    /**
     * - Search query
     */
    query?: string | undefined;
    /**
     * - Results array
     */
    results?: (NotionPage | NotionDatabase)[] | undefined;
    /**
     * - Page object
     */
    page?: NotionPage | undefined;
    /**
     * - Database object
     */
    database?: NotionDatabase | undefined;
    /**
     * - Blocks array
     */
    blocks?: NotionBlock[] | undefined;
    /**
     * - Page ID
     */
    pageId?: string | undefined;
    /**
     * - Database ID
     */
    databaseId?: string | undefined;
    /**
     * - Block ID
     */
    blockId?: string | undefined;
    /**
     * - Deletion status
     */
    deleted?: boolean | undefined;
    /**
     * - User object
     */
    user?: NotionUser | undefined;
    /**
     * - Users array
     */
    users?: NotionUser[] | undefined;
    /**
     * - Has more flag
     */
    hasMore?: boolean | undefined;
    /**
     * - Next cursor for pagination
     */
    next_cursor?: string | undefined;
    /**
     * - HTTP method
     */
    method?: string | undefined;
    /**
     * - API path
     */
    path?: string | undefined;
    /**
     * - Raw result
     */
    result?: unknown;
};
/**
 * Notion response formatting utilities
 * Formats Notion API responses for better readability and consistency
 */
/**
 * @typedef {Object} NotionRichText
 * @property {string} plain_text - Plain text content
 * @property {string} type - Text type
 */
/**
 * @typedef {Object} NotionUser
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} avatar_url - Avatar URL
 * @property {string} type - User type
 * @property {Object} [person] - Person details
 * @property {Object} [bot] - Bot details
 */
/**
 * @typedef {Object} NotionParent
 * @property {string} type - Parent type
 * @property {string} [database_id] - Database ID
 * @property {string} [page_id] - Page ID
 * @property {string} [workspace] - Workspace flag
 */
/**
 * @typedef {Object} NotionProperty
 * @property {string} type - Property type
 * @property {NotionRichText[]} [title] - Title content
 * @property {NotionRichText[]} [rich_text] - Rich text content
 * @property {number} [number] - Number value
 * @property {boolean} [checkbox] - Checkbox value
 * @property {Object} [select] - Select value
 * @property {Object[]} [multi_select] - Multi-select values
 * @property {Object} [date] - Date value
 * @property {NotionUser[]} [people] - People values
 * @property {Object[]} [files] - File values
 * @property {string} [url] - URL value
 * @property {string} [email] - Email value
 * @property {string} [phone_number] - Phone number value
 * @property {Object} [formula] - Formula value
 * @property {Object} [relation] - Relation value
 * @property {Object} [rollup] - Rollup value
 */
/**
 * @typedef {Object} NotionFilter
 * @property {string} [property] - Property name to filter
 * @property {string} [relation] - Relation filter
 * @property {string} [rollup] - Rollup filter
 * @property {string} [formula] - Formula filter
 * @property {string} [timestamp] - Timestamp filter
 * @property {Object} [and] - AND filter condition
 * @property {Object} [or] - OR filter condition
 */
/**
 * @typedef {Object} NotionSort
 * @property {string} [property] - Property name to sort by
 * @property {string} [timestamp] - Timestamp to sort by ('created_time' or 'last_edited_time')
 * @property {'ascending'|'descending'} direction - Sort direction
 */
/**
 * @typedef {Object} NotionPage
 * @property {string} id - Page ID
 * @property {string} object - Object type
 * @property {string} url - Page URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Page properties
 * @property {boolean} archived - Archive status
 * @property {NotionRichText[]} [title] - Page title
 */
/**
 * @typedef {Object} NotionDatabase
 * @property {string} id - Database ID
 * @property {string} object - Object type
 * @property {string} url - Database URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Database properties
 * @property {boolean} archived - Archive status
 * @property {NotionRichText[]} [title] - Database title
 */
/**
 * @typedef {Object} NotionBlock
 * @property {string} id - Block ID
 * @property {string} object - Object type
 * @property {string} type - Block type
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {boolean} has_children - Has children flag
 * @property {Object} [paragraph] - Paragraph block data
 * @property {Object} [heading_1] - Heading 1 block data
 * @property {Object} [heading_2] - Heading 2 block data
 * @property {Object} [heading_3] - Heading 3 block data
 * @property {Object} [bulleted_list_item] - Bulleted list item data
 * @property {Object} [numbered_list_item] - Numbered list item data
 * @property {Object} [to_do] - To-do block data
 * @property {Object} [quote] - Quote block data
 * @property {Object} [callout] - Callout block data
 * @property {Object} [code] - Code block data
 * @property {Object} [image] - Image block data
 * @property {Object} [file] - File block data
 * @property {Object} [embed] - Embed block data
 */
/**
 * @typedef {Object} NotionSearchResponse
 * @property {(NotionPage|NotionDatabase)[]} results - Search results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */
/**
 * @typedef {Object} NotionBlocksResponse
 * @property {NotionBlock[]} results - Block results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */
/**
 * @typedef {Object} NotionQueryResponse
 * @property {NotionPage[]} results - Query results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */
/**
 * @typedef {Object} FormattedSearchResult
 * @property {string} id - Result ID
 * @property {string} type - Object type
 * @property {string} title - Extracted title
 * @property {string} url - Result URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionParent} parent - Parent object
 */
/**
 * @typedef {Object} FormattedSearchResults
 * @property {FormattedSearchResult[]} results - Formatted results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */
/**
 * @typedef {Object} FormattedPageData
 * @property {string} id - Page ID
 * @property {string} title - Page title
 * @property {string} url - Page URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Page properties
 * @property {boolean} archived - Archive status
 */
/**
 * @typedef {Object} FormattedDatabaseData
 * @property {string} id - Database ID
 * @property {string} title - Database title
 * @property {string} url - Database URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {NotionUser} created_by - Creator user
 * @property {NotionUser} last_edited_by - Last editor user
 * @property {NotionParent} parent - Parent object
 * @property {Record<string, NotionProperty>} properties - Database properties
 * @property {boolean} archived - Archive status
 */
/**
 * @typedef {Object} FormattedBlock
 * @property {string} id - Block ID
 * @property {string} type - Block type
 * @property {string} content - Extracted content
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {boolean} has_children - Has children flag
 */
/**
 * @typedef {Object} FormattedBlocksData
 * @property {FormattedBlock[]} blocks - Formatted blocks
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */
/**
 * @typedef {Object} FormattedQueryResult
 * @property {string} id - Result ID
 * @property {string} title - Result title
 * @property {string} url - Result URL
 * @property {string} created_time - Creation timestamp
 * @property {string} last_edited_time - Last edit timestamp
 * @property {Record<string, NotionProperty>} properties - Result properties
 * @property {boolean} archived - Archive status
 */
/**
 * @typedef {Object} FormattedQueryResults
 * @property {FormattedQueryResult[]} results - Formatted results
 * @property {boolean} has_more - Has more results flag
 * @property {string} [next_cursor] - Next cursor for pagination
 */
/**
 * @typedef {Object} FormattedUserData
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} avatar_url - Avatar URL
 * @property {string} type - User type
 * @property {Object} [person] - Person details
 * @property {Object} [bot] - Bot details
 */
/**
 * @typedef {Object} NotionResponseData
 * @property {string} action - Action type
 * @property {string} [query] - Search query
 * @property {(NotionPage|NotionDatabase)[]} [results] - Results array
 * @property {NotionPage} [page] - Page object
 * @property {NotionDatabase} [database] - Database object
 * @property {NotionBlock[]} [blocks] - Blocks array
 * @property {string} [pageId] - Page ID
 * @property {string} [databaseId] - Database ID
 * @property {string} [blockId] - Block ID
 * @property {boolean} [deleted] - Deletion status
 * @property {NotionUser} [user] - User object
 * @property {NotionUser[]} [users] - Users array
 * @property {boolean} [hasMore] - Has more flag
 * @property {string} [next_cursor] - Next cursor for pagination
 * @property {string} [method] - HTTP method
 * @property {string} [path] - API path
 * @property {unknown} [result] - Raw result
 */
/**
 * Format search results
 * @param {NotionSearchResponse} response - Notion search response
 * @returns {FormattedSearchResults} Formatted search results
 */
export function formatSearchResults(response: NotionSearchResponse): FormattedSearchResults;
/**
 * Format page data
 * @param {NotionPage} page - Notion page object
 * @returns {FormattedPageData|null} Formatted page data
 */
export function formatPageData(page: NotionPage): FormattedPageData | null;
/**
 * Format database data
 * @param {NotionDatabase} database - Notion database object
 * @returns {FormattedDatabaseData|null} Formatted database data
 */
export function formatDatabaseData(database: NotionDatabase): FormattedDatabaseData | null;
/**
 * Format blocks data
 * @param {NotionBlocksResponse} response - Notion blocks response
 * @returns {FormattedBlocksData} Formatted blocks data
 */
export function formatBlocksData(response: NotionBlocksResponse): FormattedBlocksData;
/**
 * Format database query results
 * @param {NotionQueryResponse} response - Notion database query response
 * @returns {FormattedQueryResults} Formatted query results
 */
export function formatQueryResults(response: NotionQueryResponse): FormattedQueryResults;
/**
 * Extract title from Notion object
 * @param {NotionPage|NotionDatabase} item - Notion page/database object
 * @returns {string} Extracted title
 */
export function extractTitle(item: NotionPage | NotionDatabase): string;
/**
 * Extract content from block
 * @param {NotionBlock} block - Notion block object
 * @returns {string} Extracted content
 */
export function extractBlockContent(block: NotionBlock): string;
/**
 * Format user data
 * @param {NotionUser} user - Notion user object
 * @returns {FormattedUserData|null} Formatted user data
 */
export function formatUserData(user: NotionUser): FormattedUserData | null;
/**
 * Format error response
 * @param {Error} error - Error object
 * @returns {{error: boolean, message: string, timestamp: string}} Formatted error response
 */
export function formatErrorResponse(error: Error): {
    error: boolean;
    message: string;
    timestamp: string;
};
/**
 * Format Notion API response
 * @param {NotionResponseData} responseData - Response data with action and results
 * @returns {Record<string, unknown>} Formatted Notion response
 */
export function formatNotionResponse(responseData: NotionResponseData): Record<string, unknown>;
//# sourceMappingURL=notionFormatting.d.ts.map