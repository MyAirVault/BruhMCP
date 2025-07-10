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

// Import middleware
import { apiRateLimiter } from './utils/rateLimiter.js';

// Import database
import { testConnection } from './db/config.js';

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
			processManager: 'healthy',
		},
	});
});

app.use('/api/v1/mcp-types', mcpTypesRoutes);
app.use('/api/v1/api-keys', apiKeysRoutes);
app.use('/api/v1/mcps', mcpInstancesRoutes);

// 404 handler
app.use('*', (_req, res) => {
	res.status(404).json({
		error: {
			code: 'NOT_FOUND',
			message: 'The requested resource was not found',
		},
	});
});

// Global error handler
//@ts-ignore
app.use((err, _req, res, _next) => {
	console.error('Global error handler:', err);
	res.status(500).json({
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'An unexpected error occurred',
		},
	});
});

// Start server
app.listen(port, async () => {
	console.log(`🚀 Server is running on port ${port}`);
	console.log(`📚 Health check: http://localhost:${port}/health`);
	console.log(`🔐 Authentication: http://localhost:${port}/auth/request`);

	// Test database connection
	try {
		await testConnection();
		console.log('✅ Database connected successfully');
	} catch (error) {
		console.error('❌ Database connection failed:', error instanceof Error ? error.message : error);
	}
});
