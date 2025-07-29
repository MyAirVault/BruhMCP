/**
 * Response caching middleware for Reddit MCP
 * Handles caching of API responses to improve performance
 */

const { getCachedResponse, setCachedResponse  } = require('../services/responseCache');

/**
 * Cache configuration for different Reddit operations
 */
const CACHE_MAPPINGS = {
  'get_subreddit_info': {
    type: 'subreddit_info',
    getParams: (/** @type {Record<string, string>} */ args) => ({ subreddit: args.subreddit }),
    ttl: 10 * 60 * 1000 // 10 minutes
  },
  'get_subreddit_posts': {
    type: 'subreddit_posts',
    getParams: (/** @type {Record<string, string|number>} */ args) => ({ 
      subreddit: args.subreddit, 
      sort: args.sort || 'hot', 
      limit: args.limit || 25,
      time: args.time || 'day'
    }),
    ttl: 2 * 60 * 1000 // 2 minutes
  },
  'get_user_info': {
    type: 'user_info',
    getParams: (/** @type {Record<string, string>} */ args) => ({ username: args.username }),
    ttl: 5 * 60 * 1000 // 5 minutes
  },
  'get_user_posts': {
    type: 'user_posts',
    getParams: (/** @type {Record<string, string|number>} */ args) => ({ 
      username: args.username,
      sort: args.sort || 'new',
      limit: args.limit || 25,
      time: args.time || 'all'
    }),
    ttl: 3 * 60 * 1000 // 3 minutes
  },
  'get_user_comments': {
    type: 'user_comments',
    getParams: (/** @type {Record<string, string|number>} */ args) => ({ 
      username: args.username,
      sort: args.sort || 'new',
      limit: args.limit || 25,
      time: args.time || 'all'
    }),
    ttl: 3 * 60 * 1000 // 3 minutes
  },
  'get_subscriptions': {
    type: 'subscriptions',
    getParams: (/** @type {Record<string, number>} */ args) => ({ limit: args.limit || 100 }),
    ttl: 5 * 60 * 1000 // 5 minutes
  },
  'search_posts': {
    type: 'search_results',
    getParams: (/** @type {Record<string, string|number>} */ args) => ({ 
      query: args.query,
      subreddit: args.subreddit || '',
      sort: args.sort || 'relevance',
      limit: args.limit || 25,
      time: args.time || 'all'
    }),
    ttl: 1 * 60 * 1000 // 1 minute
  },
  'search_subreddits': {
    type: 'search_results',
    getParams: (/** @type {Record<string, string|number>} */ args) => ({ 
      query: args.query,
      limit: args.limit || 25
    }),
    ttl: 1 * 60 * 1000 // 1 minute
  }
};

/**
 * Create response caching middleware
 * @param {Object} options - Cache options
 * @returns {Function} Middleware function
 */
