/**
 * Fetch with retry logic for Dropbox API
 * Handles rate limiting and temporary errors
 */

/**
 * Fetch with retry logic
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay between retries in milliseconds
 * @returns {Promise<Response>} Response object
 */
export async function fetchWithRetry(url, options = {}, maxRetries = 3, baseDelay = 1000) {
	let lastError;
	
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(url, options);
			
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