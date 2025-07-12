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
        function headerFormat(token: any): any;
        namespace validation {
            let format: RegExp;
            let endpoint: string;
        }
    }
    export namespace endpoints {
        let me: string;
        let files: string;
        let teams: string;
        function fileDetails(fileKey: any): string;
        function fileComments(fileKey: any): string;
        function teamProjects(teamId: any): string;
        function projectFiles(projectId: any): string;
        function versions(fileKey: any): string;
        function createComment(fileKey: any): string;
        function updateFile(fileKey: any): string;
        function createWebhook(teamId: any): string;
    }
    export namespace customHandlers {
        export function files_1(config: any, apiKey: any): Promise<{
            totalFiles: number;
            totalTeams: number;
            api_limitations: string;
            note: string | undefined;
            user_info: null;
            files: never[];
            teams: never[];
            projects: never[];
            available_endpoints: never[];
            errors: never[];
        }>;
        export { files_1 as files };
        export function teamProjects_1(config: any, apiKey: any, teamId: any): Promise<unknown>;
        export { teamProjects_1 as teamProjects };
        export function fileDetails_1(config: any, apiKey: any, fileKey: any): Promise<unknown>;
        export { fileDetails_1 as fileDetails };
        export function createComment_1(config: any, apiKey: any, fileKey: any, message: any): Promise<{
            success: boolean;
            comment: unknown;
            message: string;
        }>;
        export { createComment_1 as createComment };
    }
    export let tools: ({
        name: string;
        description: string;
        endpoint: string;
        parameters: {
            teamId?: undefined;
            fileKey?: undefined;
            message?: undefined;
        };
        handler?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            teamId?: undefined;
            fileKey?: undefined;
            message?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            teamId: {
                type: string;
                description: string;
                required: boolean;
            };
            fileKey?: undefined;
            message?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            fileKey: {
                type: string;
                description: string;
                required: boolean;
            };
            teamId?: undefined;
            message?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            fileKey: {
                type: string;
                description: string;
                required: boolean;
            };
            message: {
                type: string;
                description: string;
                required: boolean;
            };
            teamId?: undefined;
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