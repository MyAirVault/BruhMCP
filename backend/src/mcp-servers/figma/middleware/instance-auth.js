/**
 * Instance-based authentication middleware for multi-tenant MCP services
 */

import { getInstanceCredentials, validateInstanceAccess, updateUsageTracking, getApiKeyForInstance } from '../services/database.js';

/**
 * Create instance authentication middleware
 * Validates instance ID and loads user credentials from database
 * @returns {(req: any, res: any, next: any) => Promise<void>} Express middleware function
 */
export function createInstanceAuthMiddleware() {
  return async (req, res, next) => {
    try {
      const { instanceId } = req.params;
      
      // Validate instance ID format
      if (!instanceId) {
        return res.status(400).json({
          error: 'Instance ID is required',
          message: 'URL must include instance ID: /:instanceId/endpoint'
        });
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(instanceId)) {
        return res.status(400).json({
          error: 'Invalid instance ID format',
          message: 'Instance ID must be a valid UUID'
        });
      }

      // Get instance credentials from database
      const instance = await getInstanceCredentials(instanceId);
      
      // Validate instance access
      const validation = validateInstanceAccess(instance);
      
      if (!validation.isValid) {
        return res.status(validation.statusCode).json({
          error: validation.error,
          message: 'Instance access denied',
          instanceId: instanceId
        });
      }

      // Get API key for external service calls
      const apiKey = getApiKeyForInstance(instance);

      // Attach instance data to request for use in handlers
      req.instance = instance;
      req.figmaApiKey = apiKey;
      req.instanceId = instanceId;

      // Update usage tracking (async, non-blocking)
      updateUsageTracking(instanceId).catch(error => {
        console.error('Failed to update usage tracking:', error);
      });

      next();
    } catch (error) {
      console.error('Instance authentication error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: 'Failed to validate instance credentials'
      });
    }
  };
}

/**
 * Create middleware for endpoints that don't require instance authentication
 * Used for health checks and service discovery endpoints
 * @returns {(req: any, res: any, next: any) => void} Express middleware function
 */
export function createPublicMiddleware() {
  return (req, _, next) => {
    // For public endpoints, we may still want to extract instanceId if provided
    // but we don't validate it or require it to be valid
    const { instanceId } = req.params;
    
    if (instanceId) {
      req.instanceId = instanceId;
    }
    
    next();
  };
}