import { getMCPInstanceById } from '../db/queries/mcpInstancesQueries.js';

/**
 * Middleware to check if MCP instance is active and accessible
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
export async function checkMCPAccess(req, res, next) {
	try {
		// Extract MCP ID from the URL path
		const pathParts = req.path.split('/');
		const mcpIdIndex = pathParts.findIndex(part => part.length === 36); // UUID length
		
		if (mcpIdIndex === -1) {
			return res.status(400).json({
				error: 'Invalid MCP instance ID in request path'
			});
		}
		
		const mcpId = pathParts[mcpIdIndex];
		
		// Get MCP instance details
		const mcpInstance = await getMCPInstanceById(mcpId);
		
		if (!mcpInstance) {
			return res.status(404).json({
				error: 'MCP instance not found'
			});
		}
		
		// Check if MCP is active
		if (!mcpInstance.is_active || mcpInstance.status !== 'active') {
			return res.status(403).json({
				error: 'MCP instance is not active',
				status: mcpInstance.status,
				is_active: mcpInstance.is_active
			});
		}
		
		// Check if MCP is expired
		if (mcpInstance.expires_at && new Date() > mcpInstance.expires_at) {
			return res.status(403).json({
				error: 'MCP instance has expired',
				expired_at: mcpInstance.expires_at
			});
		}
		
		// Add MCP instance to request for use in handlers
		req.mcpInstance = mcpInstance;
		
		next();
	} catch (error) {
		console.error('Error checking MCP access:', error);
		res.status(500).json({
			error: 'Failed to validate MCP access'
		});
	}
}

/**
 * Middleware specifically for MCP routes that extracts instance ID from URL
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
export function mcpRouteAccessControl(req, res, next) {
	// This middleware should be applied to the MCP routes
	// It will check access before any MCP endpoints are reached
	checkMCPAccess(req, res, next);
}