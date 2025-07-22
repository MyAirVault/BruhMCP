/**
 * Saved Cards Controller - Handles fetching saved payment methods from Razorpay
 * @fileoverview Manages retrieval of customer's saved cards from Razorpay
 */

import { getUserPlan } from '../../db/queries/userPlansQueries.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

/**
 * Get saved cards for the authenticated user from Razorpay
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function getSavedCards(req, res) {
	try {
		// Check authentication
		if (!req.user) {
			res.status(401).json({
				error: {
					code: 'UNAUTHORIZED',
					message: 'User not authenticated'
				}
			});
			return;
		}

		const userId = req.user.id;

		// Get user plan to retrieve customer_id
		const userPlan = await getUserPlan(userId);
		
		if (!userPlan || !userPlan.customer_id) {
			res.json({
				message: 'No saved cards found',
				data: {
					cards: [],
					customerId: null
				}
			});
			return;
		}

		// Fetch saved tokens/cards from Razorpay
		try {
			// Import razorpay dynamically
			/** @type {any} */
			const { razorpay } = await import('../services/paymentGateway.js');
			
			// Razorpay API to fetch customer's saved tokens
			/** @type {any} */
			const tokens = await razorpay.customers.fetchTokens(userPlan.customer_id);
			
			// Format the cards data
			/** @type {any[]} */
			const formattedCards = tokens.items.map((/** @type {any} */ token) => ({
				id: token.id,
				last4: token.card.last4,
				network: token.card.network,
				type: token.card.type,
				issuer: token.card.issuer,
				expiryMonth: token.card.expiry_month,
				expiryYear: token.card.expiry_year,
				bank: token.bank,
				wallet: token.wallet,
				method: token.method,
				createdAt: new Date(token.created_at * 1000).toISOString()
			}));

			res.json({
				message: 'Saved cards retrieved successfully',
				data: {
					cards: formattedCards,
					customerId: userPlan.customer_id,
					count: tokens.count
				}
			});
			return;

		} catch (razorpayError) {
			// If customer doesn't exist or has no saved cards
			/** @type {any} */
			const error = razorpayError;
			if (error.statusCode === 400 || error.statusCode === 404) {
				res.json({
					message: 'No saved cards found',
					data: {
						cards: [],
						customerId: userPlan.customer_id
					}
				});
				return;
			}
			throw razorpayError;
		}

	} catch (error) {
		console.error('Error fetching saved cards:', error);
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		ErrorResponses.internal(res, errorMessage);
		return;
	}
}