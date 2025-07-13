import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { processHealthMonitor } from './process-health-monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a new MCP process (simplified without port allocation)
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

	let processInfo;

	try {
		console.log(`🚀 Creating MCP process for ${instanceId} (attempt ${retryAttempt}/${maxRetries})`);

		// Prepare environment variables (no port allocation)
		const env = {
			...process.env,
			MCP_ID: instanceId,
			USER_ID: userId,
			MCP_TYPE: mcpType,
			CREDENTIALS: JSON.stringify(credentials),
			CONFIG: JSON.stringify(instanceConfig || {}),
			NODE_ENV: 'production',
		};

		// Get universal server script path
		const serverScriptPath = join(__dirname, '..', '..', 'mcp-servers', 'universal-mcp-server.js');

		console.log(`🔧 Spawning process for ${instanceId}`);

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
			mcpType,
			instanceId,
			userId,
			process: mcpProcess,
			startTime: new Date(),
			retryAttempt,
		};

		console.log(
			`🎯 MCP ${mcpType} process spawned for instance ${instanceId} with PID ${mcpProcess.pid}`
		);

		// Validate process startup
		const startupSuccess = await processHealthMonitor.validateProcessStartup(instanceId, processInfo);
		if (!startupSuccess) {
			throw new Error('Process startup validation failed');
		}

		console.log(`✅ Instance ${instanceId} process created and validated successfully`);

		return {
			processInfo,
			mcpProcess,
			result: {
				processId: mcpProcess.pid,
				validated: true,
				retryAttempt,
			},
		};
	} catch (error) {
		console.error(`❌ Failed to create MCP process for ${instanceId} (attempt ${retryAttempt}):`, error.message);

		// Clean up on failure
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

