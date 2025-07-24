/**
 * Fetch with Retry * Provides robust fetching with curl fallback for corporate networks
 */

import { exec } from "child_process";
import { promisify } from "util";
import fetch from 'node-fetch';
import { createLogger } from './logger.js';

const logger = createLogger('FetchWithRetry');

const execAsync = promisify(exec);

/**
 * @typedef {Object} FetchOptions
 * @property {Record<string, string>} [headers] - Request headers
 * @property {string} [method] - HTTP method
 * @property {string | Buffer} [body] - Request body
 */

/**
 * @typedef {Object} MockResponse
 * @property {boolean} ok - Whether request succeeded
 * @property {number} status - HTTP status code
 * @property {string} statusText - Status text
 * @property {Map<string, string>} headers - Response headers
 * @property {() => Promise<any>} json - JSON parser function
 */

/**
 * Fetch with retry and curl fallback
 * @param {string} url - URL to fetch
 * @param {FetchOptions} [options] - Request options
 * @returns {Promise<import('node-fetch').Response | MockResponse>} Response data
 */
export async function fetchWithRetry(url, options = {}) {
	try {
		const response = await fetch(url, options);
		return /** @type {import('node-fetch').Response | MockResponse} */ (response);
	} catch (fetchError) {
		logger.warn(
			`Initial fetch failed for ${url}: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}. Likely a corporate proxy or SSL issue. Attempting curl fallback.`
		);

		const curlHeaders = formatHeadersForCurl(options.headers);
		// -s: Silent mode—no progress bar in stderr
		// -S: Show errors in stderr
		// --fail-with-body: curl errors with code 22, and outputs body of failed request, e.g. "Fetch failed with status 404"
		// -L: Follow redirects
		const curlCommand = `curl -s -S --fail-with-body -L ${curlHeaders.join(" ")} "${url}"`;

		try {
			// Fallback to curl for corporate networks that have proxies that sometimes block fetch
			logger.info(`Executing curl command: ${curlCommand}`);
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
				logger.info(
					`Curl command for ${url} produced stderr (but might be informational): ${stderr}`
				);
			}

			if (!stdout) {
				throw new Error("Curl command returned empty stdout.");
			}

			// Create a mock Response object for curl fallback
			const jsonData = JSON.parse(stdout);
			return {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Map(),
				json: () => Promise.resolve(jsonData)
			};
		} catch (curlError) {
			logger.error(`Curl fallback also failed for ${url}: ${curlError instanceof Error ? curlError.message : String(curlError)}`);
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