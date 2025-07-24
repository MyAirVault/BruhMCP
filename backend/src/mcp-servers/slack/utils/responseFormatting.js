/**
 * Response formatting utilities for Slack
 * Handles API responses, MCP responses, and data structures
 */

import { debug } from './logger.js';
import { formatSlackText, formatSlackTimestamp } from './textFormatting.js';
import { formatMessageResponse } from './messageFormatting.js';
import { formatChannelResponse, formatUserResponse, formatTeamResponse } from './entityFormatting.js';

/**
 * Format a generic Slack API response
 * @param {Object} response - Raw Slack API response
 * @returns {Object} Formatted response
 */
export function formatSlackResponse(response) {
	if (!response) return null;

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
 * @returns {Object} MCP response object
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
 * @param {Object[]} blocks - Array of content blocks
 * @returns {Object} MCP response object
 */
export function createFormattedResponse(blocks) {
	return {
		content: blocks
	};
}

/**
 * Format error response for MCP
 * @param {Error} error - Error object
 * @returns {Object} MCP error response
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
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Rich MCP response object
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
 * @returns {Object} Table MCP response object
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