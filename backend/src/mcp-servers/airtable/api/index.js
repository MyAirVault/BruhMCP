/**
 * Airtable API main export file
 * Re-exports all Airtable API functions from their respective modules
 */

// Base operations
const {
	listBases,
	getBaseSchema
} = require('./bases.js');

// Record operations
const {
	listRecords,
	getRecord,
	createRecord,
	updateRecord,
	deleteRecord,
	createMultipleRecords
} = require('./records.js');

// Common utilities and types
const {
	AIRTABLE_BASE_URL,
	handleApiError,
	makeAuthenticatedRequest,
	buildQueryParams,
	validateAirtableId,
	sanitizeInput,
	formatApiResponse
} = require('./common.js');

module.exports = {
	// Base operations
	listBases,
	getBaseSchema,
	// Record operations
	listRecords,
	getRecord,
	createRecord,
	updateRecord,
	deleteRecord,
	createMultipleRecords,
	// Common utilities and types
	AIRTABLE_BASE_URL,
	handleApiError,
	makeAuthenticatedRequest,
	buildQueryParams,
	validateAirtableId,
	sanitizeInput,
	formatApiResponse
};