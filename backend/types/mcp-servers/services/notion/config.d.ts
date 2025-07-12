declare namespace _default {
    export let name: string;
    export let displayName: string;
    export let description: string;
    export let category: string;
    export let iconUrl: string;
    export namespace api {
        let baseURL: string;
        let version: string;
        let notionVersion: string;
        namespace rateLimit {
            let requests: number;
            let period: string;
        }
        let documentation: string;
    }
    export namespace auth {
        let type: string;
        let field: string;
        let header: string;
        function headerFormat(token: any): string;
        namespace validation {
            let format: RegExp;
            let endpoint: string;
        }
    }
    export namespace endpoints {
        let me: string;
        let users: string;
        let databases: string;
        let pages: string;
        let blocks: string;
        let search: string;
        function databaseQuery(databaseId: any): string;
        function pageBlocks(pageId: any): string;
        function pageProperties(pageId: any): string;
        let createPage: string;
        function updatePage(pageId: any): string;
    }
    export namespace customHandlers {
        export function searchContent(config: any, token: any, query?: string, filter?: {}): Promise<{
            results: any;
            total: any;
            has_more: any;
            next_cursor: any;
        }>;
        export function queryDatabase(config: any, token: any, databaseId: any, filter?: {}, sorts?: any[]): Promise<{
            results: any;
            total: any;
            has_more: any;
            next_cursor: any;
        }>;
        export function getPageContent(config: any, token: any, pageId: any): Promise<{
            page: {
                id: any;
                created_time: any;
                last_edited_time: any;
                properties: any;
                url: any;
                parent: any;
            };
            blocks: any;
            total_blocks: any;
        }>;
        export function createPage_1(config: any, token: any, parent: any, properties: any, children?: any[]): Promise<unknown>;
        export { createPage_1 as createPage };
    }
    export let tools: ({
        name: string;
        description: string;
        endpoint: string;
        parameters: {
            query?: undefined;
            filter?: undefined;
            databaseId?: undefined;
            sorts?: undefined;
            pageId?: undefined;
            parent?: undefined;
            properties?: undefined;
            children?: undefined;
        };
        handler?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            query: {
                type: string;
                description: string;
                required: boolean;
                default: string;
            };
            filter: {
                type: string;
                description: string;
                required: boolean;
                default: {};
            };
            databaseId?: undefined;
            sorts?: undefined;
            pageId?: undefined;
            parent?: undefined;
            properties?: undefined;
            children?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            databaseId: {
                type: string;
                description: string;
                required: boolean;
            };
            filter: {
                type: string;
                description: string;
                required: boolean;
                default: {};
            };
            sorts: {
                type: string;
                description: string;
                required: boolean;
                default: never[];
            };
            query?: undefined;
            pageId?: undefined;
            parent?: undefined;
            properties?: undefined;
            children?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            pageId: {
                type: string;
                description: string;
                required: boolean;
            };
            query?: undefined;
            filter?: undefined;
            databaseId?: undefined;
            sorts?: undefined;
            parent?: undefined;
            properties?: undefined;
            children?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            parent: {
                type: string;
                description: string;
                required: boolean;
            };
            properties: {
                type: string;
                description: string;
                required: boolean;
            };
            children: {
                type: string;
                description: string;
                required: boolean;
                default: never[];
            };
            query?: undefined;
            filter?: undefined;
            databaseId?: undefined;
            sorts?: undefined;
            pageId?: undefined;
        };
        endpoint?: undefined;
    })[];
    export let resources: ({
        name: string;
        uri: string;
        description: string;
        endpoint: string;
        handler?: undefined;
    } | {
        name: string;
        uri: string;
        description: string;
        handler: string;
        endpoint?: undefined;
    })[];
    export namespace validation_1 {
        function credentials(config: any, credentials: any): Promise<{
            valid: boolean;
            user: unknown;
        }>;
    }
    export { validation_1 as validation };
}
export default _default;
//# sourceMappingURL=config.d.ts.map