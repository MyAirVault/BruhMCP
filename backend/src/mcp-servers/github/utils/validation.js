/**
 * Validation utilities for GitHub MCP service
 * Provides comprehensive validation for GitHub API parameters
 */

import { createLogger } from './logger.js';

const logger = createLogger('validation');

/**
 * Validate GitHub owner and repository name
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @throws {Error} If validation fails
 */
export function validateGitHubOwnerRepo(owner, repo) {
	if (!owner || typeof owner !== 'string') {
		throw new Error('Repository owner is required and must be a string');
	}

	if (!repo || typeof repo !== 'string') {
		throw new Error('Repository name is required and must be a string');
	}

	// GitHub username/organization name validation
	const ownerRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
	if (!ownerRegex.test(owner)) {
		throw new Error('Invalid repository owner format. Must be 1-39 characters, alphanumeric or hyphens, cannot start or end with hyphen');
	}

	// GitHub repository name validation
	const repoRegex = /^[a-zA-Z0-9._-]{1,100}$/;
	if (!repoRegex.test(repo)) {
		throw new Error('Invalid repository name format. Must be 1-100 characters, alphanumeric, dots, underscores, or hyphens');
	}
}

/**
 * Validate GitHub issue parameters
 * @param {Object} params - Issue parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubIssueParams(params) {
	if (!params || typeof params !== 'object') {
		return; // Optional parameters
	}

	// Validate state if provided
	if (params.state && !['open', 'closed', 'all'].includes(params.state)) {
		throw new Error('Issue state must be "open", "closed", or "all"');
	}

	// Validate sort if provided
	if (params.sort && !['created', 'updated', 'comments'].includes(params.sort)) {
		throw new Error('Issue sort must be "created", "updated", or "comments"');
	}

	// Validate direction if provided
	if (params.direction && !['asc', 'desc'].includes(params.direction)) {
		throw new Error('Issue direction must be "asc" or "desc"');
	}

	// Validate per_page if provided
	if (params.per_page !== undefined) {
		if (!Number.isInteger(params.per_page) || params.per_page < 1 || params.per_page > 100) {
			throw new Error('per_page must be an integer between 1 and 100');
		}
	}

	// Validate page if provided
	if (params.page !== undefined) {
		if (!Number.isInteger(params.page) || params.page < 1) {
			throw new Error('page must be a positive integer');
		}
	}

	// Validate labels if provided
	if (params.labels && typeof params.labels === 'string') {
		const labels = params.labels.split(',').map(label => label.trim());
		for (const label of labels) {
			if (label.length > 50) {
				throw new Error('Label names cannot exceed 50 characters');
			}
		}
	}

	// Validate milestone if provided
	if (params.milestone && typeof params.milestone === 'string') {
		if (params.milestone !== '*' && params.milestone !== 'none' && !/^\d+$/.test(params.milestone)) {
			throw new Error('Milestone must be a number, "*", or "none"');
		}
	}

	// Validate assignee if provided
	if (params.assignee && typeof params.assignee === 'string') {
		if (params.assignee !== '*' && params.assignee !== 'none') {
			validateGitHubUsername(params.assignee);
		}
	}

	// Validate creator if provided
	if (params.creator && typeof params.creator === 'string') {
		validateGitHubUsername(params.creator);
	}

	// Validate mentioned if provided
	if (params.mentioned && typeof params.mentioned === 'string') {
		validateGitHubUsername(params.mentioned);
	}

	// Validate since if provided
	if (params.since && typeof params.since === 'string') {
		if (!isValidISO8601Date(params.since)) {
			throw new Error('since must be a valid ISO 8601 date string');
		}
	}
}

/**
 * Validate GitHub pull request parameters
 * @param {Object} params - PR parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubPRParams(params) {
	if (!params || typeof params !== 'object') {
		throw new Error('Pull request parameters are required');
	}

	// Required fields
	if (!params.title || typeof params.title !== 'string') {
		throw new Error('Pull request title is required and must be a string');
	}

	if (!params.head || typeof params.head !== 'string') {
		throw new Error('Pull request head branch is required and must be a string');
	}

	if (!params.base || typeof params.base !== 'string') {
		throw new Error('Pull request base branch is required and must be a string');
	}

	// Validate title length
	if (params.title.length > 256) {
		throw new Error('Pull request title cannot exceed 256 characters');
	}

	// Validate branch names
	validateGitHubBranchName(params.head);
	validateGitHubBranchName(params.base);

	// Validate optional fields
	if (params.body && typeof params.body !== 'string') {
		throw new Error('Pull request body must be a string');
	}

	if (params.body && params.body.length > 65536) {
		throw new Error('Pull request body cannot exceed 65536 characters');
	}

	if (params.maintainer_can_modify !== undefined && typeof params.maintainer_can_modify !== 'boolean') {
		throw new Error('maintainer_can_modify must be a boolean');
	}

	if (params.draft !== undefined && typeof params.draft !== 'boolean') {
		throw new Error('draft must be a boolean');
	}
}

/**
 * Validate GitHub search parameters
 * @param {Object} params - Search parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubSearchParams(params) {
	if (!params || typeof params !== 'object') {
		throw new Error('Search parameters are required');
	}

	// Required query
	if (!params.q || typeof params.q !== 'string') {
		throw new Error('Search query (q) is required and must be a string');
	}

	if (params.q.length > 256) {
		throw new Error('Search query cannot exceed 256 characters');
	}

	// Validate sort for repositories
	if (params.sort && !['stars', 'forks', 'help-wanted-issues', 'updated'].includes(params.sort)) {
		throw new Error('Repository search sort must be "stars", "forks", "help-wanted-issues", or "updated"');
	}

	// Validate order
	if (params.order && !['asc', 'desc'].includes(params.order)) {
		throw new Error('Search order must be "asc" or "desc"');
	}

	// Validate per_page
	if (params.per_page !== undefined) {
		if (!Number.isInteger(params.per_page) || params.per_page < 1 || params.per_page > 100) {
			throw new Error('per_page must be an integer between 1 and 100');
		}
	}

	// Validate page
	if (params.page !== undefined) {
		if (!Number.isInteger(params.page) || params.page < 1) {
			throw new Error('page must be a positive integer');
		}
	}
}

/**
 * Validate GitHub repository creation parameters
 * @param {Object} params - Repository parameters
 * @throws {Error} If validation fails
 */
