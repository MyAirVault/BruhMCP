import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import portManager from '../portManager.js';
import { generateAccessUrl } from '../../controllers/mcpInstances/utils.js';
import { validatePortAssignment } from '../../utils/portValidation.js';
import { processHealthMonitor } from './process-health-monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a new MCP process with comprehensive validation and retry logic
 * @param {Object} config - Process configuration
 * @param {string} config.mcpType - MCP type name
 * @param {string} config.instanceId - Instance ID
 * @param {string} config.userId - User ID
 * @param {Object} config.credentials - Decrypted credentials
 * @param {Object} config.config - Instance configuration
 * @param {number} [config.retryAttempt=1] - Current retry attempt
 * @returns {Promise<Object>} Process information
 */
export async function createProcess(config) {
	const { mcpType, instanceId, userId, credentials, config: instanceConfig, retryAttempt = 1 } = config;
	const maxRetries = 3;

	let assignedPort;
	let processInfo;

	try {
		console.log(`🚀 Creating MCP process for ${instanceId} (attempt ${retryAttempt}/${maxRetries})`);

		// Get available port with retry logic
		assignedPort = await portManager.getAvailablePort();

		// Double-check port availability to prevent race conditions
		const portConflict = await checkPortConflict(assignedPort);
		if (portConflict) {
			throw new Error(`Port ${assignedPort} is already in use`);
		}

		// Validate port assignment
		validatePortAssignment(assignedPort);

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

		console.log(`🔧 Spawning process for ${instanceId} on port ${assignedPort}`);

		// Start MCP process with enhanced error handling
		const mcpProcess = spawn('node', [serverScriptPath], {
			env,
			detached: false,
			stdio: ['pipe', 'pipe', 'pipe'],
		});

		// Verify process was spawned successfully
		if (!mcpProcess.pid) {
			throw new Error('Failed to spawn process - no PID assigned');
		}

		// Store process information
		processInfo = {
			processId: mcpProcess.pid,
			assignedPort,
			accessUrl: generateAccessUrl(assignedPort, instanceId, mcpType),
			mcpType,
			instanceId,
			userId,
			process: mcpProcess,
			startTime: new Date(),
			retryAttempt,
		};

		console.log(
			`🎯 MCP ${mcpType} process spawned for instance ${instanceId} on port ${assignedPort} with PID ${mcpProcess.pid}`
		);

		// CRITICAL: Validate that the process actually starts successfully
		console.log(`🔍 Validating startup for instance ${instanceId}...`);
		const startupSuccess = await processHealthMonitor.validateProcessStartup(instanceId, processInfo, assignedPort);

		if (!startupSuccess) {
			throw new Error('Process startup validation failed');
		}

		console.log(`✅ Instance ${instanceId} validated and ready`);
		console.log(`🔗 Access URL: ${generateAccessUrl(assignedPort, instanceId, mcpType)}`);

		return {
			processInfo,
			mcpProcess,
			result: {
				processId: mcpProcess.pid,
				assignedPort,
				accessUrl: generateAccessUrl(assignedPort, instanceId, mcpType),
				validated: true,
				retryAttempt,
			},
		};
	} catch (error) {
		console.error(`❌ Failed to create MCP process for ${instanceId} (attempt ${retryAttempt}):`, error.message);

		// Clean up on failure
		if (assignedPort) {
			portManager.releasePort(assignedPort);
		}

		if (processInfo && processInfo.process) {
			try {
				processInfo.process.kill('SIGTERM');
			} catch (killError) {
				console.error('Failed to kill failed process:', killError.message);
			}
		}

		// Retry logic
		if (retryAttempt < maxRetries) {
			console.log(`🔄 Retrying process creation for ${instanceId} (${retryAttempt + 1}/${maxRetries})`);

			// Wait before retry with exponential backoff
			const delay = Math.min(1000 * Math.pow(2, retryAttempt - 1), 10000);
			await new Promise(resolve => setTimeout(resolve, delay));

			// Recursive retry
			return createProcess({
				...config,
				retryAttempt: retryAttempt + 1,
			});
		}

		// All retries exhausted
		const finalError = new Error(
			`Failed to create process after ${maxRetries} attempts. Last error: ${error.message}`
		);
		finalError.originalError = error;
		finalError.retryAttempts = retryAttempt;
		throw finalError;
	}
}

/**
 * Check if a port is actually in use (additional validation)
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} True if port is in use
 */
async function checkPortConflict(port) {
	return new Promise(async resolve => {
		const { createServer } = await import('net');
		const server = createServer();

		server.listen(port, () => {
			server.close(() => resolve(false)); // Port is available
		});

		server.on('error', () => resolve(true)); // Port is in use
	});
}
