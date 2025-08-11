/**
 * Create a new user account
 * @param {Object} userData - User registration data
 * @param {string} userData.firstName - User's first name
 * @param {string} userData.lastName - User's last name
 * @param {string} userData.email - User's email address
 * @param {string} userData.passwordHash - Hashed password
 * @param {boolean} [userData.isVerified=false] - Email verification status
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, isVerified: boolean, createdAt: Date, updatedAt: Date}>} Created user data with ID
 */
export function createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    isVerified?: boolean | undefined;
}): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Find user by email address
 * @param {string} email - User's email address
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, password_hash: string, isVerified: boolean, is_verified: number, razorpayCustomerId: string|null, createdAt: Date, updatedAt: Date, lastLoginAt: Date|null, isActive: boolean}|null>} User data or null if not found
 */
export function findUserByEmail(email: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password_hash: string;
    isVerified: boolean;
    is_verified: number;
    razorpayCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    isActive: boolean;
} | null>;
/**
 * Find user by ID
 * @param {string} userId - User's UUID
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, password_hash: string, isVerified: boolean, is_verified: number, razorpayCustomerId: string|null, createdAt: Date, updatedAt: Date, lastLoginAt: Date|null, isActive: boolean}|null>} User data or null if not found
 */
export function findUserById(userId: string): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password_hash: string;
    isVerified: boolean;
    is_verified: number;
    razorpayCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    isActive: boolean;
} | null>;
/**
 * Update user data
 * @param {string} userId - User's UUID
 * @param {Object} updateData - Data to update
 * @returns {Promise<{id: string, firstName: string, lastName: string, email: string, isVerified: boolean, razorpayCustomerId: string|null, createdAt: Date, updatedAt: Date, lastLoginAt: Date|null, isActive: boolean}>} Updated user data
 */
export function updateUser(userId: string, updateData: Object): Promise<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
    razorpayCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    isActive: boolean;
}>;
/**
 * Update user password
 * @param {string} userId - User's UUID
 * @param {string} newPasswordHash - New hashed password
 * @returns {Promise<boolean>} Success status
 */
export function updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean>;
/**
 * Mark user email as verified
 * @param {string} userId - User's UUID
 * @returns {Promise<boolean>} Success status
 */
export function markEmailAsVerified(userId: string): Promise<boolean>;
/**
 * Update user's last login timestamp
 * @param {string} userId - User's UUID
 * @returns {Promise<boolean>} Success status
 */
export function updateLastLogin(userId: string): Promise<boolean>;
/**
 * Check if user exists with email (including unverified users)
 * @param {string} email - User's email address
 * @returns {Promise<{id: string, isVerified: boolean, is_verified: number, isActive: boolean}|null>} Minimal user data or null
 */
export function checkUserExists(email: string): Promise<{
    id: string;
    isVerified: boolean;
    is_verified: number;
    isActive: boolean;
} | null>;
/**
 * Soft delete user (mark as inactive)
 * @param {string} userId - User's UUID
 * @returns {Promise<boolean>} Success status
 */
export function deactivateUser(userId: string): Promise<boolean>;
//# sourceMappingURL=authQueries.d.ts.map