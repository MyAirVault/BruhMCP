/**
 * Calculate expiration date based on option
 * @param {string} option - Expiration option
 * @returns {Date|null} Expiration date or null for 'never'
 */
export function calculateExpirationDate(option: string): Date | null;
/**
 * Generate consistent access URL for MCP instances
 * @param {string} instanceId - The instance UUID
 * @param {string} mcpTypeName - The MCP type name
 * @returns {string} The formatted access URL in format <domain>/<mcp>/uuid
 */
export function generateAccessUrl(instanceId: string, mcpTypeName: string): string;
//# sourceMappingURL=utils.d.ts.map