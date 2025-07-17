/**
 * HTTP fetch utility with retry logic for Notion API
 */

import { Logger } from './logger.js';

const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_TIMEOUT = 30000;

/**
 * Fetch with retry logic and error handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retryAttempts - Number of retry attempts
 * @param {number} retryDelay - Delay between retries in ms
 * @returns {Promise<any>} Response data
 */
export async function fetchWithRetry(
	url,
	options = {},
	retryAttempts = DEFAULT_RETRY_ATTEMPTS,
	retryDelay = DEFAULT_RETRY_DELAY
) {
	for (let attempt = 1; attempt <= retryAttempts; attempt++) {
		// Create new controller and timeout for each attempt
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

		try {
			Logger.log(`Attempt ${attempt}/${retryAttempts} for ${url}`);

			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});

			// Clear timeout on successful response
			clearTimeout(timeoutId);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			// Always clear timeout on error
			clearTimeout(timeoutId);

			Logger.error(`Attempt ${attempt} failed:`, error);

			if (attempt === retryAttempts) {
				throw error;
			}

			// Wait before retry
			await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
		}
	}
}
