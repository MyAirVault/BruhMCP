/**
 * @typedef {Object} SimplifiedStroke
 * @property {Array} colors
 * @property {string} [strokeWeight]
 * @property {number[]} [strokeDashes]
 * @property {string} [strokeWeights]
 */
/**
 * Build simplified strokes * @param {any} n - Figma node
 * @returns {SimplifiedStroke}
 */
export function buildSimplifiedStrokes(n: any): SimplifiedStroke;
export type SimplifiedStroke = {
    colors: any[];
    strokeWeight?: string | undefined;
    strokeDashes?: number[] | undefined;
    strokeWeights?: string | undefined;
};
//# sourceMappingURL=style.d.ts.map