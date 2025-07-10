/**
 * Calculate expiration date based on option
 * @param {string} option - Expiration option
 * @returns {Date|null} Expiration date or null for 'never'
 */
export function calculateExpirationDate(option) {
	if (option === 'never') return null;

	const now = new Date();

	switch (option) {
		case '1h':
			return new Date(now.getTime() + 60 * 60 * 1000);
		case '6h':
			return new Date(now.getTime() + 6 * 60 * 60 * 1000);
		case '1day':
			return new Date(now.getTime() + 24 * 60 * 60 * 1000);
		case '30days':
			return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
		default:
			return null;
	}
}
