/**
 * Fetch with Retry * Provides robust fetching with curl fallback for corporate networks
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const { axios } = require('../../../utils/axiosUtils.js');
const { Logger } = require('./logger.js');

const execAsync = promisify(exec);

/**
 * Fetch with retry and curl fallback
 * @param {string} url - URL to fetch
 * @param {{ headers?: Record<string, string>, [key: string]: any }} options - Request options
 * @returns {Promise<any>} Response data
 */
async function fetchWithRetry(url, options = {}) {
	try {
		const response = await axios({
			method: options.method || 'GET',
			url: url,
			headers: options.headers,
			data: options.body,
			timeout: options.timeout || 30000,
			...options
		});

		if (response.status >= 400) {
			throw new Error(`Fetch failed with status ${response.status}: ${response.statusText}`);
		}
		return response.data;
	} catch (fetchError) {
		const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
		Logger.log(
			`[fetchWithRetry] Initial fetch failed for ${url}: ${errorMessage}. Likely a corporate proxy or SSL issue. Attempting curl fallback.`
		);

		const curlHeaders = formatHeadersForCurl(options.headers);
		// -s: Silent mode—no progress bar in stderr
		// -S: Show errors in stderr
		// --fail-with-body: curl errors with code 22, and outputs body of failed request, e.g. "Fetch failed with status 404"
		// -L: Follow redirects
		const curlCommand = `curl -s -S --fail-with-body -L ${curlHeaders.join(" ")} "${url}"`;

		try {
			// Fallback to curl for corporate networks that have proxies that sometimes block fetch
			Logger.log(`[fetchWithRetry] Executing curl command: ${curlCommand}`);
			const { stdout, stderr } = await execAsync(curlCommand);

			if (stderr) {
				// curl often outputs progress to stderr, so only treat as error if stdout is empty
				// or if stderr contains typical error keywords.
				if (
					!stdout ||
					stderr.toLowerCase().includes("error") ||
					stderr.toLowerCase().includes("fail")
				) {
					throw new Error(`Curl command failed with stderr: ${stderr}`);
				}
				Logger.log(
					`[fetchWithRetry] Curl command for ${url} produced stderr (but might be informational): ${stderr}`
				);
			}

			if (!stdout) {
				throw new Error("Curl command returned empty stdout.");
			}

			return JSON.parse(stdout);
		} catch (curlError) {
			const curlErrorMessage = curlError instanceof Error ? curlError.message : String(curlError);
			Logger.error(`[fetchWithRetry] Curl fallback also failed for ${url}: ${curlErrorMessage}`);
			// Re-throw the original fetch error to give context about the initial failure
			throw fetchError;
		}
	}
}

/**
 * Converts HeadersInit to an array of curl header arguments
 * @param {Record<string, string> | undefined} headers - Headers to convert
 * @returns {string[]} Array of strings, each a curl -H argument
 */
function formatHeadersForCurl(headers) {
	if (!headers) {
		return [];
	}

	return Object.entries(headers).map(([key, value]) => `-H "${key}: ${value}"`);
}
module.exports = {
	fetchWithRetry
};