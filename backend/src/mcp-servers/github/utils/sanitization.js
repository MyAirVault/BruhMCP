/**
 * Sanitization utilities for GitHub MCP service
 * Provides safe sanitization of user inputs and API parameters
 */

import { createLogger } from './logger.js';

const logger = createLogger('sanitization');

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
			// Trim whitespace and sanitize string
			const trimmed = sanitizeString(value);
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
				.map(item => typeof item === 'string' ? sanitizeString(item) : item)
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

	logger.debug('Parameters sanitized', {
		originalKeys: Object.keys(params),
		sanitizedKeys: Object.keys(sanitized)
	});

	return sanitized;
}

/**
 * Sanitize a string for safe usage
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
	if (typeof str !== 'string') return '';
	
	return str
		.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
		.replace(/[\x80-\xFF]/g, '') // Remove non-ASCII characters that might cause issues
		.trim();
}

/**
 * Sanitize GitHub repository name
 * @param {string} repoName - Repository name
 * @returns {string} Sanitized repository name
 */
export function sanitizeRepoName(repoName) {
	if (typeof repoName !== 'string') return '';
	
	return repoName
		.replace(/[^a-zA-Z0-9._-]/g, '') // Only allow valid repo name characters
		.replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing dots, underscores, hyphens
		.substring(0, 100) // Limit to 100 characters
		.trim();
}

/**
 * Sanitize GitHub username
 * @param {string} username - Username
 * @returns {string} Sanitized username
 */
export function sanitizeUsername(username) {
	if (typeof username !== 'string') return '';
	
	return username
		.replace(/[^a-zA-Z0-9-]/g, '') // Only allow valid username characters
		.replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
		.substring(0, 39) // Limit to 39 characters
		.trim();
}

/**
 * Sanitize GitHub branch name
 * @param {string} branchName - Branch name
 * @returns {string} Sanitized branch name
 */
export function sanitizeBranchName(branchName) {
	if (typeof branchName !== 'string') return '';
	
	return branchName
		.replace(/[~^:?*\[\]\\]/g, '') // Remove invalid characters
		.replace(/\/+/g, '/') // Replace multiple slashes with single slash
		.replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.substring(0, 250) // Limit to 250 characters
		.trim();
}

/**
 * Sanitize GitHub label name
 * @param {string} labelName - Label name
 * @returns {string} Sanitized label name
 */
export function sanitizeLabelName(labelName) {
	if (typeof labelName !== 'string') return '';
	
	return labelName
		.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
		.substring(0, 50) // Limit to 50 characters
		.trim();
}

/**
 * Sanitize GitHub issue/PR title
 * @param {string} title - Title
 * @returns {string} Sanitized title
 */
export function sanitizeTitle(title) {
	if (typeof title !== 'string') return '';
	
	return title
		.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
		.replace(/\s+/g, ' ') // Replace multiple spaces with single space
		.substring(0, 256) // Limit to 256 characters
		.trim();
}

/**
 * Sanitize GitHub issue/PR body
 * @param {string} body - Body content
 * @returns {string} Sanitized body
 */
export function sanitizeBody(body) {
	if (typeof body !== 'string') return '';
	
	return body
		.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters but keep newlines and tabs
		.substring(0, 65536) // Limit to 65536 characters
		.trim();
}

/**
 * Sanitize GitHub search query
 * @param {string} query - Search query
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query) {
	if (typeof query !== 'string') return '';
	
	return query
		.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
		.replace(/\s+/g, ' ') // Replace multiple spaces with single space
		.substring(0, 256) // Limit to 256 characters
		.trim();
}

/**
 * Sanitize GitHub commit SHA
 * @param {string} sha - Commit SHA
 * @returns {string} Sanitized SHA
 */
export function sanitizeCommitSHA(sha) {
	if (typeof sha !== 'string') return '';
	
	return sha
		.replace(/[^a-fA-F0-9]/g, '') // Only allow hex characters
		.substring(0, 40) // Limit to 40 characters
		.toLowerCase();
}

