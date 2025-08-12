/**
 * User signup route functions
 * Handles user registration business logic with email verification
 * 
 * This module contains the main signup functionality that:
 * - Validates user input and checks for existing accounts
 * - Creates new user accounts in unverified state
 * - Generates and sends OTP codes for email verification
 * - Integrates with the auth tokens system for verification flow
 */

const { createUser, findUserByEmail, checkUserExists } = require('../../db/queries/authQueries');
const { storeOTPToken } = require('../../db/queries/tokenQueries');
const { hashPassword } = require('../../utils/password');
const { 
    generateOTPCode, 
    storeOTP, 
    sendOTPEmail 
} = require('../../utils/otp');


// Constants for signup configuration

const SIGNUP_CONFIG = {
    INITIAL_VERIFICATION_STATUS: 0,
    DEFAULT_PLAN_CODE: 'free'
};


/**
 * Handle user signup with email verification
 * Creates a new user account and initiates email verification process
 * 
 * @param {import('express').Request} req - Express request object with signup data
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with user creation status
 */
async function handleSignup(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        if (!firstName || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Required fields are missing: firstName, email, and password are required'
            });
            return;
        }
        
        // Check if user already exists with this email
        const existingUser = await checkUserExists(email);
        
        if (existingUser && existingUser.isVerified) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists and is verified. Please try logging in instead.'
            });
            return;
        }
        
        let userId;
        let userCreated = false;
        
        if (existingUser && !existingUser.isVerified) {
            // User exists but is not verified - we'll reuse the existing user
            userId = existingUser.id;
            userCreated = false;
            
            // For now, we'll just use the existing user and send a new OTP
            // In a production system, you might want to update the password here
            console.log(`Existing unverified user found: ${email.toLowerCase().trim()}, userId: ${userId}`);
        } else {
            // No existing user - create new user
            userCreated = true;
            
            // Hash password securely
            const passwordHash = await hashPassword(password);
            
            // Create user (verified in local development, unverified in production)
            const newUser = await createUser({
                firstName: firstName.trim(),
                lastName: lastName ? lastName.trim() : '',
                email: email.toLowerCase().trim(),
                passwordHash: passwordHash,
                isVerified: process.env.NODE_ENV === 'local'
            });
            
            userId = newUser.id;
            
            if (!userId) {
                throw new Error('Failed to create user account');
            }
            
            console.log(`New user created for email: ${email.toLowerCase().trim()}, userId: ${userId}`);
        }
        
        // Generate and send OTP for email verification (skip in local development)
        if (process.env.NODE_ENV !== 'local') {
            const otp = generateOTPCode();
            await storeOTP(userId, email.toLowerCase().trim(), otp);
            await sendOTPEmail(email.toLowerCase().trim(), otp, 'signup_verification');
        }
        
        console.log(`User signup initiated for email: ${email.toLowerCase().trim()}, userId: ${userId}`);
        
        const isLocal = process.env.NODE_ENV === 'local';
        const responseMessage = isLocal 
            ? 'Account created and verified! You can now log in.'
            : userCreated 
                ? 'Account created! Please check your email and enter the verification code to complete setup.'
                : 'Account exists but not verified. A new verification code has been sent to your email.';
        
        res.status(201).json({
            success: true,
            message: responseMessage,
            data: {
                userId: userId,
                email: email.toLowerCase().trim(),
                requiresVerification: !isLocal,
                step: isLocal ? 'completed' : 'email_verification',
                isExistingUser: !userCreated
            }
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Signup failed:', errorMessage, {
            email: req.body?.email,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({
            success: false,
            message: 'Account creation failed. Please try again.'
        });
    } finally {
        console.debug('Signup process completed for request');
    }
}


/**
 * Handle resend OTP for unverified signup users
 * Resends verification code to users who haven't completed email verification
 * 
 * @param {import('express').Request} req - Express request object with email
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>} Sends JSON response with resend status
 */
async function handleResendSignupOTP(req, res) {
    try {
        const { email } = req.body;
        
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email is required'
            });
            return;
        }
        
        // Check if user exists and is unverified
        const user = await checkUserExists(email.toLowerCase().trim());
        
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'No account found with this email address. Please sign up first.'
            });
            return;
        }
        
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: 'Your account is already verified. Please try logging in instead.'
            });
            return;
        }
        
        // Generate and send new OTP
        const otp = generateOTPCode();
        await storeOTP(user.id, email.toLowerCase().trim(), otp);
        await sendOTPEmail(email.toLowerCase().trim(), otp, 'signup_verification');
        
        console.log(`OTP resent for unverified user: ${email.toLowerCase().trim()}, userId: ${user.id}`);
        
        res.status(200).json({
            success: true,
            message: 'Verification code resent successfully. Please check your email.',
            data: {
                email: email.toLowerCase().trim(),
                step: 'email_verification'
            }
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Resend signup OTP failed:', errorMessage, {
            email: req.body?.email,
            timestamp: new Date().toISOString()
        });
        
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification code. Please try again.'
        });
    } finally {
        console.debug('Resend signup OTP process completed for request');
    }
}


// Export functions
module.exports = {
    handleSignup,
    handleResendSignupOTP
};