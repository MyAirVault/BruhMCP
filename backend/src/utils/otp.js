/**
 * OTP (One-Time Password) generation and validation utilities
 * Handles 6-digit OTP codes with configurable expiry and rate limiting
 * 
 * This module provides comprehensive OTP functionality including:
 * - Secure 6-digit OTP code generation
 * - Database storage with expiry timestamps
 * - Email delivery with customizable templates
 * - Rate limiting and attempt tracking
 * - Automatic cleanup of expired tokens
 */

const { storeOTPToken, getOTPAttemptCount, getRecentOTPRequests, findValidOTPToken, markTokenAsUsedByValue, cleanupExpiredTokens } = require('../db/queries/tokenQueries');
const { findUserByEmail, markEmailAsVerified } = require('../db/queries/authQueries');


// OTP configuration constants


// OTP configuration

const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 3,
    RATE_LIMIT_WINDOW_MINUTES: 5,
    MAX_REQUESTS_PER_WINDOW: 3,
    DEVELOPMENT_MAX_ATTEMPTS: 10
};


/**
 * Generate 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
function generateOTPCode() {
    try {
        // Generate random 6-digit number between 100000 and 999999
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const otp = randomNum.toString();
        
        // Validate OTP format
        if (otp.length !== OTP_CONFIG.LENGTH || !/^\d{6}$/.test(otp)) {
            throw new Error('Generated OTP does not meet format requirements');
        }
        
        return otp;
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('OTP code generation failed:', errorMessage);
        throw error;
    } finally {
        console.debug('OTP code generation process completed');
    }
}


/**
 * Store OTP in database for user
 * @param {string} userId - User UUID
 * @param {string} email - User email
 * @param {string} otp - Generated OTP code
 * @returns {Promise<void>}
 */
