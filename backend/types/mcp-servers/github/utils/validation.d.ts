/**
 * Validate GitHub owner and repository name
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @throws {Error} If validation fails
 */
export function validateGitHubOwnerRepo(owner: string, repo: string): void;
/**
 * Validate GitHub issue parameters
 * @param {Object} params - Issue parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubIssueParams(params: Object): void;
/**
 * Validate GitHub pull request parameters
 * @param {Object} params - PR parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubPRParams(params: Object): void;
/**
 * Validate GitHub search parameters
 * @param {Object} params - Search parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubSearchParams(params: Object): void;
/**
 * Validate GitHub repository creation parameters
 * @param {Object} params - Repository parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubRepoParams(params: Object): void;
/**
 * Validate GitHub branch name
 * @param {string} branchName - Branch name
 * @throws {Error} If validation fails
 */
export function validateGitHubBranchName(branchName: string): void;
/**
 * Validate GitHub username
 * @param {string} username - Username
 * @throws {Error} If validation fails
 */
export function validateGitHubUsername(username: string): void;
/**
 * Validate GitHub issue number
 * @param {number} issueNumber - Issue number
 * @throws {Error} If validation fails
 */
export function validateGitHubIssueNumber(issueNumber: number): void;
/**
 * Validate GitHub pull request number
 * @param {number} prNumber - PR number
 * @throws {Error} If validation fails
 */
export function validateGitHubPRNumber(prNumber: number): void;
/**
 * Validate GitHub milestone number
 * @param {number} milestoneNumber - Milestone number
 * @throws {Error} If validation fails
 */
export function validateGitHubMilestoneNumber(milestoneNumber: number): void;
/**
 * Validate GitHub commit SHA
 * @param {string} sha - Commit SHA
 * @throws {Error} If validation fails
 */
export function validateGitHubCommitSHA(sha: string): void;
/**
 * Validate GitHub reference name
 * @param {string} ref - Reference name
 * @throws {Error} If validation fails
 */
export function validateGitHubRef(ref: string): void;
/**
 * Validate ISO 8601 date string
 * @param {string} dateString - Date string
 * @returns {boolean} True if valid
 */
export function isValidISO8601Date(dateString: string): boolean;
/**
 * Validate GitHub label name
 * @param {string} labelName - Label name
 * @throws {Error} If validation fails
 */
export function validateGitHubLabelName(labelName: string): void;
/**
 * Validate GitHub organization name
 * @param {string} orgName - Organization name
 * @throws {Error} If validation fails
 */
export function validateGitHubOrgName(orgName: string): void;
/**
 * Validate GitHub content path
 * @param {string} path - Content path
 * @throws {Error} If validation fails
 */
export function validateGitHubContentPath(path: string): void;
/**
 * Sanitize GitHub parameters
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} Sanitized parameters
 */
export function sanitizeGitHubParams(params: Object): Object;
/**
 * Validation result wrapper
 * @param {Function} validationFn - Validation function
 * @param {*} value - Value to validate
 * @returns {Object} Validation result
 */
export function validateWithResult(validationFn: Function, value: any): Object;
declare namespace _default {
    export { validateGitHubOwnerRepo };
    export { validateGitHubIssueParams };
    export { validateGitHubPRParams };
    export { validateGitHubSearchParams };
    export { validateGitHubRepoParams };
    export { validateGitHubBranchName };
    export { validateGitHubUsername };
    export { validateGitHubIssueNumber };
    export { validateGitHubPRNumber };
    export { validateGitHubMilestoneNumber };
    export { validateGitHubCommitSHA };
    export { validateGitHubRef };
    export { isValidISO8601Date };
    export { validateGitHubLabelName };
    export { validateGitHubOrgName };
    export { validateGitHubContentPath };
    export { sanitizeGitHubParams };
    export { validateWithResult };
}
export default _default;
//# sourceMappingURL=validation.d.ts.map