export default serviceConfigs;
declare namespace serviceConfigs {
    namespace figma {
        let name: string;
        let baseURL: string;
        function authHeader(apiKey: any): {
            'X-Figma-Token': any;
        };
        let credentialField: string;
        namespace endpoints {
            let me: string;
            let files: string;
            let teams: string;
            function fileDetails(fileKey: any): string;
            function fileComments(fileKey: any): string;
            function teamProjects(teamId: any): string;
            function projectFiles(projectId: any): string;
        }
        namespace customHandlers {
            export function files_1(config: any, apiKey: any): Promise<{
                totalFiles: number;
                note: string | undefined;
                user_info: null;
                files: never[];
                available_endpoints: never[];
                errors: never[];
            }>;
            export { files_1 as files };
        }
    }
    namespace github {
        let name_1: string;
        export { name_1 as name };
        let baseURL_1: string;
        export { baseURL_1 as baseURL };
        export function authHeader_1(token: any): {
            Authorization: string;
            'User-Agent': string;
        };
        export { authHeader_1 as authHeader };
        let credentialField_1: string;
        export { credentialField_1 as credentialField };
        export namespace endpoints_1 {
            let me_1: string;
            export { me_1 as me };
            export let repos: string;
            export let issues: string;
            export let notifications: string;
            export function repoDetails(owner: any, repo: any): string;
            export function repoIssues(owner: any, repo: any): string;
            export function repoPulls(owner: any, repo: any): string;
        }
        export { endpoints_1 as endpoints };
        export namespace customHandlers_1 {
            export function repos_1(config: any, token: any): Promise<{
                repositories: any;
                totalCount: any;
            }>;
            export { repos_1 as repos };
        }
        export { customHandlers_1 as customHandlers };
    }
    namespace gmail {
        let name_2: string;
        export { name_2 as name };
        let baseURL_2: string;
        export { baseURL_2 as baseURL };
        export function authHeader_2(apiKey: any): {
            Authorization: string;
        };
        export { authHeader_2 as authHeader };
        let credentialField_2: string;
        export { credentialField_2 as credentialField };
        export namespace endpoints_2 {
            let profile: string;
            let messages: string;
            let labels: string;
            function messageDetails(messageId: any): string;
        }
        export { endpoints_2 as endpoints };
        export namespace customHandlers_2 {
            export function messages_1(_config: any, _apiKey: any): Promise<{
                note: string;
                oauth_required: boolean;
                setup_url: string;
            }>;
            export { messages_1 as messages };
        }
        export { customHandlers_2 as customHandlers };
    }
}
//# sourceMappingURL=service-configs.d.ts.map