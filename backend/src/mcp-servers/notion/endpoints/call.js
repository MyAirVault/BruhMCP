/**
 * Notion MCP Call Endpoint
 * Handles direct API calls to Notion service
 */

import { NotionService } from '../api/notion-api.js';
import { handleNotionError } from '../utils/error-handler.js';
import { Logger } from '../utils/logger.js';

/**
 * Handle call endpoint - provides direct API access
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function handleCallEndpoint(req, res) {
	try {
		const { bearerToken, instanceId, userId } = req;

		if (!bearerToken) {
			return res.status(401).json({
				error: 'Unauthorized',
				message: 'Bearer token required for call endpoint',
			});
		}

		const { method, path, params } = req.body;

		if (!method || !path) {
			return res.status(400).json({
				error: 'Bad request',
				message: 'Method and path are required',
			});
		}

		// Create Notion service instance
		const notionService = new NotionService({ bearerToken });

		// Execute API call based on method and path
		const result = await executeApiCall(notionService, method, path, params);

		res.json({
			success: true,
			result: result,
			instanceId: instanceId,
		});
	} catch (error) {
		Logger.error('Call endpoint error:', error);
		const errorInfo = handleNotionError(error);
		res.status(errorInfo.statusCode || 500).json({
			error: 'API call failed',
			message: errorInfo.message,
			instanceId: req.instanceId,
		});
	}
}

/**
 * Execute API call based on method and path
 * @param {NotionService} notionService - Notion service instance
 * @param {string} method - HTTP method
 * @param {string} path - API path
 * @param {Object} params - Request parameters
 * @returns {Promise<Object>} API response
 */
async function executeApiCall(notionService, method, path, params = {}) {
	// Map common API endpoints to service methods
	const endpointMap = {
		'GET:/search': () => notionService.search(params.query, params),
		'GET:/pages/:id': () => notionService.getPage(params.id),
		'GET:/pages/:id/blocks': () => notionService.getPageBlocks(params.id, params.start_cursor),
		'POST:/pages': () => notionService.createPage(params),
		'PATCH:/pages/:id': () => notionService.updatePage(params.id, params),
		'GET:/databases/:id': () => notionService.getDatabase(params.id),
		'POST:/databases/:id/query': () => notionService.queryDatabase(params.id, params),
		'POST:/databases': () => notionService.createDatabase(params),
		'PATCH:/databases/:id': () => notionService.updateDatabase(params.id, params),
		'PATCH:/blocks/:id/children': () => notionService.appendBlocks(params.id, params.children),
		'DELETE:/blocks/:id': () => notionService.deleteBlock(params.id),
		'GET:/users/me': () => notionService.getCurrentUser(),
		'GET:/users': () => notionService.listUsers(params.start_cursor),
	};

	// Create endpoint key
	const endpointKey = `${method.toUpperCase()}:${path}`;

	// Check if we have a direct mapping
	if (endpointMap[endpointKey]) {
		return await endpointMap[endpointKey]();
	}

	// Handle parameterized paths
	for (const [key, handler] of Object.entries(endpointMap)) {
		const [keyMethod, keyPath] = key.split(':');
		if (keyMethod === method.toUpperCase() && pathMatches(keyPath, path)) {
			// Extract path parameters
			const pathParams = extractPathParams(keyPath, path);
			const combinedParams = { ...params, ...pathParams };
			return await handler(combinedParams);
		}
	}

	// If no mapping found, make raw API call
	return await notionService.makeRawApiCall(method, path, params);
}

/**
 * Check if path matches pattern with parameters
 * @param {string} pattern - Path pattern with :param syntax
 * @param {string} path - Actual path
 * @returns {boolean} Whether path matches pattern
 */
function pathMatches(pattern, path) {
	const patternParts = pattern.split('/');
	const pathParts = path.split('/');

	if (patternParts.length !== pathParts.length) {
		return false;
	}

	for (let i = 0; i < patternParts.length; i++) {
		const patternPart = patternParts[i];
		const pathPart = pathParts[i];

		if (patternPart.startsWith(':')) {
			// Parameter placeholder - matches any value
			continue;
		}

		if (patternPart !== pathPart) {
			return false;
		}
	}

	return true;
}

/**
 * Extract parameters from path
 * @param {string} pattern - Path pattern with :param syntax
 * @param {string} path - Actual path
 * @returns {Object} Extracted parameters
 */
function extractPathParams(pattern, path) {
	const patternParts = pattern.split('/');
	const pathParts = path.split('/');
	const params = {};

	for (let i = 0; i < patternParts.length; i++) {
		const patternPart = patternParts[i];
		const pathPart = pathParts[i];

		if (patternPart.startsWith(':')) {
			const paramName = patternPart.substring(1);
			params[paramName] = pathPart;
		}
	}

	return params;
}
