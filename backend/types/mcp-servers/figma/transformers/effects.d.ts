/**
 * @typedef {Object} SimplifiedEffects
 * @property {string} [boxShadow]
 * @property {string} [filter]
 * @property {string} [backdropFilter]
 * @property {string} [textShadow]
 */
/**
 * Build simplified effects * @param {any} n - Figma node
 * @returns {SimplifiedEffects}
 */
export function buildSimplifiedEffects(n: any): SimplifiedEffects;
export type SimplifiedEffects = {
    boxShadow?: string | undefined;
    filter?: string | undefined;
    backdropFilter?: string | undefined;
    textShadow?: string | undefined;
};
//# sourceMappingURL=effects.d.ts.map