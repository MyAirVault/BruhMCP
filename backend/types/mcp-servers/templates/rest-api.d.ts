declare namespace _default {
    export let name: string;
    export let displayName: string;
    export let description: string;
    export let category: string;
    export let iconUrl: string;
    export namespace api {
        let baseURL: string;
        let version: string;
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
        export let me: string;
        export let list: string;
        export function details(id: any): string;
        export let create: string;
        export function update(id: any): string;
        export function _delete(id: any): string;
        export { _delete as delete };
    }
    export namespace customHandlers {
        function listItems(config: any, token: any, options?: {}): Promise<{
            items: any;
            total: any;
            limit: any;
            offset: any;
            hasMore: any;
        }>;
        function createItem(config: any, token: any, itemData: any): Promise<unknown>;
    }
    export let tools: ({
        name: string;
        description: string;
        endpoint: string;
        parameters: {
            limit?: undefined;
            offset?: undefined;
            filter?: undefined;
            itemData?: undefined;
        };
        handler?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            limit: {
                type: string;
                description: string;
                required: boolean;
                default: number;
            };
            offset: {
                type: string;
                description: string;
                required: boolean;
                default: number;
            };
            filter: {
                type: string;
                description: string;
                required: boolean;
            };
            itemData?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            itemData: {
                type: string;
                description: string;
                required: boolean;
            };
            limit?: undefined;
            offset?: undefined;
            filter?: undefined;
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
//# sourceMappingURL=rest-api.d.ts.map