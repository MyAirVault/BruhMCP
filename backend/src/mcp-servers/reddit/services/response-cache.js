/**
 * Response caching service for Reddit MCP
 * Implements in-memory caching for frequently accessed Reddit data
 */

// In-memory cache storage
const responseCache = new Map();

// Cache configuration
const CACHE_CONFIG = {
  // Default TTL for different types of data
  ttl: {
    subreddit_info: 10 * 60 * 1000, // 10 minutes
    subreddit_posts: 2 * 60 * 1000, // 2 minutes
    user_info: 5 * 60 * 1000, // 5 minutes
    user_posts: 3 * 60 * 1000, // 3 minutes
    user_comments: 3 * 60 * 1000, // 3 minutes
    subscriptions: 5 * 60 * 1000, // 5 minutes
    search_results: 1 * 60 * 1000, // 1 minute
    default: 60 * 1000 // 1 minute default
  },
  // Maximum number of cached items
  maxSize: 1000,
  // Clean up interval
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
};

// Cache statistics
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  cleanups: 0,
  errors: 0
};

// Cleanup interval
let cleanupIntervalId = null;

/**
 * Initialize response cache
 */
export function initializeResponseCache() {
  console.log('🚀 Initializing Reddit response cache system');
  
  // Clear existing cache
  responseCache.clear();
  
  // Reset statistics
  cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    cleanups: 0,
    errors: 0
  };
  
  // Start cleanup interval
  startCleanupInterval();
  
  console.log('✅ Reddit response cache initialized');
}

/**
 * Generate cache key
 * @param {string} type - Cache type (subreddit_info, user_posts, etc.)
 * @param {string} instanceId - Instance ID
 * @param {Object} params - Request parameters
 * @returns {string} Cache key
 */
function generateCacheKey(type, instanceId, params) {
  // Sort parameters to ensure consistent keys
  const sortedParams = Object.keys(params || {})
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  const paramsString = JSON.stringify(sortedParams);
  return `${type}:${instanceId}:${paramsString}`;
}

/**
 * Get cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Object} params - Request parameters
 * @returns {any|null} Cached response or null if not found/expired
 */
export function getCachedResponse(type, instanceId, params = {}) {
  try {
    const key = generateCacheKey(type, instanceId, params);
    const cached = responseCache.get(key);
    
    if (!cached) {
      cacheStats.misses++;
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      responseCache.delete(key);
      cacheStats.misses++;
      return null;
    }
    
    cacheStats.hits++;
    
    // Update last accessed time
    cached.lastAccessed = Date.now();
    
    console.log(`✅ Cache hit for ${type}: ${key}`);
    return cached.data;
    
  } catch (error) {
    console.error('Cache get error:', error);
    cacheStats.errors++;
    return null;
  }
}

/**
 * Set cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Object} params - Request parameters
 * @param {any} data - Response data to cache
 * @param {number} [customTtl] - Custom TTL in milliseconds
 */
export function setCachedResponse(type, instanceId, params = {}, data, customTtl = null) {
  try {
    const key = generateCacheKey(type, instanceId, params);
    const ttl = customTtl || CACHE_CONFIG.ttl[type] || CACHE_CONFIG.ttl.default;
    
    // Check cache size limit
    if (responseCache.size >= CACHE_CONFIG.maxSize) {
      // Remove oldest entries
      const entries = Array.from(responseCache.entries());
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      
      const toDelete = entries.slice(0, Math.floor(CACHE_CONFIG.maxSize * 0.1));
      toDelete.forEach(([key]) => responseCache.delete(key));
      
      console.log(`🗑️ Cache cleanup: removed ${toDelete.length} old entries`);
    }
    
    const cacheEntry = {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl,
      lastAccessed: Date.now(),
      type,
      instanceId,
      params
    };
    
    responseCache.set(key, cacheEntry);
    cacheStats.sets++;
    
    console.log(`💾 Cached ${type} response for ${Math.floor(ttl / 1000)}s: ${key}`);
    
  } catch (error) {
    console.error('Cache set error:', error);
    cacheStats.errors++;
  }
}

