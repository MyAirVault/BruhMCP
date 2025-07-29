export type FigmaColor = {
    /**
     * - Red component (0-1)
     */
    r: number;
    /**
     * - Green component (0-1)
     */
    g: number;
    /**
     * - Blue component (0-1)
     */
    b: number;
    /**
     * - Alpha component (0-1)
     */
    a: number;
};
export type FigmaOffset = {
    /**
     * - X offset
     */
    x: number;
    /**
     * - Y offset
     */
    y: number;
};
export type FigmaEffect = {
    /**
     * - Effect type (DROP_SHADOW, INNER_SHADOW, LAYER_BLUR, BACKGROUND_BLUR)
     */
    type: string;
    /**
     * - Whether effect is visible
     */
    visible: boolean;
    /**
     * - Effect radius
     */
    radius: number;
    /**
     * - Effect color (for shadows)
     */
    color: FigmaColor;
    /**
     * - Effect offset (for shadows)
     */
    offset: FigmaOffset;
    /**
     * - Shadow spread
     */
    spread?: number | undefined;
};
export type FigmaNode = {
    /**
     * - Node type
     */
    type: string;
    /**
     * - Node effects
     */
    effects?: FigmaEffect[] | undefined;
};
export type SimplifiedEffects = {
    boxShadow?: string | undefined;
    filter?: string | undefined;
    backdropFilter?: string | undefined;
    textShadow?: string | undefined;
};
/**
 * @typedef {Object} FigmaColor
 * @property {number} r - Red component (0-1)
 * @property {number} g - Green component (0-1)
 * @property {number} b - Blue component (0-1)
 * @property {number} a - Alpha component (0-1)
 */
/**
 * @typedef {Object} FigmaOffset
 * @property {number} x - X offset
 * @property {number} y - Y offset
 */
/**
 * @typedef {Object} FigmaEffect
 * @property {string} type - Effect type (DROP_SHADOW, INNER_SHADOW, LAYER_BLUR, BACKGROUND_BLUR)
 * @property {boolean} visible - Whether effect is visible
 * @property {number} radius - Effect radius
 * @property {FigmaColor} color - Effect color (for shadows)
 * @property {FigmaOffset} offset - Effect offset (for shadows)
 * @property {number} [spread] - Shadow spread
 */
/**
 * @typedef {Object} FigmaNode
 * @property {string} type - Node type
 * @property {FigmaEffect[]} [effects] - Node effects
 */
/**
 * @typedef {Object} SimplifiedEffects
 * @property {string} [boxShadow]
 * @property {string} [filter]
 * @property {string} [backdropFilter]
 * @property {string} [textShadow]
 */
/**
 * Build simplified effects
 * @param {FigmaNode} n - Figma node
 * @returns {SimplifiedEffects}
 */
export function buildSimplifiedEffects(n: FigmaNode): SimplifiedEffects;
//# sourceMappingURL=effects.d.ts.map