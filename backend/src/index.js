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

// Import database
import { initializeDatabase } from './db/config.js';

// Port validation removed - no longer using dynamic port allocation

// Import expiration monitor
import expirationMonitor from './services/expiration-monitor.js';

// Import logging services
import loggingService from './services/logging/loggingService.js';
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

// Redirect verify requests to frontend dev server
app.get('/verify', (req, res) => {
	const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
	const token = req.query.token;
	res.redirect(`${frontendUrl}/verify${token ? '?token=' + token : ''}`);
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

// Instance-based MCP routing: /:instanceId/mcp/:mcpType/*
app.use('/:instanceId/mcp/:mcpType', (req, res) => {
	const { instanceId, mcpType } = req.params;
	console.log(`🔄 Instance routing request: ${instanceId}/mcp/${mcpType} from ${req.ip}`);

	// Forward to appropriate MCP instance port
	// This will be handled by the process manager to route to the correct instance
	res.status(502).json({
		error: {
			code: 'INSTANCE_NOT_AVAILABLE',
			message: `MCP instance ${instanceId} is not available or not running`,
			instanceId,
			mcpType,
		},
	});
});

// SPA fallback - serve index.html for non-API routes
app.get('*', (req, res) => {
	// Don't serve SPA for API routes
	if (req.path.startsWith('/api/') || req.path.startsWith('/auth/') || req.path.startsWith('/health')) {
		return res.status(404).json({
			error: {
				code: 'NOT_FOUND',
				message: 'The requested resource was not found',
			},
		});
	}
	
	// Serve index.html for all other routes (SPA routing)
	res.sendFile('index.html', { root: 'public' }, (err) => {
		if (err) {
			res.status(404).json({
				error: {
					code: 'FRONTEND_NOT_FOUND',
					message: 'Frontend not built. Run npm run build:frontend',
				},
			});
		}
	});
});

// Global error handler
// @ts-expect-error - Express error handler requires 4 parameters
app.use((err, req, res, _next) => {
	// Log error through logging service
	loggingService.logError(err, {
		userId: req.user?.id,
		operation: 'global_error_handler',
		endpoint: req.originalUrl,
		method: req.method,
		ip: req.ip,
		critical: true
	});

	res.status(500).json({
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'An unexpected error occurred',
		},
	});
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
