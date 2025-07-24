/**
 * Airtable Records API operations
 */

import {
	makeAuthenticatedRequest,
	handleApiError,
	formatApiResponse,
	buildQueryParams,
	validateAirtableId,
} from './common.js';

/**
 * @typedef {import('./common.js').AirtableRecord} AirtableRecord
 */

/**
 * @typedef {Object} ListRecordsOptions
 * @property {string} [view] - View name or ID
 * @property {string[]} [fields] - Fields to include
 * @property {number} [maxRecords] - Maximum number of records
 * @property {Array<{field: string, direction: 'asc' | 'desc'}>} [sort] - Sort options
 * @property {string} [filterByFormula] - Filter formula
 * @property {string} [offset] - Pagination offset
 */

/**
 * List records from a table
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} apiKey - Airtable API key
 * @param {ListRecordsOptions} [options] - Query options
 * @returns {Promise<Object>} Records list
 */
export async function listRecords(baseId, tableId, apiKey, options = {}) {
	validateAirtableId(baseId, 'base');
	validateAirtableId(tableId, 'table');

	const queryParams = buildQueryParams({
		view: options.view,
		fields: options.fields,
		maxRecords: options.maxRecords,
		sort: options.sort ? JSON.stringify(options.sort) : undefined,
		filterByFormula: options.filterByFormula,
		offset: options.offset,
	});

	const endpoint = `/${baseId}/${tableId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
	const response = await makeAuthenticatedRequest(endpoint, apiKey);
	await handleApiError(response, `Records from ${tableId}`);

	const rawData = await response.json();
	/** @type {Object} */
	const data = /** @type {Object} */ (rawData);
	return /** @type {Object} */ (formatApiResponse(data, 'list_records'));
}

/**
 * Get a specific record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} recordId - Record ID
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<AirtableRecord>} Record data
 */
export async function getRecord(baseId, tableId, recordId, apiKey) {
	validateAirtableId(baseId, 'base');
	validateAirtableId(tableId, 'table');
	validateAirtableId(recordId, 'record');

	const endpoint = `/${baseId}/${tableId}/${recordId}`;
	const response = await makeAuthenticatedRequest(endpoint, apiKey);
	await handleApiError(response, `Record ${recordId}`);

	const rawData = await response.json();
	/** @type {AirtableRecord} */
	const data = /** @type {AirtableRecord} */ (rawData);
	return /** @type {AirtableRecord} */ (formatApiResponse(data, 'get_record'));
}

/**
 * Create a new record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {Record<string, string | number | boolean | string[]>} fields - Record fields
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<AirtableRecord>} Created record
 */
export async function createRecord(baseId, tableId, fields, apiKey) {
	validateAirtableId(baseId, 'base');
	validateAirtableId(tableId, 'table');

	const endpoint = `/${baseId}/${tableId}`;
	const response = await makeAuthenticatedRequest(endpoint, apiKey, {
		method: 'POST',
		body: JSON.stringify({ fields }),
	});
	await handleApiError(response, 'Create record');

	const rawData = await response.json();
	/** @type {AirtableRecord} */
	const data = /** @type {AirtableRecord} */ (rawData);
	return /** @type {AirtableRecord} */ (formatApiResponse(data, 'create_record'));
}

/**
 * Update an existing record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} recordId - Record ID
 * @param {Record<string, string | number | boolean | string[]>} fields - Updated fields
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<AirtableRecord>} Updated record
 */
export async function updateRecord(baseId, tableId, recordId, fields, apiKey) {
	validateAirtableId(baseId, 'base');
	validateAirtableId(tableId, 'table');
	validateAirtableId(recordId, 'record');

	const endpoint = `/${baseId}/${tableId}/${recordId}`;
	const response = await makeAuthenticatedRequest(endpoint, apiKey, {
		method: 'PATCH',
		body: JSON.stringify({ fields }),
	});
	await handleApiError(response, 'Update record');

	const rawData = await response.json();
	/** @type {AirtableRecord} */
	const data = /** @type {AirtableRecord} */ (rawData);
	return /** @type {AirtableRecord} */ (formatApiResponse(data, 'update_record'));
}

/**
 * @typedef {Object} DeleteResponse
 * @property {string} id - Deleted record ID
 * @property {boolean} deleted - Deletion status
 */

/**
 * Delete a record
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {string} recordId - Record ID
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<DeleteResponse>} Deletion confirmation
 */
export async function deleteRecord(baseId, tableId, recordId, apiKey) {
	validateAirtableId(baseId, 'base');
	validateAirtableId(tableId, 'table');
	validateAirtableId(recordId, 'record');

	const endpoint = `/${baseId}/${tableId}/${recordId}`;
	const response = await makeAuthenticatedRequest(endpoint, apiKey, {
		method: 'DELETE',
	});
	await handleApiError(response, 'Delete record');

	const rawData = await response.json();
	/** @type {DeleteResponse} */
	const data = /** @type {DeleteResponse} */ (rawData);
	return /** @type {DeleteResponse} */ (formatApiResponse(data, 'delete_record'));
}

/**
 * @typedef {Object} RecordInput
 * @property {Record<string, string | number | boolean | string[]>} fields - Record fields
 */

/**
 * @typedef {Object} BatchCreateResponse
 * @property {AirtableRecord[]} records - Created records
 */

/**
 * Create multiple records in batch
 * @param {string} baseId - Base ID
 * @param {string} tableId - Table ID
 * @param {RecordInput[]} records - Array of record objects with fields
 * @param {string} apiKey - Airtable API key
 * @returns {Promise<BatchCreateResponse>} Created records
 */
export async function createMultipleRecords(baseId, tableId, records, apiKey) {
	validateAirtableId(baseId, 'base');
	validateAirtableId(tableId, 'table');

	if (!Array.isArray(records) || records.length === 0) {
		throw new Error('Records must be a non-empty array');
	}

	if (records.length > 10) {
		throw new Error('Maximum 10 records can be created at once');
	}

	const endpoint = `/${baseId}/${tableId}`;
	const response = await makeAuthenticatedRequest(endpoint, apiKey, {
		method: 'POST',
		body: JSON.stringify({ records }),
	});
	await handleApiError(response, 'Create multiple records');

	const rawData = await response.json();
	/** @type {BatchCreateResponse} */
	const data = /** @type {BatchCreateResponse} */ (rawData);
	return /** @type {BatchCreateResponse} */ (formatApiResponse(data, 'create_multiple_records'));
}
