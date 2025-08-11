export type RazorpayCustomer = {
    /**
     * - Razorpay customer ID
     */
    id: string;
    /**
     * - Customer name
     */
    name: string;
    /**
     * - Customer email
     */
    email: string;
    /**
     * - Customer phone number
     */
    contact?: string | undefined;
    /**
     * - Additional customer notes
     */
    notes?: Object | undefined;
    /**
     * - Creation timestamp
     */
    created_at: number;
};
/**
 * @typedef {Object} RazorpayCustomer
 * @property {string} id - Razorpay customer ID
 * @property {string} name - Customer name
 * @property {string} email - Customer email
 * @property {string} [contact] - Customer phone number
 * @property {Object} [notes] - Additional customer notes
 * @property {number} created_at - Creation timestamp
 */
/**
 * Create a new Razorpay customer
 * @param {Object} customerData - Customer creation data
 * @param {string} customerData.name - Customer name
 * @param {string} customerData.email - Customer email
 * @param {string} [customerData.contact] - Customer phone number
 * @param {string} [customerData.fail_existing] - Fail if customer already exists
 * @param {Object} [customerData.notes] - Additional notes
 * @returns {Promise<RazorpayCustomer>} Razorpay customer object
 * @throws {Error} If customer creation fails
 */
export function createRazorpayCustomer(customerData: {
    name: string;
    email: string;
    contact?: string | undefined;
    fail_existing?: string | undefined;
    notes?: Object | undefined;
}): Promise<RazorpayCustomer>;
/**
 * Fetch Razorpay customer details
 * @param {string} customerId - Razorpay customer ID
 * @returns {Promise<Object>} Razorpay customer details
 * @throws {Error} If customer fetch fails
 */
export function fetchRazorpayCustomer(customerId: string): Promise<Object>;
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
export function updateRazorpayCustomer(customerId: string, updateData: {
    name?: string | undefined;
    email?: string | undefined;
    contact?: string | undefined;
    notes?: Object | undefined;
}): Promise<Object>;
//# sourceMappingURL=customers.d.ts.map