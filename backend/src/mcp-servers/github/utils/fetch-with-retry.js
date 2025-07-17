/**
 * Fetch with Retry * Provides robust fetching with curl fallback for corporate networks
 */

import { exec } from "child_process";
import { promisify } from "util";
import fetch from 'node-fetch';
import { Logger } from './logger.js';

const execAsync = promisify(exec);

/**
 * Fetch with retry and curl fallback * @param {string} url - URL to fetch
 * @param {Object} options - Request options
 * @returns {Promise<any>} Response data
 */
export async function fetchWithRetry(url, options = {}) {
	try {
		const response = await fetch(url, options);

		if (!response.ok) {
			throw new Error(`Fetch failed with status ${response.status}: ${response.statusText}`);
		}
		return await response.json();
	} catch (fetchError) {
		Logger.log(
			`[fetchWithRetry] Initial fetch failed for ${url}: ${fetchError.message}. Likely a corporate proxy or SSL issue. Attempting curl fallback.`
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
			Logger.error(`[fetchWithRetry] Curl fallback also failed for ${url}: ${curlError.message}`);
			// Re-throw the original fetch error to give context about the initial failure
			throw fetchError;
		}
	}
}

/**
 * Converts HeadersInit to an array of curl header arguments * @param {Object} headers - Headers to convert
 * @returns {string[]} Array of strings, each a curl -H argument
 */
function formatHeadersForCurl(headers) {
	if (!headers) {
		return [];
	}

	return Object.entries(headers).map(([key, value]) => `-H "${key}: ${value}"`);
}