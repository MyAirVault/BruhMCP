/**
 * Calculate expiration date based on option
 * @param {string} option - Expiration option
 * @returns {Date|null} Expiration date or null for 'never'
 */
export function calculateExpirationDate(option: string): Date | null;
/**
 * Generate consistent access URL for MCP instances
 * @param {number|null} assignedPort - The port number assigned to the instance
 * @param {string} instanceId - The instance UUID
 * @param {string} mcpTypeName - The MCP type name
 * @returns {string|null} The formatted access URL or null if no port assigned
 */
export function generateAccessUrl(assignedPort: number | null, instanceId: string, mcpTypeName: string): string | null;
//# sourceMappingURL=utils.d.ts.map