/**
 * Sanitize GitHub file path
 * @param {string} path - File path
 * @returns {string} Sanitized path
 */
export function sanitizeFilePath(path) {
	if (typeof path !== 'string') return '';
	
	return path
		.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
		.replace(/\/+/g, '/') // Replace multiple slashes with single slash
		.replace(/^\/+/, '') // Remove leading slashes
		.substring(0, 4096) // Limit to 4096 characters
		.trim();
}

/**
 * Sanitize GitHub organization name
 * @param {string} orgName - Organization name
 * @returns {string} Sanitized organization name
 */
export function sanitizeOrgName(orgName) {
	// Same rules as username
	return sanitizeUsername(orgName);
}

/**
 * Sanitize GitHub milestone title
 * @param {string} title - Milestone title
 * @returns {string} Sanitized title
 */
export function sanitizeMilestoneTitle(title) {
	if (typeof title !== 'string') return '';
	
	return title
		.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
		.replace(/\s+/g, ' ') // Replace multiple spaces with single space
		.substring(0, 255) // Limit to 255 characters
		.trim();
}

/**
 * Sanitize GitHub description
 * @param {string} description - Description
 * @returns {string} Sanitized description
 */
export function sanitizeDescription(description) {
	if (typeof description !== 'string') return '';
	
	return description
		.replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
		.replace(/\s+/g, ' ') // Replace multiple spaces with single space
		.substring(0, 350) // Limit to 350 characters for repo description
		.trim();
}

/**
 * Sanitize GitHub tag name
 * @param {string} tagName - Tag name
 * @returns {string} Sanitized tag name
 */
export function sanitizeTagName(tagName) {
	if (typeof tagName !== 'string') return '';
	
	return tagName
		.replace(/[^a-zA-Z0-9._-]/g, '') // Only allow valid tag name characters
		.replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing dots, underscores, hyphens
		.substring(0, 100) // Limit to 100 characters
		.trim();
}

/**
 * Sanitize GitHub reference name
 * @param {string} ref - Reference name
 * @returns {string} Sanitized reference
 */
export function sanitizeRef(ref) {
	if (typeof ref !== 'string') return '';
	
	// Could be a branch name, tag name, or commit SHA
	if (ref.length === 40 && /^[a-fA-F0-9]+$/.test(ref)) {
		// It's likely a commit SHA
		return sanitizeCommitSHA(ref);
	} else {
		// It's likely a branch or tag name
		return sanitizeBranchName(ref);
	}
}

/**
 * Sanitize GitHub assignee list
 * @param {Array<string>} assignees - Assignee usernames
 * @returns {Array<string>} Sanitized assignees
 */
export function sanitizeAssignees(assignees) {
	if (!Array.isArray(assignees)) return [];
	
	return assignees
		.filter(assignee => typeof assignee === 'string')
		.map(assignee => sanitizeUsername(assignee))
		.filter(assignee => assignee.length > 0)
		.slice(0, 10); // GitHub allows max 10 assignees
}

/**
 * Sanitize GitHub labels list
 * @param {Array<string>} labels - Label names
 * @returns {Array<string>} Sanitized labels
 */
export function sanitizeLabels(labels) {
	if (!Array.isArray(labels)) return [];
	
	return labels
		.filter(label => typeof label === 'string')
		.map(label => sanitizeLabelName(label))
		.filter(label => label.length > 0)
		.slice(0, 100); // Reasonable limit for labels
}

/**
 * Sanitize GitHub milestone number
 * @param {number|string} milestone - Milestone number
 * @returns {number|null} Sanitized milestone
 */
export function sanitizeMilestone(milestone) {
	if (typeof milestone === 'number') {
		return Number.isInteger(milestone) && milestone > 0 ? milestone : null;
	}
	
	if (typeof milestone === 'string') {
		const parsed = parseInt(milestone, 10);
		return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
	}
	
	return null;
}

/**
 * Sanitize GitHub pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Sanitized pagination parameters
 */