/**
 * Delete cached response
 * @param {string} type - Cache type
 * @param {string} instanceId - Instance ID
 * @param {Object} params - Request parameters
 */
export function deleteCachedResponse(type, instanceId, params = {}) {
  try {
    const key = generateCacheKey(type, instanceId, params);
    const deleted = responseCache.delete(key);
    
    if (deleted) {
      cacheStats.deletes++;
      console.log(`🗑️ Deleted cached response: ${key}`);
    }
    
    return deleted;
    
  } catch (error) {
    console.error('Cache delete error:', error);
    cacheStats.errors++;
    return false;
  }
}

/**
 * Clear all cached responses for an instance
 * @param {string} instanceId - Instance ID
 */
export function clearInstanceCache(instanceId) {
  try {
    const keysToDelete = [];
    
    for (const [key, entry] of responseCache.entries()) {
      if (entry.instanceId === instanceId) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => responseCache.delete(key));
    cacheStats.deletes += keysToDelete.length;
    
    console.log(`🗑️ Cleared cache for instance ${instanceId}: ${keysToDelete.length} entries`);
    
    return keysToDelete.length;
    
  } catch (error) {
    console.error('Cache clear error:', error);
    cacheStats.errors++;
    return 0;
  }
}

/**
 * Clear all cached responses
 */
export function clearAllCache() {
  try {
    const count = responseCache.size;
    responseCache.clear();
    cacheStats.deletes += count;
    
    console.log(`🗑️ Cleared all cache: ${count} entries`);
    
    return count;
    
  } catch (error) {
    console.error('Cache clear all error:', error);
    cacheStats.errors++;
    return 0;
  }
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStatistics() {
  const now = Date.now();
  const entries = Array.from(responseCache.values());
  
  const typeStats = {};
  let expiredCount = 0;
  
  entries.forEach(entry => {
    // Count by type
    if (!typeStats[entry.type]) {
      typeStats[entry.type] = 0;
    }
    typeStats[entry.type]++;
    
    // Count expired entries
    if (now > entry.expiresAt) {
      expiredCount++;
    }
  });
  
  const hitRate = cacheStats.hits + cacheStats.misses > 0 
    ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(2)
    : 0;
  
  return {
    size: responseCache.size,
    maxSize: CACHE_CONFIG.maxSize,
    expiredCount,
    hitRate: `${hitRate}%`,
    statistics: { ...cacheStats },
    typeBreakdown: typeStats,
    memoryUsage: {
      bytes: JSON.stringify(Array.from(responseCache.entries())).length,
      mb: (JSON.stringify(Array.from(responseCache.entries())).length / 1024 / 1024).toFixed(2)
    }
  };
}

/**
 * Start cleanup interval
 */
function startCleanupInterval() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
  }
  
  cleanupIntervalId = setInterval(() => {
    cleanupExpiredEntries();
  }, CACHE_CONFIG.cleanupInterval);
  
  console.log('🔄 Started cache cleanup interval');
}

/**
 * Stop cleanup interval
 */
export function stopCleanupInterval() {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    console.log('⏹️ Stopped cache cleanup interval');
  }
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries() {
  try {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, entry] of responseCache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => responseCache.delete(key));
    
    if (keysToDelete.length > 0) {
      cacheStats.cleanups++;
      console.log(`🧹 Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
    
  } catch (error) {
    console.error('Cache cleanup error:', error);
    cacheStats.errors++;
  }
}

/**
 * Update cache configuration
 * @param {Object} newConfig - New cache configuration
 */
export function updateCacheConfig(newConfig) {
  Object.assign(CACHE_CONFIG, newConfig);
  console.log('⚙️ Updated cache configuration:', CACHE_CONFIG);
}

/**
 * Get cache configuration
 * @returns {Object} Current cache configuration
 */
export function getCacheConfig() {
  return { ...CACHE_CONFIG };
}