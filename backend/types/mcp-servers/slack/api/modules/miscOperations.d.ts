/**
 * Create a reminder
 * @param {Object} args - Reminder arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Reminder result
 */
export function createReminder(args: Object, bearerToken: string): Promise<Object>;
/**
 * Get team information
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Team info result
 */
export function getTeamInfo(bearerToken: string): Promise<Object>;
/**
 * Test authentication
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Auth test result
 */
export function testAuth(bearerToken: string): Promise<Object>;
//# sourceMappingURL=miscOperations.d.ts.map