const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv/config');

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const mcpTypesRoutes = require('./routes/mcpTypesRoutes.js');
const apiKeysRoutes = require('./routes/apiKeysRoutes.js');
const mcpInstancesRoutes = require('./routes/mcpInstancesRoutes.js');
const billingRoutes = require('./billing/routes/billingRoutes.js');
const billingDetailsRoutes = require('./routes/billingDetailsRoutes.js');

// Import billing validation
const { validateBillingConfig } = require('./billing/middleware/webhookValidation.js');

// Import middleware
const { apiRateLimiter } = require('./utils/rateLimiter.js');
const { errorHandler } = require('./utils/errorResponse.js');

// Import database
const { initializeDatabase } = require('./db/config.js');

// Import MCP Auth Registry
const { authRegistry } = require('./services/mcp-auth-registry/index.js');

// Port validation removed - no longer using dynamic port allocation

// Import expiration monitor
const expirationMonitor = require('./services/expirationMonitor.js');

// OAuth service removed - now handled per service

// Import logging services
const loggingService = require('./services/logging/loggingService.js');
const { ErrorResponses } = require('./utils/errorResponse.js');
const logMaintenanceService = require('./services/logging/logMaintenanceService.js');


const app = express();
const port = process.env.PORT || 5000;

// Trust proxy for Nginx
app.set('trust proxy', true);

// Security middleware
app.use(helmet.default({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "https://checkout.razorpay.com", "'unsafe-inline'"],
			styleSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
			imgSrc: ["'self'", "data:", "https:", "https://checkout.razorpay.com"],
			connectSrc: [
				"'self'", 
				"https://api.razorpay.com",
				"https://checkout.razorpay.com",
				"https://lumberjack.razorpay.com",
				"https://*.razorpay.com"
			],
			frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
			fontSrc: ["'self'", "https://checkout.razorpay.com"],
			formAction: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
		},
	},
}));
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

// Rate limiting
app.use(apiRateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
	const startTime = Date.now();
	
	res.on('finish', () => {
		const responseTime = Date.now() - startTime;
		loggingService.logAPIRequest(req, res, responseTime);
	});
	
	next();
});

// OAuth well-known endpoint handler for MCP services (before static files)
app.get('/.well-known/oauth-authorization-server/*', (_req, res) => {
	// MCP services using API keys should return 404 for OAuth endpoints
	res.status(404).json({
		error: 'Not Found',
		message: 'This endpoint is not available for API key based MCP services'
	});
});

// Static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// API routes
app.use('/auth', authRoutes);

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.get('/api/v1/health', (_req, res) => {
	res.status(200).json({
		status: 'ok',
		version: '1.0.0',
		timestamp: new Date().toISOString(),
		services: {
			database: 'healthy',
			cache: 'healthy',
		},
	});
});

app.use('/api/v1/mcp-types', mcpTypesRoutes);
app.use('/api/v1/api-keys', apiKeysRoutes);
app.use('/api/v1/mcps', mcpInstancesRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/billing-details', billingDetailsRoutes);

// Register MCP Auth Registry routes (will be initialized during startup)
app.use('/api/v1/auth-registry', (req, res, next) => {
	const router = authRegistry.getRouter();
	if (router) {
		router(req, res, next);
	} else {
		res.status(503).json({
			error: 'Auth registry not initialized',
			message: 'The authentication registry is still initializing. Please try again in a few moments.'
		});
	}
});


// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
	// Don't serve SPA for API routes
	if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.startsWith('/health')) {
		return ErrorResponses.notFound(res, 'API endpoint');
	}
	
	// Serve index.html for all other routes (SPA routing)
	res.sendFile('index.html', { root: 'public' }, (err) => {
		if (err) {
			ErrorResponses.notFound(res, 'Frontend', {
				metadata: { suggestion: 'Run npm run build:frontend' }
			});
		}
	});
});

// Global error handler
// @ts-expect-error - Express error handler requires 4 parameters
app.use((err, req, res, next) => {
	// Log error through logging service
	loggingService.logError(err, {
		userId: req.user?.id,
		operation: 'global_error_handler',
		endpoint: req.originalUrl,
		method: req.method,
		ip: req.ip || 'unknown',
		critical: true
	});

	// Use standardized error handler
	errorHandler(err, req, res, next);
});

// Start server
const server = app.listen(port, async () => {
	// Log server startup
	loggingService.logServerStart({
		port: String(port),
		environment: process.env.NODE_ENV || 'development',
		nodeVersion: process.version,
		platform: process.platform
	});

	console.log(`🚀 Server is running on port ${port}`);
	console.log(`📚 Health check: http://localhost:${port}/health`);
	console.log(`🔐 Authentication: http://localhost:${port}/auth/request`);

	// Startup validation checks
	console.log('🔍 Running startup validation checks...');

	// Validate billing configuration
	const billingConfig = validateBillingConfig();
	if (!billingConfig.valid) {
		console.warn('⚠️ Billing configuration incomplete:', billingConfig.message);
		console.warn('💳 Payment features will not work until Razorpay is configured');
		console.warn('🔧 Required environment variables:', billingConfig.missingVars?.join(', '));
	} else {
		console.log('✅ Billing configuration is valid');
	}

	// Initialize database and verify tables
	try {
		await initializeDatabase();
	} catch (error) {
		console.error('❌ Database initialization failed:', error instanceof Error ? error.message : error);
		console.error('🛑 Server cannot start without a properly configured database');
		process.exit(1);
	}

	// Initialize MCP Auth Registry
	try {
		console.log('🔐 Initializing MCP Auth Registry...');
		await authRegistry.initialize({
			servicesPath: './src/mcp-servers',
			baseUrl: process.env.BASE_URL || `http://localhost:${port}`,
			autoDiscovery: true,
			discoveryInterval: 30000 // 30 seconds
		});
		console.log('✅ MCP Auth Registry initialized');
	} catch (error) {
		console.error('❌ Failed to initialize MCP Auth Registry:', error);
		loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
			operation: 'auth_registry_init',
			critical: true
		});
		// Don't exit - allow server to continue with reduced functionality
	}

	// OAuth service removed - now handled per service

	// Start expiration monitor
	try {
		expirationMonitor.start();
		console.log('✅ Expiration monitor started');
	} catch (error) {
		console.error('❌ Failed to start expiration monitor:', error);
		loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
			operation: 'expiration_monitor_start',
			critical: true
		});
	}

	// Start log maintenance service
	try {
		logMaintenanceService.startAutomatedMaintenance(24); // 24 hours interval
		console.log('✅ Log maintenance service started');
	} catch (error) {
		console.error('❌ Failed to start log maintenance service:', error);
		loggingService.logError(error instanceof Error ? error : new Error(String(error)), {
			operation: 'log_maintenance_start',
			critical: false
		});
	}


	console.log('🎯 All startup checks completed');
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('🛑 SIGTERM received, shutting down gracefully...');
	
	// Log shutdown
	loggingService.logServerStop({
		reason: 'SIGTERM',
		graceful: true
	});

	// Stop services
	expirationMonitor.stop();
	logMaintenanceService.stopAutomatedMaintenance();

	server.close(() => {
		console.log('✅ Server closed');
		process.exit(0);
	});
});

process.on('SIGINT', () => {
	console.log('🛑 SIGINT received, shutting down gracefully...');
	
	// Log shutdown
	loggingService.logServerStop({
		reason: 'SIGINT',
		graceful: true
	});

	// Stop services
	expirationMonitor.stop();
	logMaintenanceService.stopAutomatedMaintenance();

	server.close(() => {
		console.log('✅ Server closed');
		process.exit(0);
	});
});
