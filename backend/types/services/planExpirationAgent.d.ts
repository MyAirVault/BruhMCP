/**
 * Get all users with expired pro plans that still have active instances
 * @returns {Promise<Array>} Array of users with expired plans and active instances
 */
export function getExpiredProUsersWithActiveInstances(): Promise<any[]>;
/**
 * Process a single expired pro user - deactivate instances and downgrade plan
 * @param {Object} user - User object with expired plan
 * @returns {Promise<Object>} Processing result
 */
export function processExpiredProUser(user: Object): Promise<Object>;
/**
 * Run the plan expiration agent - process all expired pro users
 * @returns {Promise<Object>} Overall processing result
 */
export function runPlanExpirationAgent(): Promise<Object>;
/**
 * Check if there are any users that need plan expiration processing
 * @returns {Promise<Object>} Check result with count of users needing processing
 */
export function checkForExpiredUsers(): Promise<Object>;
/**
 * Schedule the plan expiration agent to run periodically
 * @param {number} intervalMinutes - How often to run the agent (in minutes)
 * @returns {NodeJS.Timeout} Timer object for the scheduled job
 */
export function schedulePlanExpirationAgent(intervalMinutes?: number): NodeJS.Timeout;
//# sourceMappingURL=planExpirationAgent.d.ts.map