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
        let guilds: string;
        let channels: string;
        function guildChannels(guildId: any): string;
        function channelMessages(channelId: any): string;
        function sendMessage(channelId: any): string;
        function guildMembers(guildId: any): string;
        function guildRoles(guildId: any): string;
        function channelInfo(channelId: any): string;
        function guildInfo(guildId: any): string;
    }
    export namespace customHandlers {
        export function botInfo(config: any, token: any): Promise<{
            bot_info: null;
            guilds: never[];
            total_guilds: number;
            available_endpoints: never[];
            errors: never[];
        }>;
        export function guildChannels_1(config: any, token: any, guildId: any): Promise<{
            channels: any;
            total: any;
            guild_id: any;
        }>;
        export { guildChannels_1 as guildChannels };
        export function sendMessage_1(config: any, token: any, channelId: any, content: any, options?: {}): Promise<unknown>;
        export { sendMessage_1 as sendMessage };
        export function channelMessages_1(config: any, token: any, channelId: any, limit?: number): Promise<{
            messages: any;
            total: any;
            channel_id: any;
        }>;
        export { channelMessages_1 as channelMessages };
    }
    export let tools: ({
        name: string;
        description: string;
        handler: string;
        parameters: {
            guildId?: undefined;
            channelId?: undefined;
            content?: undefined;
            embeds?: undefined;
            limit?: undefined;
        };
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            guildId: {
                type: string;
                description: string;
                required: boolean;
            };
            channelId?: undefined;
            content?: undefined;
            embeds?: undefined;
            limit?: undefined;
        };
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            channelId: {
                type: string;
                description: string;
                required: boolean;
            };
            content: {
                type: string;
                description: string;
                required: boolean;
            };
            embeds: {
                type: string;
                description: string;
                required: boolean;
            };
            guildId?: undefined;
            limit?: undefined;
        };
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            channelId: {
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
            guildId?: undefined;
            content?: undefined;
            embeds?: undefined;
        };
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
            bot: unknown;
        }>;
    }
    export { validation_1 as validation };
}
export default _default;
//# sourceMappingURL=config.d.ts.map