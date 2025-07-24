/**
 * NotionService class that wraps all Notion API functions
 */
export class NotionService {
    /**
     * @param {Object} config - Service configuration
     * @param {string} config.bearerToken - OAuth Bearer token
     */
    constructor(config: {
        bearerToken: string;
    });
    bearerToken: string;
    search(args: any): Promise<any>;
    getPage(args: any): Promise<any>;
    getPageBlocks(args: any): Promise<any>;
    createPage(args: any): Promise<any>;
    updatePage(args: any): Promise<any>;
    getDatabase(args: any): Promise<any>;
    queryDatabase(args: any): Promise<any>;
    createDatabase(args: any): Promise<any>;
    updateDatabase(args: any): Promise<any>;
    appendBlocks(args: any): Promise<any>;
    deleteBlock(args: any): Promise<any>;
    getCurrentUser(args: any): Promise<any>;
    listUsers(args: any): Promise<any>;
    makeRawApiCall(args: any): Promise<any>;
}
export { makeNotionRequest, getPage, getPageBlocks, createPage, updatePage, getDatabase, queryDatabase, createDatabase, updateDatabase, appendBlocks, deleteBlock, getCurrentUser, listUsers, searchNotion, makeRawApiCall } from "./modules/index.js";
//# sourceMappingURL=notionApi.d.ts.map