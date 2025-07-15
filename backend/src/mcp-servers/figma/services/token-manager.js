/**
 * Token Management Service for LLM-optimized responses
 * Provides token estimation, response chunking, and size management
 */

/**
 * Estimates token count for a given text or JSON object
 * Uses the common approximation of ~4 characters per token
 * @param {string|object} content - Content to estimate tokens for
 * @returns {number} Estimated token count
 */
function estimateTokenCount(content) {
    let text;
    
    if (typeof content === 'object') {
        text = JSON.stringify(content);
    } else {
        text = String(content);
    }
    
    // Rough estimation: ~4 characters per token for most models
    // This accounts for both text content and JSON structure overhead
    return Math.ceil(text.length / 4);
}

/**
 * Checks if content exceeds the specified token limit
 * @param {string|object} content - Content to check
 * @param {number} maxTokens - Maximum allowed tokens
 * @returns {boolean} True if content exceeds limit
 */
function exceedsTokenLimit(content, maxTokens = 20000) {
    return estimateTokenCount(content) > maxTokens;
}

/**
 * Truncates content to fit within token limits while preserving structure
 * @param {object} data - Data object to truncate
 * @param {number} maxTokens - Maximum allowed tokens
 * @returns {object} Truncated data with metadata
 */
function truncateToTokenLimit(data, maxTokens = 20000) {
    const originalTokens = estimateTokenCount(data);
    
    if (originalTokens <= maxTokens) {
        return {
            data,
            truncated: false,
            originalTokens,
            finalTokens: originalTokens
        };
    }
    
    // Progressive truncation strategy
    let truncatedData = { ...data };
    
    // 1. Remove large arrays first (geometry, effects, fills)
    if (truncatedData.document && truncatedData.document.children) {
        truncatedData = truncateNodeArrays(truncatedData, maxTokens * 0.8);
    }
    
    // 2. Remove detailed properties if still too large
    if (estimateTokenCount(truncatedData) > maxTokens) {
        truncatedData = removeDetailedProperties(truncatedData, maxTokens * 0.7);
    }
    
    // 3. Limit text content if still too large
    if (estimateTokenCount(truncatedData) > maxTokens) {
        truncatedData = limitTextContent(truncatedData, maxTokens * 0.6);
    }
    
    const finalTokens = estimateTokenCount(truncatedData);
    
    return {
        data: truncatedData,
        truncated: true,
        originalTokens,
        finalTokens,
        reductionRatio: finalTokens / originalTokens
    };
}

/**
 * Removes large array properties from nodes to reduce size
 * @param {object} data - Data to process
 * @param {number} targetTokens - Target token count
 * @returns {object} Processed data
 */
function truncateNodeArrays(data, targetTokens) {
    function processNode(node) {
        if (!node || typeof node !== 'object') return node;
        
        const processed = { ...node };
        
        // Remove heavy properties that are often not needed for LLM analysis
        const heavyProperties = [
            'fills', 'strokes', 'effects', 'exportSettings',
            'relativeTransform', 'absoluteTransform', 'absoluteBoundingBox',
            'absoluteRenderBounds', 'constraints', 'layoutPositioning'
        ];
        
        heavyProperties.forEach(prop => {
            if (processed[prop]) {
                delete processed[prop];
            }
        });
        
        // Recursively process children but limit depth
        if (processed.children && Array.isArray(processed.children)) {
            processed.children = processed.children.slice(0, 20).map(processNode);
            processed.childrenTruncated = processed.children.length < node.children.length;
        }
        
        return processed;
    }
    
    if (data.document) {
        data.document = processNode(data.document);
    }
    
    return data;
}

/**
 * Removes detailed properties while keeping essential structure
 * @param {object} data - Data to process
 * @param {number} targetTokens - Target token count
 * @returns {object} Processed data
 */
