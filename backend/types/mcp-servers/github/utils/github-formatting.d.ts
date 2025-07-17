/**
 * GitHub response formatting utilities
 * Standardizes GitHub API responses for MCP tools
 */
/**
 * Format repository response from GitHub API
 * @param {Object} repo - Raw GitHub repository object
 * @returns {Object} Formatted repository response
 */
export function formatRepositoryResponse(repo: Object): Object;
/**
 * Format issue response from GitHub API
 * @param {Object} issue - Raw GitHub issue object
 * @returns {Object} Formatted issue response
 */
export function formatIssueResponse(issue: Object): Object;
/**
 * Format pull request response from GitHub API
 * @param {Object} pr - Raw GitHub pull request object
 * @returns {Object} Formatted pull request response
 */
export function formatPullRequestResponse(pr: Object): Object;
/**
 * Format commit response from GitHub API
 * @param {Object} commit - Raw GitHub commit object
 * @returns {Object} Formatted commit response
 */
export function formatCommitResponse(commit: Object): Object;
/**
 * Format user response from GitHub API
 * @param {Object} user - Raw GitHub user object
 * @returns {Object} Formatted user response
 */
export function formatUserResponse(user: Object): Object;
/**
 * Format branch response from GitHub API
 * @param {Object} branch - Raw GitHub branch object
 * @returns {Object} Formatted branch response
 */
export function formatBranchResponse(branch: Object): Object;
/**
 * Format repository content response from GitHub API
 * @param {Object} content - Raw GitHub content object
 * @returns {Object} Formatted content response
 */
export function formatContentResponse(content: Object): Object;
/**
 * Format search results response from GitHub API
 * @param {Object} searchResult - Raw GitHub search result object
 * @param {string} type - Type of search (repositories, issues, etc.)
 * @returns {Object} Formatted search response
 */
export function formatSearchResponse(searchResult: Object, type: string): Object;
/**
 * Format error response for consistent error handling
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(error: Error, context?: string): Object;
//# sourceMappingURL=github-formatting.d.ts.map