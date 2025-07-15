/**
 * Response Optimization Service for LLM-friendly Figma data
 * Transforms raw Figma API responses into structured, semantic data optimized for LLM consumption
 */

const { estimateTokenCount, truncateToTokenLimit } = require('./token-manager');

/**
 * Optimization levels for different use cases
 */
const OPTIMIZATION_LEVELS = {
    overview: {
        includeMetadata: true,
        includeStructure: true,
        includeComponents: false,
        includeStyles: false,
        maxDepth: 2,
        maxNodes: 50,
        includeGeometry: false,
        includeEffects: false
    },
    components: {
        includeMetadata: true,
        includeStructure: false,
        includeComponents: true,
        includeStyles: false,
        maxDepth: 3,
        maxNodes: 100,
        includeGeometry: false,
        includeEffects: false
    },
    styles: {
        includeMetadata: true,
        includeStructure: false,
        includeComponents: false,
        includeStyles: true,
        maxDepth: 1,
        maxNodes: 200,
        includeGeometry: false,
        includeEffects: true
    },
    layout: {
        includeMetadata: true,
        includeStructure: true,
        includeComponents: false,
        includeStyles: false,
        maxDepth: 4,
        maxNodes: 75,
        includeGeometry: true,
        includeEffects: false
    },
    full: {
        includeMetadata: true,
        includeStructure: true,
        includeComponents: true,
        includeStyles: true,
        maxDepth: 10,
        maxNodes: 1000,
        includeGeometry: true,
        includeEffects: true
    }
};

/**
 * Optimizes a Figma file response for LLM consumption
 * @param {object} figmaData - Raw Figma API response
 * @param {string} optimization - Optimization level (overview, components, styles, layout, full)
 * @param {object} options - Additional options
 * @returns {object} Optimized response data
 */
function optimizeFigmaFile(figmaData, optimization = 'overview', options = {}) {
    const level = OPTIMIZATION_LEVELS[optimization] || OPTIMIZATION_LEVELS.overview;
    const maxTokens = options.maxTokens || 20000;
    
    let optimized = {
        meta: extractFileMeta(figmaData),
        summary: null,
        structure: null,
        components: null,
        styles: null,
        availableDetails: generateAvailableDetails(figmaData)
    };
    
    // Add data based on optimization level
    if (level.includeMetadata) {
        optimized.summary = generateFileSummary(figmaData);
    }
    
    if (level.includeStructure && figmaData.document) {
        optimized.structure = optimizeDocumentStructure(figmaData.document, level);
    }
    
    if (level.includeComponents && figmaData.components) {
        optimized.components = optimizeComponents(figmaData.components, level);
    }
    
    if (level.includeStyles && figmaData.styles) {
        optimized.styles = optimizeStyles(figmaData.styles, level);
    }
    
    // Apply token limits
    const result = truncateToTokenLimit(optimized, maxTokens);
    
    return {
        ...result.data,
        _meta: {
            optimization,
            tokenCount: result.finalTokens,
            truncated: result.truncated,
            originalTokens: result.originalTokens,
            hasMore: result.truncated || hasMoreContent(figmaData, optimization)
        }
    };
}

/**
 * Extracts essential file metadata
 * @param {object} figmaData - Raw Figma data
 * @returns {object} File metadata
 */
function extractFileMeta(figmaData) {
    return {
        name: figmaData.name,
        lastModified: figmaData.lastModified,
        version: figmaData.version,
        thumbnailUrl: figmaData.thumbnailUrl,
        role: figmaData.role,
        linkAccess: figmaData.linkAccess
    };
}

/**
 * Generates a high-level summary of the file
 * @param {object} figmaData - Raw Figma data
 * @returns {object} File summary
 */
function generateFileSummary(figmaData) {
    const summary = {
        type: inferFileType(figmaData),
        pageCount: 0,
        componentCount: 0,
        styleCount: 0,
        mainElements: []
    };
    
    // Count pages
    if (figmaData.document && figmaData.document.children) {
        summary.pageCount = figmaData.document.children.length;
        summary.pages = figmaData.document.children.map(page => ({
            name: page.name,
            type: page.type,
            childCount: page.children ? page.children.length : 0
        }));
    }
    
    // Count components
    if (figmaData.components) {
        summary.componentCount = Object.keys(figmaData.components).length;
        summary.mainComponents = Object.values(figmaData.components)
            .slice(0, 10)
            .map(comp => ({
                name: comp.name,
                description: comp.description,
                key: comp.key
            }));
    }
    
    // Count styles
    if (figmaData.styles) {
        summary.styleCount = Object.keys(figmaData.styles).length;
        summary.styleTypes = categorizeStyles(figmaData.styles);
    }
    
    // Extract design tokens
    summary.designTokens = extractDesignTokens(figmaData);
    
    return summary;
}

/**
 * Optimizes document structure for LLM understanding
 * @param {object} document - Figma document node
 * @param {object} level - Optimization level settings
 * @returns {object} Optimized structure
 */
function optimizeDocumentStructure(document, level) {
    function processNode(node, depth = 0) {
        if (depth > level.maxDepth || !node) return null;
        
        const optimized = {
            id: node.id,
            name: node.name,
            type: node.type
        };
        
        // Add essential properties based on node type
        if (node.type === 'FRAME' || node.type === 'COMPONENT') {
            optimized.size = extractSize(node);
            optimized.position = extractPosition(node);
        }
        
        if (node.type === 'TEXT') {
            optimized.content = node.characters ? 
                (node.characters.length > 100 ? 
                    node.characters.substring(0, 100) + '...' : 
                    node.characters) : '';
            optimized.style = extractTextStyle(node);
        }
        
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
            optimized.componentInfo = {
                description: node.description,
                remote: node.remote,
                key: node.key
            };
        }
        
        // Add children with depth limit
        if (node.children && Array.isArray(node.children) && depth < level.maxDepth) {
            optimized.children = node.children
                .slice(0, level.maxNodes / (depth + 1))
                .map(child => processNode(child, depth + 1))
                .filter(child => child !== null);
                
            if (node.children.length > optimized.children.length) {
                optimized.hasMoreChildren = true;
                optimized.totalChildren = node.children.length;
            }
        }
        
        return optimized;
    }
    
    return processNode(document);
}

