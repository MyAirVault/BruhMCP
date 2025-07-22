/**
 * @typedef {Object} ExpiredProUser
 * @property {number} user_id - User ID
 * @property {string} plan_type - Plan type (should be 'pro')
 * @property {Date|string} plan_expires_at - When the plan expired
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {number} active_instance_count - Number of active instances
 */
/**
 * @typedef {Object} PlanCancellationResult
 * @property {number} deactivatedInstances - Number of instances deactivated
 * @property {string} newPlan - New plan type after downgrade
 * @property {string} message - Result message
 */
/**
 * @typedef {Object} ProcessResult
 * @property {boolean} success - Whether processing was successful
 * @property {number} userId - User ID
 * @property {string} email - User email
 * @property {number} [deactivatedInstances] - Number of instances deactivated (on success)
 * @property {string} [newPlan] - New plan type (on success)
 * @property {string} [message] - Result message
 * @property {string} [error] - Error message (on failure)
 */
/**
 * @typedef {Object} AgentResult
 * @property {boolean} success - Overall success status
 * @property {number} processed - Number of users processed
 * @property {number} [successCount] - Number of successful processes
 * @property {number} [errorCount] - Number of failed processes
 * @property {ProcessResult[]} [results] - Individual processing results
 * @property {number} duration - Processing duration in milliseconds
 * @property {string} message - Overall result message
 * @property {string} [error] - Error message (on failure)
 */
/**
 * @typedef {Object} ExpiredUserCheck
 * @property {boolean} hasExpiredUsers - Whether there are expired users
 * @property {number} count - Number of expired users
 * @property {Array<{userId: number, email: string, planExpiredAt: Date|string, activeInstances: number}>} users - List of expired users
 * @property {string} [error] - Error message if check failed
 */
/**
 * Get all users with expired pro plans that still have active instances
 * @returns {Promise<ExpiredProUser[]>} Array of users with expired plans and active instances
 */
export function getExpiredProUsersWithActiveInstances(): Promise<ExpiredProUser[]>;
/**
 * Process a single expired pro user - deactivate instances and downgrade plan
 * @param {ExpiredProUser} user - User object with expired plan
 * @returns {Promise<ProcessResult>} Processing result
 */
export function processExpiredProUser(user: ExpiredProUser): Promise<ProcessResult>;
/**
 * Run the plan expiration agent - process all expired pro users
 * @returns {Promise<AgentResult>} Overall processing result
 */
export function runPlanExpirationAgent(): Promise<AgentResult>;
/**
 * Check if there are any users that need plan expiration processing
 * @returns {Promise<ExpiredUserCheck>} Check result with count of users needing processing
 */
export function checkForExpiredUsers(): Promise<ExpiredUserCheck>;
/**
 * Schedule the plan expiration agent to run periodically
 * @param {number} intervalMinutes - How often to run the agent (in minutes)
 * @returns {NodeJS.Timeout} Timer object for the scheduled job
 */
export function schedulePlanExpirationAgent(intervalMinutes?: number): NodeJS.Timeout;
export type ExpiredProUser = {
    /**
     * - User ID
     */
    user_id: number;
    /**
     * - Plan type (should be 'pro')
     */
    plan_type: string;
    /**
     * - When the plan expired
     */
    plan_expires_at: Date | string;
    /**
     * - User email
     */
    email: string;
    /**
     * - User name
     */
    name: string;
    /**
     * - Number of active instances
     */
    active_instance_count: number;
};
export type PlanCancellationResult = {
    /**
     * - Number of instances deactivated
     */
    deactivatedInstances: number;
    /**
     * - New plan type after downgrade
     */
    newPlan: string;
    /**
     * - Result message
     */
    message: string;
};
export type ProcessResult = {
    /**
     * - Whether processing was successful
     */
    success: boolean;
    /**
     * - User ID
     */
    userId: number;
    /**
     * - User email
     */
    email: string;
    /**
     * - Number of instances deactivated (on success)
     */
    deactivatedInstances?: number | undefined;
    /**
     * - New plan type (on success)
     */
    newPlan?: string | undefined;
    /**
     * - Result message
     */
    message?: string | undefined;
    /**
     * - Error message (on failure)
     */
    error?: string | undefined;
};
export type AgentResult = {
    /**
     * - Overall success status
     */
    success: boolean;
    /**
     * - Number of users processed
     */
    processed: number;
    /**
     * - Number of successful processes
     */
    successCount?: number | undefined;
    /**
     * - Number of failed processes
     */
    errorCount?: number | undefined;
    /**
     * - Individual processing results
     */
    results?: ProcessResult[] | undefined;
    /**
     * - Processing duration in milliseconds
     */
    duration: number;
    /**
     * - Overall result message
     */
    message: string;
    /**
     * - Error message (on failure)
     */
    error?: string | undefined;
};
export type ExpiredUserCheck = {
    /**
     * - Whether there are expired users
     */
    hasExpiredUsers: boolean;
    /**
     * - Number of expired users
     */
    count: number;
    /**
     * - List of expired users
     */
    users: Array<{
        userId: number;
        email: string;
        planExpiredAt: Date | string;
        activeInstances: number;
    }>;
    /**
     * - Error message if check failed
     */
    error?: string | undefined;
};
//# sourceMappingURL=planExpirationAgent.d.ts.map