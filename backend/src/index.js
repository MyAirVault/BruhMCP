import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

// Import routes
import authRoutes from './routes/authRoutes.js';
import mcpTypesRoutes from './routes/mcpTypesRoutes.js';
import apiKeysRoutes from './routes/apiKeysRoutes.js';
import mcpInstancesRoutes from './routes/mcpInstancesRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import middleware
import { apiRateLimiter } from './utils/rateLimiter.js';
import { errorHandler } from './utils/errorResponse.js';

// Import database
import { initializeDatabase } from './db/config.js';

// Port validation removed - no longer using dynamic port allocation

// Import expiration monitor
import expirationMonitor from './services/expiration-monitor.js';

// Import logging services
import loggingService from './services/logging/loggingService.js';
import { ErrorResponses } from './utils/errorResponse.js';
import logMaintenanceService from './services/logging/logMaintenanceService.js';

const app = express();
const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
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
app.get('/.well-known/oauth-authorization-server/*', (req, res) => {
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
app.use('/api/v1/admin', adminRoutes);


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
		ip: req.ip,
		critical: true
	});

	// Use standardized error handler
	errorHandler(err, req, res, next);
});

// Start server
const server = app.listen(port, async () => {
	// Log server startup
	loggingService.logServerStart({
		port,
		environment: process.env.NODE_ENV || 'development',
		nodeVersion: process.version,
		platform: process.platform
	});

	console.log(`🚀 Server is running on port ${port}`);
	console.log(`📚 Health check: http://localhost:${port}/health`);
	console.log(`🔐 Authentication: http://localhost:${port}/auth/request`);

	// Startup validation checks
	console.log('🔍 Running startup validation checks...');

	// Port range validation removed - no longer using dynamic port allocation

	// Initialize database and verify tables
	try {
		await initializeDatabase();
	} catch (error) {
		console.error('❌ Database initialization failed:', error instanceof Error ? error.message : error);
		console.error('🛑 Server cannot start without a properly configured database');
		process.exit(1);
	}

	// Start expiration monitor
	try {
		expirationMonitor.start();
		console.log('✅ Expiration monitor started');
	} catch (error) {
		console.error('❌ Failed to start expiration monitor:', error);
		loggingService.logError(error, {
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
		loggingService.logError(error, {
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
