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
    constructor(authOptions: FigmaAuthOptions);
    apiKey: string;
    oauthToken: string;
    useOAuth: boolean;
    /**
     * Make authenticated request to Figma API
     * @param {string} endpoint - API endpoint
     * @returns {Promise<any>}
     */
    request(endpoint: string): Promise<any>;
    /**
     * Get file data and return simplified response
     * @param {string} fileKey - Figma file key
     * @param {number|null} [depth] - Depth limit for traversal
     * @returns {Promise<any>} Simplified design object
     */
    getFile(fileKey: string, depth?: number | null): Promise<any>;
    /**
     * Get specific node data and return simplified response
     * @param {string} fileKey - Figma file key
     * @param {string} nodeId - Node ID to fetch
     * @param {number|null} [depth] - Depth limit for traversal
     * @returns {Promise<any>} Simplified design object
     */
    getNode(fileKey: string, nodeId: string, depth?: number | null): Promise<any>;
    /**
     * Get image downloads
     * @param {string} fileKey - Figma file key
     * @param {Array<Object>} nodes - Nodes to download
     * @param {string} localPath - Local path for downloads
     * @param {number} pngScale - PNG scale factor
     * @param {Object} svgOptions - SVG export options
     * @returns {Promise<string[]>} Array of download results
     */
    getImages(fileKey: string, nodes: Array<Object>, localPath: string, pngScale?: number, svgOptions?: Object): Promise<string[]>;
    /**
     * Get image fills
     * @param {string} fileKey - Figma file key
     * @param {Array<Object>} nodes - Nodes with image fills
     * @param {string} localPath - Local path for downloads
     * @returns {Promise<string[]>} Array of download results
     */
    getImageFills(fileKey: string, nodes: Array<Object>, localPath: string): Promise<string[]>;
}
export type FigmaAuthOptions = {
    /**
     * - Personal access token
     */
    figmaApiKey: string;
    /**
     * - OAuth token
     */
    figmaOAuthToken: string;
    /**
     * - Whether to use OAuth
     */
    useOAuth: boolean;
};
//# sourceMappingURL=figma-service.d.ts.map