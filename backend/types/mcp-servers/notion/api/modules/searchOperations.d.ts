/**
 * Search for pages and databases
 * @param {{query?: string, filter?: {value: string, property: string}, sort?: {direction: 'ascending' | 'descending', timestamp: 'last_edited_time'}, page_size?: number, start_cursor?: string}} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Record<string, unknown>>} Search results
 */
export function searchNotion(args: {
    query?: string | undefined;
    filter?: {
        value: string;
        property: string;
    } | undefined;
    sort?: {
        direction: 'ascending' | 'descending';
        timestamp: 'last_edited_time';
    } | undefined;
    page_size?: number | undefined;
    start_cursor?: string | undefined;
}, bearerToken: string): Promise<Record<string, unknown>>;
//# sourceMappingURL=searchOperations.d.ts.map