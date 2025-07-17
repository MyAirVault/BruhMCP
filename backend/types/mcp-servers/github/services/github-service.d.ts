export class GitHubService {
    /**
     * @param {Object} config - Service configuration
     */
    constructor(config: Object);
    config: {
        constructor: Function;
        toString(): string;
        toLocaleString(): string;
        valueOf(): Object;
        hasOwnProperty(v: PropertyKey): boolean;
        isPrototypeOf(v: Object): boolean;
        propertyIsEnumerable(v: PropertyKey): boolean;
        bearerToken: any;
        timeout: any;
        retryAttempts: any;
        useOptimization: boolean;
        useSimplification: boolean;
    };
    api: GitHubAPI;
    responseOptimizer: ResponseOptimizer;
    responseSimplifier: ResponseSimplifier;
    globalVariableManager: GlobalVariableManager;
    repositoryCache: Map<any, any>;
    userCache: Map<any, any>;
    cacheTimeout: number;
    /**
     * Get authenticated user information
     * @returns {Promise<Object>}
     */
    getAuthenticatedUser(): Promise<Object>;
    /**
     * List repositories for authenticated user
     * @param {Object} options - Query options
     * @returns {Promise<Array>}
     */
    listRepositories(options?: Object): Promise<any[]>;
    /**
     * Get repository information with caching
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @returns {Promise<Object>}
     */
    getRepository(owner: string, repo: string): Promise<Object>;
    /**
     * Create repository with validation
     * @param {Object} params - Repository parameters
     * @returns {Promise<Object>}
     */
    createRepository(params: Object): Promise<Object>;
    /**
     * List issues for repository
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {Object} options - Query options
     * @returns {Promise<Array>}
     */
    listIssues(owner: string, repo: string, options?: Object): Promise<any[]>;
    /**
     * Get specific issue
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {number} issueNumber - Issue number
     * @returns {Promise<Object>}
     */
    getIssue(owner: string, repo: string, issueNumber: number): Promise<Object>;
    /**
     * Create issue with validation
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {Object} params - Issue parameters
     * @returns {Promise<Object>}
     */
    createIssue(owner: string, repo: string, params: Object): Promise<Object>;
    /**
     * Create pull request with validation
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {Object} params - PR parameters
     * @returns {Promise<Object>}
     */
    createPullRequest(owner: string, repo: string, params: Object): Promise<Object>;
    /**
     * Search repositories
     * @param {Object} params - Search parameters
     * @returns {Promise<Object>}
     */
    searchRepositories(params: Object): Promise<Object>;
    /**
     * Get repository contents
     * @param {string} owner - Repository owner
     * @param {string} repo - Repository name
     * @param {Object} options - Content options
     * @returns {Promise<Object>}
     */
    getRepositoryContents(owner: string, repo: string, options?: Object): Promise<Object>;
    /**
     * Get service statistics
     * @returns {Object}
     */
    getStatistics(): Object;
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Health check
     * @returns {Promise<Object>}
     */
    healthCheck(): Promise<Object>;
}
import { GitHubAPI } from '../api/github-api.js';
import { ResponseOptimizer } from './cache/response-optimizer.js';
import { ResponseSimplifier } from './cache/response-simplifier.js';
import { GlobalVariableManager } from './session/global-variable-manager.js';
//# sourceMappingURL=github-service.d.ts.map