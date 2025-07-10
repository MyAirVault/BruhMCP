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
const mcpType = process.env.MCP_TYPE || 'figma';

// Parse credentials
const credentials = JSON.parse(process.env.CREDENTIALS || '{}');
const { api_key } = credentials;

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

// Figma MCP endpoints
app.get('/files', async (req, res) => {
	try {
		// Simulate Figma API call
		const mockFiles = [
			{
				key: 'file1',
				name: 'Design System Components',
				thumbnail_url: 'https://via.placeholder.com/150',
				last_modified: new Date().toISOString(),
				version: '1.0.0',
			},
			{
				key: 'file2',
				name: 'Mobile App Designs',
				thumbnail_url: 'https://via.placeholder.com/150',
				last_modified: new Date().toISOString(),
				version: '2.1.0',
			},
		];

		res.json({
			files: mockFiles,
			totalCount: mockFiles.length,
		});
	} catch (error) {
		console.error('Error fetching files:', error);
		res.status(500).json({ error: 'Failed to fetch files' });
	}
});

app.get('/files/:key', async (req, res) => {
	try {
		const { key } = req.params;

		// Simulate Figma API call
		const mockFile = {
			key: key,
			name: 'Design System Components',
			thumbnail_url: 'https://via.placeholder.com/150',
			last_modified: new Date().toISOString(),
			version: '1.0.0',
			document: {
				id: 'doc1',
				name: 'Document',
				type: 'DOCUMENT',
				children: [
					{
						id: 'page1',
						name: 'Page 1',
						type: 'CANVAS',
						children: [
							{
								id: 'frame1',
								name: 'Frame 1',
								type: 'FRAME',
								absoluteBoundingBox: {
									x: 0,
									y: 0,
									width: 400,
									height: 300,
								},
							},
						],
					},
				],
			},
		};

		res.json(mockFile);
	} catch (error) {
		console.error('Error fetching file:', error);
		res.status(500).json({ error: 'Failed to fetch file' });
	}
});

app.get('/files/:key/comments', async (req, res) => {
	try {
		const { key } = req.params;

		// Simulate Figma API call
		const mockComments = [
			{
				id: 'comment1',
				message: 'This looks great! Can we make the button slightly larger?',
				user: {
					id: 'user1',
					handle: 'designer1',
					img_url: 'https://via.placeholder.com/32',
				},
				created_at: new Date().toISOString(),
				resolved_at: null,
			},
			{
				id: 'comment2',
				message: 'Updated the spacing as requested.',
				user: {
					id: 'user2',
					handle: 'designer2',
					img_url: 'https://via.placeholder.com/32',
				},
				created_at: new Date().toISOString(),
				resolved_at: new Date().toISOString(),
			},
		];

		res.json({
			comments: mockComments,
			totalCount: mockComments.length,
		});
	} catch (error) {
		console.error('Error fetching comments:', error);
		res.status(500).json({ error: 'Failed to fetch comments' });
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

	const message = `Figma MCP server running on port ${port}`;
	console.log(message);
	console.log(`MCP ID: ${mcpId}`);
	console.log(`User ID: ${userId}`);
	console.log(`API Key configured: ${api_key ? 'Yes' : 'No'}`);
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
