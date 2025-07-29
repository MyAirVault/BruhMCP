// @ts-check

/**
 * Local Development Authentication Routes
 * @fileoverview Routes for local development authentication features
 */

const { Router } = require('express');
const { 
    localLoginOrRegister, 
    getEnvironmentInfo, 
    testCredentials 
} = require('../controllers/localAuthController.js');
const { logout } = require('../../controllers/authController.js'); // Reuse existing logout
const { isLocalMode } = require('../config/localMode.js');

const router = Router();

// Middleware to ensure these routes only work in local mode
router.use((/** @type {import('express').Request} */ _req, res, next) => {
    if (!isLocalMode()) {
        res.status(404).json({
            success: false,
            error: 'Local development routes not available',
            message: 'These routes are only available when LOCAL_DEV=true'
        });
        return;
    }
    next();
});

// Log all local auth route access for debugging
router.use((req, /** @type {import('express').Response} */ _res, next) => {
    console.log(`🚀 Local auth route accessed: ${req.method} ${req.path}`);
    next();
});

// POST /api/local-auth/login - Local email/password login or register
router.post('/login', localLoginOrRegister);

// GET /api/local-auth/environment - Get environment info
router.get('/environment', getEnvironmentInfo);

// POST /api/local-auth/test-credentials - Test credentials without logging in
router.post('/test-credentials', testCredentials);

// POST /api/local-auth/logout - Logout (reuse existing)
router.post('/logout', logout);

module.exports = router;