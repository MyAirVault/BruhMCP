/**
 * Figma Service Layer * Handles authentication, API calls, and data processing
 */

import { fetchWithRetry } from '../utils/fetch-with-retry.js';
import { parseFigmaResponse } from './response-simplifier.js';
import { downloadFigmaImage } from '../utils/common.js';
import { Logger } from '../utils/logger.js';

const FIGMA_BASE_URL = 'https://api.figma.com/v1';

/**
 * @typedef {Object} FigmaAuthOptions
 * @property {string} figmaApiKey - Personal access token
 * @property {string} figmaOAuthToken - OAuth token
 * @property {boolean} useOAuth - Whether to use OAuth
 */

export class FigmaService {
	/**
	 * @param {FigmaAuthOptions} authOptions
	 */
	constructor(authOptions) {
		this.apiKey = authOptions.figmaApiKey || '';
		this.oauthToken = authOptions.figmaOAuthToken || '';
		this.useOAuth = !!authOptions.useOAuth && !!this.oauthToken;
	}

	/**
	 * Make authenticated request to Figma API	 * @param {string} endpoint - API endpoint
	 * @returns {Promise<any>}
	 */
	async request(endpoint) {
		try {
			Logger.log(`Calling ${FIGMA_BASE_URL}${endpoint}`);

			// Set auth headers based on authentication method			const headers = {};

			if (this.useOAuth) {
				// Use OAuth token with Authorization: Bearer header
				Logger.log('Using OAuth Bearer token for authentication');
				headers['Authorization'] = `Bearer ${this.oauthToken}`;
			} else {
				// Use Personal Access Token with X-Figma-Token header
				Logger.log('Using Personal Access Token for authentication');
				headers['X-Figma-Token'] = this.apiKey;
			}

			const data = await fetchWithRetry(`${FIGMA_BASE_URL}${endpoint}`, {
				headers,
			});

			return data;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to make request to Figma API: ${error.message}`);
			}
			throw new Error(`Failed to make request to Figma API: ${error}`);
		}
	}

	/**
	 * Get file data and return simplified response	 * @param {string} fileKey - Figma file key
	 * @param {number|null} [depth] - Depth limit for traversal
	 * @returns {Promise<any>} Simplified design object
	 */
	async getFile(fileKey, depth = null) {
		try {
			const endpoint = `/files/${fileKey}${depth ? `?depth=${depth}` : ''}`;
			Logger.log(`Retrieving Figma file: ${fileKey} (depth: ${depth ?? 'default'})`);
			
			const response = await this.request(endpoint);
			Logger.log('Got response');
			
			// Check if response is valid before parsing
			if (!response || typeof response !== 'object') {
				throw new Error('Invalid response from Figma API');
			}
			
			// Simplify the response			const simplifiedResponse = parseFigmaResponse(response);
			
			return simplifiedResponse;
		} catch (error) {
			Logger.error('Failed to get file:', error);
			throw error;
		}
	}

	/**
	 * Get specific node data and return simplified response	 * @param {string} fileKey - Figma file key
	 * @param {string} nodeId - Node ID to fetch
	 * @param {number|null} [depth] - Depth limit for traversal
	 * @returns {Promise<any>} Simplified design object
	 */
	async getNode(fileKey, nodeId, depth = null) {
		try {
			const endpoint = `/files/${fileKey}/nodes?ids=${nodeId}${depth ? `&depth=${depth}` : ''}`;
			
			const response = await this.request(endpoint);
			Logger.log('Got response from getNode, now parsing.');
			
			// Check if response is valid before parsing
			if (!response || typeof response !== 'object') {
				throw new Error('Invalid response from Figma API');
			}
			
			// Simplify the response			const simplifiedResponse = parseFigmaResponse(response);
			
			return simplifiedResponse;
		} catch (error) {
			Logger.error('Failed to get node:', error);
			throw error;
		}
	}

	/**
	 * Get image downloads	 * @param {string} fileKey - Figma file key
	 * @param {Array} nodes - Nodes to download
	 * @param {string} localPath - Local path for downloads
	 * @param {number} pngScale - PNG scale factor
	 * @param {Object} svgOptions - SVG export options
	 * @returns {Promise<string[]>} Array of download results
	 */
	async getImages(fileKey, nodes, localPath, pngScale = 2, svgOptions = {}) {
		const { outlineText = false, includeId = false, simplifyStroke = false } = svgOptions;
		
		const pngIds = nodes.filter(({ fileType }) => fileType === "png").map(({ nodeId }) => nodeId);
		const pngFiles = pngIds.length > 0
			? this.request(`/images/${fileKey}?ids=${pngIds.join(",")}&format=png&scale=${pngScale}`)
				.then(({ images = {} }) => images)
			: {};

		const svgIds = nodes.filter(({ fileType }) => fileType === "svg").map(({ nodeId }) => nodeId);
		const svgParams = [
			`ids=${svgIds.join(",")}`,
			"format=svg",
			`svg_outline_text=${outlineText}`,
			`svg_include_id=${includeId}`,
			`svg_simplify_stroke=${simplifyStroke}`,
		].join("&");

		const svgFiles = svgIds.length > 0
			? this.request(`/images/${fileKey}?${svgParams}`)
				.then(({ images = {} }) => images)
			: {};

		const files = await Promise.all([pngFiles, svgFiles]).then(([f, l]) => ({ ...f, ...l }));

		const downloads = nodes
			.map(({ nodeId, fileName }) => {
				const imageUrl = files[nodeId];
				if (imageUrl) {
					return downloadFigmaImage(fileName, localPath, imageUrl);
				}
				return false;
			})
			.filter((url) => !!url);

		return Promise.all(downloads);
	}

	/**
	 * Get image fills	 * @param {string} fileKey - Figma file key
	 * @param {Array} nodes - Nodes with image fills
	 * @param {string} localPath - Local path for downloads
	 * @returns {Promise<string[]>} Array of download results
	 */
	async getImageFills(fileKey, nodes, localPath) {
		if (nodes.length === 0) return [];

		let promises = [];
		const endpoint = `/files/${fileKey}/images`;
		const file = await this.request(endpoint);
		const { images = {} } = file.meta;
		promises = nodes.map(async ({ imageRef, fileName }) => {
			const imageUrl = images[imageRef];
			if (!imageUrl) {
				return "";
			}
			return downloadFigmaImage(fileName, localPath, imageUrl);
		});
		return Promise.all(promises);
	}
}