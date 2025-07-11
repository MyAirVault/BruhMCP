/**
 * Port validation utilities for MCP instances
 * Ensures all port assignments are within the valid range
 */

// Hard-coded valid port range matching database constraints
const VALID_PORT_RANGE = {
	MIN: 49160,
	MAX: 49999,
};

/**
 * Validate if a port is within the valid MCP port range
 * @param {number} port - Port number to validate
 * @returns {boolean} True if port is valid
 */
export function isValidMCPPort(port) {
	const portNum = typeof port === 'string' ? parseInt(port) : port;
	return !isNaN(portNum) && portNum >= VALID_PORT_RANGE.MIN && portNum <= VALID_PORT_RANGE.MAX;
}

/**
 * Validate environment variable port range against database constraints
 * @param {number} rangeStart - Start of port range
 * @param {number} rangeEnd - End of port range
 * @throws {Error} If range doesn't match database constraints
 */
export function validatePortRange(rangeStart, rangeEnd) {
	const startNum = typeof rangeStart === 'string' ? parseInt(rangeStart) : rangeStart;
	const endNum = typeof rangeEnd === 'string' ? parseInt(rangeEnd) : rangeEnd;

	if (isNaN(startNum) || isNaN(endNum)) {
		throw new Error('PORT_RANGE_START and PORT_RANGE_END must be valid numbers');
	}

	if (startNum !== VALID_PORT_RANGE.MIN || endNum !== VALID_PORT_RANGE.MAX) {
		throw new Error(
			`Port range (${startNum}-${endNum}) doesn't match database constraints (${VALID_PORT_RANGE.MIN}-${VALID_PORT_RANGE.MAX}). ` +
				'Update database constraints if you need to change the port range.'
		);
	}

	if (startNum >= endNum) {
		throw new Error('PORT_RANGE_START must be less than PORT_RANGE_END');
	}
}

/**
 * Get the valid port range
 * @returns {Object} Valid port range
 */
export function getValidPortRange() {
	return {
		min: VALID_PORT_RANGE.MIN,
		max: VALID_PORT_RANGE.MAX,
		total: VALID_PORT_RANGE.MAX - VALID_PORT_RANGE.MIN + 1,
	};
}

/**
 * Validate port assignment for database operations
 * @param {number|null} port - Port to validate (null is allowed for deactivated instances)
 * @throws {Error} If port is invalid
 */
export function validatePortAssignment(port) {
	// Allow null values for deactivated instances
	if (port === null || port === undefined) {
		return;
	}
	
	if (!isValidMCPPort(port)) {
		throw new Error(
			`Invalid port assignment: ${port}. Port must be between ${VALID_PORT_RANGE.MIN} and ${VALID_PORT_RANGE.MAX}`
		);
	}
}
