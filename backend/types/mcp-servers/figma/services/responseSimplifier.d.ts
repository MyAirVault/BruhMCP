export type GlobalVars = {
    /**
     * - Style variables
     */
    styles: Record<string, unknown>;
    /**
     * - Component variables
     */
    components: Record<string, unknown>;
    /**
     * - Component set variables
     */
    componentSets: Record<string, unknown>;
    /**
     * - Component instance variables
     */
    componentInstances: Record<string, unknown>;
};
export type FigmaNode = {
    /**
     * - Node ID
     */
    id: string;
    /**
     * - Node name
     */
    name: string;
    /**
     * - Node type
     */
    type: string;
    /**
     * - Child nodes
     */
    children?: FigmaNode[] | undefined;
    /**
     * - Component ID
     */
    componentId?: string | undefined;
    /**
     * - Component properties
     */
    componentProperties?: Record<string, unknown> | undefined;
    /**
     * - Text style
     */
    style?: Record<string, unknown> | undefined;
    /**
     * - Fill paints
     */
    fills?: unknown[] | undefined;
    /**
     * - Text content
     */
    characters?: string | undefined;
    /**
     * - Opacity value
     */
    opacity?: number | undefined;
    /**
     * - Corner radius
     */
    cornerRadius?: number | undefined;
    /**
     * - Rectangle corner radii
     */
    rectangleCornerRadii?: number[] | undefined;
};
export type SimplifiedNode = {
    /**
     * - Node ID
     */
    id: string;
    /**
     * - Node name
     */
    name: string;
    /**
     * - Node type
     */
    type: string;
    /**
     * - Component ID
     */
    componentId?: string | undefined;
    /**
     * - Component properties
     */
    componentProperties?: Record<string, unknown>[] | undefined;
    /**
     * - Text style reference
     */
    textStyle?: string | undefined;
    /**
     * - Fill reference
     */
    fills?: string | undefined;
    /**
     * - Stroke reference
     */
    strokes?: string | undefined;
    /**
     * - Effects reference
     */
    effects?: string | undefined;
    /**
     * - Layout reference
     */
    layout?: string | undefined;
    /**
     * - Text content
     */
    text?: string | undefined;
    /**
     * - Opacity value
     */
    opacity?: number | undefined;
    /**
     * - Border radius
     */
    borderRadius?: string | undefined;
    /**
     * - Child nodes
     */
    children?: SimplifiedNode[] | undefined;
};
export type FigmaResponse = {
    /**
     * - File name
     */
    name: string;
    /**
     * - Last modified timestamp
     */
    lastModified: string;
    /**
     * - Thumbnail URL
     */
    thumbnailUrl?: string | undefined;
    /**
     * - Document node
     */
    document: Object;
    /**
     * - Root children
     */
    children?: FigmaNode[] | undefined;
    /**
     * - Components
     */
    components?: Object | undefined;
    /**
     * - Component sets
     */
    componentSets?: Object | undefined;
    /**
     * - Nodes (for GetFileNodesResponse)
     */
    nodes?: Object | undefined;
};
export type NodeResponse = {
    /**
     * - Document node
     */
    document: FigmaNode;
    /**
     * - Components
     */
    components?: Object | undefined;
    /**
     * - Component sets
     */
    componentSets?: Object | undefined;
};
/**
 * Parse Figma API response
 * @param {FigmaResponse} data - Raw Figma API response (GetFileResponse | GetFileNodesResponse)
 * @returns {Object} Simplified design object with global variables
 */
export function simplifyFigmaResponse(data: FigmaResponse): Object;
/**
 * Parse Figma API response
 * @param {FigmaResponse} data - Raw Figma API response (GetFileResponse | GetFileNodesResponse)
 * @returns {Object} Simplified design object with global variables
 */
export function parseFigmaResponse(data: FigmaResponse): Object;
//# sourceMappingURL=responseSimplifier.d.ts.map