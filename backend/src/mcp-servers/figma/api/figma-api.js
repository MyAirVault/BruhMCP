/**
 * Figma API integration
 * Handles all communication with Figma's REST API
 */

import fetch from 'node-fetch';

const FIGMA_BASE_URL = 'https://api.figma.com/v1';

/**
 * Get file details from Figma API
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaFile(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Get published components from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComponents(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/components`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Get published styles from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaStyles(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/styles`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Get comments from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComments(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/comments`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}
