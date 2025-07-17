export function getAuthenticatedUser(bearerToken: any): Promise<Object>;
export function listRepositories(args: any, bearerToken: any): Promise<Object>;
export function getRepository(args: any, bearerToken: any): Promise<Object>;
export function createRepository(args: any, bearerToken: any): Promise<Object>;
export function listIssues(args: any, bearerToken: any): Promise<Object>;
export function getIssue(args: any, bearerToken: any): Promise<Object>;
export function createIssue(args: any, bearerToken: any): Promise<Object>;
export function updateIssue(args: any, bearerToken: any): Promise<Object>;
export function listPullRequests(args: any, bearerToken: any): Promise<Object>;
export function getPullRequest(args: any, bearerToken: any): Promise<Object>;
export function createPullRequest(args: any, bearerToken: any): Promise<Object>;
export function updatePullRequest(args: any, bearerToken: any): Promise<Object>;
export function listCommits(args: any, bearerToken: any): Promise<Object>;
export function getCommit(args: any, bearerToken: any): Promise<Object>;
export function listBranches(args: any, bearerToken: any): Promise<Object>;
export function getBranch(args: any, bearerToken: any): Promise<Object>;
export function createBranch(args: any, bearerToken: any): Promise<Object>;
export function searchRepositories(args: any, bearerToken: any): Promise<Object>;
export function searchIssues(args: any, bearerToken: any): Promise<Object>;
export function getRepositoryContents(args: any, bearerToken: any): Promise<Object>;
export function forkRepository(args: any, bearerToken: any): Promise<Object>;
export function starRepository(args: any, bearerToken: any): Promise<Object>;
export function unstarRepository(args: any, bearerToken: any): Promise<Object>;
/**
 * GitHub API client class
 */
export class GitHubAPI {
    /**
     * @param {string} bearerToken - OAuth Bearer token
     * @param {Object} options - API client options
     */
    constructor(bearerToken: string, options?: Object);
    bearerToken: string;
    options: {
        constructor: Function;
        toString(): string;
        toLocaleString(): string;
        valueOf(): Object;
        hasOwnProperty(v: PropertyKey): boolean;
        isPrototypeOf(v: Object): boolean;
        propertyIsEnumerable(v: PropertyKey): boolean;
        timeout: any;
        retryAttempts: any;
        baseURL: any;
        userAgent: any;
    };
    cache: Object;
    cacheStats: {
        hits: number;
        misses: number;
        sets: number;
    };
    /**
     * Make authenticated request to GitHub API
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Object} API response
     */
    makeRequest(endpoint: string, options?: Object): Object;
    /**
     * Get authenticated user information
     * @returns {Object} User information
     */
    getAuthenticatedUser(): Object;
    /**
     * List repositories for the authenticated user
     * @param {Object} args - Repository arguments
     * @returns {Object} Repositories list
     */
    listRepositories(args?: Object): Object;
    /**
     * Get repository information
     * @param {Object} args - Repository arguments
     * @returns {Object} Repository information
     */
    getRepository(args: Object): Object;
    /**
     * Create a new repository
     * @param {Object} args - Repository arguments
     * @returns {Object} Created repository
     */
    createRepository(args: Object): Object;
    /**
     * List issues for a repository
     * @param {Object} args - Issue arguments
     * @returns {Object} Issues list
     */
    listIssues(args: Object): Object;
    /**
     * Get issue information
     * @param {Object} args - Issue arguments
     * @returns {Object} Issue information
     */
    getIssue(args: Object): Object;
    /**
     * Create a new issue
     * @param {Object} args - Issue arguments
     * @returns {Object} Created issue
     */
    createIssue(args: Object): Object;
    /**
     * Update an issue
     * @param {Object} args - Issue arguments
     * @returns {Object} Updated issue
     */
    updateIssue(args: Object): Object;
    /**
     * List pull requests for a repository
     * @param {Object} args - Pull request arguments
     * @returns {Object} Pull requests list
     */
    listPullRequests(args: Object): Object;
    /**
     * Get pull request information
     * @param {Object} args - Pull request arguments
     * @returns {Object} Pull request information
     */
    getPullRequest(args: Object): Object;
    /**
     * Create a new pull request
     * @param {Object} args - Pull request arguments
     * @returns {Object} Created pull request
     */
    createPullRequest(args: Object): Object;
    /**
     * Update a pull request
     * @param {Object} args - Pull request arguments
     * @returns {Object} Updated pull request
     */
    updatePullRequest(args: Object): Object;
    /**
     * Search repositories
     * @param {Object} args - Search arguments
     * @returns {Object} Search results
     */
    searchRepositories(args: Object): Object;
    /**
     * Search issues
     * @param {Object} args - Search arguments
     * @returns {Object} Search results
     */
    searchIssues(args: Object): Object;
    /**
     * List commits for a repository
     * @param {Object} args - Commit arguments
     * @returns {Object} Commits list
     */
    listCommits(args: Object): Object;
    /**
     * Get commit information
     * @param {Object} args - Commit arguments
     * @returns {Object} Commit information
     */
    getCommit(args: Object): Object;
    /**
     * List branches for a repository
     * @param {Object} args - Branch arguments
     * @returns {Object} Branches list
     */
    listBranches(args: Object): Object;
    /**
     * Get branch information
     * @param {Object} args - Branch arguments
     * @returns {Object} Branch information
     */
    getBranch(args: Object): Object;
    /**
     * Create a new branch
     * @param {Object} args - Branch arguments
     * @returns {Object} Created branch reference
     */
    createBranch(args: Object): Object;
    /**
     * Get repository contents
     * @param {Object} args - Content arguments
     * @returns {Object} Repository contents
     */
    getRepositoryContents(args: Object): Object;
    /**
     * Fork a repository
     * @param {Object} args - Fork arguments
     * @returns {Object} Forked repository
     */
    forkRepository(args: Object): Object;
    /**
     * Star a repository
     * @param {Object} args - Star arguments
     * @returns {Object} Success status
     */
    starRepository(args: Object): Object;
    /**
     * Unstar a repository
     * @param {Object} args - Unstar arguments
     * @returns {Object} Success status
     */
    unstarRepository(args: Object): Object;
    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats(): Object;
    /**
     * Clear cache
     */
    clearCache(): void;
}
export default GitHubAPI;
//# sourceMappingURL=github-api.d.ts.map