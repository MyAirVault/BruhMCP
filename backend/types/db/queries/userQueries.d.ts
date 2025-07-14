/**
 * Find user by email address
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User record or null
 */
export function findUserByEmail(email: string): Promise<Object | null>;
/**
 * Find user by ID
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Object|null>} User record or null
 */
export function findUserById(userId: string): Promise<Object | null>;
/**
 * Create new user
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} [userData.name] - User name
 * @returns {Promise<Object>} Created user record
 */
export function createUser(userData: {
    email: string;
    name?: string | undefined;
}): Promise<Object>;
/**
 * Find existing user or create new one (upsert pattern)
 * @param {string} email - User email
 * @param {string} [name] - User name
 * @returns {Promise<Object>} User record (existing or newly created)
 */
export function findOrCreateUser(email: string, name?: string): Promise<Object>;
/**
 * Update user information
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.name] - User name
 * @param {string} [updateData.email] - User email
 * @returns {Promise<Object|null>} Updated user record or null
 */
export function updateUser(userId: string, updateData: {
    name?: string | undefined;
    email?: string | undefined;
}): Promise<Object | null>;
/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
export function getUserStats(userId: string): Promise<Object>;
//# sourceMappingURL=userQueries.d.ts.map