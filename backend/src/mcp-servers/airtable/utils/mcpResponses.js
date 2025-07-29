/**
 * MCP Response Utilities
 * Standardized response formatting for MCP tools
 */

const yaml = require('js-yaml');

/**
 * Create successful text response
 * @param {string} text - Response text
 * @param {Object} [options] - Response options
 * @returns {Object} MCP response
 */
function createTextResponse(text, options = {}) {
	return {
		content: [{ type: 'text', text }],
		...options
	};
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {{operation?: string}} [context] - Error context
 * @returns {Object} MCP error response
 */
function createErrorResponse(message, context = {}) {
	return {
		isError: true,
		content: [{ 
			type: 'text', 
			text: `Error: ${message}${context.operation ? ` (${context.operation})` : ''}` 
		}]
	};
}

/**
 * Create YAML formatted response
 * @param {Object} data - Data to format
 * @param {Object} [options] - YAML formatting options
 * @returns {Object} MCP response with YAML content
 */
function createYamlResponse(data, options = {}) {
	const yamlOptions = {
		indent: 2,
		lineWidth: 120,
		noRefs: true,
		sortKeys: false,
		...options
	};

	const yamlText = yaml.dump(data, yamlOptions);
	
	return {
		content: [{ type: 'text', text: yamlText }]
	};
}

/**
 * Create JSON formatted response
 * @param {Object} data - Data to format
 * @param {number} [indent] - JSON indentation
 * @returns {Object} MCP response with JSON content
 */
function createJsonResponse(data, indent = 2) {
	const jsonText = JSON.stringify(data, null, indent);
	
	return {
		content: [{ type: 'text', text: jsonText }]
	};
}

/**
 * Create table formatted response
 * @param {Array<Record<string, string>>} data - Array of objects to format as table
 * @param {Array<string>} [columns] - Column names to include
 * @returns {Object} MCP response with table content
 */
function createTableResponse(data, columns) {
	if (!Array.isArray(data) || data.length === 0) {
		return createTextResponse('No data to display');
	}

	// Get columns from first object if not provided
	const cols = columns || Object.keys(data[0]);
	
	// Create header
	const header = cols.join(' | ');
	const separator = cols.map(() => '---').join(' | ');
	
	// Create rows
	const rows = data.map(row => 
		cols.map(col => String(row[col] || '')).join(' | ')
	);
	
	const tableText = [header, separator, ...rows].join('\n');
	
	return {
		content: [{ type: 'text', text: tableText }]
	};
}

/**
 * Create list formatted response
 * @param {Array<string>} items - Array of items to format as list
 * @param {boolean} [numbered] - Whether to use numbered list
 * @returns {Object} MCP response with list content
 */
function createListResponse(items, numbered = false) {
	if (!Array.isArray(items) || items.length === 0) {
		return createTextResponse('No items to display');
	}

	const listText = items
		.map((item, index) => {
			const prefix = numbered ? `${index + 1}. ` : '- ';
			return `${prefix}${String(item)}`;
		})
		.join('\n');
	
	return {
		content: [{ type: 'text', text: listText }]
	};
}

/**
 * Create summary response with statistics
 * @param {Object} data - Data to summarize
 * @param {Object} stats - Statistics object
 * @returns {Object} MCP response with summary
 */
function createSummaryResponse(data, stats) {
	const summary = [
		'Summary:',
		...Object.entries(stats).map(([key, value]) => `- ${key}: ${value}`),
		'',
		'Data:'
	].join('\n');

	const yamlData = yaml.dump(data, {
		indent: 2,
		lineWidth: 120,
		noRefs: true,
		sortKeys: false
	});

	return {
		content: [{ type: 'text', text: summary + '\n' + yamlData }]
	};
}

/**
 * Create paginated response
 * @param {Array<Object>} data - Data array
 * @param {{page?: number, hasMore?: boolean, total?: number}} pagination - Pagination info
 * @returns {Object} MCP response with pagination info
 */
function createPaginatedResponse(data, pagination) {
	const paginationInfo = [
		`Page ${pagination.page || 1}`,
		pagination.hasMore ? '(More data available)' : '(Last page)',
		pagination.total ? `Total: ${pagination.total}` : '',
		''
	].filter(Boolean).join(' ');

	const yamlData = yaml.dump(data, {
		indent: 2,
		lineWidth: 120,
		noRefs: true,
		sortKeys: false
	});

	return {
		content: [{ type: 'text', text: paginationInfo + '\n' + yamlData }]
	};
}

/**
 * Format Airtable error for MCP response
 * @param {Error} error - Error object
 * @param {{operation?: string}} context - Error context
 * @returns {Object} MCP error response
 */
function formatAirtableError(error, context = {}) {
	const errorMessage = error.message || 'Unknown error occurred';
	const operation = context.operation || 'operation';
	
	return createErrorResponse(errorMessage, { operation });
}

/**
 * Create progress response for long operations
 * @param {string} operation - Operation name
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {string} [status] - Additional status message
 * @returns {Object} MCP response with progress
 */
function createProgressResponse(operation, current, total, status = '') {
	const percentage = Math.round((current / total) * 100);
	const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
	
	const progressText = [
		`${operation}: ${current}/${total} (${percentage}%)`,
		`[${progressBar}]`,
		status && `Status: ${status}`
	].filter(Boolean).join('\n');

	return {
		content: [{ type: 'text', text: progressText }]
	};
}

module.exports = {
	createTextResponse,
	createErrorResponse,
	createYamlResponse,
	createJsonResponse,
	createTableResponse,
	createListResponse,
	createSummaryResponse,
	createPaginatedResponse,
	formatAirtableError,
	createProgressResponse
};