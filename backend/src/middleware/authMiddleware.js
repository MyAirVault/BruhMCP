// @ts-check
import { verifyJWT } from '../utils/jwt.js';
import { findUserByEmail } from '../db/userQueries.js';


/**
 * Authentication middleware that validates JWT tokens from cookies
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticate(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'MISSING_AUTH_TOKEN',
        message: 'Authentication required'
      }
    });
  }

  const payload = verifyJWT(token);

  if (!payload) {
    return res.status(401).json({
      error: {
        code: 'INVALID_AUTH_TOKEN',
        message: 'Invalid or expired authentication token'
      }
    });
  }

  try {
    // Get user from database
    const user = await findUserByEmail(payload.email);
    
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed'
      }
    });
  }
}

/**
 * Optional authentication middleware - doesn't fail if no token
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export async function optionalAuthenticate(req, _res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    req.user = null;
    return next();
  }

  const payload = verifyJWT(token);

  if (!payload) {
    req.user = null;
    return next();
  }

  try {
    const user = await findUserByEmail(payload.email);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email
      };
    } else {
      req.user = null;
    }
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
  }

  next();
}


/**
 * Get current user from request
 * @param {import('express').Request} req
 */
export function getCurrentUser(req) {
  return req.user || null;
}

/**
 * Check if user is authenticated
 * @param {import('express').Request} req
 */
export function isAuthenticated(req) {
  return req.user !== null && req.user !== undefined;
}