/**
 * Authentication utilities for Figma service
 */

/**
 * Extract API key from request headers
 * @param {{ headers: Record<string, string>, query: Record<string, string> }} req - Express request object
 * @returns {string|null} API key if found, null otherwise
 */
export function extractApiKey(req) {
  // Check X-API-Key header (standard)
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'];
  }
  
  // Check Authorization header with Bearer token
  if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
  }
  
  // Check query parameter (less secure, for testing)
  if (req.query.api_key) {
    return req.query.api_key;
  }
  
  return null;
}

/**
 * Validate API key format and structure
 * @param {string} apiKey - API key to validate
 */
export function validateApiKey(apiKey) {
  if (!apiKey) {
    return {
      isValid: false,
      error: 'API key is required'
    };
  }
  
  if (typeof apiKey !== 'string') {
    return {
      isValid: false,
      error: 'API key must be a string'
    };
  }
  
  if (!apiKey.startsWith('figd_')) {
    return {
      isValid: false,
      error: 'Invalid Figma API key format. Must start with "figd_"'
    };
  }
  
  if (apiKey.length < 20) {
    return {
      isValid: false,
      error: 'API key appears to be too short'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}

/**
 * Create authentication middleware for routes
 */
export function createAuthMiddleware() {
  return (req, res, next) => {
    const apiKey = extractApiKey(req);
    const validation = validateApiKey(apiKey || '');
    
    if (!validation.isValid) {
      return res.status(401).json({
        error: validation.error,
        message: 'Valid Figma API key required'
      });
    }
    
    // Attach API key to request for use in handlers
    req.figmaApiKey = apiKey;
    next();
  };
}