async function storeOTP(userId, email, otp) {
    try {
        if (!userId || !email || !otp) {
            throw new Error('Missing required parameters: userId, email, and otp are all required');
        }
        
        // PostgreSQL uses UUIDs for user IDs
        if (typeof userId !== 'string' || !userId) {
            throw new Error('userId must be a valid string UUID');
        }
        
        // Normalize OTP to handle any whitespace
        const normalizedOTP = otp.trim();
        
        if (normalizedOTP.length !== OTP_CONFIG.LENGTH || !/^\d{6}$/.test(normalizedOTP)) {
            throw new Error('OTP must be exactly 6 digits');
        }
        
        const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
        
        // Use PostgreSQL token query to store OTP
        // This will automatically invalidate any existing OTPs for this user
        await storeOTPToken(userId, normalizedOTP);
        
        console.log(`OTP stored successfully for user ${userId}:`, {
            email: email,
            expiresAt: expiresAt.toISOString(),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('OTP storage failed:', errorMessage);
        throw error;
    } finally {
        console.debug('OTP storage process completed');
    }
}


/**
 * Verify OTP code for user
 * @param {string} email - User email
 * @param {string} otp - OTP code to verify
 * @returns {Promise<{success: boolean, message: string, user?: {id: string, firstName: string, lastName: string, email: string, isVerified: boolean}}>} Verification result with success status and user data
 */
async function verifyOTP(email, otp) {
    try {
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }
        
        // Normalize email input to handle case sensitivity and whitespace
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedOTP = otp.trim();
        
        // Log OTP verification attempt for security monitoring
        console.log('OTP verification attempt:', {
            email: normalizedEmail,
            timestamp: new Date().toISOString()
        });
        
        // Get user first - PostgreSQL query handles case-insensitive matching
        const user = await findUserByEmail(normalizedEmail);
        
        // Log user lookup result for debugging
        if (!user) {
            console.warn('OTP verification failed - user not found:', {
                email: normalizedEmail,
                timestamp: new Date().toISOString()
            });
            
            return {
                success: false,
                message: 'User not found or no valid OTP exists'
            };
        }
        
        // Get user's latest valid OTP using PostgreSQL query
        const validOTP = await findValidOTPToken(user.id, normalizedOTP);
        
        // Additional safety check: verify OTP hasn't expired (double-check)
        if (validOTP && validOTP.expiresAt) {
            const expirationTime = new Date(validOTP.expiresAt);
            const currentTime = new Date();
            if (currentTime > expirationTime) {
                console.warn('OTP verification failed - expired after retrieval:', {
                    userId: user.id,
                    email: normalizedEmail,
                    expiresAt: validOTP.expiresAt,
                    currentTime: currentTime.toISOString()
                });
                return {
                    success: false,
                    message: 'OTP has expired. Please request a new verification code.'
                };
            }
        }
        
        // Get attempt count using PostgreSQL query
        const attemptCount = await getOTPAttemptCount(user.id, 60); // 60 minutes window
        
        // Log excessive attempt count for security monitoring
        const maxAttempts = process.env.NODE_ENV === 'development' 
            ? OTP_CONFIG.DEVELOPMENT_MAX_ATTEMPTS 
            : OTP_CONFIG.MAX_ATTEMPTS;
        
        if (attemptCount >= maxAttempts) {
            console.warn('OTP verification blocked - too many attempts:', {
                userId: user.id,
                email: normalizedEmail,
                attemptCount: attemptCount,
                maxAttempts: maxAttempts,
                timestamp: new Date().toISOString()
            });
        }
        
        // Check attempt limit with environment-specific configuration
        if (attemptCount >= maxAttempts) {
            return {
                success: false,
                message: 'Too many OTP attempts. Please request a new verification code.'
            };
        }
        
        // Check if OTP exists and matches
        if (!validOTP) {
            // Log failed OTP verification for security monitoring
            console.warn('OTP verification failed:', {
                userId: user.id,
                email: normalizedEmail,
                reason: 'no_valid_otp',
                timestamp: new Date().toISOString()
            });
            
            return {
                success: false,
                message: 'No valid OTP exists for this user'
            };
        }
        
        // Mark OTP as used
        await markTokenAsUsedByValue(normalizedOTP, 'otp');
        
        // Mark user as verified if not already
        if (!user.isVerified) {
            await markEmailAsVerified(user.id);
        }
        
        return {
            success: true,
            message: 'OTP verified successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: true
            }
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('OTP verification failed:', errorMessage);
        throw error;
    } finally {
        console.debug('OTP verification process completed');
    }
}


/**
 * Check OTP rate limit for user
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<{canRequest: boolean, remainingRequests: number, message: string}>} Rate limit check result
 */
async function checkOTPRateLimit(userId) {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        // Check recent OTP requests within configured time window using PostgreSQL query
        const recentRequestCount = await getRecentOTPRequests(userId, OTP_CONFIG.RATE_LIMIT_WINDOW_MINUTES);
        
        const maxRequestsPerWindow = OTP_CONFIG.MAX_REQUESTS_PER_WINDOW;
        const canRequest = recentRequestCount < maxRequestsPerWindow;
        
        return {
            canRequest,
            remainingRequests: Math.max(0, maxRequestsPerWindow - recentRequestCount),
            message: canRequest 
                ? 'OTP request allowed' 
                : 'Too many OTP requests. Please wait before requesting again.'
        };
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('OTP rate limit check failed:', errorMessage);
        throw error;
    } finally {
        console.debug('OTP rate limit check process completed');
    }
}


/**
 * Get email template based on purpose
 * @param {string} purpose - Email purpose
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @returns {{subject: string, content: string[]}} Email template with subject and content
 */
