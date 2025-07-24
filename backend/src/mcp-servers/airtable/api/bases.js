/**
 * Airtable Bases API operations
 */

import { makeAuthenticatedRequest, handleApiError, formatApiResponse } from './common.js';

/**
 * List all accessible Airtable bases
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<Object>} List of bases
 */
export async function listBases(apiKey) {
	const response = await makeAuthenticatedRequest('/meta/bases', apiKey);
	await handleApiError(response, 'Bases list');
	
	const data = await response.json();
	return formatApiResponse(data, 'list_bases');
}

/**
 * Get base schema (tables and fields)
 * @param {string} baseId - Base ID
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<Object>} Base schema
 */
export async function getBaseSchema(baseId, apiKey) {
	const response = await makeAuthenticatedRequest(`/meta/bases/${baseId}/tables`, apiKey);
	await handleApiError(response, `Base schema for ${baseId}`);
	
	const data = await response.json();
	return formatApiResponse(data, 'get_base_schema');
}