import { atomicActivateProSubscription } from '../../db/queries/userPlansQueries.js';
import { findUserByEmail } from '../../db/queries/userQueries.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

/**
 * Manually upgrade a user to Pro plan (admin only)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function manualUpgrade(req, res) {
	try {
		const { email, subscriptionId } = req.body;

		if (!email || !subscriptionId) {
			return res.status(400).json({
				error: {
					code: 'MISSING_FIELDS',
					message: 'Email and subscriptionId are required'
				}
			});
		}

		// Get user by email
		const user = await findUserByEmail(email);
		if (!user) {
			return res.status(404).json({
				error: {
					code: 'USER_NOT_FOUND',
					message: `User not found with email: ${email}`
				}
			});
		}

		console.log(`🔧 Manual upgrade initiated for user ${user.id} (${email}) with subscription ${subscriptionId}`);

		// Calculate expiry date (30 days from now)
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30);

		// Activate Pro subscription
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
		res.status(500).json(ErrorResponses.INTERNAL_SERVER_ERROR(error.message));
	}
}