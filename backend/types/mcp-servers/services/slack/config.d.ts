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
        let me: string;
        let channels: string;
        let users: string;
        let messages: string;
        let profile: string;
        let presence: string;
        let sendMessage: string;
        function channelInfo(channelId: any): string;
        function userInfo(userId: any): string;
        function channelMembers(channelId: any): string;
    }
    export namespace customHandlers {
        export function workspaceInfo(config: any, token: any): Promise<{
            totalChannels: number;
            workspace: any;
            bot_user: any;
            auth_info: null;
            channels: never[];
            users: never[];
            available_endpoints: never[];
            errors: never[];
        }>;
        export function sendMessage_1(config: any, token: any, channel: any, text: any, options?: {}): Promise<unknown>;
        export { sendMessage_1 as sendMessage };
        export function channelHistory(config: any, token: any, channel: any, limit?: number): Promise<{
            messages: any;
            total: any;
            channel: any;
        }>;
    }
    export let tools: ({
        name: string;
        description: string;
        endpoint: string;
        parameters: {
            channel?: undefined;
            text?: undefined;
            thread_ts?: undefined;
            limit?: undefined;
        };
        handler?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            channel?: undefined;
            text?: undefined;
            thread_ts?: undefined;
            limit?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            channel: {
                type: string;
                description: string;
                required: boolean;
            };
            text: {
                type: string;
                description: string;
                required: boolean;
            };
            thread_ts: {
                type: string;
                description: string;
                required: boolean;
            };
            limit?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            channel: {
                type: string;
                description: string;
                required: boolean;
            };
            limit: {
                type: string;
                description: string;
                required: boolean;
                default: number;
            };
            text?: undefined;
            thread_ts?: undefined;
        };
        endpoint?: undefined;
    })[];
    export let resources: ({
        name: string;
        uri: string;
        description: string;
        handler: string;
        endpoint?: undefined;
    } | {
        name: string;
        uri: string;
        description: string;
        endpoint: string;
        handler?: undefined;
    })[];
    export namespace validation_1 {
        function credentials(config: any, credentials: any): Promise<{
            valid: boolean;
            workspace: any;
            user: any;
            bot_id: any;
        }>;
    }
    export { validation_1 as validation };
}
export default _default;
//# sourceMappingURL=config.d.ts.map