export function validateGitHubRepoParams(params) {
	if (!params || typeof params !== 'object') {
		throw new Error('Repository parameters are required');
	}

	// Required name
	if (!params.name || typeof params.name !== 'string') {
		throw new Error('Repository name is required and must be a string');
	}

	// Validate repository name format
	const repoRegex = /^[a-zA-Z0-9._-]{1,100}$/;
	if (!repoRegex.test(params.name)) {
		throw new Error('Invalid repository name format. Must be 1-100 characters, alphanumeric, dots, underscores, or hyphens');
	}

	// Validate optional fields
	if (params.description && typeof params.description !== 'string') {
		throw new Error('Repository description must be a string');
	}

	if (params.description && params.description.length > 350) {
		throw new Error('Repository description cannot exceed 350 characters');
	}

	if (params.private !== undefined && typeof params.private !== 'boolean') {
		throw new Error('private must be a boolean');
	}

	if (params.has_issues !== undefined && typeof params.has_issues !== 'boolean') {
		throw new Error('has_issues must be a boolean');
	}

	if (params.has_projects !== undefined && typeof params.has_projects !== 'boolean') {
		throw new Error('has_projects must be a boolean');
	}

	if (params.has_wiki !== undefined && typeof params.has_wiki !== 'boolean') {
		throw new Error('has_wiki must be a boolean');
	}

	if (params.auto_init !== undefined && typeof params.auto_init !== 'boolean') {
		throw new Error('auto_init must be a boolean');
	}

	if (params.gitignore_template && typeof params.gitignore_template !== 'string') {
		throw new Error('gitignore_template must be a string');
	}

	if (params.license_template && typeof params.license_template !== 'string') {
		throw new Error('license_template must be a string');
	}
}

/**
 * Validate GitHub branch name
 * @param {string} branchName - Branch name
 * @throws {Error} If validation fails
 */