export function sanitizePagination(params) {
	const sanitized = {};
	
	if (params.page !== undefined) {
		const page = parseInt(params.page, 10);
		if (Number.isInteger(page) && page > 0) {
			sanitized.page = page;
		}
	}
	
	if (params.per_page !== undefined) {
		const perPage = parseInt(params.per_page, 10);
		if (Number.isInteger(perPage) && perPage > 0 && perPage <= 100) {
			sanitized.per_page = perPage;
		}
	}
	
	return sanitized;
}

/**
 * Sanitize GitHub date parameters
 * @param {Object} params - Date parameters
 * @returns {Object} Sanitized date parameters
 */
export function sanitizeDateParams(params) {
	const sanitized = {};
	
	if (params.since && typeof params.since === 'string') {
		const date = new Date(params.since);
		if (!isNaN(date.getTime())) {
			sanitized.since = date.toISOString();
		}
	}
	
	if (params.until && typeof params.until === 'string') {
		const date = new Date(params.until);
		if (!isNaN(date.getTime())) {
			sanitized.until = date.toISOString();
		}
	}
	
	return sanitized;
}

/**
 * Sanitize GitHub sort parameters
 * @param {Object} params - Sort parameters
 * @param {Array<string>} validSorts - Valid sort options
 * @returns {Object} Sanitized sort parameters
 */
export function sanitizeSortParams(params, validSorts = ['created', 'updated']) {
	const sanitized = {};
	
	if (params.sort && validSorts.includes(params.sort)) {
		sanitized.sort = params.sort;
	}
	
	if (params.direction && ['asc', 'desc'].includes(params.direction)) {
		sanitized.direction = params.direction;
	}
	
	if (params.order && ['asc', 'desc'].includes(params.order)) {
		sanitized.order = params.order;
	}
	
	return sanitized;
}

/**
 * Sanitize GitHub filter parameters
 * @param {Object} params - Filter parameters
 * @returns {Object} Sanitized filter parameters
 */
export function sanitizeFilterParams(params) {
	const sanitized = {};
	
	if (params.state && ['open', 'closed', 'all'].includes(params.state)) {
		sanitized.state = params.state;
	}
	
	if (params.visibility && ['all', 'public', 'private'].includes(params.visibility)) {
		sanitized.visibility = params.visibility;
	}
	
	if (params.type && ['all', 'owner', 'public', 'private', 'member'].includes(params.type)) {
		sanitized.type = params.type;
	}
	
	if (params.affiliation && typeof params.affiliation === 'string') {
		const validAffiliations = ['owner', 'collaborator', 'organization_member'];
		const affiliations = params.affiliation.split(',')
			.map(a => a.trim())
			.filter(a => validAffiliations.includes(a));
		
		if (affiliations.length > 0) {
			sanitized.affiliation = affiliations.join(',');
		}
	}
	
	if (params.assignee && typeof params.assignee === 'string') {
		if (params.assignee === '*' || params.assignee === 'none') {
			sanitized.assignee = params.assignee;
		} else {
			const sanitizedAssignee = sanitizeUsername(params.assignee);
			if (sanitizedAssignee.length > 0) {
				sanitized.assignee = sanitizedAssignee;
			}
		}
	}
	
	if (params.creator && typeof params.creator === 'string') {
		const sanitizedCreator = sanitizeUsername(params.creator);
		if (sanitizedCreator.length > 0) {
			sanitized.creator = sanitizedCreator;
		}
	}
	
	if (params.mentioned && typeof params.mentioned === 'string') {
		const sanitizedMentioned = sanitizeUsername(params.mentioned);
		if (sanitizedMentioned.length > 0) {
			sanitized.mentioned = sanitizedMentioned;
		}
	}
	
	if (params.labels && typeof params.labels === 'string') {
		const labels = params.labels.split(',')
			.map(label => sanitizeLabelName(label.trim()))
			.filter(label => label.length > 0);
		
		if (labels.length > 0) {
			sanitized.labels = labels.join(',');
		}
	}
	
	if (params.milestone && typeof params.milestone === 'string') {
		if (params.milestone === '*' || params.milestone === 'none') {
			sanitized.milestone = params.milestone;
		} else {
			const milestoneNumber = sanitizeMilestone(params.milestone);
			if (milestoneNumber !== null) {
				sanitized.milestone = milestoneNumber.toString();
			}
		}
	}
	
	return sanitized;
}

