/**
 * Handle email change request
 * Verifies current password and sends OTP to new email address
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with request status
 */
export function handleChangeEmail(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Handle email change verification
 * Validates OTP and updates user's email with transaction support
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with verification status
 */
export function handleVerifyEmailChange(req: import("express").Request, res: import("express").Response): Promise<void>;
/**
 * Send email change confirmation to old email address
 * Notifies user about successful email change for security
 *
 * @param {string} oldEmail - Previous email address
 * @param {string} newEmail - New email address
 * @param {string} firstName - User's first name
 * @returns {Promise<void>}
 */
export function sendEmailChangeConfirmation(oldEmail: string, newEmail: string, firstName: string): Promise<void>;
//# sourceMappingURL=change-email.d.ts.map