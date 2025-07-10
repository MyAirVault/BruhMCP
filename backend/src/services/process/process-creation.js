import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import portManager from '../portManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a new MCP process
 * @param {Object} config - Process configuration
 * @param {string} config.mcpType - MCP type name
 * @param {string} config.instanceId - Instance ID
 * @param {string} config.userId - User ID
 * @param {Object} config.credentials - Decrypted credentials
 * @param {Object} config.config - Instance configuration
 * @returns {Promise<Object>} Process information
 */
export async function createProcess(config) {
	const { mcpType, instanceId, userId, credentials, config: instanceConfig } = config;

	try {
		// Get available port
		const assignedPort = portManager.getAvailablePort();

		// Prepare environment variables
		const env = {
			...process.env,
			PORT: assignedPort.toString(),
			MCP_ID: instanceId,
			USER_ID: userId,
			MCP_TYPE: mcpType,
			CREDENTIALS: JSON.stringify(credentials),
			CONFIG: JSON.stringify(instanceConfig || {}),
			NODE_ENV: 'production',
		};

		// Get universal server script path
		const serverScriptPath = join(__dirname, '..', '..', 'mcp-servers', 'universal-mcp-server.js');

		// Start MCP process
		const mcpProcess = spawn('node', [serverScriptPath], {
			env,
			detached: false,
			stdio: ['pipe', 'pipe', 'pipe'],
		});

		// Store process information
		const processInfo = {
			processId: mcpProcess.pid,
			assignedPort,
			accessUrl: `http://localhost:${assignedPort}`,
			mcpType,
			instanceId,
			userId,
			process: mcpProcess,
			startTime: new Date(),
		};

		console.log(
			`MCP ${mcpType} server created for instance ${instanceId} on port ${assignedPort} with PID ${mcpProcess.pid}`
		);

		return {
			processInfo,
			mcpProcess,
			result: {
				processId: mcpProcess.pid,
				assignedPort,
				accessUrl: `http://localhost:${assignedPort}/mcp/${mcpType}`,
			},
		};
	} catch (error) {
		console.error('Failed to create MCP process:', error);
		throw error;
	}
}
