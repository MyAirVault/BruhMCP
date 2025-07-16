/**
 * @typedef {Object} SimplifiedLayout
 * @property {"none" | "row" | "column"} mode
 * @property {"flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch"} [justifyContent]
 * @property {"flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch"} [alignItems]
 * @property {"flex-start" | "flex-end" | "center" | "stretch"} [alignSelf]
 * @property {boolean} [wrap]
 * @property {string} [gap]
 * @property {{x: number, y: number}} [locationRelativeToParent]
 * @property {{width?: number, height?: number, aspectRatio?: number}} [dimensions]
 * @property {string} [padding]
 * @property {{horizontal?: "fixed" | "fill" | "hug", vertical?: "fixed" | "fill" | "hug"}} [sizing]
 * @property {("x" | "y")[]} [overflowScroll]
 * @property {"absolute"} [position]
 */
/**
 * Convert Figma's layout config into a more typical flex-like schema
 * @param {any} n - Figma node
 * @param {any} [parent] - Parent node
 * @returns {SimplifiedLayout}
 */
export function buildSimplifiedLayout(n: any, parent?: any): SimplifiedLayout;
export type SimplifiedLayout = {
    mode: "none" | "row" | "column";
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch" | undefined;
    alignItems?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch" | undefined;
    alignSelf?: "flex-start" | "flex-end" | "center" | "stretch" | undefined;
    wrap?: boolean | undefined;
    gap?: string | undefined;
    locationRelativeToParent?: {
        x: number;
        y: number;
    } | undefined;
    dimensions?: {
        width?: number;
        height?: number;
        aspectRatio?: number;
    } | undefined;
    padding?: string | undefined;
    sizing?: {
        horizontal?: "fixed" | "fill" | "hug";
        vertical?: "fixed" | "fill" | "hug";
    } | undefined;
    overflowScroll?: ("y" | "x")[] | undefined;
    position?: "absolute" | undefined;
};
//# sourceMappingURL=layout.d.ts.map