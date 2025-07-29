/**
 * Update user password hash
 * @param {number} userId
 * @param {string} passwordHash
 * @returns {Promise<Object>}
 */
export function updateUserPassword(userId: number, passwordHash: string): Promise<Object>;
/**
 * Get all users with password status for local development
 * @returns {Promise<Array<Object>>}
 */
export function getAllUsersWithPasswordStatus(): Promise<Array<Object>>;
/**
 * Get user with password hash (for password verification)
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export function getUserWithPasswordHash(email: string): Promise<Object | null>;
/**
 * Check if user has password set
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export function userHasPassword(email: string): Promise<boolean>;
//# sourceMappingURL=localUserQueries.d.ts.map