// @ts-check

/**
 * Local Development Authentication Controller
 * @fileoverview Controller for handling local development authentication requests
 */

import { z } from 'zod';
import { localUserService } from '../services/localUserService.js';
import { generateJWT } from '../../utils/jwt.js';
import { ErrorResponses, formatZodErrors } from '../../utils/errorResponse.js';
import { getLocalModeConfig } from '../config/localMode.js';

// Validation schemas
const localLoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * Local development login/register
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export async function localLoginOrRegister(req, res) {
    try {
        const validationResult = localLoginSchema.safeParse(req.body);

        if (!validationResult.success) {
            ErrorResponses.validation(res, 'Invalid request parameters', formatZodErrors(validationResult.error));
            return;
        }

        const { email, password } = validationResult.data;

        // Additional email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            ErrorResponses.invalidInput(res, 'Invalid email format');
            return;
        }

        // Process login or registration
        const result = await localUserService.loginOrRegister(email, password);

        if (!result.success) {
            ErrorResponses.unauthorized(res, result.message || 'Authentication failed');
            return;
        }

        // Generate JWT (same as production)
        const jwtToken = generateJWT(result.user);

        // Set JWT as HTTP-only cookie (same as production)
        res.cookie('authToken', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Log successful authentication
        console.log(`🔐 Local auth successful: ${result.user.email} (${result.isNewUser ? 'new user' : 'existing user'})`);

        res.status(200).json({
            success: true,
            message: result.isNewUser ? 'Account created and logged in successfully' : 'Logged in successfully',
            user: result.user,
            isNewUser: result.isNewUser
        });
    } catch (error) {
        console.error('Error in localLoginOrRegister:', error);
        ErrorResponses.internal(res, 'An unexpected error occurred');
    }
}

/**
 * Get environment info for frontend
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export async function getEnvironmentInfo(req, res) {
    try {
        const config = getLocalModeConfig();
        
        res.status(200).json({
            success: true,
            ...config
        });
    } catch (error) {
        console.error('Error in getEnvironmentInfo:', error);
        ErrorResponses.internal(res, 'An unexpected error occurred');
    }
}

/**
 * Test credentials without logging in (for CLI verification)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export async function testCredentials(req, res) {
    try {
        const validationResult = localLoginSchema.safeParse(req.body);

        if (!validationResult.success) {
            ErrorResponses.validation(res, 'Invalid request parameters', formatZodErrors(validationResult.error));
            return;
        }

        const { email, password } = validationResult.data;

        const result = await localUserService.verifyCredentials(email, password);

        if (!result.success) {
            ErrorResponses.unauthorized(res, result.message || 'Invalid credentials');
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Credentials are valid',
            user: result.user
        });
    } catch (error) {
        console.error('Error in testCredentials:', error);
        ErrorResponses.internal(res, 'An unexpected error occurred');
    }
}