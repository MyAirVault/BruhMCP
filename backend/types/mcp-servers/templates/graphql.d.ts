declare namespace _default {
    export let name: string;
    export let displayName: string;
    export let description: string;
    export let category: string;
    export let iconUrl: string;
    export namespace api {
        let baseURL: string;
        let version: string;
        let type: string;
        namespace rateLimit {
            let requests: number;
            let period: string;
        }
        let documentation: string;
    }
    export namespace auth {
        let type_1: string;
        export { type_1 as type };
        export let field: string;
        export let header: string;
        export function headerFormat(token: any): string;
        export namespace validation {
            let format: RegExp;
            let query: string;
        }
    }
    export namespace queries {
        let me: string;
        let listItems: string;
        let itemDetails: string;
    }
    export namespace mutations {
        let createItem: string;
        let updateItem: string;
    }
    export namespace endpoints {
        let me_1: string;
        export { me_1 as me };
        export let list: string;
        export let details: string;
        export let create: string;
        export let update: string;
    }
    export namespace customHandlers {
        export function executeQuery(config: any, token: any, query: any, variables?: {}): Promise<any>;
        export function listItems_1(config: any, token: any, options?: {}): Promise<{
            items: any;
            pageInfo: any;
            totalCount: any;
        }>;
        export { listItems_1 as listItems };
        export function getItemDetails(config: any, token: any, id: any): Promise<any>;
        export function createItem_1(config: any, token: any, input: any): Promise<any>;
        export { createItem_1 as createItem };
    }
    export let tools: ({
        name: string;
        description: string;
        handler: string;
        parameters: {
            first?: undefined;
            after?: undefined;
            filter?: undefined;
            id?: undefined;
            input?: undefined;
        };
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            first: {
                type: string;
                description: string;
                required: boolean;
                default: number;
            };
            after: {
                type: string;
                description: string;
                required: boolean;
            };
            filter: {
                type: string;
                description: string;
                required: boolean;
            };
            id?: undefined;
            input?: undefined;
        };
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            id: {
                type: string;
                description: string;
                required: boolean;
            };
            first?: undefined;
            after?: undefined;
            filter?: undefined;
            input?: undefined;
        };
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            input: {
                type: string;
                description: string;
                required: boolean;
                properties: {
                    title: {
                        type: string;
                        required: boolean;
                    };
                    description: {
                        type: string;
                        required: boolean;
                    };
                    content: {
                        type: string;
                        required: boolean;
                    };
                };
            };
            first?: undefined;
            after?: undefined;
            filter?: undefined;
            id?: undefined;
        };
    })[];
    export let resources: ({
        name: string;
        uri: string;
        description: string;
        query: string;
        handler?: undefined;
    } | {
        name: string;
        uri: string;
        description: string;
        handler: string;
        query?: undefined;
    })[];
    export namespace validation_1 {
        function credentials(config: any, credentials: any): Promise<{
            valid: boolean;
            user: any;
        }>;
    }
    export { validation_1 as validation };
}
export default _default;
//# sourceMappingURL=graphql.d.ts.map