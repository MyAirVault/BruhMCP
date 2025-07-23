/**
 * @typedef {Object} FigmaAuthOptions
 * @property {string} figmaApiKey - Personal access token
 * @property {string} figmaOAuthToken - OAuth token
 * @property {boolean} useOAuth - Whether to use OAuth
 */
/**
 * @typedef {Object} NodeInfo
 * @property {string} nodeId - Node ID
 * @property {string} fileName - File name
 * @property {string} fileType - File type (png, svg)
 */
/**
 * @typedef {Object} ImageFillNode
 * @property {string} imageRef - Image reference
 * @property {string} fileName - File name
 */
/**
 * @typedef {Object} SVGOptions
 * @property {boolean} [outlineText] - Whether to outline text
 * @property {boolean} [includeId] - Whether to include IDs
 * @property {boolean} [simplifyStroke] - Whether to simplify strokes
 */
/**
 * @typedef {Record<string, string>} HTTPHeaders
 */
/**
 * @typedef {Record<string, string>} ImageFilesMap
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
     * @param {NodeInfo[]} nodes - Nodes to download
     * @param {string} localPath - Local path for downloads
     * @param {number} pngScale - PNG scale factor
     * @param {SVGOptions} svgOptions - SVG export options
     * @returns {Promise<string[]>} Array of download results
     */
    getImages(fileKey: string, nodes: NodeInfo[], localPath: string, pngScale?: number, svgOptions?: SVGOptions): Promise<string[]>;
    /**
     * Get image fills
     * @param {string} fileKey - Figma file key
     * @param {ImageFillNode[]} nodes - Nodes with image fills
     * @param {string} localPath - Local path for downloads
     * @returns {Promise<string[]>} Array of download results
     */
    getImageFills(fileKey: string, nodes: ImageFillNode[], localPath: string): Promise<string[]>;
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
export type NodeInfo = {
    /**
     * - Node ID
     */
    nodeId: string;
    /**
     * - File name
     */
    fileName: string;
    /**
     * - File type (png, svg)
     */
    fileType: string;
};
export type ImageFillNode = {
    /**
     * - Image reference
     */
    imageRef: string;
    /**
     * - File name
     */
    fileName: string;
};
export type SVGOptions = {
    /**
     * - Whether to outline text
     */
    outlineText?: boolean | undefined;
    /**
     * - Whether to include IDs
     */
    includeId?: boolean | undefined;
    /**
     * - Whether to simplify strokes
     */
    simplifyStroke?: boolean | undefined;
};
export type HTTPHeaders = Record<string, string>;
export type ImageFilesMap = Record<string, string>;
//# sourceMappingURL=figma-service.d.ts.map