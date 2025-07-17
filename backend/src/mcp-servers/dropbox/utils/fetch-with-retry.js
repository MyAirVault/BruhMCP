/**
 * Fetch with retry logic for Dropbox API
 * Handles rate limiting and temporary errors
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const LONG_TIMEOUT = 120000; // 2 minutes for file operations

/**
 * Fetch with retry logic
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay between retries in milliseconds
 * @param {number} timeout - Request timeout in milliseconds
 * @returns {Promise<Response>} Response object
 */
export async function fetchWithRetry(url, options = {}, maxRetries = MAX_RETRIES, baseDelay = RETRY_DELAY, timeout = DEFAULT_TIMEOUT) {
	let lastError;
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			// Add timeout to the request
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), timeout);
			
			const fetchOptions = {
				...options,
				signal: controller.signal
			};
			
			const response = await fetch(url, fetchOptions);
			clearTimeout(timeoutId);
			
			// If successful, return the response
			if (response.ok) {
				return response;
			}
			
			// Handle rate limiting (429) and server errors (5xx)
			if (response.status === 429 || response.status >= 500) {
				if (attempt < maxRetries) {
					const delay = baseDelay * Math.pow(2, attempt);
					console.log(`⏳ Request failed with status ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}
			}
			
			// For client errors (4xx), don't retry
			if (response.status >= 400 && response.status < 500 && response.status !== 429) {
				const errorText = await response.text();
				throw new Error(`HTTP ${response.status}: ${errorText}`);
			}
			
			// For other errors, throw immediately
			const errorText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errorText}`);
			
		} catch (error) {
			lastError = error;
			
			// Handle timeout errors
			if (error.name === 'AbortError') {
				if (attempt < maxRetries) {
					const delay = baseDelay * Math.pow(2, attempt);
					console.log(`⏳ Request timeout, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}
				throw new Error(`Request timeout after ${timeout}ms`);
			}
			
			// If it's a network error, retry
			if (error.name === 'TypeError' && error.message.includes('fetch')) {
				if (attempt < maxRetries) {
					const delay = baseDelay * Math.pow(2, attempt);
					console.log(`⏳ Network error, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
					await new Promise(resolve => setTimeout(resolve, delay));
					continue;
				}
			}
			
			// For other errors, throw immediately
			throw error;
		}
	}
	
	// If we've exhausted all retries, throw the last error
	throw lastError;
}

/**
 * Fetch with retry logic for file operations (longer timeout)
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay between retries in milliseconds
 * @returns {Promise<Response>} Response object
 */
export async function fetchFileWithRetry(url, options = {}, maxRetries = MAX_RETRIES, baseDelay = RETRY_DELAY) {
	return fetchWithRetry(url, options, maxRetries, baseDelay, LONG_TIMEOUT);
}