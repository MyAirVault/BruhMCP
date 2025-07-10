import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const mcpId = process.env.MCP_ID;
const userId = process.env.USER_ID;
const mcpType = process.env.MCP_TYPE || 'gmail';

// Parse credentials (multiple fields)
const credentials = JSON.parse(process.env.CREDENTIALS || '{}');
const { api_key, client_secret, client_id, refresh_token } = credentials;

// Setup file-based logging directory
const logDir = path.join(__dirname, '../../logs/users', `user_${userId}`, `mcp_${mcpId}_${mcpType}`);

// Initialize metrics
let metrics = {
	requests: 0,
	errors: 0,
	startTime: new Date(),
	lastAccessed: new Date(),
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics and logging middleware
app.use((req, res, next) => {
	metrics.requests++;
	metrics.lastAccessed = new Date();
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
	next();
});

// Error handling middleware
app.use((err, req, res, next) => {
	metrics.errors++;
	console.error(`[${new Date().toISOString()}] Error:`, err.message);
	next(err);
});

// Initialize logging directory
async function initLogging() {
	try {
		await fs.mkdir(logDir, { recursive: true });
		console.log(`Logging initialized for MCP ${mcpId} in ${logDir}`);
	} catch (error) {
		console.error('Failed to initialize logging:', error);
	}
}

// Gmail MCP endpoints
app.get('/messages', async (req, res) => {
	try {
		// Simulate Gmail API call
		const mockMessages = [
			{
				id: '1',
				threadId: 'thread1',
				snippet: 'This is a sample email message...',
				from: 'sender@example.com',
				subject: 'Sample Email',
				date: new Date().toISOString(),
			},
			{
				id: '2',
				threadId: 'thread2',
				snippet: 'Another sample email message...',
				from: 'another@example.com',
				subject: 'Another Email',
				date: new Date().toISOString(),
			},
		];

		res.json({
			messages: mockMessages,
			totalCount: mockMessages.length,
		});
	} catch (error) {
		console.error('Error fetching messages:', error);
		res.status(500).json({ error: 'Failed to fetch messages' });
	}
});

app.get('/messages/:id', async (req, res) => {
	try {
		const { id } = req.params;

		// Simulate Gmail API call
		const mockMessage = {
			id: id,
			threadId: 'thread1',
			snippet: 'This is a sample email message...',
			from: 'sender@example.com',
			to: 'recipient@example.com',
			subject: 'Sample Email',
			body: 'This is the full body of the email message.',
			date: new Date().toISOString(),
			attachments: [],
		};

		res.json(mockMessage);
	} catch (error) {
		console.error('Error fetching message:', error);
		res.status(500).json({ error: 'Failed to fetch message' });
	}
});

app.post('/messages', async (req, res) => {
	try {
		const { to, subject, body } = req.body;

		// Simulate sending email
		const mockResponse = {
			id: 'sent_' + Date.now(),
			threadId: 'thread_' + Date.now(),
			to: to,
			subject: subject,
			body: body,
			status: 'sent',
			sentAt: new Date().toISOString(),
		};

		res.json(mockResponse);
	} catch (error) {
		console.error('Error sending message:', error);
		res.status(500).json({ error: 'Failed to send message' });
	}
});

// Health check endpoint
app.get('/health', (req, res) => {
	const uptimeMs = Date.now() - metrics.startTime.getTime();
	const health = {
		status: 'healthy',
		mcpId,
		mcpType,
		userId,
		uptime: {
			seconds: Math.floor(uptimeMs / 1000),
			hours: Math.floor(uptimeMs / (1000 * 60 * 60)),
		},
		metrics: {
			requests: metrics.requests,
			errors: metrics.errors,
			errorRate: metrics.requests > 0 ? metrics.errors / metrics.requests : 0,
		},
		timestamp: new Date().toISOString(),
	};

	res.json(health);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
	try {
		const metricsData = {
			...metrics,
			uptime: Date.now() - metrics.startTime.getTime(),
			memory: process.memoryUsage(),
			cpu: process.cpuUsage(),
		};

		// Write metrics to file
		await fs.writeFile(path.join(logDir, 'metrics.json'), JSON.stringify(metricsData, null, 2));

		res.json(metricsData);
	} catch (error) {
		console.error('Failed to write metrics:', error);
		res.status(500).json({ error: 'Failed to generate metrics' });
	}
});

// Start server
app.listen(port, async () => {
	await initLogging();

	const message = `Gmail MCP server running on port ${port}`;
	console.log(message);
	console.log(`MCP ID: ${mcpId}`);
	console.log(`User ID: ${userId}`);
	console.log(`Credentials configured: ${Object.keys(credentials).join(', ')}`);
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
	console.log('Received SIGTERM, shutting down gracefully');

	// Write final metrics
	try {
		const finalMetrics = {
			...metrics,
			shutdownTime: new Date().toISOString(),
			totalUptime: Date.now() - metrics.startTime.getTime(),
		};

		await fs.writeFile(path.join(logDir, 'shutdown-metrics.json'), JSON.stringify(finalMetrics, null, 2));
	} catch (error) {
		console.error('Failed to write shutdown metrics:', error);
	}

	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('Received SIGINT, shutting down');
	process.exit(0);
});
