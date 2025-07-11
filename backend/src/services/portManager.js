import { validatePortRange, getValidPortRange } from '../utils/portValidation.js';

/**
 * Enhanced port management service with database synchronization
 */
class PortManager {
	constructor() {
		this.usedPorts = new Set();

		// Validate environment variables against database constraints
		const envStart = parseInt(process.env.PORT_RANGE_START || '49160');
		const envEnd = parseInt(process.env.PORT_RANGE_END || '49999');

		try {
			validatePortRange(envStart, envEnd);
		} catch (error) {
			console.error('❌ Port range validation failed:', error.message);
			console.log('🔧 Using database-enforced port range instead');
		}

		// Always use the validated range
		const validRange = getValidPortRange();
		this.portRange = {
			start: validRange.min,
			end: validRange.max,
		};

		this.initialized = false;
		this.initializationPromise = null;
	}

	/**
	 * Initialize port manager by syncing with database
	 * Uses mutex pattern to prevent race conditions during concurrent initialization
	 */
	async initialize() {
		// If already initialized, return immediately
		if (this.initialized) return;

		// If initialization is in progress, wait for it to complete
		if (this.initializationPromise) {
			return this.initializationPromise;
		}

		// Start initialization and store the promise to prevent concurrent execution
		this.initializationPromise = this._performInitialization();

		try {
			await this.initializationPromise;
		} finally {
			// Clear the promise when done, regardless of success or failure
			this.initializationPromise = null;
		}
	}

	/**
	 * Internal method to perform the actual initialization
	 * @private
	 */
	async _performInitialization() {
		try {
			const { getAllActiveInstancePorts } = await import('../db/queries/mcpInstancesQueries.js');
			const activePorts = await getAllActiveInstancePorts();

			// Clear and sync with database
			this.usedPorts.clear();
			activePorts.forEach(port => {
				if (port && port >= this.portRange.start && port <= this.portRange.end) {
					this.usedPorts.add(port);
				}
			});

			console.log(`🔧 Port manager initialized with ${this.usedPorts.size} active ports from database`);
			this.initialized = true;
		} catch (error) {
			console.error('❌ Failed to initialize port manager:', error);
			// Continue with empty set if database sync fails
			this.initialized = true;
		}
	}

	/**
	 * Get an available port
	 * @returns {Promise<number>} Available port number
	 * @throws {Error} If no ports are available
	 */
	async getAvailablePort() {
		await this.initialize();

		for (let port = this.portRange.start; port <= this.portRange.end; port++) {
			if (!this.usedPorts.has(port)) {
				this.usedPorts.add(port);
				console.log(
					`🔌 Allocated port ${port} (${this.usedPorts.size}/${this.portRange.end - this.portRange.start + 1} used)`
				);
				return port;
			}
		}
		throw new Error(`No available ports in range ${this.portRange.start}-${this.portRange.end}`);
	}

	/**
	 * Release a port
	 * @param {number} port - Port number to release
	 */
	releasePort(port) {
		if (this.usedPorts.has(port)) {
			this.usedPorts.delete(port);
			console.log(
				`🔌 Released port ${port} (${this.usedPorts.size}/${this.portRange.end - this.portRange.start + 1} used)`
			);
		}
	}

	/**
	 * Check if a port is available
	 * @param {number} port - Port number to check
	 * @returns {boolean} True if port is available
	 */
	isPortAvailable(port) {
		return !this.usedPorts.has(port);
	}

	/**
	 * Reserve a specific port
	 * @param {number} port - Port number to reserve
	 * @returns {boolean} True if port was successfully reserved
	 */
	reservePort(port) {
		if (this.isPortAvailable(port)) {
			this.usedPorts.add(port);
			return true;
		}
		return false;
	}

	/**
	 * Get the list of used ports
	 * @returns {Array<number>} Array of used port numbers
	 */
	getUsedPorts() {
		return Array.from(this.usedPorts);
	}

	/**
	 * Get port range information
	 * @returns {Object} Port range information
	 */
	getPortRange() {
		return {
			start: this.portRange.start,
			end: this.portRange.end,
			total: this.portRange.end - this.portRange.start + 1,
			used: this.usedPorts.size,
			available: this.portRange.end - this.portRange.start + 1 - this.usedPorts.size,
		};
	}
}

// Create singleton instance
const portManager = new PortManager();

export default portManager;
