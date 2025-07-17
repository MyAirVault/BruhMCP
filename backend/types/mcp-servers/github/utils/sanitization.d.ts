/**
 * Sanitize GitHub parameters
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} Sanitized parameters
 */
export function sanitizeGitHubParams(params: Object): Object;
/**
 * Sanitize a string for safe usage
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str: string): string;
/**
 * Sanitize GitHub repository name
 * @param {string} repoName - Repository name
 * @returns {string} Sanitized repository name
 */
export function sanitizeRepoName(repoName: string): string;
/**
 * Sanitize GitHub username
 * @param {string} username - Username
 * @returns {string} Sanitized username
 */
export function sanitizeUsername(username: string): string;
/**
 * Sanitize GitHub branch name
 * @param {string} branchName - Branch name
 * @returns {string} Sanitized branch name
 */
export function sanitizeBranchName(branchName: string): string;
/**
 * Sanitize GitHub label name
 * @param {string} labelName - Label name
 * @returns {string} Sanitized label name
 */
export function sanitizeLabelName(labelName: string): string;
/**
 * Sanitize GitHub issue/PR title
 * @param {string} title - Title
 * @returns {string} Sanitized title
 */
export function sanitizeTitle(title: string): string;
/**
 * Sanitize GitHub issue/PR body
 * @param {string} body - Body content
 * @returns {string} Sanitized body
 */
export function sanitizeBody(body: string): string;
/**
 * Sanitize GitHub search query
 * @param {string} query - Search query
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query: string): string;
/**
 * Sanitize GitHub commit SHA
 * @param {string} sha - Commit SHA
 * @returns {string} Sanitized SHA
 */
export function sanitizeCommitSHA(sha: string): string;
/**
 * Sanitize GitHub file path
 * @param {string} path - File path
 * @returns {string} Sanitized path
 */
export function sanitizeFilePath(path: string): string;
/**
 * Sanitize GitHub organization name
 * @param {string} orgName - Organization name
 * @returns {string} Sanitized organization name
 */
export function sanitizeOrgName(orgName: string): string;
/**
 * Sanitize GitHub milestone title
 * @param {string} title - Milestone title
 * @returns {string} Sanitized title
 */
export function sanitizeMilestoneTitle(title: string): string;
/**
 * Sanitize GitHub description
 * @param {string} description - Description
 * @returns {string} Sanitized description
 */
export function sanitizeDescription(description: string): string;
/**
 * Sanitize GitHub tag name
 * @param {string} tagName - Tag name
 * @returns {string} Sanitized tag name
 */
export function sanitizeTagName(tagName: string): string;
/**
 * Sanitize GitHub reference name
 * @param {string} ref - Reference name
 * @returns {string} Sanitized reference
 */
export function sanitizeRef(ref: string): string;
/**
 * Sanitize GitHub assignee list
 * @param {Array<string>} assignees - Assignee usernames
 * @returns {Array<string>} Sanitized assignees
 */
export function sanitizeAssignees(assignees: Array<string>): Array<string>;
/**
 * Sanitize GitHub labels list
 * @param {Array<string>} labels - Label names
 * @returns {Array<string>} Sanitized labels
 */
export function sanitizeLabels(labels: Array<string>): Array<string>;
/**
 * Sanitize GitHub milestone number
 * @param {number|string} milestone - Milestone number
 * @returns {number|null} Sanitized milestone
 */
export function sanitizeMilestone(milestone: number | string): number | null;
/**
 * Sanitize GitHub pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Sanitized pagination parameters
 */
export function sanitizePagination(params: Object): Object;
/**
 * Sanitize GitHub date parameters
 * @param {Object} params - Date parameters
 * @returns {Object} Sanitized date parameters
 */
export function sanitizeDateParams(params: Object): Object;
/**
 * Sanitize GitHub sort parameters
 * @param {Object} params - Sort parameters
 * @param {Array<string>} validSorts - Valid sort options
 * @returns {Object} Sanitized sort parameters
 */
export function sanitizeSortParams(params: Object, validSorts?: Array<string>): Object;
/**
 * Sanitize GitHub filter parameters
 * @param {Object} params - Filter parameters
 * @returns {Object} Sanitized filter parameters
 */
export function sanitizeFilterParams(params: Object): Object;
/**
 * Comprehensive sanitization for GitHub API parameters
 * @param {Object} params - Parameters to sanitize
 * @param {string} operation - Operation type for context
 * @returns {Object} Sanitized parameters
 */
export function sanitizeForGitHubAPI(params: Object, operation?: string): Object;
declare namespace _default {
    export { sanitizeGitHubParams };
    export { sanitizeString };
    export { sanitizeRepoName };
    export { sanitizeUsername };
    export { sanitizeBranchName };
    export { sanitizeLabelName };
    export { sanitizeTitle };
    export { sanitizeBody };
    export { sanitizeSearchQuery };
    export { sanitizeCommitSHA };
    export { sanitizeFilePath };
    export { sanitizeOrgName };
    export { sanitizeMilestoneTitle };
    export { sanitizeDescription };
    export { sanitizeTagName };
    export { sanitizeRef };
    export { sanitizeAssignees };
    export { sanitizeLabels };
    export { sanitizeMilestone };
    export { sanitizePagination };
    export { sanitizeDateParams };
    export { sanitizeSortParams };
    export { sanitizeFilterParams };
    export { sanitizeForGitHubAPI };
}
export default _default;
//# sourceMappingURL=sanitization.d.ts.map