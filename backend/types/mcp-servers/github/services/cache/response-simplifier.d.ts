export class ResponseSimplifier {
    simplificationStats: {
        totalRequests: number;
        totalOriginalSize: number;
        totalSimplifiedSize: number;
        simplificationRatio: number;
    };
    /**
     * Simplify repositories response
     * @param {Array} repositories - Array of repositories
     * @returns {Array} Simplified repositories
     */
    simplifyRepositoriesResponse(repositories: any[]): any[];
    /**
     * Simplify single repository
     * @param {Object} repo - Repository object
     * @returns {Object} Simplified repository
     */
    simplifyRepository(repo: Object): Object;
    /**
     * Simplify issues response
     * @param {Array} issues - Array of issues
     * @returns {Array} Simplified issues
     */
    simplifyIssuesResponse(issues: any[]): any[];
    /**
     * Simplify single issue
     * @param {Object} issue - Issue object
     * @returns {Object} Simplified issue
     */
    simplifyIssue(issue: Object): Object;
    /**
     * Simplify pull requests response
     * @param {Array} pullRequests - Array of pull requests
     * @returns {Array} Simplified pull requests
     */
    simplifyPullRequestsResponse(pullRequests: any[]): any[];
    /**
     * Simplify single pull request
     * @param {Object} pr - Pull request object
     * @returns {Object} Simplified pull request
     */
    simplifyPullRequest(pr: Object): Object;
    /**
     * Simplify commits response
     * @param {Array} commits - Array of commits
     * @returns {Array} Simplified commits
     */
    simplifyCommitsResponse(commits: any[]): any[];
    /**
     * Simplify single commit
     * @param {Object} commit - Commit object
     * @returns {Object} Simplified commit
     */
    simplifyCommit(commit: Object): Object;
    /**
     * Simplify user response
     * @param {Object} user - User object
     * @returns {Object} Simplified user
     */
    simplifyUserResponse(user: Object): Object;
    /**
     * Simplify search response
     * @param {Object} searchResult - Search result object
     * @returns {Object} Simplified search result
     */
    simplifySearchResponse(searchResult: Object): Object;
    /**
     * Simplify contents response
     * @param {Object|Array} contents - Contents object or array
     * @returns {Object|Array} Simplified contents
     */
    simplifyContentsResponse(contents: Object | any[]): Object | any[];
    /**
     * Simplify single content item
     * @param {Object} item - Content item
     * @returns {Object} Simplified content item
     */
    simplifyContentItem(item: Object): Object;
    /**
     * Simplify branches response
     * @param {Array} branches - Array of branches
     * @returns {Array} Simplified branches
     */
    simplifyBranchesResponse(branches: any[]): any[];
    /**
     * Format date to readable format
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateString: string): string;
    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text: string, maxLength?: number): string;
    /**
     * Calculate response size
     * @param {*} response - Response object
     * @returns {number} Size in bytes
     */
    calculateResponseSize(response: any): number;
    /**
     * Update simplification statistics
     * @param {number} originalSize - Original size
     * @param {number} simplifiedSize - Simplified size
     */
    updateSimplificationStats(originalSize: number, simplifiedSize: number): void;
    /**
     * Format response as YAML
     * @param {*} data - Data to format
     * @returns {string} YAML formatted string
     */
    formatAsYAML(data: any): string;
    /**
     * Simplify response with options
     * @param {*} data - Data to simplify
     * @param {string} type - Response type
     * @param {Object} options - Simplification options
     * @returns {*} Simplified data
     */
    simplify(data: any, type: string, options?: Object): any;
    /**
     * Get simplification statistics
     * @returns {Object} Statistics
     */
    getSimplificationStats(): Object;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Reset statistics
     */
    resetStats(): void;
}
export default ResponseSimplifier;
//# sourceMappingURL=response-simplifier.d.ts.map