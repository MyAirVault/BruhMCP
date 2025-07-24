/**
 * Airtable Bases API operations
 */

import { makeAuthenticatedRequest, handleApiError, formatApiResponse } from './common.js';

/**
 * @typedef {Object} BasesListResponse
 * @property {import('./common.js').AirtableBase[]} bases - List of bases
 * @property {import('./common.js').ApiResponseMeta} _meta - Response metadata
 */

/**
 * List all accessible Airtable bases
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<BasesListResponse>} List of bases
 */
export async function listBases(apiKey) {
	const response = await makeAuthenticatedRequest('/meta/bases', apiKey);
	await handleApiError(response, 'Bases list');
	
	const data = await response.json();
	const formattedResponse = formatApiResponse(data, 'list_bases');
	if (!formattedResponse || typeof formattedResponse !== 'object') {
		throw new Error('Invalid response from Airtable API');
	}
	return /** @type {BasesListResponse} */ (formattedResponse);
}

/**
 * @typedef {Object} BaseSchemaResponse
 * @property {import('./common.js').AirtableTable[]} tables - List of tables
 * @property {import('./common.js').ApiResponseMeta} _meta - Response metadata
 */

/**
 * Get base schema (tables and fields)
 * @param {string} baseId - Base ID
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<BaseSchemaResponse>} Base schema
 */
export async function getBaseSchema(baseId, apiKey) {
	const response = await makeAuthenticatedRequest(`/meta/bases/${baseId}/tables`, apiKey);
	await handleApiError(response, `Base schema for ${baseId}`);
	
	const data = await response.json();
	const formattedResponse = formatApiResponse(data, 'get_base_schema');
	if (!formattedResponse || typeof formattedResponse !== 'object') {
		throw new Error('Invalid response from Airtable API');
	}
	return /** @type {BaseSchemaResponse} */ (formattedResponse);
}