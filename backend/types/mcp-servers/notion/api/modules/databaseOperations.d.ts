/**
 * @typedef {import('../../utils/notionFormatting.js').NotionRichText} NotionRichText
 * @typedef {import('../../utils/notionFormatting.js').NotionUser} NotionUser
 * @typedef {import('../../utils/notionFormatting.js').NotionParent} NotionParent
 * @typedef {import('../../utils/notionFormatting.js').NotionDatabase} NotionDatabase
 * @typedef {import('../../utils/notionFormatting.js').NotionPage} NotionPage
 * @typedef {import('../../utils/notionFormatting.js').NotionQueryResponse} NotionQueryResponse
 * @typedef {import('../../utils/notionFormatting.js').NotionResponseData} NotionResponseData
 */
/**
 * @typedef {import('../../utils/notionFormatting.js').NotionFilter} NotionFilter
 * @typedef {import('../../utils/notionFormatting.js').NotionSort} NotionSort
 */
/**
 * @typedef {import('../../utils/notionFormatting.js').NotionProperty} NotionProperty
 */
/**
 * @typedef {Object} GetDatabaseArgs
 * @property {string} databaseId - The database ID to retrieve
 */
/**
 * @typedef {Object} QueryDatabaseArgs
 * @property {string} databaseId - The database ID to query
 * @property {NotionFilter} [filter] - Filter conditions for the query
 * @property {NotionSort[]} [sorts] - Sort conditions for the query
 * @property {number} [page_size] - Number of results per page (max 100)
 * @property {string} [start_cursor] - Pagination cursor
 */
/**
 * @typedef {Object} CreateDatabaseArgs
 * @property {NotionParent} parent - Parent page or workspace information
 * @property {NotionRichText[]} title - Database title as rich text array
 * @property {Record<string, NotionProperty>} properties - Database properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */
/**
 * @typedef {Object} UpdateDatabaseArgs
 * @property {string} databaseId - The database ID to update
 * @property {NotionRichText[]} [title] - Updated title as rich text array
 * @property {Record<string, NotionProperty>} [properties] - Updated properties schema
 * @property {boolean} [is_inline] - Whether the database is inline
 */
/**
 * Get database
 * @param {GetDatabaseArgs} args - Database arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Database data
 */
export function getDatabase(args: GetDatabaseArgs, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * Query database
 * @param {QueryDatabaseArgs} args - Database query arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Query results
 */
export function queryDatabase(args: QueryDatabaseArgs, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * Create database
 * @param {CreateDatabaseArgs} args - Database creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Created database
 */
export function createDatabase(args: CreateDatabaseArgs, bearerToken: string): Promise<Record<string, unknown>>;
/**
 * Update database
 * @param {UpdateDatabaseArgs} args - Database update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Updated database
 */
export function updateDatabase(args: UpdateDatabaseArgs, bearerToken: string): Promise<Record<string, unknown>>;
export type NotionRichText = import("../../utils/notionFormatting.js").NotionRichText;
export type NotionUser = import("../../utils/notionFormatting.js").NotionUser;
export type NotionParent = import("../../utils/notionFormatting.js").NotionParent;
export type NotionDatabase = import("../../utils/notionFormatting.js").NotionDatabase;
export type NotionPage = import("../../utils/notionFormatting.js").NotionPage;
export type NotionQueryResponse = import("../../utils/notionFormatting.js").NotionQueryResponse;
export type NotionResponseData = import("../../utils/notionFormatting.js").NotionResponseData;
export type NotionFilter = import("../../utils/notionFormatting.js").NotionFilter;
export type NotionSort = import("../../utils/notionFormatting.js").NotionSort;
export type NotionProperty = import("../../utils/notionFormatting.js").NotionProperty;
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
    filter?: import("../../utils/notionFormatting.js").NotionFilter | undefined;
    /**
     * - Sort conditions for the query
     */
    sorts?: import("../../utils/notionFormatting.js").NotionSort[] | undefined;
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
    parent: NotionParent;
    /**
     * - Database title as rich text array
     */
    title: NotionRichText[];
    /**
     * - Database properties schema
     */
    properties: Record<string, NotionProperty>;
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
    title?: import("../../utils/notionFormatting.js").NotionRichText[] | undefined;
    /**
     * - Updated properties schema
     */
    properties?: Record<string, import("../../utils/notionFormatting.js").NotionProperty> | undefined;
    /**
     * - Whether the database is inline
     */
    is_inline?: boolean | undefined;
};
//# sourceMappingURL=databaseOperations.d.ts.map