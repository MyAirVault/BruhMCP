/**
 * Simple port management service
 */
class PortManager {
	constructor() {
		this.usedPorts = new Set();
		this.portRange = {
			start: parseInt(process.env.PORT_RANGE_START) || 3001,
			end: parseInt(process.env.PORT_RANGE_END) || 3100,
		};
	}

	/**
	 * Get an available port
	 * @returns {number} Available port number
	 * @throws {Error} If no ports are available
	 */
	getAvailablePort() {
		for (let port = this.portRange.start; port <= this.portRange.end; port++) {
			if (!this.usedPorts.has(port)) {
				this.usedPorts.add(port);
				return port;
			}
		}
		throw new Error('No available ports in range');
	}

	/**
	 * Release a port
	 * @param {number} port - Port number to release
	 */
	releasePort(port) {
		this.usedPorts.delete(port);
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