export function validateGitHubBranchName(branchName) {
	if (!branchName || typeof branchName !== 'string') {
		throw new Error('Branch name is required and must be a string');
	}

	// GitHub branch name validation rules
	if (branchName.length > 250) {
		throw new Error('Branch name cannot exceed 250 characters');
	}

	// Cannot start or end with slash
	if (branchName.startsWith('/') || branchName.endsWith('/')) {
		throw new Error('Branch name cannot start or end with slash');
	}

	// Cannot contain consecutive slashes
	if (branchName.includes('//')) {
		throw new Error('Branch name cannot contain consecutive slashes');
	}

	// Cannot contain certain characters
	const invalidChars = /[~^:?*\[\]\\]/;
	if (invalidChars.test(branchName)) {
		throw new Error('Branch name cannot contain ~, ^, :, ?, *, [, ], or \\');
	}

	// Cannot be just dots
	if (/^\.+$/.test(branchName)) {
		throw new Error('Branch name cannot be just dots');
	}

	// Cannot contain space at the beginning or end
	if (branchName.startsWith(' ') || branchName.endsWith(' ')) {
		throw new Error('Branch name cannot start or end with space');
	}
}

/**
 * Validate GitHub username
 * @param {string} username - Username
 * @throws {Error} If validation fails
 */
export function validateGitHubUsername(username) {
	if (!username || typeof username !== 'string') {
		throw new Error('Username is required and must be a string');
	}

	const usernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
	if (!usernameRegex.test(username)) {
		throw new Error('Invalid username format. Must be 1-39 characters, alphanumeric or hyphens, cannot start or end with hyphen');
	}
}

/**
 * Validate GitHub issue number
 * @param {number} issueNumber - Issue number
 * @throws {Error} If validation fails
 */
export function validateGitHubIssueNumber(issueNumber) {
	if (!Number.isInteger(issueNumber) || issueNumber < 1) {
		throw new Error('Issue number must be a positive integer');
	}
}

/**
 * Validate GitHub pull request number
 * @param {number} prNumber - PR number
 * @throws {Error} If validation fails
 */
export function validateGitHubPRNumber(prNumber) {
	if (!Number.isInteger(prNumber) || prNumber < 1) {
		throw new Error('Pull request number must be a positive integer');
	}
}

/**
 * Validate GitHub milestone number
 * @param {number} milestoneNumber - Milestone number
 * @throws {Error} If validation fails
 */
export function validateGitHubMilestoneNumber(milestoneNumber) {
	if (!Number.isInteger(milestoneNumber) || milestoneNumber < 1) {
		throw new Error('Milestone number must be a positive integer');
	}
}

/**
 * Validate GitHub commit SHA
 * @param {string} sha - Commit SHA
 * @throws {Error} If validation fails
 */
export function validateGitHubCommitSHA(sha) {
	if (!sha || typeof sha !== 'string') {
		throw new Error('Commit SHA is required and must be a string');
	}

	// GitHub commit SHA validation (40 character hex string)
	const shaRegex = /^[a-fA-F0-9]{40}$/;
	if (!shaRegex.test(sha)) {
		throw new Error('Invalid commit SHA format. Must be a 40-character hexadecimal string');
	}
}

/**
 * Validate GitHub reference name
 * @param {string} ref - Reference name
 * @throws {Error} If validation fails
 */
export function validateGitHubRef(ref) {
	if (!ref || typeof ref !== 'string') {
		throw new Error('Reference is required and must be a string');
	}

	// Can be branch name, tag name, or commit SHA
	if (ref.length === 40 && /^[a-fA-F0-9]{40}$/.test(ref)) {
		// It's a commit SHA
		validateGitHubCommitSHA(ref);
	} else {
		// It's a branch or tag name
		validateGitHubBranchName(ref);
	}
}

/**
 * Validate ISO 8601 date string
 * @param {string} dateString - Date string
 * @returns {boolean} True if valid
 */
export function isValidISO8601Date(dateString) {
	if (!dateString || typeof dateString !== 'string') {
		return false;
	}

	const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;
	if (!iso8601Regex.test(dateString)) {
		return false;
	}

	const date = new Date(dateString);
	return !isNaN(date.getTime());
}