/**
 * Comprehensive sanitization for GitHub API parameters
 * @param {Object} params - Parameters to sanitize
 * @param {string} operation - Operation type for context
 * @returns {Object} Sanitized parameters
 */
export function sanitizeForGitHubAPI(params, operation = 'unknown') {
	const sanitized = sanitizeGitHubParams(params);
	
	// Apply specific sanitization based on operation
	switch (operation) {
		case 'list_repositories':
		case 'list_issues':
		case 'list_pull_requests':
			Object.assign(sanitized, sanitizePagination(sanitized));
			Object.assign(sanitized, sanitizeSortParams(sanitized));
			Object.assign(sanitized, sanitizeFilterParams(sanitized));
			Object.assign(sanitized, sanitizeDateParams(sanitized));
			break;
			
		case 'search_repositories':
		case 'search_issues':
			if (sanitized.q) {
				sanitized.q = sanitizeSearchQuery(sanitized.q);
			}
			Object.assign(sanitized, sanitizePagination(sanitized));
			Object.assign(sanitized, sanitizeSortParams(sanitized, ['stars', 'forks', 'updated']));
			break;
			
		case 'create_repository':
			if (sanitized.name) {
				sanitized.name = sanitizeRepoName(sanitized.name);
			}
			if (sanitized.description) {
				sanitized.description = sanitizeDescription(sanitized.description);
			}
			break;
			
		case 'create_issue':
		case 'update_issue':
			if (sanitized.title) {
				sanitized.title = sanitizeTitle(sanitized.title);
			}
			if (sanitized.body) {
				sanitized.body = sanitizeBody(sanitized.body);
			}
			if (sanitized.assignees) {
				sanitized.assignees = sanitizeAssignees(sanitized.assignees);
			}
			if (sanitized.labels) {
				sanitized.labels = sanitizeLabels(sanitized.labels);
			}
			if (sanitized.milestone) {
				sanitized.milestone = sanitizeMilestone(sanitized.milestone);
			}
			break;
			
		case 'create_pull_request':
		case 'update_pull_request':
			if (sanitized.title) {
				sanitized.title = sanitizeTitle(sanitized.title);
			}
			if (sanitized.body) {
				sanitized.body = sanitizeBody(sanitized.body);
			}
			if (sanitized.head) {
				sanitized.head = sanitizeBranchName(sanitized.head);
			}
			if (sanitized.base) {
				sanitized.base = sanitizeBranchName(sanitized.base);
			}
			break;
			
		case 'get_contents':
			if (sanitized.path) {
				sanitized.path = sanitizeFilePath(sanitized.path);
			}
			if (sanitized.ref) {
				sanitized.ref = sanitizeRef(sanitized.ref);
			}
			break;
	}
	
	logger.debug('Parameters sanitized for GitHub API', {
		operation,
		originalKeys: Object.keys(params || {}),
		sanitizedKeys: Object.keys(sanitized)
	});
	
	return sanitized;
}

/**
 * Export all sanitization functions
 */
export default {
	sanitizeGitHubParams,
	sanitizeString,
	sanitizeRepoName,
	sanitizeUsername,
	sanitizeBranchName,
	sanitizeLabelName,
	sanitizeTitle,
	sanitizeBody,
	sanitizeSearchQuery,
	sanitizeCommitSHA,
	sanitizeFilePath,
	sanitizeOrgName,
	sanitizeMilestoneTitle,
	sanitizeDescription,
	sanitizeTagName,
	sanitizeRef,
	sanitizeAssignees,
	sanitizeLabels,
	sanitizeMilestone,
	sanitizePagination,
	sanitizeDateParams,
	sanitizeSortParams,
	sanitizeFilterParams,
	sanitizeForGitHubAPI
};