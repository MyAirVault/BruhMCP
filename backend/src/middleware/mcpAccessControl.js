// @ts-check
import { getMCPInstanceById } from '../db/queries/mcpInstancesQueries.js';
import { ErrorResponses } from '../utils/errorResponse.js';

/**
 * Middleware to check if MCP instance is active and accessible
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export async function checkMCPAccess(req, res, next) {
	try {
		// Extract MCP ID from the URL path
		const pathParts = req.path.split('/');
		const mcpIdIndex = pathParts.findIndex(/** @param {string} part */ part => part.length === 36); // UUID length

		if (mcpIdIndex === -1) {
			return ErrorResponses.invalidInput(res, 'Invalid MCP instance ID in request path');
		}

		const mcpId = pathParts[mcpIdIndex];

		// Get MCP instance details  
		const mcpInstance = await getMCPInstanceById(mcpId, req.user?.userId || '');

		if (!mcpInstance) {
			return ErrorResponses.instanceNotFound(res, mcpId);
		}

		// Check if MCP is active
		if (mcpInstance.status !== 'active') {
			return ErrorResponses.instanceUnavailable(res, mcpId, {
				metadata: { status: mcpInstance.status }
			});
		}

		// Check if MCP is expired
		if (mcpInstance.expires_at && new Date() > mcpInstance.expires_at) {
			return ErrorResponses.forbidden(res, 'MCP instance has expired', {
				instanceId: mcpId,
				metadata: { expired_at: mcpInstance.expires_at }
			});
		}

		// Add MCP instance to request for use in handlers
		req.mcpInstance = mcpInstance;

		next();
	} catch (error) {
		console.error('Error checking MCP access:', error);
		return ErrorResponses.internal(res, 'Failed to validate MCP access');
	}
}

/**
 * Middleware specifically for MCP routes that extracts instance ID from URL
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export function mcpRouteAccessControl(req, res, next) {
	// This middleware should be applied to the MCP routes
	// It will check access before any MCP endpoints are reached
	checkMCPAccess(req, res, next);
}