/**
 * Validate GitHub label name
 * @param {string} labelName - Label name
 * @throws {Error} If validation fails
 */
export function validateGitHubLabelName(labelName) {
	if (!labelName || typeof labelName !== 'string') {
		throw new Error('Label name is required and must be a string');
	}

	if (labelName.length > 50) {
		throw new Error('Label name cannot exceed 50 characters');
	}

	// Cannot be just whitespace
	if (labelName.trim().length === 0) {
		throw new Error('Label name cannot be empty or just whitespace');
	}
}

/**
 * Validate GitHub organization name
 * @param {string} orgName - Organization name
 * @throws {Error} If validation fails
 */
export function validateGitHubOrgName(orgName) {
	if (!orgName || typeof orgName !== 'string') {
		throw new Error('Organization name is required and must be a string');
	}

	// Same validation as username
	validateGitHubUsername(orgName);
}

/**
 * Validate GitHub content path
 * @param {string} path - Content path
 * @throws {Error} If validation fails
 */
export function validateGitHubContentPath(path) {
	if (path && typeof path !== 'string') {
		throw new Error('Content path must be a string');
	}

	if (path && path.length > 4096) {
		throw new Error('Content path cannot exceed 4096 characters');
	}

	// Cannot start with slash
	if (path && path.startsWith('/')) {
		throw new Error('Content path cannot start with slash');
	}
}

/**
 * Sanitize GitHub parameters
 * @param {Object} params - Parameters to sanitize
 * @returns {Object} Sanitized parameters
 */
export function sanitizeGitHubParams(params) {
	if (!params || typeof params !== 'object') {
		return {};
	}

	const sanitized = {};

	for (const [key, value] of Object.entries(params)) {
		if (value === null || value === undefined) {
			continue;
		}

		if (typeof value === 'string') {
			// Trim whitespace
			const trimmed = value.trim();
			if (trimmed.length > 0) {
				sanitized[key] = trimmed;
			}
		} else if (typeof value === 'number') {
			// Ensure it's a valid number
			if (!isNaN(value) && isFinite(value)) {
				sanitized[key] = value;
			}
		} else if (typeof value === 'boolean') {
			sanitized[key] = value;
		} else if (Array.isArray(value)) {
			// Sanitize array elements
			const sanitizedArray = value
				.filter(item => item !== null && item !== undefined)
				.map(item => typeof item === 'string' ? item.trim() : item)
				.filter(item => typeof item !== 'string' || item.length > 0);
			
			if (sanitizedArray.length > 0) {
				sanitized[key] = sanitizedArray;
			}
		} else if (typeof value === 'object') {
			// Recursively sanitize nested objects
			const sanitizedObject = sanitizeGitHubParams(value);
			if (Object.keys(sanitizedObject).length > 0) {
				sanitized[key] = sanitizedObject;
			}
		}
	}

	return sanitized;
}

/**
 * Validation result wrapper
 * @param {Function} validationFn - Validation function
 * @param {*} value - Value to validate
 * @returns {Object} Validation result
 */
export function validateWithResult(validationFn, value) {
	try {
		validationFn(value);
		return {
			valid: true,
			error: null
		};
	} catch (error) {
		logger.warn('Validation failed', {
			error: error.message,
			value: typeof value === 'string' ? value : JSON.stringify(value)
		});
		
		return {
			valid: false,
			error: error.message
		};
	}
}

/**
 * Export all validation functions
 */
export default {
	validateGitHubOwnerRepo,
	validateGitHubIssueParams,
	validateGitHubPRParams,
	validateGitHubSearchParams,
	validateGitHubRepoParams,
	validateGitHubBranchName,
	validateGitHubUsername,
	validateGitHubIssueNumber,
	validateGitHubPRNumber,
	validateGitHubMilestoneNumber,
	validateGitHubCommitSHA,
	validateGitHubRef,
	isValidISO8601Date,
	validateGitHubLabelName,
	validateGitHubOrgName,
	validateGitHubContentPath,
	sanitizeGitHubParams,
	validateWithResult
};