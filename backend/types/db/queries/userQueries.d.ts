/**
 * @typedef {Object} DatabaseUser
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string|null} name - User name
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */
/**
 * @typedef {Object} UserStats
 * @property {number} total_instances - Total MCP instances
 * @property {number} active_instances - Active MCP instances
 * @property {number} expired_instances - Expired MCP instances
 * @property {number} inactive_instances - Inactive MCP instances
 * @property {string|null} first_instance_created - First instance creation timestamp
 * @property {string|null} last_activity - Last activity timestamp
 */
/**
 * Find user by email address
 * @param {string} email - User email
 * @returns {Promise<DatabaseUser|null>} User record or null
 */
export function findUserByEmail(email: string): Promise<DatabaseUser | null>;
/**
 * Find user by ID
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<DatabaseUser|null>} User record or null
 */
export function findUserById(userId: string): Promise<DatabaseUser | null>;
/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string|null} [userData.name] - User name
 * @returns {Promise<DatabaseUser>} Created user record
 */
export function createUser(userData: {
    email: string;
    name?: string | null | undefined;
}): Promise<DatabaseUser>;
/**
 * Find existing user or create new one (upsert pattern)
 * @param {string} email - User email
 * @param {string|null} [name] - User name
 * @returns {Promise<DatabaseUser>} User record (existing or newly created)
 */
export function findOrCreateUser(email: string, name?: string | null): Promise<DatabaseUser>;
/**
 * Update user information
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string|null} [updateData.name] - User name
 * @param {string} [updateData.email] - User email
 * @returns {Promise<DatabaseUser|null>} Updated user record or null
 */
export function updateUser(userId: string, updateData: {
    name?: string | null | undefined;
    email?: string | undefined;
}): Promise<DatabaseUser | null>;
/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<UserStats>} User statistics
 */
export function getUserStats(userId: string): Promise<UserStats>;
export type DatabaseUser = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User email
     */
    email: string;
    /**
     * - User name
     */
    name: string | null;
    /**
     * - Creation timestamp
     */
    created_at: string;
    /**
     * - Last update timestamp
     */
    updated_at: string;
};
export type UserStats = {
    /**
     * - Total MCP instances
     */
    total_instances: number;
    /**
     * - Active MCP instances
     */
    active_instances: number;
    /**
     * - Expired MCP instances
     */
    expired_instances: number;
    /**
     * - Inactive MCP instances
     */
    inactive_instances: number;
    /**
     * - First instance creation timestamp
     */
    first_instance_created: string | null;
    /**
     * - Last activity timestamp
     */
    last_activity: string | null;
};
//# sourceMappingURL=userQueries.d.ts.map