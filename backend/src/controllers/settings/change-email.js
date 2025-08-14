/**
 * Email change functionality for user settings
 * Handles email change requests and verification with transaction support
 * 
 * This module provides secure email change functionality including:
 * - Email change request with current password verification
 * - OTP generation and delivery to new email address
 * - Email change verification with transaction-based updates
 * - Comprehensive error handling and security logging
 */

const bcrypt = require('bcryptjs');
const { findUserById, updateUser, checkUserExists } = require('../../db/queries/authQueries');
const { storeOTPToken, markTokenAsUsedByValue, invalidateUserTokens } = require('../../db/queries/tokenQueries');
const { pool } = require('../../db/config');
const { generateOTPCode, storeOTP, verifyOTP, sendOTPEmail } = require('../../utils/otp');


/**
 * Handle email change request
 * Verifies current password and sends OTP to new email address
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with request status
 */
async function handleChangeEmail(req, res) {
    try {
        const { newEmail, currentPassword } = req.body;
        const userId = req.user?.userId;
        
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        
        if (!newEmail || !currentPassword) {
            res.status(400).json({
                success: false,
                message: 'New email address and current password are required'
            });
            return;
        }
        
        // Get current user data with password
        const user = await findUserById(userId);
        
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        
        // Verify current password
        const passwordValid = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!passwordValid) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }
        
        // Check if new email is same as current
        if (newEmail.toLowerCase() === user.email.toLowerCase()) {
            res.status(400).json({
                success: false,
                message: 'New email address must be different from your current email'
            });
            return;
        }
        
        // Check if new email is already in use by a verified account
        const existingUser = await checkUserExists(newEmail);
        
        // Additional check to make sure it's not the same user
        if (existingUser && existingUser.id !== userId) {
        
            // If the existing user is verified, block the email change
            if (existingUser.isVerified) {
                res.status(409).json({
                    success: false,
                    message: 'This email address is already registered to another account'
                });
                return;
            }
            
            // If existing user is unverified, allow the email change to proceed
            // The unverified account will be cleaned up after successful OTP verification
            console.log('Found unverified account with target email:', {
                existingUserId: existingUser.id,
                newEmail: newEmail,
                timestamp: new Date().toISOString()
            });
        }
        
        // Generate and store OTP for email change verification
        const otp = generateOTPCode();
        
        console.log('Email change OTP generated for user:', {
            userId: userId,
            newEmail: newEmail,
            timestamp: new Date().toISOString()
        });
        
        await storeOTP(userId, newEmail, otp);
        
        // Store pending email change in a temporary way (using auth_tokens table with special type)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        
        const storePendingQuery = `
            INSERT INTO auth_tokens (user_id, token, token_type, expires_at)
            VALUES ($1, $2, 'email_change_pending', $3)
            ON CONFLICT (user_id, token_type) 
            WHERE token_type = 'email_change_pending'
            DO UPDATE SET 
                token = EXCLUDED.token,
                expires_at = EXCLUDED.expires_at,
                updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.query(storePendingQuery, [userId, newEmail, expiresAt]);
        
        // Send OTP to new email address
        await sendOTPEmail(newEmail, otp, 'email_change_verification');
        
        console.log('Email change request processed:', {
            userId: userId,
            currentEmail: user.email,
            newEmail: newEmail,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: 'Verification code has been sent to your new email address. Please check your inbox to complete the email change.',
            newEmail: newEmail
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Email change request failed:', {
            error: errorMessage,
            userId: req.user?.userId,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to process email change request. Please try again.'
        });
        return;
        
    } finally {
        console.debug('Email change request process completed');
    }
}


/**
 * Handle email change verification
 * Validates OTP and updates user's email with transaction support
 * 
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with verification status
 */
async function handleVerifyEmailChange(req, res) {
    try {
        const { email, otp } = req.body;
        const userId = req.user?.userId;
        
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        
        if (!email || !otp) {
            res.status(400).json({
                success: false,
                message: 'Email address and verification code are required'
            });
            return;
        }
        
        // Get current user data with verification status
        const user = await findUserById(userId);
        
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        
        // Security check: Only verified users can perform email changes with cleanup
        if (!user.isVerified) {
            res.status(403).json({
                success: false,
                message: 'Email change requires account verification'
            });
            return;
        }
        
        // Verify that this email change was requested by this user
        const pendingChangeQuery = `
            SELECT token FROM auth_tokens 
            WHERE user_id = $1
            AND token_type = 'email_change_pending' 
            AND token = $2
            AND expires_at > CURRENT_TIMESTAMP
            AND is_used = false
        `;
        
        const pendingChangeResult = await pool.query(pendingChangeQuery, [userId, email]);
        const pendingChange = pendingChangeResult.rows.length > 0 ? pendingChangeResult.rows[0] : null;
        
        if (!pendingChange) {
            res.status(400).json({
                success: false,
                message: 'No pending email change found for this email address or request has expired'
            });
            return;
        }
        
        // Verify OTP - use current email (user.email) instead of new email for verification
        // because OTP was stored against the user_id, but verifyOTP searches by email
        // and the user's current email in the database is still the old email
        
        console.log('Verifying email change OTP for user:', {
            userId: userId,
            currentEmail: user.email,
            newEmail: email,
            timestamp: new Date().toISOString()
        });
        
        const otpResult = await verifyOTP(user.email, otp);
        
        if (!otpResult.success) {
            res.status(400).json({
                success: false,
                message: otpResult.message || 'Invalid or expired verification code'
            });
            return;
        }
        
        // Check once more if new email is still available (race condition protection)
        const existingUserCheck = await checkUserExists(email);
        
        let existingUser = null;
        if (existingUserCheck && existingUserCheck.id !== userId) {
            existingUser = existingUserCheck;
        }
        
        if (existingUser) {
            // If the existing user became verified between checks, block the operation
            if (existingUser.isVerified) {
                res.status(409).json({
                    success: false,
                    message: 'This email address is no longer available'
                });
                return;
            }
            
            // If still unverified, proceed with cleanup
            console.log('Confirmed unverified account will be cleaned up:', {
                existingUserId: existingUser.id,
                email: email,
                timestamp: new Date().toISOString()
            });
        }
        
        // Begin transaction for email change with unverified account cleanup
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Step 1: Check if there's still an unverified account with the target email
            const unverifiedAccountQuery = `
                SELECT id, is_verified FROM users 
                WHERE email = $1 AND id != $2 AND is_verified = false AND is_active = true
            `;
            const unverifiedResult = await client.query(unverifiedAccountQuery, [email, userId]);
            const unverifiedAccount = unverifiedResult.rows.length > 0 ? unverifiedResult.rows[0] : null;
            
            // Step 2: If unverified account exists, clean it up
            if (unverifiedAccount) {
                console.log('Cleaning up unverified account within transaction:', {
                    unverifiedUserId: unverifiedAccount.id,
                    email: email,
                    timestamp: new Date().toISOString()
                });
                
                // Delete auth tokens for the unverified user (foreign key cascade will handle this)
                const deleteTokensQuery = `DELETE FROM auth_tokens WHERE user_id = $1`;
                await client.query(deleteTokensQuery, [unverifiedAccount.id]);
                
                // Delete the unverified user account
                const deleteUserQuery = `
                    DELETE FROM users 
                    WHERE id = $1 AND is_verified = false AND is_active = true
                `;
                const deleteResult = await client.query(deleteUserQuery, [unverifiedAccount.id]);
                
                if (deleteResult.rowCount === 0) {
                    throw new Error('Failed to cleanup unverified account - account may have been verified');
                }
                
                console.log('Successfully cleaned up unverified account:', {
                    deletedUserId: unverifiedAccount.id,
                    email: email
                });
            }
            
            // Step 3: Update current user's email
            const updateEmailQuery = `
                UPDATE users 
                SET email = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND is_active = true
            `;
            
            const updateResult = await client.query(updateEmailQuery, [email, userId]);
            
            if (updateResult.rowCount === 0) {
                throw new Error('Failed to update email address');
            }
            
            // Step 4: Clean up pending email change record
            const cleanupPendingQuery = `
                DELETE FROM auth_tokens 
                WHERE user_id = $1 AND token_type = 'email_change_pending'
            `;
            await client.query(cleanupPendingQuery, [userId]);
            
            // Step 5: Clean up any remaining OTP tokens for this email change
            const cleanupOTPsQuery = `
                UPDATE auth_tokens 
                SET is_used = true 
                WHERE user_id = $1 AND token_type = 'otp' AND is_used = false
            `;
            await client.query(cleanupOTPsQuery, [userId]);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
        // Send confirmation email to old email address
        await sendEmailChangeConfirmation(user.email, email, user.firstName);
        
        console.log('Email change completed successfully:', {
            userId: userId,
            oldEmail: user.email,
            newEmail: email,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            message: 'Email address has been successfully changed.',
            user: {
                id: userId,
                email: email,
                firstName: user.firstName
            }
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Email change verification failed:', {
            error: errorMessage,
            userId: req.user?.userId,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to verify email change. Please try again.'
        });
        return;
        
    } finally {
        console.debug('Email change verification process completed');
    }
}


/**
 * Send email change confirmation to old email address
 * Notifies user about successful email change for security
 * 
 * @param {string} oldEmail - Previous email address
 * @param {string} newEmail - New email address
 * @param {string} firstName - User's first name
 * @returns {Promise<void>}
 */
async function sendEmailChangeConfirmation(oldEmail, newEmail, firstName) {
    try {
        // Create confirmation email content
        const subject = 'Your email address has been changed';
        const content = [
            `Hello ${firstName},`,
            ``,
            `🔄 Your email address has been successfully changed.`,
            ``,
            `Previous email: ${oldEmail}`,
            `New email: ${newEmail}`,
            ``,
            `If you did not make this change, please contact support immediately as your account may be compromised.`,
            ``,
            `This change was completed at: ${new Date().toISOString()}`,
            ``,
            `For your security, all active sessions have been maintained but please ensure you update your email in any connected services.`
        ];
        
        // Simulate email sending (replace with actual email service in production)
        console.log('\n' + '='.repeat(50));
        console.log('📧 EMAIL SIMULATION - EMAIL_CHANGE_CONFIRMATION');
        console.log('='.repeat(50));
        console.log(`To: ${oldEmail}`);
        console.log(`Subject: ${subject}`);
        console.log('');
        console.log('Content:');
        console.log('-'.repeat(30));
        content.forEach(line => console.log(line));
        console.log('-'.repeat(30));
        console.log('='.repeat(50));
        console.log('');
        
        console.log('Email change confirmation sent successfully:', {
            oldEmail: oldEmail,
            newEmail: newEmail,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Email change confirmation sending failed:', errorMessage);
        // Don't throw error as this is not critical to the main flow
    } finally {
        console.debug('Email change confirmation process completed');
    }
}


// Export route handlers
module.exports = {
    handleChangeEmail,
    handleVerifyEmailChange,
    sendEmailChangeConfirmation
};