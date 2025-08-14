/**
 * User profile route functions
 * Handles user profile retrieval business logic
 */

const { findUserById } = require('../../db/queries/authQueries');
const { getUserSubscriptionSummary } = require('../../utils/razorpay/subscriptionLimits');


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
             res.status(401).json({
                success: false,
                message: 'User ID not found in session'
            });
            return
        }
        
        // Fetch complete user data from database
        const user = await findUserById(userId);
        
        if (!user) {
             res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return
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


/**
 * Handle get user plan summary
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>}
 */
async function handleGetUserPlan(req, res) {
    try {
        // Get user ID from auth middleware
        const userId = req.user?.userId || req.user?.id;
        
        if (!userId) {
             res.status(401).json({
                success: false,
                message: 'User ID not found in session'
            });
            return
        }
        
        // Get user subscription data using the consolidated subscription limits system
        const subscriptionDataRaw = await getUserSubscriptionSummary(userId);
        
        /** @type {any} */
        const subscriptionData = subscriptionDataRaw;
        
        const planData = {
            userId: subscriptionData.userId,
            plan: {
                type: subscriptionData.subscription?.planCode || 'free',
                maxInstances: subscriptionData.maxInstances,
                features: subscriptionData.plan?.features || [],
                expiresAt: subscriptionData.subscription?.currentPeriodEnd || null,
                createdAt: subscriptionData.subscription?.createdAt || new Date().toISOString()
            },
            isActive: subscriptionData.isActive,
            activeInstances: subscriptionData.activeInstances,
            maxInstances: subscriptionData.maxInstances,
            canCreate: subscriptionData.canCreate,
            message: subscriptionData.message,
            usage: subscriptionData.usage
        };
        
        res.json({
            success: true,
            message: 'User plan retrieved successfully',
            data: planData
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Get user plan failed:', errorMessage);
        
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user plan'
        });
    } finally {
        console.debug('Get user plan process completed');
    }
}


// Export functions
module.exports = {
    handleGetProfile,
    handleGetUserPlan
};