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
const mcpType = process.env.MCP_TYPE || 'github';

// Parse credentials
const credentials = JSON.parse(process.env.CREDENTIALS || '{}');
const { personal_access_token } = credentials;

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

// GitHub MCP endpoints
app.get('/repos', async (req, res) => {
	try {
		// Simulate GitHub API call
		const mockRepos = [
			{
				id: 1,
				name: 'awesome-project',
				full_name: 'user/awesome-project',
				private: false,
				html_url: 'https://github.com/user/awesome-project',
				description: 'An awesome project built with Node.js',
				language: 'JavaScript',
				stargazers_count: 25,
				forks_count: 5,
				updated_at: new Date().toISOString(),
			},
			{
				id: 2,
				name: 'another-repo',
				full_name: 'user/another-repo',
				private: true,
				html_url: 'https://github.com/user/another-repo',
				description: 'Another repository for testing',
				language: 'Python',
				stargazers_count: 10,
				forks_count: 2,
				updated_at: new Date().toISOString(),
			},
		];

		res.json({
			repositories: mockRepos,
			totalCount: mockRepos.length,
		});
	} catch (error) {
		console.error('Error fetching repositories:', error);
		res.status(500).json({ error: 'Failed to fetch repositories' });
	}
});

app.get('/repos/:owner/:repo', async (req, res) => {
	try {
		const { owner, repo } = req.params;

		// Simulate GitHub API call
		const mockRepo = {
			id: 1,
			name: repo,
			full_name: `${owner}/${repo}`,
			private: false,
			html_url: `https://github.com/${owner}/${repo}`,
			description: 'An awesome project built with Node.js',
			language: 'JavaScript',
			stargazers_count: 25,
			forks_count: 5,
			open_issues_count: 3,
			default_branch: 'main',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		res.json(mockRepo);
	} catch (error) {
		console.error('Error fetching repository:', error);
		res.status(500).json({ error: 'Failed to fetch repository' });
	}
});

app.get('/repos/:owner/:repo/issues', async (req, res) => {
	try {
		const { owner, repo } = req.params;

		// Simulate GitHub API call
		const mockIssues = [
			{
				id: 1,
				number: 1,
				title: 'Bug: Application crashes on startup',
				body: 'The application crashes when starting up with certain configurations.',
				state: 'open',
				user: {
					login: 'user1',
					avatar_url: 'https://via.placeholder.com/32',
				},
				labels: [
					{ name: 'bug', color: 'red' },
					{ name: 'high-priority', color: 'orange' },
				],
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
			{
				id: 2,
				number: 2,
				title: 'Feature: Add dark mode support',
				body: 'It would be great to have dark mode support for better user experience.',
				state: 'open',
				user: {
					login: 'user2',
					avatar_url: 'https://via.placeholder.com/32',
				},
				labels: [
					{ name: 'enhancement', color: 'green' },
					{ name: 'ui', color: 'blue' },
				],
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		];

		res.json({
			issues: mockIssues,
			totalCount: mockIssues.length,
		});
	} catch (error) {
		console.error('Error fetching issues:', error);
		res.status(500).json({ error: 'Failed to fetch issues' });
	}
});

app.post('/repos/:owner/:repo/issues', async (req, res) => {
	try {
		const { owner, repo } = req.params;
		const { title, body, labels } = req.body;

		// Simulate creating an issue
		const mockIssue = {
			id: Date.now(),
			number: Math.floor(Math.random() * 1000) + 1,
			title: title,
			body: body,
			state: 'open',
			user: {
				login: 'api-user',
				avatar_url: 'https://via.placeholder.com/32',
			},
			labels: labels || [],
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			html_url: `https://github.com/${owner}/${repo}/issues/${Math.floor(Math.random() * 1000) + 1}`,
		};

		res.status(201).json(mockIssue);
	} catch (error) {
		console.error('Error creating issue:', error);
		res.status(500).json({ error: 'Failed to create issue' });
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

	const message = `GitHub MCP server running on port ${port}`;
	console.log(message);
	console.log(`MCP ID: ${mcpId}`);
	console.log(`User ID: ${userId}`);
	console.log(`Personal Access Token configured: ${personal_access_token ? 'Yes' : 'No'}`);
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