function removeDetailedProperties(data, targetTokens) {
    function simplifyNode(node) {
        if (!node || typeof node !== 'object') return node;
        
        // Keep only essential properties for LLM understanding
        const essentialProps = [
            'id', 'name', 'type', 'visible', 'locked',
            'width', 'height', 'x', 'y',
            'children', 'characters', 'style'
        ];
        
        const simplified = {};
        essentialProps.forEach(prop => {
            if (node[prop] !== undefined) {
                if (prop === 'children' && Array.isArray(node[prop])) {
                    simplified[prop] = node[prop].map(simplifyNode);
                } else if (prop === 'style' && typeof node[prop] === 'object') {
                    // Simplify style object
                    simplified[prop] = {
                        fontFamily: node[prop].fontFamily,
                        fontSize: node[prop].fontSize,
                        fontWeight: node[prop].fontWeight,
                        textAlignHorizontal: node[prop].textAlignHorizontal
                    };
                } else {
                    simplified[prop] = node[prop];
                }
            }
        });
        
        return simplified;
    }
    
    if (data.document) {
        data.document = simplifyNode(data.document);
    }
    
    // Simplify other top-level properties
    if (data.components) {
        const componentKeys = Object.keys(data.components).slice(0, 50);
        data.components = {};
        componentKeys.forEach(key => {
            data.components[key] = {
                key,
                name: data.components[key].name,
                description: data.components[key].description
            };
        });
    }
    
    return data;
}

/**
 * Limits text content in nodes to prevent token overflow
 * @param {object} data - Data to process
 * @param {number} targetTokens - Target token count
 * @returns {object} Processed data
 */
function limitTextContent(data, targetTokens) {
    function limitNodeText(node) {
        if (!node || typeof node !== 'object') return node;
        
        const processed = { ...node };
        
        // Limit text content
        if (processed.characters && typeof processed.characters === 'string') {
            if (processed.characters.length > 200) {
                processed.characters = processed.characters.substring(0, 200) + '...';
                processed.textTruncated = true;
            }
        }
        
        // Limit children array
        if (processed.children && Array.isArray(processed.children)) {
            processed.children = processed.children.slice(0, 10).map(limitNodeText);
            if (processed.children.length < node.children.length) {
                processed.childrenLimited = true;
            }
        }
        
        return processed;
    }
    
    if (data.document) {
        data.document = limitNodeText(data.document);
    }
    
    return data;
}

/**
 * Creates a continuation token for chunked responses
 * @param {string} fileKey - Figma file key
 * @param {string} operation - Operation type
 * @param {object} parameters - Additional parameters
 * @returns {string} Base64 encoded continuation token
 */
function createContinuationToken(fileKey, operation, parameters = {}) {
    const tokenData = {
        fileKey,
        operation,
        timestamp: Date.now(),
        parameters
    };
    
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

/**
 * Parses a continuation token
 * @param {string} token - Base64 encoded continuation token
 * @returns {object|null} Parsed token data or null if invalid
 */
function parseContinuationToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const data = JSON.parse(decoded);
        
        // Check if token is not too old (1 hour limit)
        if (Date.now() - data.timestamp > 3600000) {
            return null;
        }
        
        return data;
    } catch (error) {
        return null;
    }
}

/**
 * Determines optimal chunk size for large responses
 * @param {number} totalTokens - Total estimated tokens
 * @param {number} maxTokensPerChunk - Maximum tokens per chunk
 * @returns {object} Chunking strategy
 */
function calculateChunkingStrategy(totalTokens, maxTokensPerChunk = 20000) {
    const numChunks = Math.ceil(totalTokens / maxTokensPerChunk);
    const recommendedChunkSize = Math.floor(totalTokens / numChunks);
    
    return {
        totalTokens,
        numChunks,
        recommendedChunkSize,
        strategy: numChunks <= 3 ? 'progressive' : 'summary_first'
    };
}

module.exports = {
    estimateTokenCount,
    exceedsTokenLimit,
    truncateToTokenLimit,
    createContinuationToken,
    parseContinuationToken,
    calculateChunkingStrategy
};