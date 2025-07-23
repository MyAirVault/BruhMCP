// @ts-check

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {Request & {user: {id: number}}} AuthenticatedRequest
 */

import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
	getBillingDetailsByUserId,
	upsertBillingDetails,
	addCardToBillingDetails,
	removeCardFromBillingDetails,
	setDefaultCard,
	deleteBillingDetails,
} from '../db/queries/billingDetailsQueries.js';

const router = express.Router();

/**
 * @route GET /api/billing-details
 * @desc Get billing details for authenticated user
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
router.get('/', authenticate, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const billingDetails = await getBillingDetailsByUserId(userId);

		if (!billingDetails) {
			res.status(404).json({
				success: false,
				message: 'Billing details not found',
			});
			return;
		}

		// Parse cards if it's a string (shouldn't be needed with JSONB, but just in case)
		if (billingDetails.cards && typeof billingDetails.cards === 'string') {
			billingDetails.cards = JSON.parse(billingDetails.cards);
		}

		res.json({
			success: true,
			data: billingDetails,
		});
		return;
	} catch (error) {
		console.error('Error fetching billing details:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch billing details',
			},
		});
		return;
	}
});

/**
 * @route POST /api/billing-details
 * @desc Create or update billing details for authenticated user
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
router.post('/', authenticate, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { address_line1, address_line2, city, state, country, zip_code, cards, default_card_id } = req.body;

		// Validate required fields
		if (!address_line1 || !city || !state || !country || !zip_code) {
			res.status(400).json({
				success: false,
				message: 'Required fields: address_line1, city, state, country, zip_code',
			});
			return;
		}

		const billingDetails = await upsertBillingDetails(userId, {
			address_line1,
			address_line2,
			city,
			state,
			country,
			zip_code,
			cards,
			default_card_id,
		});

		res.json({
			success: true,
			data: billingDetails,
			message: 'Billing details saved successfully',
		});
		return;
	} catch (error) {
		console.error('Error saving billing details:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to save billing details',
			},
		});
		return;
	}
});

/**
 * @route POST /api/billing-details/cards
 * @desc Add a card to user's billing details
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
router.post('/cards', authenticate, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { cardData, setAsDefault = false } = req.body;

		if (!cardData || !cardData.id) {
			res.status(400).json({
				success: false,
				message: 'Card data with ID is required',
			});
			return;
		}

		const billingDetails = await addCardToBillingDetails(userId, cardData, setAsDefault);

		res.json({
			success: true,
			data: billingDetails,
			message: 'Card added successfully',
		});
		return;
	} catch (error) {
		console.error('Error adding card:', error);

		if (error instanceof Error && error.message.includes('Billing details not found')) {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to add card',
			},
		});
		return;
	}
});

/**
 * @route DELETE /api/billing-details/cards/:cardId
 * @desc Remove a card from user's billing details
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
router.delete('/cards/:cardId', authenticate, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { cardId } = req.params;

		const billingDetails = await removeCardFromBillingDetails(userId, cardId);

		res.json({
			success: true,
			data: billingDetails,
			message: 'Card removed successfully',
		});
		return;
	} catch (error) {
		console.error('Error removing card:', error);

		if (error instanceof Error && error.message.includes('Billing details not found')) {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to remove card',
			},
		});
		return;
	}
});

/**
 * @route PUT /api/billing-details/cards/:cardId/default
 * @desc Set a card as default
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
router.put('/cards/:cardId/default', authenticate, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const { cardId } = req.params;

		const billingDetails = await setDefaultCard(userId, cardId);

		res.json({
			success: true,
			data: billingDetails,
			message: 'Default card updated successfully',
		});
		return;
	} catch (error) {
		console.error('Error setting default card:', error);

		if (error instanceof Error && error.message.includes('not found')) {
			res.status(404).json({
				success: false,
				message: error.message,
			});
			return;
		}

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to set default card',
			},
		});
		return;
	}
});

/**
 * @route DELETE /api/billing-details
 * @desc Delete billing details for authenticated user
 * @access Private
 * @param {AuthenticatedRequest} req - Express request object with authenticated user
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
router.delete('/', authenticate, async (req, res) => {
	try {
		const userId = String(req.user?.id);
		const deleted = await deleteBillingDetails(userId);

		if (!deleted) {
			res.status(404).json({
				success: false,
				message: 'Billing details not found',
			});
			return;
		}

		res.json({
			success: true,
			message: 'Billing details deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting billing details:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete billing details',
			},
		});
	}
});

export default router;
