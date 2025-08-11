/**
 * Get all subscription plans
 * Returns all active plans from the configuration
 */

const { getActivePlans } = require('../../../data/subscription-plans.js');

/**
 * Get all subscription plans
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
async function getAllPlans(req, res) {
	try {
		const plans = getActivePlans();

		res.json({
			success: true,
			message: 'Subscription plans retrieved successfully',
			data: {
				plans,
				total: plans.length,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Failed to get subscription plans:', errorMessage);

		res.status(500).json({
			success: false,
			message: 'Failed to get subscription plans',
		});
	} finally {
		console.debug('Get subscription plans process completed');
	}
}

module.exports = getAllPlans;