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
        let repos: string;
        let issues: string;
        let notifications: string;
        let starred: string;
        let following: string;
        let followers: string;
        function repoDetails(owner: any, repo: any): string;
        function repoIssues(owner: any, repo: any): string;
        function repoPulls(owner: any, repo: any): string;
        function repoCommits(owner: any, repo: any): string;
    }
    export namespace customHandlers {
        export function repos_1(config: any, token: any): Promise<{
            repositories: any;
            totalCount: any;
            summary: {
                public: any;
                private: any;
                languages: any[];
                total_stars: any;
            };
        }>;
        export { repos_1 as repos };
        export function repoDetails_1(config: any, token: any, owner: any, repo: any): Promise<unknown>;
        export { repoDetails_1 as repoDetails };
        export function issues_1(config: any, token: any): Promise<{
            issues: any;
            total: any;
        }>;
        export { issues_1 as issues };
    }
    export let tools: ({
        name: string;
        description: string;
        endpoint: string;
        parameters: {
            owner?: undefined;
            repo?: undefined;
        };
        handler?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            owner?: undefined;
            repo?: undefined;
        };
        endpoint?: undefined;
    } | {
        name: string;
        description: string;
        handler: string;
        parameters: {
            owner: {
                type: string;
                description: string;
                required: boolean;
            };
            repo: {
                type: string;
                description: string;
                required: boolean;
            };
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