import { atomicActivateProSubscription } from '../../db/queries/userPlansQueries.js';
import { findUserByEmail } from '../../db/queries/userQueries.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

/**
 * Manually upgrade a user to Pro plan (admin only)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function manualUpgrade(req, res) {
	try {
		const { email, subscriptionId } = req.body;

		if (!email || !subscriptionId) {
			res.status(400).json({
				error: {
					code: 'MISSING_FIELDS',
					message: 'Email and subscriptionId are required'
				}
			});
			return;
		}

		// Get user by email
		const user = await findUserByEmail(email);
		if (!user) {
			res.status(404).json({
				error: {
					code: 'USER_NOT_FOUND',
					message: `User not found with email: ${email}`
				}
			});
			return;
		}

		console.log(`🔧 Manual upgrade initiated for user ${user.id} (${email}) with subscription ${subscriptionId}`);

		// Calculate expiry date (30 days from now)
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);

		// Activate Pro subscription
		/** @type {any} */
		const result = await atomicActivateProSubscription(
			user.id,
			subscriptionId,
			expiresAt
		);

		console.log(`✅ Manual upgrade completed for user ${user.id}`);

		res.json({
			message: 'User successfully upgraded to Pro plan',
			data: {
				userId: user.id,
				email: email,
				subscriptionId: subscriptionId,
				status: result.status,
				plan: result.plan
			}
		});

	} catch (error) {
		console.error('Error in manual upgrade:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		ErrorResponses.internal(res, errorMessage);
		return;
	}
}