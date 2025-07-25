/**
 * Response size limiting middleware for Reddit MCP
 * Prevents memory issues with large responses by implementing size limits
 */

/**
 * Response size limits configuration
 */
const SIZE_LIMITS = {
  // Maximum response size in bytes
  maxResponseSize: 10 * 1024 * 1024, // 10MB
  
  // Tool-specific limits
  toolLimits: {
    'get_subreddit_posts': 2 * 1024 * 1024, // 2MB
    'get_user_posts': 2 * 1024 * 1024, // 2MB
    'get_user_comments': 2 * 1024 * 1024, // 2MB
    'get_post_comments': 1 * 1024 * 1024, // 1MB
    'search_posts': 1 * 1024 * 1024, // 1MB
    'search_subreddits': 512 * 1024, // 512KB
    'get_subscriptions': 1 * 1024 * 1024, // 1MB
    'get_inbox_messages': 1 * 1024 * 1024, // 1MB
    'get_subreddit_info': 256 * 1024, // 256KB
    'get_user_info': 256 * 1024, // 256KB
    'get_post_by_id': 512 * 1024, // 512KB
  },
  
  // String length limits for different content types
  stringLimits: {
    title: 300,
    comment: 40000,
    message: 10000,
    description: 5000,
    url: 2000
  }
};

/**
 * Creates response size limiting middleware
 * @param {Object} options - Size limit options
 * @returns {Function} Express middleware function
 */