function getEmailTemplate(purpose, email, otp) {
    /** @type {Record<string, {subject: string, content: string[]}>} */
    const templates = {
        signup_verification: {
            subject: 'Welcome! Verify your email to get started',
            content: [
                `🎉 Welcome to our platform!`,
                ``,
                `Thanks for signing up! To complete your account setup and start using all our features, please verify your email address.`,
                ``,
                `Your verification code is: ${otp}`,
                ``,
                `This code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes for security.`,
                ``,
                `Once verified, you'll be automatically logged in and ready to go!`,
                ``,
                `If you didn't sign up for an account, please ignore this email.`
            ]
        },
        login_otp: {
            subject: 'Your login verification code',
            content: [
                `🔐 Secure Login Verification`,
                ``,
                `Someone is trying to log into your account. For security, please verify it's you.`,
                ``,
                `Your login verification code is: ${otp}`,
                ``,
                `This code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
                ``,
                `If this wasn't you, please secure your account immediately.`,
                ``,
                `Never share this code with anyone.`
            ]
        },
        password_reset: {
            subject: 'Reset your password',
            content: [
                `🔑 Password Reset Request`,
                ``,
                `You requested to reset your password. Use the code below to proceed:`,
                ``,
                `Your password reset code is: ${otp}`,
                ``,
                `This code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
                ``,
                `If you didn't request a password reset, please ignore this email and consider securing your account.`,
                ``,
                `Keep this code confidential and don't share it with anyone.`
            ]
        },
        email_change_verification: {
            subject: 'Verify your new email address',
            content: [
                `🔄 Email Change Verification`,
                ``,
                `You requested to change your email address. To complete this process, please verify your new email address.`,
                ``,
                `Your verification code is: ${otp}`,
                ``,
                `This code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
                ``,
                `If you didn't request this change, please ignore this email and secure your account immediately.`,
                ``,
                `Keep this code confidential and don't share it with anyone.`
            ]
        },
        verification: {
            subject: 'Your verification code',
            content: [
                `📧 Email Verification`,
                ``,
                `Your verification code is: ${otp}`,
                ``,
                `This code will expire in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
                ``,
                `Please use this code to complete your verification process.`
            ]
        }
    };
    
    return templates[purpose] || templates.verification;
}


/**
 * Send OTP via email using real SMTP service with console logging
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - OTP purpose (signup_verification, login_otp, password_reset, email_change_verification, verification)
 * @returns {Promise<void>}
 */
async function sendOTPEmail(email, otp, purpose = 'verification') {
    try {
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }
        
        const template = getEmailTemplate(purpose, email, otp);
        
        // Always show console output for debugging/development
        console.log('\n' + '='.repeat(50));
        console.log(`📧 EMAIL - ${purpose.toUpperCase()}`);
        console.log('='.repeat(50));
        console.log(`To: ${email}`);
        console.log(`Subject: ${template.subject}`);
        console.log('');
        console.log('Content:');
        console.log('-'.repeat(30));
        template.content.forEach(line => console.log(line));
        console.log('-'.repeat(30));
        console.log('');
        console.log(`🕒 This ${purpose} code expires in ${OTP_CONFIG.EXPIRY_MINUTES} minutes`);
        console.log('='.repeat(50));
        console.log('');
        
        // Also send actual email using SMTP
        try {
            const { emailService } = require('../services/emailService.js');
            const result = await emailService.sendOTP(email, otp, purpose, OTP_CONFIG.EXPIRY_MINUTES);
            
            if (result.success) {
                console.log(`✅ Real email sent successfully to ${email} (Message ID: ${result.messageId})`);
            } else {
                console.log(`⚠️ Real email failed: ${result.error}`);
            }
        } catch (emailError) {
            const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
            console.log(`⚠️ Real email service error: ${errorMessage}`);
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('OTP email sending failed:', errorMessage);
        throw error;
    } finally {
        console.debug('OTP email sending process completed');
    }
}


/**
 * Clean up expired OTPs from database
 * @returns {Promise<void>}
 */
async function cleanupExpiredOTPs() {
    try {
        // Use the token queries to clean up expired OTPs
        const deletedCount = await cleanupExpiredTokens('otp');
        
        if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} expired OTP records`);
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('OTP cleanup failed:', errorMessage);
        throw error;
    } finally {
        console.debug('OTP cleanup process completed');
    }
}



// Export all OTP utility functions
module.exports = {
    // Core OTP functions
    generateOTPCode,
    storeOTP,
    verifyOTP,
    
    // Rate limiting and management
    checkOTPRateLimit,
    cleanupExpiredOTPs,
    
    // Communication
    sendOTPEmail
};