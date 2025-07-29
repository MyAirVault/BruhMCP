export type FigmaPaint = {
    type: string;
    imageRef?: string | undefined;
    scaleMode?: string | undefined;
    color?: {
        r: number;
        g: number;
        b: number;
        a: number;
    } | undefined;
    opacity?: number | undefined;
    visible?: boolean | undefined;
    gradientHandlePositions?: any[] | undefined;
    gradientStops?: {
        position: number;
        color: {
            r: number;
            g: number;
            b: number;
            a: number;
        };
    }[] | undefined;
};
export type FigmaNode = {
    strokes?: FigmaPaint[] | undefined;
    strokeWeight?: number | undefined;
    strokeDashes?: number[] | undefined;
    individualStrokeWeights?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    } | undefined;
};
export type SimplifiedStroke = {
    colors: Array<string | {
        type: string;
        imageRef?: string;
        scaleMode?: string;
        gradientHandlePositions?: any[];
        gradientStops?: Array<{
            position: number;
            color: {
                hex: string;
                opacity: number;
            };
        }>;
    }>;
    strokeWeight?: string | undefined;
    strokeDashes?: number[] | undefined;
};
/**
 * @typedef {Object} FigmaPaint
 * @property {string} type
 * @property {string} [imageRef]
 * @property {string} [scaleMode]
 * @property {{ r: number, g: number, b: number, a: number }} [color]
 * @property {number} [opacity]
 * @property {boolean} [visible]
 * @property {any[]} [gradientHandlePositions]
 * @property {Array<{ position: number, color: { r: number, g: number, b: number, a: number } }>} [gradientStops]
 */
/**
 * @typedef {Object} FigmaNode
 * @property {FigmaPaint[]} [strokes]
 * @property {number} [strokeWeight]
 * @property {number[]} [strokeDashes]
 * @property {{ top: number, right: number, bottom: number, left: number }} [individualStrokeWeights]
 */
/**
 * @typedef {Object} SimplifiedStroke
 * @property {Array<string|{ type: string, imageRef?: string, scaleMode?: string, gradientHandlePositions?: any[], gradientStops?: Array<{ position: number, color: { hex: string, opacity: number } }> }>} colors
 * @property {string} [strokeWeight]
 * @property {number[]} [strokeDashes]
 */
/**
 * Build simplified strokes
 * @param {FigmaNode} n - Figma node
 * @returns {SimplifiedStroke}
 */
export function buildSimplifiedStrokes(n: FigmaNode): SimplifiedStroke;
//# sourceMappingURL=style.d.ts.map