export function createResponseSizeLimitMiddleware(options = {}) {
  const config = {
    ...SIZE_LIMITS,
    ...options
  };
  
  return (/** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
    const operation = req.body?.method;
    const toolName = req.body?.params?.name;
    
    if (operation !== 'tools/call' || !toolName) {
      return next();
    }
    
    // Get size limit for this tool
    const sizeLimit = /** @type {Record<string, number>} */ (config.toolLimits)[/** @type {keyof typeof config.toolLimits} */ (toolName)] || config.maxResponseSize;
    
    // Intercept response to check size
    const originalJson = res.json;
    
    res.json = function(/** @type {Record<string, Record<string, Record<string, {result?: {content?: Array<{type: string, text: string}>}} | unknown>>} */ data) {
      try {
        // Calculate response size
        const responseString = JSON.stringify(data);
        const responseSize = Buffer.byteLength(responseString, 'utf8');
        
        // Check if response exceeds size limit
        if (responseSize > sizeLimit) {
          console.warn(`⚠️ Response size limit exceeded for ${toolName}: ${responseSize} bytes (limit: ${sizeLimit} bytes)`);
          
          // Try to truncate the response
          const truncatedData = truncateResponse(data, sizeLimit, toolName);
          
          // Add size limit headers
          res.set({
            'X-Response-Size': responseSize.toString(),
            'X-Response-Size-Limit': sizeLimit.toString(),
            'X-Response-Truncated': 'true'
          });
          
          return originalJson.call(this, truncatedData);
        }
        
        // Add size headers for successful responses
        res.set({
          'X-Response-Size': responseSize.toString(),
          'X-Response-Size-Limit': sizeLimit.toString(),
          'X-Response-Truncated': 'false'
        });
        
      } catch (error) {
        console.error('Response size limit middleware error:', error);
        // Don't fail the request due to size checking issues
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Truncate response to fit within size limit
 * @param {Object} data - Response data
 * @param {number} sizeLimit - Size limit in bytes
 * @param {string} toolName - Tool name for context
 * @returns {Object} Truncated response
 */
function truncateResponse(data, sizeLimit, toolName) {
  try {
    // For MCP responses, the main content is in result.content
    if (data.result && data.result.content) {
      const content = data.result.content;
      
      // Find text content to truncate
      const textContent = content.find(item => item.type === 'text');
      
      if (textContent && textContent.text) {
        // Calculate overhead (everything except the text content)
        const overhead = JSON.stringify({
          ...data,
          result: {
            ...data.result,
            content: [{
              type: 'text',
              text: ''
            }]
          }
        });
        
        const overheadSize = Buffer.byteLength(overhead, 'utf8');
        const availableSize = sizeLimit - overheadSize - 1000; // Leave 1KB buffer
        
        if (availableSize > 0) {
          // Truncate the text content intelligently
          const truncatedText = truncateText(textContent.text, availableSize, toolName);
          
          return {
            ...data,
            result: {
              ...data.result,
              content: [{
                type: 'text',
                text: truncatedText
              }]
            }
          };
        }
      }
    }
    
    // Fallback: return error response if can't truncate properly
    return {
      jsonrpc: '2.0',
      id: data.id,
      error: {
        code: -32000,
        message: 'Response too large',
        data: {
          originalSize: Buffer.byteLength(JSON.stringify(data), 'utf8'),
          sizeLimit: sizeLimit,
          toolName: toolName
        }
      }
    };
    
  } catch (error) {
    console.error('Response truncation error:', error);
    
    // Return error response
    return {
      jsonrpc: '2.0',
      id: data.id,
      error: {
        code: -32000,
        message: 'Response processing error',
        data: {
          error: error.message,
          toolName: toolName
        }
      }
    };
  }
}

/**
 * Truncate text content intelligently
 * @param {string} text - Text to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @param {string} toolName - Tool name for context
 * @returns {string} Truncated text
 */
function truncateText(text, maxSize, toolName) {
  try {
    // If text is already small enough, return as is
    if (Buffer.byteLength(text, 'utf8') <= maxSize) {
      return text;
    }
    
    // Tool-specific truncation strategies
    switch (toolName) {
      case 'get_subreddit_posts':
      case 'get_user_posts':
        return truncatePostList(text, maxSize);
      
      case 'get_user_comments':
      case 'get_post_comments':
        return truncateCommentList(text, maxSize);
      
      case 'search_posts':
      case 'search_subreddits':
        return truncateSearchResults(text, maxSize);
      
      default:
        return truncateGeneric(text, maxSize);
    }
    
  } catch (error) {
    console.error('Text truncation error:', error);
    return truncateGeneric(text, maxSize);
  }
}

/**
 * Truncate post list responses
 * @param {string} text - Post list text
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated text
 */
function truncatePostList(text, maxSize) {
  const lines = text.split('\n');
  const truncatedLines = [];
  let currentSize = 0;
  
  for (const line of lines) {
    const lineSize = Buffer.byteLength(line + '\n', 'utf8');
    
    if (currentSize + lineSize > maxSize - 200) { // Leave space for truncation message
      break;
    }
    
    truncatedLines.push(line);
    currentSize += lineSize;
  }
  
  // Add truncation message
  const truncationMessage = `\n\n⚠️ Response truncated due to size limits. Showing ${truncatedLines.length} items.`;
  truncatedLines.push(truncationMessage);
  
  return truncatedLines.join('\n');
}

/**
 * Truncate comment list responses
 * @param {string} text - Comment list text
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated text
 */
function truncateCommentList(text, maxSize) {
  const lines = text.split('\n');
  const truncatedLines = [];
  let currentSize = 0;
  
  for (const line of lines) {
    const lineSize = Buffer.byteLength(line + '\n', 'utf8');
    
    if (currentSize + lineSize > maxSize - 200) { // Leave space for truncation message
      break;
    }
    
    truncatedLines.push(line);
    currentSize += lineSize;
  }
  
  // Add truncation message
  const truncationMessage = `\n\n⚠️ Response truncated due to size limits. Showing partial comments.`;
  truncatedLines.push(truncationMessage);
  
  return truncatedLines.join('\n');
}

/**
 * Truncate search results
 * @param {string} text - Search results text
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated text
 */
function truncateSearchResults(text, maxSize) {
  const lines = text.split('\n');
  const truncatedLines = [];
  let currentSize = 0;
  
  for (const line of lines) {
    const lineSize = Buffer.byteLength(line + '\n', 'utf8');
    
    if (currentSize + lineSize > maxSize - 200) { // Leave space for truncation message
      break;
    }
    
    truncatedLines.push(line);
    currentSize += lineSize;
  }
  
  // Add truncation message
  const truncationMessage = `\n\n⚠️ Search results truncated due to size limits. Try narrowing your search.`;
  truncatedLines.push(truncationMessage);
  
  return truncatedLines.join('\n');
}

/**
 * Generic text truncation
 * @param {string} text - Text to truncate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string} Truncated text
 */
function truncateGeneric(text, maxSize) {
  const truncationMessage = '\n\n⚠️ Response truncated due to size limits.';
  const availableSize = maxSize - Buffer.byteLength(truncationMessage, 'utf8');
  
  if (availableSize <= 0) {
    return truncationMessage;
  }
  
  // Truncate by bytes, not characters
  let truncated = '';
  let currentSize = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charSize = Buffer.byteLength(char, 'utf8');
    
    if (currentSize + charSize > availableSize) {
      break;
    }
    
    truncated += char;
    currentSize += charSize;
  }
  
  return truncated + truncationMessage;
}

/**
 * Validate content string length
 * @param {string} content - Content to validate
 * @param {string} type - Content type
 * @throws {Error} If content exceeds length limit
 */
export function validateContentLength(content, type) {
  if (!content || typeof content !== 'string') {
    return;
  }
  
  const limit = SIZE_LIMITS.stringLimits[type];
  if (limit && content.length > limit) {
    throw new Error(`${type} exceeds maximum length of ${limit} characters`);
  }
}

/**
 * Update size limits configuration
 * @param {Object} newLimits - New size limits
 */
export function updateSizeLimits(newLimits) {
  Object.assign(SIZE_LIMITS, newLimits);
  console.log('⚙️ Updated response size limits:', SIZE_LIMITS);
}

/**
 * Get current size limits configuration
 * @returns {Object} Current size limits
 */
export function getSizeLimits() {
  return { ...SIZE_LIMITS };
}

/**
 * Get size limit for a specific tool
 * @param {string} toolName - Tool name
 * @returns {number} Size limit in bytes
 */
export function getToolSizeLimit(toolName) {
  return SIZE_LIMITS.toolLimits[toolName] || SIZE_LIMITS.maxResponseSize;
}

/**
 * Format size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}