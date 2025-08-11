/**
 * Validate that all required Razorpay plan IDs are configured in the config file
 * Checks paid plans (pro, plus) for both monthly and yearly billing cycles
 * Free plan doesn't require Razorpay plan IDs since it's free
 * @returns {void}
 * @throws {Error} If any required plan IDs are missing from configuration
 */
export function validatePlanConfiguration(): void;
/**
 * Get detailed validation status for diagnostic purposes
 * @returns {Object} Validation status with plan details
 */
export function getPlanValidationStatus(): Object;
//# sourceMappingURL=validate-plans.d.ts.map