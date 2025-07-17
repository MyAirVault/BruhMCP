/**
 * Get repository information
 * @param {Object} args - Repository arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Repository information
 */
export function getRepository(args: Object, bearerToken: string): Object;
/**
 * Create a new repository
 * @param {Object} args - Repository arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created repository
 */
export function createRepository(args: Object, bearerToken: string): Object;
/**
 * List issues for a repository
 * @param {Object} args - Issue arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Issues list
 */
export function listIssues(args: Object, bearerToken: string): Object;
/**
 * Get issue information
 * @param {Object} args - Issue arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Issue information
 */
export function getIssue(args: Object, bearerToken: string): Object;
/**
 * Create a new issue
 * @param {Object} args - Issue arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created issue
 */
export function createIssue(args: Object, bearerToken: string): Object;
/**
 * Create a new pull request
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created pull request
 */
export function createPullRequest(args: Object, bearerToken: string): Object;
/**
 * List pull requests for a repository
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Pull requests list
 */
export function listPullRequests(args: Object, bearerToken: string): Object;
/**
 * Search repositories
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export function searchRepositories(args: Object, bearerToken: string): Object;
/**
 * Search issues
 * @param {Object} args - Search arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Search results
 */
export function searchIssues(args: Object, bearerToken: string): Object;
/**
 * Update an issue
 * @param {Object} args - Issue arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated issue
 */
export function updateIssue(args: Object, bearerToken: string): Object;
/**
 * Get pull request information
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Pull request information
 */
export function getPullRequest(args: Object, bearerToken: string): Object;
/**
 * Update a pull request
 * @param {Object} args - Pull request arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Updated pull request
 */
export function updatePullRequest(args: Object, bearerToken: string): Object;
/**
 * List commits for a repository
 * @param {Object} args - Commit arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Commits list
 */
export function listCommits(args: Object, bearerToken: string): Object;
/**
 * Get commit information
 * @param {Object} args - Commit arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Commit information
 */
export function getCommit(args: Object, bearerToken: string): Object;
/**
 * List branches for a repository
 * @param {Object} args - Branch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Branches list
 */
export function listBranches(args: Object, bearerToken: string): Object;
/**
 * Get branch information
 * @param {Object} args - Branch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Branch information
 */
export function getBranch(args: Object, bearerToken: string): Object;
/**
 * Create a new branch
 * @param {Object} args - Branch arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Created branch reference
 */
export function createBranch(args: Object, bearerToken: string): Object;
/**
 * Get repository contents
 * @param {Object} args - Content arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Repository contents
 */
export function getRepositoryContents(args: Object, bearerToken: string): Object;
/**
 * Fork a repository
 * @param {Object} args - Fork arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Forked repository
 */
export function forkRepository(args: Object, bearerToken: string): Object;
/**
 * Star a repository
 * @param {Object} args - Star arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Success status
 */
export function starRepository(args: Object, bearerToken: string): Object;
/**
 * Unstar a repository
 * @param {Object} args - Unstar arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Success status
 */
export function unstarRepository(args: Object, bearerToken: string): Object;
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
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats(): Object;
    /**
     * Clear cache
     */
    clearCache(): void;
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
}
//# sourceMappingURL=github-api-old.d.ts.map