import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
	getBillingDetailsByUserId,
	upsertBillingDetails,
	addCardToBillingDetails,
	removeCardFromBillingDetails,
	setDefaultCard,
	deleteBillingDetails
} from '../db/queries/billingDetailsQueries.js';

const router = express.Router();

/**
 * @route GET /api/billing-details
 * @desc Get billing details for authenticated user
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		const billingDetails = await getBillingDetailsByUserId(userId);

		if (!billingDetails) {
			return res.status(404).json({
				success: false,
				message: 'Billing details not found'
			});
		}

		// Parse cards if it's a string (shouldn't be needed with JSONB, but just in case)
		if (billingDetails.cards && typeof billingDetails.cards === 'string') {
			billingDetails.cards = JSON.parse(billingDetails.cards);
		}

		res.json({
			success: true,
			data: billingDetails
		});
	} catch (error) {
		console.error('Error fetching billing details:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to fetch billing details'
			}
		});
	}
});

/**
 * @route POST /api/billing-details
 * @desc Create or update billing details for authenticated user
 * @access Private
 */
router.post('/', authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		const {
			address_line1,
			address_line2,
			city,
			state,
			country,
			zip_code,
			cards,
			default_card_id
		} = req.body;

		// Validate required fields
		if (!address_line1 || !city || !state || !country || !zip_code) {
			return res.status(400).json({
				success: false,
				message: 'Required fields: address_line1, city, state, country, zip_code'
			});
		}

		const billingDetails = await upsertBillingDetails(userId, {
			address_line1,
			address_line2,
			city,
			state,
			country,
			zip_code,
			cards,
			default_card_id
		});

		res.json({
			success: true,
			data: billingDetails,
			message: 'Billing details saved successfully'
		});
	} catch (error) {
		console.error('Error saving billing details:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to save billing details'
			}
		});
	}
});

/**
 * @route POST /api/billing-details/cards
 * @desc Add a card to user's billing details
 * @access Private
 */
router.post('/cards', authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		const { cardData, setAsDefault = false } = req.body;

		if (!cardData || !cardData.id) {
			return res.status(400).json({
				success: false,
				message: 'Card data with ID is required'
			});
		}

		const billingDetails = await addCardToBillingDetails(userId, cardData, setAsDefault);

		res.json({
			success: true,
			data: billingDetails,
			message: 'Card added successfully'
		});
	} catch (error) {
		console.error('Error adding card:', error);
		
		if (error.message.includes('Billing details not found')) {
			return res.status(404).json({
				success: false,
				message: error.message
			});
		}

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to add card'
			}
		});
	}
});

/**
 * @route DELETE /api/billing-details/cards/:cardId
 * @desc Remove a card from user's billing details
 * @access Private
 */
router.delete('/cards/:cardId', authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		const { cardId } = req.params;

		const billingDetails = await removeCardFromBillingDetails(userId, cardId);

		res.json({
			success: true,
			data: billingDetails,
			message: 'Card removed successfully'
		});
	} catch (error) {
		console.error('Error removing card:', error);

		if (error.message.includes('Billing details not found')) {
			return res.status(404).json({
				success: false,
				message: error.message
			});
		}

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to remove card'
			}
		});
	}
});

/**
 * @route PUT /api/billing-details/cards/:cardId/default
 * @desc Set a card as default
 * @access Private
 */
router.put('/cards/:cardId/default', authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		const { cardId } = req.params;

		const billingDetails = await setDefaultCard(userId, cardId);

		res.json({
			success: true,
			data: billingDetails,
			message: 'Default card updated successfully'
		});
	} catch (error) {
		console.error('Error setting default card:', error);

		if (error.message.includes('not found')) {
			return res.status(404).json({
				success: false,
				message: error.message
			});
		}

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to set default card'
			}
		});
	}
});

/**
 * @route DELETE /api/billing-details
 * @desc Delete billing details for authenticated user
 * @access Private
 */
router.delete('/', authenticate, async (req, res) => {
	try {
		const userId = req.user.id;
		const deleted = await deleteBillingDetails(userId);

		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: 'Billing details not found'
			});
		}

		res.json({
			success: true,
			message: 'Billing details deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting billing details:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Failed to delete billing details'
			}
		});
	}
});

export default router;