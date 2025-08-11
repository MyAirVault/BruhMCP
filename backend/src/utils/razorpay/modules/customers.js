/**
 * Razorpay customer management functions
 * Handles customer creation, fetching, and updates
 */

const { initializeRazorpay } = require('./core');

/**
 * Create a new Razorpay customer
 * @param {Object} customerData - Customer creation data
 * @param {string} customerData.name - Customer name
 * @param {string} customerData.email - Customer email
 * @param {string} [customerData.contact] - Customer phone number
 * @param {string} [customerData.fail_existing] - Fail if customer already exists
 * @param {Object} [customerData.notes] - Additional notes
 * @returns {Promise<Object>} Razorpay customer object with isNew flag
 * @throws {Error} If customer creation fails
 */
async function createRazorpayCustomer(customerData) {
	try {
		const { name, email, contact, fail_existing = '0', notes = {} } = customerData;

		// Validate required fields
		if (!name || !email) {
			throw new Error('Name and email are required for customer creation');
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error('Invalid email format');
		}

		const razorpay = initializeRazorpay();

		/** @type {any} */
		const customerOptions = {
			name,
			email,
			fail_existing: 0,
			notes,
			...(contact && { contact }),
		};

		/** @type {any} */
		const customer = await razorpay.customers.create(customerOptions);

		console.log('Razorpay customer created successfully:', customer.id);

		// Add isNew flag for compatibility (assume new if created within last 5 seconds)
		return {
			...customer,
			isNew: !customer.created_at || Date.now() - customer.created_at * 1000 < 5000,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay customer creation failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay customer creation process completed');
	}
}

/**
 * Fetch Razorpay customer details
 * @param {string} customerId - Razorpay customer ID
 * @returns {Promise<Object>} Razorpay customer details
 * @throws {Error} If customer fetch fails
 */
async function fetchRazorpayCustomer(customerId) {
	try {
		if (!customerId) {
			throw new Error('Customer ID is required');
		}

		const razorpay = initializeRazorpay();
		const customer = await razorpay.customers.fetch(customerId);

		console.log('Razorpay customer details fetched successfully:', customerId);
		return customer;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay customer fetch failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay customer fetch process completed');
	}
}

/**
 * Update Razorpay customer details
 * @param {string} customerId - Razorpay customer ID
 * @param {Object} updateData - Customer update data
 * @param {string} [updateData.name] - Updated customer name
 * @param {string} [updateData.email] - Updated customer email
 * @param {string} [updateData.contact] - Updated customer phone
 * @param {Object} [updateData.notes] - Updated customer notes
 * @returns {Promise<Object>} Updated Razorpay customer object
 * @throws {Error} If customer update fails
 */
async function updateRazorpayCustomer(customerId, updateData) {
	try {
		if (!customerId) {
			throw new Error('Customer ID is required for update');
		}

		const { name, email, contact, notes } = updateData;

		// Validate at least one update field is provided
		if (!name && !email && !contact && !notes) {
			throw new Error('At least one update field must be provided');
		}

		// Validate email format if provided
		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				throw new Error('Invalid email format');
			}
		}

		const razorpay = initializeRazorpay();

		/** @type {any} */
		const updateOptions = {};

		// Add fields that are being updated
		if (name) {
			updateOptions.name = name;
		}

		if (email) {
			updateOptions.email = email;
		}

		if (contact) {
			updateOptions.contact = contact;
		}

		if (notes) {
			updateOptions.notes = notes;
		}

		const customer = await razorpay.customers.edit(customerId, updateOptions);

		console.log('Razorpay customer updated successfully:', customerId);
		return customer;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('Razorpay customer update failed:', errorMessage);
		throw error;
	} finally {
		console.debug('Razorpay customer update process completed');
	}
}

module.exports = {
	createRazorpayCustomer,
	fetchRazorpayCustomer,
	updateRazorpayCustomer,
};