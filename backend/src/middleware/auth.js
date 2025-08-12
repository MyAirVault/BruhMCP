/**
 * Authentication middleware for protected routes
 * Validates JWT tokens and sets user context
 */

const { verifyAccessToken } = require('../utils/jwt');
const { findUserById } = require('../db/queries/authQueries');


/**
 * Middleware to verify JWT access token
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
function authenticateToken(req, res, next) {
    try {
        console.log('[DEBUG] authenticateToken called with headers:', req.headers);
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;
        
        console.log('[DEBUG] Extracted token:', token);
        
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
            return;
        }
        
        console.log('[DEBUG] About to call verifyAccessToken with:', token);
        // Verify the token
        const decoded = verifyAccessToken(token);
        console.log('[DEBUG] verifyAccessToken returned:', decoded);
        
        // Add user information to request object
        req.user = {
            id: decoded.userId,
            userId: decoded.userId,
            email: decoded.email,
            sessionCreatedAt: new Date(decoded.iat * 1000),
            sessionExpiresAt: new Date(decoded.exp * 1000)
        };
        
        next();
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Token authentication failed:', errorMessage);
        
        // Only set X-Clear-Auth header for specific token failures that indicate user deletion
        // Don't set it for routine expiry or validation errors
        const isUserDeletionError = errorMessage.includes('user not found') || 
                                    errorMessage.includes('user deleted') ||
                                    errorMessage.includes('account inactive');
        
        if (isUserDeletionError) {
            res.setHeader('X-Clear-Auth', 'true');
        }
        
        if (errorMessage.includes('expired')) {
            res.status(401).json({
                success: false,
                message: 'Access token has expired'
            });
            return;
        }
        
        if (errorMessage.includes('invalid') || 
            errorMessage.includes('malformed') ||
            errorMessage.includes('signature') ||
            errorMessage.includes('JsonWebTokenError')) {
            res.status(401).json({
                success: false,
                message: 'Invalid access token'
            });
            return;
        }
        
        res.status(401).json({
            success: false,
            message: 'Token verification failed'
        });
        return;
        
    } finally {
        console.debug('Token authentication process completed');
    }
}


/**
 * Middleware to verify user exists and is active
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
async function verifyUserExists(req, res, next) {
    try {
        if (!req.user || !req.user.userId) {
            res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
            return;
        }
        
        // Use PostgreSQL query to find user
        const user = await findUserById(req.user.userId);
        
        if (!user || user.email !== req.user.email) {
            // User not found in database - likely deleted
            // Tell frontend to clear authentication data
            res.setHeader('X-Clear-Auth', 'true');
            
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }
        
        // Add full user data to request (user already comes in camelCase from authQueries)
        req.user = {
            ...req.user,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };
        
        next();
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('User verification failed:', errorMessage);
        
        res.status(500).json({
            success: false,
            message: 'User verification error'
        });
        return;
        
    } finally {
        console.debug('User verification process completed');
    }
}


/**
 * Middleware to require verified email
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
function requireVerifiedEmail(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
            return;
        }
        
        if (!req.user.isVerified) {
            res.status(403).json({
                success: false,
                message: 'Email verification required to access this resource'
            });
            return;
        }
        
        next();
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Email verification check failed:', errorMessage);
        
        res.status(500).json({
            success: false,
            message: 'Verification check error'
        });
        return;
        
    } finally {
        console.debug('Email verification check process completed');
    }
}


/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;
        
        if (!token) {
            req.user = null;
            return next();
        }
        
        try {
            const decoded = verifyAccessToken(token);
            req.user = {
                id: decoded.userId,
                userId: decoded.userId,
                email: decoded.email,
                sessionCreatedAt: new Date(decoded.iat * 1000),
                sessionExpiresAt: new Date(decoded.exp * 1000)
            };
        } catch (tokenError) {
            // Token is invalid, but we continue without authentication
            req.user = null;
        }
        
        next();
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Optional authentication failed:', errorMessage);
        
        // Continue without authentication on error
        req.user = null;
        next();
        
    } finally {
        console.debug('Optional authentication process completed');
    }
}


/**
 * Combined authentication middleware (token + user verification)
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }
        
        // Verify the token
        const decoded = verifyAccessToken(token);
        
        // Add user information to request object
        req.user = {
            id: decoded.userId,
            userId: decoded.userId,
            email: decoded.email,
            sessionCreatedAt: new Date(decoded.iat * 1000),
            sessionExpiresAt: new Date(decoded.exp * 1000)
        };
        
        // Verify user exists and is active
        const user = await findUserById(req.user.userId);
        
        if (!user || user.email !== req.user.email) {
            res.setHeader('X-Clear-Auth', 'true');
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }
        
        // Add full user data to request
        req.user = {
            ...req.user,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };
        
        next();
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Authentication failed:', errorMessage);
        
        // Handle token-specific errors
        if (errorMessage.includes('expired')) {
            return res.status(401).json({
                success: false,
                message: 'Access token has expired'
            });
        }
        
        if (errorMessage.includes('invalid') || 
            errorMessage.includes('malformed') ||
            errorMessage.includes('signature') ||
            errorMessage.includes('JsonWebTokenError')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token'
            });
        }
        
        // Handle user deletion errors
        if (errorMessage.includes('user not found') || 
            errorMessage.includes('user deleted') ||
            errorMessage.includes('account inactive')) {
            res.setHeader('X-Clear-Auth', 'true');
        }
        
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}


/**
 * Full authentication with email verification requirement
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 */
async function authenticateVerified(req, res, next) {
    try {
        // First authenticate the user
        await authenticate(req, res, () => {
            // Then check if email is verified
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }
            
            if (!req.user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Email verification required to access this resource'
                });
            }
            
            next();
        });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Verified authentication failed:', errorMessage);
        
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Authentication error'
            });
        }
    }
}


// Export middleware functions
module.exports = {
    authenticateToken,
    verifyUserExists,
    requireVerifiedEmail,
    optionalAuth,
    authenticate,
    authenticateVerified
};