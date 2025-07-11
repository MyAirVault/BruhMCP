/**
 * Calculate expiration date based on option
 * @param {string} option - Expiration option
 * @returns {Date|null} Expiration date or null for 'never'
 */
export function calculateExpirationDate(option) {
	if (option === 'never') return null;

	const now = new Date();

	switch (option) {
		case '1h':
			return new Date(now.getTime() + 60 * 60 * 1000);
		case '6h':
			return new Date(now.getTime() + 6 * 60 * 60 * 1000);
		case '1day':
			return new Date(now.getTime() + 24 * 60 * 60 * 1000);
		case '30days':
			return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
		default:
			return null;
	}
}


/**
 * Generate consistent access URL for MCP instances
 * @param {number|null} assignedPort - The port number assigned to the instance
 * @param {string} instanceId - The instance UUID
 * @param {string} mcpTypeName - The MCP type name
 * @returns {string|null} The formatted access URL or null if no port assigned
 */
export function generateAccessUrl(assignedPort, instanceId, mcpTypeName) {
	if (!assignedPort) return null;
	return `http://localhost:${assignedPort}/${instanceId}/mcp/${mcpTypeName}`;
}
