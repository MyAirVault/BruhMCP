export default portManager;
declare const portManager: PortManager;
/**
 * Simple port management service
 */
declare class PortManager {
	usedPorts: Set<any>;
	portRange: {
		start: number;
		end: number;
	};
	/**
	 * Get an available port
	 * @returns {number} Available port number
	 * @throws {Error} If no ports are available
	 */
	getAvailablePort(): number;
	/**
	 * Release a port
	 * @param {number} port - Port number to release
	 */
	releasePort(port: number): void;
	/**
	 * Check if a port is available
	 * @param {number} port - Port number to check
	 * @returns {boolean} True if port is available
	 */
	isPortAvailable(port: number): boolean;
	/**
	 * Reserve a specific port
	 * @param {number} port - Port number to reserve
	 * @returns {boolean} True if port was successfully reserved
	 */
	reservePort(port: number): boolean;
	/**
	 * Get the list of used ports
	 * @returns {Array<number>} Array of used port numbers
	 */
	getUsedPorts(): Array<number>;
	/**
	 * Get port range information
	 * @returns {Object} Port range information
	 */
	getPortRange(): object;
}
//# sourceMappingURL=portManager.d.ts.map
