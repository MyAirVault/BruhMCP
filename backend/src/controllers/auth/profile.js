/**
 * User profile route functions
 * Handles user profile retrieval business logic
 */

const { findUserById } = require('../../db/queries/authQueries');


/**
 * Handle get user profile
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>}
 */
async function handleGetProfile(req, res) {
    try {
        // Get user ID from auth middleware and fetch full user data
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID not found in session'
            });
        }
        
        // Fetch complete user data from database
        const user = await findUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt
                }
            }
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Get profile failed:', errorMessage);
        
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    } finally {
        console.debug('Get profile process completed');
    }
}


// Export functions
module.exports = {
    handleGetProfile
};