export type Point = {
    x: number;
    y: number;
};
export type BoundingBox = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export type FigmaNode = {
    layoutMode?: string | undefined;
    primaryAxisAlignItems?: string | undefined;
    counterAxisAlignItems?: string | undefined;
    layoutAlign?: string | undefined;
    layoutWrap?: string | undefined;
    itemSpacing?: number | undefined;
    paddingTop?: number | undefined;
    paddingBottom?: number | undefined;
    paddingLeft?: number | undefined;
    paddingRight?: number | undefined;
    overflowDirection?: string[] | undefined;
    layoutPositioning?: string | undefined;
    layoutSizingHorizontal?: string | undefined;
    layoutSizingVertical?: string | undefined;
    layoutGrow?: boolean | undefined;
    absoluteBoundingBox?: BoundingBox | undefined;
    preserveRatio?: boolean | undefined;
    clipsContent?: boolean | undefined;
    children?: FigmaNode[] | undefined;
};
export type SimplifiedLayout = {
    mode: "none" | "row" | "column";
    justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch" | undefined;
    alignItems?: "flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch" | undefined;
    alignSelf?: "flex-start" | "flex-end" | "center" | "stretch" | undefined;
    wrap?: boolean | undefined;
    gap?: string | undefined;
    locationRelativeToParent?: Point | undefined;
    dimensions?: {
        width?: number | undefined;
        height?: number | undefined;
        aspectRatio?: number | undefined;
    } | undefined;
    padding?: string | undefined;
    sizing?: {
        horizontal?: "fill" | "fixed" | "hug" | undefined;
        vertical?: "fill" | "fixed" | "hug" | undefined;
    } | undefined;
    overflowScroll?: ("y" | "x")[] | undefined;
    position?: "absolute" | undefined;
};
export type StretchInfo = {
    children: FigmaNode[];
    mode: "none" | "row" | "column";
    axis: "primary" | "counter";
};
/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */
/**
 * @typedef {Object} BoundingBox
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */
/**
 * @typedef {Object} FigmaNode
 * @property {string} [layoutMode]
 * @property {string} [primaryAxisAlignItems]
 * @property {string} [counterAxisAlignItems]
 * @property {string} [layoutAlign]
 * @property {string} [layoutWrap]
 * @property {number} [itemSpacing]
 * @property {number} [paddingTop]
 * @property {number} [paddingBottom]
 * @property {number} [paddingLeft]
 * @property {number} [paddingRight]
 * @property {string[]} [overflowDirection]
 * @property {string} [layoutPositioning]
 * @property {string} [layoutSizingHorizontal]
 * @property {string} [layoutSizingVertical]
 * @property {boolean} [layoutGrow]
 * @property {BoundingBox} [absoluteBoundingBox]
 * @property {boolean} [preserveRatio]
 * @property {boolean} [clipsContent]
 * @property {FigmaNode[]} [children]
 */
/**
 * @typedef {Object} SimplifiedLayout
 * @property {"none" | "row" | "column"} mode
 * @property {"flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch"} [justifyContent]
 * @property {"flex-start" | "flex-end" | "center" | "space-between" | "baseline" | "stretch"} [alignItems]
 * @property {"flex-start" | "flex-end" | "center" | "stretch"} [alignSelf]
 * @property {boolean} [wrap]
 * @property {string} [gap]
 * @property {Point} [locationRelativeToParent]
 * @property {{width?: number, height?: number, aspectRatio?: number}} [dimensions]
 * @property {string} [padding]
 * @property {{horizontal?: "fixed" | "fill" | "hug", vertical?: "fixed" | "fill" | "hug"}} [sizing]
 * @property {("x" | "y")[]} [overflowScroll]
 * @property {"absolute"} [position]
 */
/**
 * Convert Figma's layout config into a more typical flex-like schema
 * @param {FigmaNode} n - Figma node
 * @param {FigmaNode|undefined} [parent] - Parent node
 * @returns {SimplifiedLayout}
 */
export function buildSimplifiedLayout(n: FigmaNode, parent?: FigmaNode | undefined): SimplifiedLayout;
//# sourceMappingURL=layout.d.ts.map