function createResponseCacheMiddleware(options = /** @type {{enabled?: boolean, skipCacheForErrors?: boolean, skipCacheForPrivate?: boolean}} */ ({})) {
  const { 
    enabled = true,
    skipCacheForErrors = true,
    skipCacheForPrivate = true
  } = /** @type {{enabled?: boolean, skipCacheForErrors?: boolean, skipCacheForPrivate?: boolean}} */ (options);
  
  return (/** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
    if (!enabled) {
      return next();
    }
    
    // Only cache for specific MCP operations
    const operation = req.body?.method;
    const args = req.body?.params?.arguments || {};
    
    if (operation !== 'tools/call' || !args || !req.body?.params?.name) {
      return next();
    }
    
    const toolName = req.body.params.name;
    const cacheMapping = /** @type {typeof CACHE_MAPPINGS} */ (CACHE_MAPPINGS)[/** @type {keyof typeof CACHE_MAPPINGS} */ (toolName)];
    
    if (!cacheMapping) {
      return next();
    }
    
    const instanceId = /** @type {string} */ (req.instanceId);
    const params = cacheMapping.getParams(args);
    
    // Skip caching for private operations (if configured)
    if (skipCacheForPrivate && isPrivateOperation(toolName)) {
      return next();
    }
    
    // Try to get cached response
    const cachedResponse = getCachedResponse(cacheMapping.type, instanceId, params);
    
    if (cachedResponse) {
      console.log(`🎯 Cache hit for ${toolName}: ${instanceId}`);
      
      // Add cache headers
      res.set({
        'X-Cache-Status': 'HIT',
        'X-Cache-Key': `${cacheMapping.type}:${instanceId}`,
        'X-Cache-TTL': Math.floor(cacheMapping.ttl / 1000).toString()
      });
      
      // Return cached response in MCP format
       res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          content: [
            {
              type: 'text',
              text: cachedResponse
            }
          ]
        }
      });
      return 
    }
    
    // Cache miss - intercept response to cache it
    const originalJson = res.json;
    
    res.json = function(/** @type {{result?: {content?: Array<{type: string, text: string}>}, error?: boolean}} */ data) {
      try {
        // Check if response should be cached
        const shouldCache = !skipCacheForErrors || !data.error;
        
        if (shouldCache && data.result && data.result.content) {
          // Extract the text content to cache
          const textContent = data.result.content
            .filter((/** @type {{type: string}} */ item) => item.type === 'text')
            .map((/** @type {{text: string}} */ item) => item.text)
            .join('');
          
          if (textContent) {
            setCachedResponse(
              cacheMapping.type,
              instanceId,
              params,
              textContent,
              cacheMapping.ttl
            );
            
            console.log(`💾 Cached response for ${toolName}: ${instanceId}`);
          }
        }
        
        // Add cache headers
        res.set({
          'X-Cache-Status': 'MISS',
          'X-Cache-Key': `${cacheMapping.type}:${instanceId}`,
          'X-Cache-TTL': Math.floor(cacheMapping.ttl / 1000).toString()
        });
        
      } catch (error) {
        console.error('Cache middleware error:', error);
        // Don't fail the request due to cache issues
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Check if operation is private and shouldn't be cached
 * @param {string} toolName - Tool name
 * @returns {boolean} True if private operation
 */
function isPrivateOperation(toolName) {
  const privateOperations = [
    'get_inbox_messages',
    'send_message',
    'submit_post',
    'submit_comment',
    'vote_on_post',
    'vote_on_comment',
    'subscribe_to_subreddit',
    'unsubscribe_from_subreddit',
    'mark_as_read'
  ];
  
  return privateOperations.includes(toolName);
}

/**
 * Create cache invalidation middleware
 * Invalidates cache entries when data changes
 * @returns {Function} Middleware function
 */
function createCacheInvalidationMiddleware() {
  return (/** @type {import('express').Request} */ req, /** @type {import('express').Response} */ res, /** @type {import('express').NextFunction} */ next) => {
    const operation = req.body?.method;
    const toolName = req.body?.params?.name;
    
    if (operation !== 'tools/call' || !toolName) {
      return next();
    }
    
    // Operations that should invalidate cache
    const invalidationMappings = {
      'submit_post': ['subreddit_posts', 'user_posts'],
      'submit_comment': ['user_comments'],
      'vote_on_post': ['subreddit_posts', 'user_posts'],
      'vote_on_comment': ['user_comments'],
      'subscribe_to_subreddit': ['subscriptions'],
      'unsubscribe_from_subreddit': ['subscriptions']
    };
    
    const typesToInvalidate = /** @type {Record<string, string[]>} */ (invalidationMappings)[/** @type {keyof typeof invalidationMappings} */ (toolName)];
    
    if (!typesToInvalidate) {
      return next();
    }
    
    // Intercept response to invalidate cache after successful operations
    const originalJson = res.json;
    
    res.json = function(/** @type {Record<string, Record<string, boolean>|Record<string, unknown>>} */ data) {
      try {
        // Only invalidate if operation was successful
        if (!data.error && data.result) {
          const instanceId = req.instanceId;
          
          // Import cache service functions
          import('../services/responseCache.js').then(({ clearInstanceCache }) => {
            // For simplicity, clear all cache for the instance
            // In a more sophisticated implementation, we'd selectively clear
            clearInstanceCache(/** @type {string} */ (instanceId));
            console.log(`🗑️ Cache invalidated for instance ${instanceId} after ${toolName}`);
          }).catch(err => {
            console.error('Cache invalidation error:', err);
          });
        }
        
      } catch (error) {
        console.error('Cache invalidation middleware error:', error);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Get cache mappings configuration
 * @returns {Object} Cache mappings
 */
function getCacheMappings() {
  return { ...CACHE_MAPPINGS };
}

/**
 * Update cache mappings
 * @param {Object} newMappings - New cache mappings
 */
function updateCacheMappings(newMappings) {
  Object.assign(CACHE_MAPPINGS, newMappings);
  console.log('⚙️ Updated cache mappings:', CACHE_MAPPINGS);
}

module.exports = {
  createResponseCacheMiddleware,
  isPrivateOperation,
  createCacheInvalidationMiddleware,
  getCacheMappings,
  updateCacheMappings
};