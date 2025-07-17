export class ResponseOptimizer {
    cache: Map<any, any>;
    compressionStats: {
        totalRequests: number;
        totalOriginalSize: number;
        totalOptimizedSize: number;
        compressionRatio: number;
    };
    /**
     * Optimize repositories response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeRepositoriesResponse(response: Object): Object;
    /**
     * Optimize repository response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeRepositoryResponse(response: Object): Object;
    /**
     * Optimize issues response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeIssuesResponse(response: Object): Object;
    /**
     * Optimize single issue
     * @param {Object} issue - Issue object
     * @returns {Object} Optimized issue
     */
    optimizeIssue(issue: Object): Object;
    /**
     * Optimize pull requests response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizePullRequestsResponse(response: Object): Object;
    /**
     * Optimize single pull request
     * @param {Object} pr - Pull request object
     * @returns {Object} Optimized pull request
     */
    optimizePullRequest(pr: Object): Object;
    /**
     * Optimize user object
     * @param {Object} user - User object
     * @returns {Object} Optimized user
     */
    optimizeUser(user: Object): Object;
    /**
     * Optimize commits response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeCommitsResponse(response: Object): Object;
    /**
     * Optimize user response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeUserResponse(response: Object): Object;
    /**
     * Optimize issue response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeIssueResponse(response: Object): Object;
    /**
     * Optimize pull request response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizePullRequestResponse(response: Object): Object;
    /**
     * Optimize search response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeSearchResponse(response: Object): Object;
    /**
     * Optimize contents response
     * @param {Object} response - Original response
     * @returns {Object} Optimized response
     */
    optimizeContentsResponse(response: Object): Object;
    /**
     * Optimize content item
     * @param {Object} item - Content item
     * @returns {Object} Optimized content item
     */
    optimizeContentItem(item: Object): Object;
    /**
     * Generic optimize method that routes to specific optimizers
     * @param {Object} response - Response to optimize
     * @param {string} type - Response type
     * @param {Object} options - Optimization options
     * @returns {Object} Optimized response
     */
    optimize(response: Object, type: string, options?: Object): Object;
    /**
     * Optimize single commit
     * @param {Object} commit - Commit object
     * @returns {Object} Optimized commit
     */
    optimizeCommit(commit: Object): Object;
    /**
     * Generic response optimization
     * @param {Object} response - Response to optimize
     * @param {Object} options - Optimization options
     * @returns {Object} Optimized response
     */
    optimizeResponse(response: Object, options?: Object): Object;
    /**
     * Check if value is empty
     * @param {any} value - Value to check
     * @returns {boolean}
     */
    isEmpty(value: any): boolean;
    /**
     * Check if field is metadata
     * @param {string} fieldName - Field name
     * @returns {boolean}
     */
    isMetadataField(fieldName: string): boolean;
    /**
     * Calculate response size (rough estimate)
     * @param {any} response - Response object
     * @returns {number} Size in bytes
     */
    calculateResponseSize(response: any): number;
    /**
     * Update compression statistics
     * @param {number} originalSize - Original size
     * @param {number} optimizedSize - Optimized size
     */
    updateCompressionStats(originalSize: number, optimizedSize: number): void;
    /**
     * Get compression statistics
     * @returns {Object}
     */
    getCompressionStats(): Object;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Reset statistics
     */
    resetStats(): void;
}
//# sourceMappingURL=response-optimizer.d.ts.map