/**
 * Saved Cards Controller - Handles fetching saved payment methods from Razorpay
 * @fileoverview Manages retrieval of customer's saved cards from Razorpay
 */

import { razorpay } from '../services/paymentGateway.js';
import { getUserPlan } from '../../db/queries/userPlansQueries.js';
import { ErrorResponses } from '../../utils/errorResponse.js';

/**
 * Get saved cards for the authenticated user from Razorpay
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getSavedCards(req, res) {
	try {
		const userId = req.user.id;

		// Get user plan to retrieve customer_id
		const userPlan = await getUserPlan(userId);
		
		if (!userPlan || !userPlan.customer_id) {
			return res.json({
				message: 'No saved cards found',
				data: {
					cards: [],
					customerId: null
				}
			});
		}

		// Fetch saved tokens/cards from Razorpay
		try {
			// Razorpay API to fetch customer's saved tokens
			const tokens = await razorpay.customers.fetchTokens(userPlan.customer_id);
			
			// Format the cards data
			const formattedCards = tokens.items.map(token => ({
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

		} catch (razorpayError) {
			// If customer doesn't exist or has no saved cards
			if (razorpayError.statusCode === 400 || razorpayError.statusCode === 404) {
				return res.json({
					message: 'No saved cards found',
					data: {
						cards: [],
						customerId: userPlan.customer_id
					}
				});
			}
			throw razorpayError;
		}

	} catch (error) {
		console.error('Error fetching saved cards:', error);
		res.status(500).json(ErrorResponses.INTERNAL_SERVER_ERROR(error.message));
	}
}