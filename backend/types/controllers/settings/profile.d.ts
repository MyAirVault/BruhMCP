/**
 * Handle get user profile
 * Retrieves current user's profile information
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user profile data
 */
export function handleGetProfile(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Handle update user profile
 * Updates user's profile information with validation
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with updated profile data
 */
export function handleUpdateProfile(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Calculate profile completeness percentage
 * Helps users understand how complete their profile is
 *
 * @param {Object} user - User data object
 * @param {string} user.firstName - User's first name
 * @param {string} user.lastName - User's last name
 * @param {string} user.email - User's email
 * @param {boolean} user.isVerified - User's verification status
 * @param {string|null} [user.razorpayCustomerId] - User's Razorpay customer ID
 * @returns {Object} Profile completeness data
 */
export function calculateProfileCompleteness(user: {
    firstName: string;
    lastName: string;
    email: string;
    isVerified: boolean;
    razorpayCustomerId?: string | null | undefined;
}): Object;
/**
 * Generate profile completion suggestions
 * Provides actionable suggestions to improve profile completeness
 *
 * @param {Array<string>} missingFields - Array of missing field names
 * @param {number} completenessPercentage - Current completeness percentage
 * @returns {Array<string>} Array of suggestions
 */
export function generateCompletionSuggestions(missingFields: Array<string>, completenessPercentage: number): Array<string>;
//# sourceMappingURL=profile.d.ts.map