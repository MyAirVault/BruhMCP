/**
 * @typedef {Object} Card
 * @property {string} id - Card ID from payment gateway
 * @property {string} brand - Card brand (Visa, MasterCard, etc.)
 * @property {string} last4 - Last 4 digits of card
 * @property {number} exp_month - Expiration month
 * @property {number} exp_year - Expiration year
 */
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
 * @property {Card[]} cards - Array of card objects
 * @property {string|null} [default_card_id] - Default card ID from payment gateway
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
 * @property {Card[]} [cards] - Array of card objects
 * @property {string|null} [default_card_id] - Default card ID from payment gateway
 */
/**
 * Get billing details for a user
 * @param {string} userId - User ID
 * @returns {Promise<BillingDetails|null>} Billing details or null if not found
 */
export function getBillingDetailsByUserId(userId: string): Promise<BillingDetails | null>;
/**
 * Create or update billing details for a user
 * @param {string} userId - User ID
 * @param {BillingDetailsInput} billingData - Billing details data
 * @returns {Promise<BillingDetails>} Created or updated billing details
 */
export function upsertBillingDetails(userId: string, billingData: BillingDetailsInput): Promise<BillingDetails>;
/**
 * Add a card to user's billing details
 * @param {string} userId - User ID
 * @param {Card} cardData - Card data from payment gateway
 * @param {boolean} [setAsDefault=false] - Whether to set this card as default
 * @returns {Promise<BillingDetails>} Updated billing details
 */
export function addCardToBillingDetails(userId: string, cardData: Card, setAsDefault?: boolean): Promise<BillingDetails>;
/**
 * Remove a card from user's billing details
 * @param {string} userId - User ID
 * @param {string} cardId - Card ID to remove
 * @returns {Promise<BillingDetails>} Updated billing details
 */
export function removeCardFromBillingDetails(userId: string, cardId: string): Promise<BillingDetails>;
/**
 * Set default card for a user
 * @param {string} userId - User ID
 * @param {string} cardId - Card ID to set as default
 * @returns {Promise<BillingDetails>} Updated billing details
 */
export function setDefaultCard(userId: string, cardId: string): Promise<BillingDetails>;
/**
 * Delete billing details for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export function deleteBillingDetails(userId: string): Promise<boolean>;
export type Card = {
    /**
     * - Card ID from payment gateway
     */
    id: string;
    /**
     * - Card brand (Visa, MasterCard, etc.)
     */
    brand: string;
    /**
     * - Last 4 digits of card
     */
    last4: string;
    /**
     * - Expiration month
     */
    exp_month: number;
    /**
     * - Expiration year
     */
    exp_year: number;
};
export type BillingDetails = {
    /**
     * - Unique billing ID
     */
    billing_id: string;
    /**
     * - User ID
     */
    user_id: string;
    /**
     * - Required first line of billing address
     */
    address_line1: string;
    /**
     * - Optional second line of billing address
     */
    address_line2?: string | undefined;
    /**
     * - City
     */
    city: string;
    /**
     * - State/Province
     */
    state: string;
    /**
     * - Country
     */
    country: string;
    /**
     * - ZIP/Postal code
     */
    zip_code: string;
    /**
     * - Array of card objects
     */
    cards: Card[];
    /**
     * - Default card ID from payment gateway
     */
    default_card_id?: string | null | undefined;
    /**
     * - Creation timestamp
     */
    created_at: Date;
    /**
     * - Last update timestamp
     */
    updated_at: Date;
};
export type BillingDetailsInput = {
    /**
     * - Required first line of billing address
     */
    address_line1: string;
    /**
     * - Optional second line of billing address
     */
    address_line2?: string | undefined;
    /**
     * - City
     */
    city: string;
    /**
     * - State/Province
     */
    state: string;
    /**
     * - Country
     */
    country: string;
    /**
     * - ZIP/Postal code
     */
    zip_code: string;
    /**
     * - Array of card objects
     */
    cards?: Card[] | undefined;
    /**
     * - Default card ID from payment gateway
     */
    default_card_id?: string | null | undefined;
};
//# sourceMappingURL=billingDetailsQueries.d.ts.map