/**
 * Figma Webhooks API operations (Webhooks V2 API)
 * Handles webhook-related requests to Figma API
 */

const { makeAuthenticatedRequest } = require('./common.js');

/**
 * Handle Webhooks API specific errors
 * @param {Response} response - Fetch response object
 * @param {string} context - Context for error message
 */
async function handleWebhooksApiError(response, context) {
	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error(`Insufficient permissions to ${context} webhook`);
		}
		if (response.status === 404) {
			throw new Error('Webhook not found');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}
}

/**
 * Create a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {any} webhookData - Webhook configuration data
 * @returns {Promise<any>}
 */
async function postFigmaWebhook(apiKey, webhookData) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!webhookData) {
		throw new Error('Webhook data is required');
	}

	const response = await makeAuthenticatedRequest('/v2/webhooks', apiKey, {
		method: 'POST',
		body: JSON.stringify(webhookData),
	});

	await handleWebhooksApiError(response, 'create');

	const data = await response.json();
	return data;
}

/**
 * Get webhooks (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} [teamId] - Optional team ID to filter webhooks
 * @returns {Promise<any>}
 */
async function getFigmaWebhooks(apiKey, teamId) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	let endpoint = '/v2/webhooks';
	if (teamId) {
		endpoint += `?team_id=${teamId}`;
	}

	const response = await makeAuthenticatedRequest(endpoint, apiKey);
	await handleWebhooksApiError(response, 'access');

	const data = await response.json();
	return data;
}

/**
 * Update a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to update
 * @param {any} webhookData - Updated webhook configuration data
 * @returns {Promise<any>}
 */
async function putFigmaWebhook(apiKey, webhookId, webhookData) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!webhookId) {
		throw new Error('Webhook ID is required');
	}

	if (!webhookData) {
		throw new Error('Webhook data is required');
	}

	const response = await makeAuthenticatedRequest(`/v2/webhooks/${webhookId}`, apiKey, {
		method: 'PUT',
		body: JSON.stringify(webhookData),
	});

	await handleWebhooksApiError(response, 'update');

	const data = await response.json();
	return data;
}

/**
 * Delete a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to delete
 * @returns {Promise<any>}
 */
async function deleteFigmaWebhook(apiKey, webhookId) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!webhookId) {
		throw new Error('Webhook ID is required');
	}

	const response = await makeAuthenticatedRequest(`/v2/webhooks/${webhookId}`, apiKey, {
		method: 'DELETE',
	});

	await handleWebhooksApiError(response, 'delete');

	const data = await response.json();
	return data;
}
module.exports = {
	postFigmaWebhook,
	getFigmaWebhooks,
	putFigmaWebhook,
	deleteFigmaWebhook
};