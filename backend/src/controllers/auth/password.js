/**
 * Password reset route functions
 * Handles password reset business logic
 */

const { findUserByEmail, updateUserPassword } = require('../../db/queries/authQueries');
const { storePasswordResetToken, findValidPasswordResetToken, markTokenAsUsedByValue, invalidateUserTokens } = require('../../db/queries/tokenQueries');
const { hashPassword } = require('../../utils/password');
const { 
    generatePasswordResetToken,
    verifyPasswordResetToken,
    invalidatePasswordResetToken
} = require('../../utils/jwt');


/**
 * Handle forgot password request
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>}
 */
async function handleForgotPassword(req, res) {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await findUserByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset link.'
            });
        }
        
        // Generate password reset token
        const payload = { userId: user.id, email: user.email };
        const resetToken = await generatePasswordResetToken(payload);
        
        // Simulate sending email with reset link
        const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}`;
        console.log('\n=== PASSWORD RESET EMAIL SIMULATION ===');
        console.log(`To: ${email}`);
        console.log(`Subject: Password Reset Request`);
        console.log(`Message: Click the link below to reset your password:`);
        console.log(`${resetUrl}`);
        console.log(`This link will expire in 1 hour.`);
        console.log('=====================================\n');
        
        res.json({
            success: true,
            message: 'If an account with this email exists, you will receive a password reset link.'
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Forgot password failed:', errorMessage);
        
        res.status(500).json({
            success: false,
            message: 'Password reset request failed'
        });
    } finally {
        console.debug('Forgot password process completed');
    }
}


/**
 * Handle password reset
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response | void>}
 */
async function handleResetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        
        // Verify reset token
        const decoded = await verifyPasswordResetToken(token);
        
        // Hash new password
        const passwordHash = await hashPassword(newPassword);
        
        // Update user password
        await updateUserPassword(decoded.userId, passwordHash);
        
        // Invalidate the reset token
        await invalidatePasswordResetToken(token);
        
        // Invalidate all existing refresh tokens for security
        await invalidateUserTokens(decoded.userId, 'refresh');
        
        res.json({
            success: true,
            message: 'Password reset successfully. Please log in with your new password.'
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Password reset failed:', errorMessage);
        
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Password reset failed'
        });
    } finally {
        console.debug('Password reset process completed');
    }
}


// Export functions
module.exports = {
    handleForgotPassword,
    handleResetPassword
};