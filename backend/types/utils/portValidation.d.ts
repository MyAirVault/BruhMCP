/**
 * Validate if a port is within the valid MCP port range
 * @param {number} port - Port number to validate
 * @returns {boolean} True if port is valid
 */
export function isValidMCPPort(port: number): boolean;
/**
 * Validate environment variable port range against database constraints
 * @param {number} rangeStart - Start of port range
 * @param {number} rangeEnd - End of port range
 * @throws {Error} If range doesn't match database constraints
 */
export function validatePortRange(rangeStart: number, rangeEnd: number): void;
/**
 * Get the valid port range
 * @returns {Object} Valid port range
 */
export function getValidPortRange(): Object;
/**
 * Validate port assignment for database operations
 * @param {number|null} port - Port to validate (null is allowed for deactivated instances)
 * @throws {Error} If port is invalid
 */
export function validatePortAssignment(port: number | null): void;
//# sourceMappingURL=portValidation.d.ts.map