/**
 * Optimizes component data for LLM understanding
 * @param {object} components - Figma components object
 * @param {object} level - Optimization level settings
 * @returns {array} Optimized components array
 */
function optimizeComponents(components, level) {
    return Object.values(components)
        .slice(0, level.maxNodes)
        .map(component => ({
            key: component.key,
            name: component.name,
            description: component.description,
            remote: component.remote,
            documentationLinks: component.documentationLinks,
            componentSetId: component.componentSetId,
            usage: 'Component available for use in designs'
        }));
}

/**
 * Optimizes style data for LLM understanding
 * @param {object} styles - Figma styles object
 * @param {object} level - Optimization level settings
 * @returns {object} Organized styles by category
 */
function optimizeStyles(styles, level) {
    const organized = {
        colors: [],
        typography: [],
        effects: [],
        grids: []
    };
    
    Object.values(styles).forEach(style => {
        const optimizedStyle = {
            key: style.key,
            name: style.name,
            description: style.description,
            styleType: style.styleType
        };
        
        switch (style.styleType) {
            case 'FILL':
                organized.colors.push(optimizedStyle);
                break;
            case 'TEXT':
                organized.typography.push(optimizedStyle);
                break;
            case 'EFFECT':
                organized.effects.push(optimizedStyle);
                break;
            case 'GRID':
                organized.grids.push(optimizedStyle);
                break;
        }
    });
    
    return organized;
}

/**
 * Infers the type of Figma file based on content
 * @param {object} figmaData - Raw Figma data
 * @returns {string} Inferred file type
 */
function inferFileType(figmaData) {
    const componentCount = figmaData.components ? Object.keys(figmaData.components).length : 0;
    const styleCount = figmaData.styles ? Object.keys(figmaData.styles).length : 0;
    
    if (componentCount > 10 && styleCount > 5) {
        return 'Design System';
    } else if (componentCount > 5) {
        return 'Component Library';
    } else if (styleCount > 10) {
        return 'Style Guide';
    } else {
        return 'Design File';
    }
}

/**
 * Categorizes styles by type
 * @param {object} styles - Figma styles object
 * @returns {object} Style categories with counts
 */
function categorizeStyles(styles) {
    const categories = {};
    Object.values(styles).forEach(style => {
        const type = style.styleType;
        categories[type] = (categories[type] || 0) + 1;
    });
    return categories;
}

/**
 * Extracts design tokens from the file
 * @param {object} figmaData - Raw Figma data
 * @returns {object} Design tokens summary
 */
function extractDesignTokens(figmaData) {
    const tokens = {
        colors: [],
        typography: [],
        spacing: [],
        borderRadius: []
    };
    
    // Extract from styles if available
    if (figmaData.styles) {
        Object.values(figmaData.styles).forEach(style => {
            if (style.styleType === 'FILL') {
                tokens.colors.push(style.name);
            } else if (style.styleType === 'TEXT') {
                tokens.typography.push(style.name);
            }
        });
    }
    
    return tokens;
}

/**
 * Helper functions for extracting node properties
 */
function extractSize(node) {
    if (node.absoluteBoundingBox) {
        return {
            width: node.absoluteBoundingBox.width,
            height: node.absoluteBoundingBox.height
        };
    }
    return null;
}

function extractPosition(node) {
    if (node.absoluteBoundingBox) {
        return {
            x: node.absoluteBoundingBox.x,
            y: node.absoluteBoundingBox.y
        };
    }
    return null;
}

function extractTextStyle(node) {
    if (node.style) {
        return {
            fontFamily: node.style.fontFamily,
            fontSize: node.style.fontSize,
            fontWeight: node.style.fontWeight,
            textAlign: node.style.textAlignHorizontal
        };
    }
    return null;
}

/**
 * Generates available detail options
 * @param {object} figmaData - Raw Figma data
 * @returns {object} Available detail options
 */
function generateAvailableDetails(figmaData) {
    const available = {};
    
    if (figmaData.components && Object.keys(figmaData.components).length > 0) {
        available.components = `${Object.keys(figmaData.components).length} components available`;
    }
    
    if (figmaData.styles && Object.keys(figmaData.styles).length > 0) {
        available.styles = `${Object.keys(figmaData.styles).length} styles available`;
    }
    
    if (figmaData.document && figmaData.document.children) {
        available.structure = `${figmaData.document.children.length} pages with detailed layout`;
    }
    
    return available;
}

/**
 * Checks if there's more content available for a given optimization level
 * @param {object} figmaData - Raw Figma data
 * @param {string} optimization - Current optimization level
 * @returns {boolean} True if more content is available
 */
function hasMoreContent(figmaData, optimization) {
    const level = OPTIMIZATION_LEVELS[optimization];
    
    if (!level.includeComponents && figmaData.components) return true;
    if (!level.includeStyles && figmaData.styles) return true;
    if (!level.includeStructure && figmaData.document) return true;
    
    return false;
}

module.exports = {
    optimizeFigmaFile,
    OPTIMIZATION_LEVELS
};