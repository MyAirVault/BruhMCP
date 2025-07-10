import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import portManager from './portManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Process management service for MCP instances
 */
class ProcessManager {
	constructor() {
		this.activeProcesses = new Map(); // Map of instanceId -> process info
	}

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
	async createProcess(config) {
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

			// Get server script path
			const serverScriptPath = join(__dirname, '..', 'mcp-servers', `${mcpType}-mcp-server.js`);

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

			this.activeProcesses.set(instanceId, processInfo);

			// Setup process monitoring
			this.setupProcessMonitoring(instanceId, mcpProcess);

			return {
				processId: mcpProcess.pid,
				assignedPort,
				accessUrl: `http://localhost:${assignedPort}`,
			};
		} catch (error) {
			console.error('Failed to create MCP process:', error);
			throw error;
		}
	}

	/**
	 * Setup process monitoring for an MCP instance
	 * @param {string} instanceId - Instance ID
	 * @param {ChildProcess} mcpProcess - Node.js process
	 */
	setupProcessMonitoring(instanceId, mcpProcess) {
		// Log stdout
		mcpProcess.stdout.on('data', data => {
			console.log(`MCP ${instanceId} stdout: ${data.toString()}`);
		});

		// Log stderr
		mcpProcess.stderr.on('data', data => {
			console.error(`MCP ${instanceId} stderr: ${data.toString()}`);
		});

		// Handle process exit
		mcpProcess.on('exit', code => {
			console.log(`MCP ${instanceId} exited with code ${code}`);
			this.handleProcessExit(instanceId, code);
		});

		// Handle process error
		mcpProcess.on('error', error => {
			console.error(`MCP ${instanceId} error:`, error);
			this.handleProcessError(instanceId, error);
		});
	}

	/**
	 * Handle process exit
	 * @param {string} instanceId - Instance ID
	 * @param {number} code - Exit code
	 */
	handleProcessExit(instanceId, code) {
		const processInfo = this.activeProcesses.get(instanceId);
		if (processInfo) {
			// Release port
			portManager.releasePort(processInfo.assignedPort);

			// Remove from active processes
			this.activeProcesses.delete(instanceId);

			// Log exit
			console.log(`Process ${instanceId} exited with code ${code}, port ${processInfo.assignedPort} released`);
		}
	}

	/**
	 * Handle process error
	 * @param {string} instanceId - Instance ID
	 * @param {Error} error - Error object
	 */
	handleProcessError(instanceId, error) {
		console.error(`Process ${instanceId} error:`, error);

		// Clean up process
		this.terminateProcess(instanceId);
	}

	/**
	 * Terminate a process
	 * @param {string} instanceId - Instance ID
	 * @returns {Promise<boolean>} True if process was terminated
	 */
	async terminateProcess(instanceId) {
		const processInfo = this.activeProcesses.get(instanceId);
		if (!processInfo) {
			return false;
		}

		try {
			// Send SIGTERM for graceful shutdown
			process.kill(processInfo.processId, 'SIGTERM');

			// Wait for graceful shutdown, then force kill if needed
			setTimeout(() => {
				if (this.activeProcesses.has(instanceId)) {
					try {
						process.kill(processInfo.processId, 'SIGKILL');
					} catch (error) {
						// Process already terminated
					}
				}
			}, 10000);

			return true;
		} catch (error) {
			console.error(`Failed to terminate process ${instanceId}:`, error);
			return false;
		}
	}

	/**
	 * Check if a process is running
	 * @param {number} pid - Process ID
	 * @returns {boolean} True if process is running
	 */
	isProcessRunning(pid) {
		try {
			process.kill(pid, 0); // Signal 0 checks if process exists
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Get process information
	 * @param {string} instanceId - Instance ID
	 * @returns {Object|null} Process information or null if not found
	 */
	getProcessInfo(instanceId) {
		return this.activeProcesses.get(instanceId) || null;
	}

	/**
	 * Get all active processes
	 * @returns {Array<Object>} Array of process information
	 */
	getAllActiveProcesses() {
		return Array.from(this.activeProcesses.values());
	}

	/**
	 * Health check for all processes
	 * @returns {Promise<Array<Object>>} Array of process health status
	 */
	async healthCheckAll() {
		const healthResults = [];

		for (const [instanceId, processInfo] of this.activeProcesses) {
			const isRunning = this.isProcessRunning(processInfo.processId);

			healthResults.push({
				instanceId,
				processId: processInfo.processId,
				assignedPort: processInfo.assignedPort,
				isRunning,
				uptime: Date.now() - processInfo.startTime.getTime(),
				mcpType: processInfo.mcpType,
				userId: processInfo.userId,
			});
		}

		return healthResults;
	}
}

// Create singleton instance
const processManager = new ProcessManager();

export default processManager;
