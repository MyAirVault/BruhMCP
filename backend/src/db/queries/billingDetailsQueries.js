import { pool } from '../config.js';

/**
 * @typedef {Object} BillingDetails
 * @property {string} billing_id - Unique billing ID
 * @property {string} user_id - User ID
 * @property {string} address_line1 - Required first line of billing address
 * @property {string} [address_line2] - Optional second line of billing address
 * @property {string} city - City
 * @property {string} state - State/Province
 * @property {string} country - Country
 * @property {string} zip_code - ZIP/Postal code
 * @property {Array} cards - Array of card objects
 * @property {string} [default_card_id] - Default card ID from payment gateway
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} BillingDetailsInput
 * @property {string} address_line1 - Required first line of billing address
 * @property {string} [address_line2] - Optional second line of billing address
 * @property {string} city - City
 * @property {string} state - State/Province
 * @property {string} country - Country
 * @property {string} zip_code - ZIP/Postal code
 * @property {Array} [cards] - Array of card objects
 * @property {string} [default_card_id] - Default card ID from payment gateway
 */

/**
 * Get billing details for a user
 * @param {string} userId - User ID
 * @returns {Promise<BillingDetails|null>} Billing details or null if not found
 */
export async function getBillingDetailsByUserId(userId) {
	const query = `
		SELECT 
			billing_id,
			user_id,
			address_line1,
			address_line2,
			city,
			state,
			country,
			zip_code,
			cards,
			default_card_id,
			created_at,
			updated_at
		FROM user_billing_details
		WHERE user_id = $1
	`;
	
	const result = await pool.query(query, [userId]);
	return result.rows[0] || null;
}

/**
 * Create or update billing details for a user
 * @param {string} userId - User ID
 * @param {BillingDetailsInput} billingData - Billing details data
 * @returns {Promise<BillingDetails>} Created or updated billing details
 */
export async function upsertBillingDetails(userId, billingData) {
	const {
		address_line1,
		address_line2 = null,
		city,
		state,
		country,
		zip_code,
		cards = [],
		default_card_id = null
	} = billingData;

	const query = `
		INSERT INTO user_billing_details (
			user_id,
			address_line1,
			address_line2,
			city,
			state,
			country,
			zip_code,
			cards,
			default_card_id
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id) 
		DO UPDATE SET
			address_line1 = EXCLUDED.address_line1,
			address_line2 = EXCLUDED.address_line2,
			city = EXCLUDED.city,
			state = EXCLUDED.state,
			country = EXCLUDED.country,
			zip_code = EXCLUDED.zip_code,
			cards = EXCLUDED.cards,
			default_card_id = EXCLUDED.default_card_id,
			updated_at = CURRENT_TIMESTAMP
		RETURNING 
			billing_id,
			user_id,
			address_line1,
			address_line2,
			city,
			state,
			country,
			zip_code,
			cards,
			default_card_id,
			created_at,
			updated_at
	`;

	const result = await pool.query(query, [
		userId,
		address_line1,
		address_line2,
		city,
		state,
		country,
		zip_code,
		JSON.stringify(cards),
		default_card_id
	]);

	return result.rows[0];
}

/**
 * Add a card to user's billing details
 * @param {string} userId - User ID
 * @param {Object} cardData - Card data from payment gateway
 * @param {boolean} setAsDefault - Whether to set this card as default
 * @returns {Promise<BillingDetails>} Updated billing details
 */
export async function addCardToBillingDetails(userId, cardData, setAsDefault = false) {
	const billingDetails = await getBillingDetailsByUserId(userId);
	
	if (!billingDetails) {
		throw new Error('Billing details not found. Please add billing address first.');
	}

	const cards = billingDetails.cards || [];
	cards.push(cardData);

	const updateData = {
		...billingDetails,
		cards,
		default_card_id: setAsDefault ? cardData.id : billingDetails.default_card_id
	};

	return await upsertBillingDetails(userId, updateData);
}

/**
 * Remove a card from user's billing details
 * @param {string} userId - User ID
 * @param {string} cardId - Card ID to remove
 * @returns {Promise<BillingDetails>} Updated billing details
 */
export async function removeCardFromBillingDetails(userId, cardId) {
	const billingDetails = await getBillingDetailsByUserId(userId);
	
	if (!billingDetails) {
		throw new Error('Billing details not found.');
	}

	const cards = (billingDetails.cards || []).filter(card => card.id !== cardId);
	let defaultCardId = billingDetails.default_card_id;

	// If the removed card was the default, unset default
	if (defaultCardId === cardId) {
		defaultCardId = cards.length > 0 ? cards[0].id : null;
	}

	const updateData = {
		...billingDetails,
		cards,
		default_card_id: defaultCardId
	};

	return await upsertBillingDetails(userId, updateData);
}

/**
 * Set default card for a user
 * @param {string} userId - User ID
 * @param {string} cardId - Card ID to set as default
 * @returns {Promise<BillingDetails>} Updated billing details
 */
export async function setDefaultCard(userId, cardId) {
	const billingDetails = await getBillingDetailsByUserId(userId);
	
	if (!billingDetails) {
		throw new Error('Billing details not found.');
	}

	const cards = billingDetails.cards || [];
	const cardExists = cards.some(card => card.id === cardId);

	if (!cardExists) {
		throw new Error('Card not found in user billing details.');
	}

	const updateData = {
		...billingDetails,
		default_card_id: cardId
	};

	return await upsertBillingDetails(userId, updateData);
}

/**
 * Delete billing details for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteBillingDetails(userId) {
	const query = `
		DELETE FROM user_billing_details
		WHERE user_id = $1
		RETURNING billing_id
	`;
	
	const result = await pool.query(query, [userId]);
	return result.rowCount > 0;
}