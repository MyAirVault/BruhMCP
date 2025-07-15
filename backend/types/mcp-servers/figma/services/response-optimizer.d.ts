/**
 * Optimizes a Figma file response for LLM consumption
 * @param {object} figmaData - Raw Figma API response
 * @param {string} optimization - Optimization level (overview, components, styles, layout, full)
 * @param {object} options - Additional options
 * @returns {object} Optimized response data
 */
export function optimizeFigmaFile(figmaData: object, optimization?: string, options?: object): object;
export namespace OPTIMIZATION_LEVELS {
    namespace overview {
        let includeMetadata: boolean;
        let includeStructure: boolean;
        let includeComponents: boolean;
        let includeStyles: boolean;
        let maxDepth: number;
        let maxNodes: number;
        let includeGeometry: boolean;
        let includeEffects: boolean;
    }
    namespace components {
        let includeMetadata_1: boolean;
        export { includeMetadata_1 as includeMetadata };
        let includeStructure_1: boolean;
        export { includeStructure_1 as includeStructure };
        let includeComponents_1: boolean;
        export { includeComponents_1 as includeComponents };
        let includeStyles_1: boolean;
        export { includeStyles_1 as includeStyles };
        let maxDepth_1: number;
        export { maxDepth_1 as maxDepth };
        let maxNodes_1: number;
        export { maxNodes_1 as maxNodes };
        let includeGeometry_1: boolean;
        export { includeGeometry_1 as includeGeometry };
        let includeEffects_1: boolean;
        export { includeEffects_1 as includeEffects };
    }
    namespace styles {
        let includeMetadata_2: boolean;
        export { includeMetadata_2 as includeMetadata };
        let includeStructure_2: boolean;
        export { includeStructure_2 as includeStructure };
        let includeComponents_2: boolean;
        export { includeComponents_2 as includeComponents };
        let includeStyles_2: boolean;
        export { includeStyles_2 as includeStyles };
        let maxDepth_2: number;
        export { maxDepth_2 as maxDepth };
        let maxNodes_2: number;
        export { maxNodes_2 as maxNodes };
        let includeGeometry_2: boolean;
        export { includeGeometry_2 as includeGeometry };
        let includeEffects_2: boolean;
        export { includeEffects_2 as includeEffects };
    }
    namespace layout {
        let includeMetadata_3: boolean;
        export { includeMetadata_3 as includeMetadata };
        let includeStructure_3: boolean;
        export { includeStructure_3 as includeStructure };
        let includeComponents_3: boolean;
        export { includeComponents_3 as includeComponents };
        let includeStyles_3: boolean;
        export { includeStyles_3 as includeStyles };
        let maxDepth_3: number;
        export { maxDepth_3 as maxDepth };
        let maxNodes_3: number;
        export { maxNodes_3 as maxNodes };
        let includeGeometry_3: boolean;
        export { includeGeometry_3 as includeGeometry };
        let includeEffects_3: boolean;
        export { includeEffects_3 as includeEffects };
    }
    namespace full {
        let includeMetadata_4: boolean;
        export { includeMetadata_4 as includeMetadata };
        let includeStructure_4: boolean;
        export { includeStructure_4 as includeStructure };
        let includeComponents_4: boolean;
        export { includeComponents_4 as includeComponents };
        let includeStyles_4: boolean;
        export { includeStyles_4 as includeStyles };
        let maxDepth_4: number;
        export { maxDepth_4 as maxDepth };
        let maxNodes_4: number;
        export { maxNodes_4 as maxNodes };
        let includeGeometry_4: boolean;
        export { includeGeometry_4 as includeGeometry };
        let includeEffects_4: boolean;
        export { includeEffects_4 as includeEffects };
    }
}
//# sourceMappingURL=response-optimizer.d.ts.map