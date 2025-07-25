/**
 * Response formatting utilities for Slack
 * Handles API responses, MCP responses, and data structures
 */

import { debug } from './logger.js';

/**
 * @typedef {Object} SlackAPIResponse
 * @property {boolean} ok - Whether the API call was successful
 * @property {string} [error] - Error message if ok is false
 * @property {string} [warning] - Warning message if present
 * @property {Object} [response_metadata] - Response metadata
 * @property {string} [response_metadata.next_cursor] - Cursor for pagination
 * @property {string[]} [response_metadata.scopes] - OAuth scopes
 * @property {string[]} [response_metadata.acceptedScopes] - Accepted OAuth scopes
 */

/**
 * @typedef {Object} FormattedSlackResponse
 * @property {boolean} ok - Whether the API call was successful
 * @property {string} timestamp - ISO timestamp of formatting
 * @property {string} [error] - Error message if present
 * @property {string} [warning] - Warning message if present
 * @property {Object} [response_metadata] - Response metadata
 */

/**
 * @typedef {Object} MCPContentBlock
 * @property {string} type - Content type (usually 'text')
 * @property {string} text - Content text
 */

/**
 * @typedef {Object} MCPResponse
 * @property {MCPContentBlock[]} content - Array of content blocks
 * @property {boolean} [isError] - Whether this is an error response
 */

/**
 * Format a generic Slack API response
 * @param {SlackAPIResponse|null} response - Raw Slack API response
 * @returns {FormattedSlackResponse|null} Formatted response
 */
export function formatSlackResponse(response) {
	if (!response) return null;

	/** @type {FormattedSlackResponse} */
	const formatted = {
		ok: response.ok,
		timestamp: new Date().toISOString()
	};

	// Add error information if present
	if (!response.ok && response.error) {
		formatted.error = response.error;
		formatted.warning = response.warning;
	}

	// Add response metadata if present
	if (response.response_metadata) {
		formatted.response_metadata = {
			next_cursor: response.response_metadata.next_cursor,
			scopes: response.response_metadata.scopes,
			acceptedScopes: response.response_metadata.acceptedScopes
		};
	}

	return formatted;
}

/**
 * Create a simple text response for MCP
 * @param {string} text - Response text
 * @returns {MCPResponse} MCP response object
 */
export function createTextResponse(text) {
	return {
		content: [
			{
				type: 'text',
				text: text
			}
		]
	};
}

/**
 * Create a formatted response with multiple content blocks
 * @param {MCPContentBlock[]} blocks - Array of content blocks
 * @returns {MCPResponse} MCP response object
 */
export function createFormattedResponse(blocks) {
	return {
		content: blocks
	};
}

/**
 * Format error response for MCP
 * @param {Error} error - Error object
 * @returns {MCPResponse} MCP error response
 */
export function formatErrorResponse(error) {
	debug('Formatting error response', { error: error.message });
	
	return {
		content: [
			{
				type: 'text',
				text: `Error: ${error.message}`
			}
		],
		isError: true
	};
}

/**
 * Create a rich text response with formatting
 * @param {string} title - Response title
 * @param {string} content - Response content
 * @param {Record<string, any>} metadata - Additional metadata
 * @returns {MCPResponse} Rich MCP response object
 */
export function createRichTextResponse(title, content, metadata = {}) {
	debug('Creating rich text response', { title, hasMetadata: Object.keys(metadata).length > 0 });
	
	const response = {
		content: [
			{
				type: 'text',
				text: `# ${title}\n\n${content}`
			}
		]
	};
	
	if (Object.keys(metadata).length > 0) {
		response.content.push({
			type: 'text',
			text: `\n---\n**Metadata:**\n${JSON.stringify(metadata, null, 2)}`
		});
	}
	
	return response;
}

/**
 * Create a table response for structured data
 * @param {string[]} headers - Table headers
 * @param {string[][]} rows - Table rows
 * @param {string} title - Table title
 * @returns {MCPResponse} Table MCP response object
 */
export function createTableResponse(headers, rows, title = '') {
	debug('Creating table response', { 
		title, 
		headerCount: headers.length, 
		rowCount: rows.length 
	});
	
	let tableText = title ? `# ${title}\n\n` : '';
	
	// Create markdown table
	tableText += `| ${headers.join(' | ')} |\n`;
	tableText += `| ${headers.map(() => '---').join(' | ')} |\n`;
	
	rows.forEach(row => {
		tableText += `| ${row.join(' | ')} |\n`;
	});
	
	return {
		content: [
			{
				type: 'text',
				text: tableText
			}
		]
	};
}