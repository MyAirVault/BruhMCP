/**
 * Authentication middleware compatibility layer
 * Maps old auth middleware to new auth system
 */

const { authenticateToken } = require('./auth.js');

/**
 * Legacy requireAuth middleware for backward compatibility
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requireAuth = authenticateToken;

/**
 * Legacy authenticate middleware for backward compatibility
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = authenticateToken;

module.exports = {
    requireAuth,
    authenticate,
    authenticateToken
};