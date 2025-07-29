/**
 * Deletion audit utilities for MCP instance deletion
 * Provides logging and monitoring capabilities for deletion operations
 */

/**
 * Log deletion attempt for audit trail
 * @param {Object} deletionEvent - Deletion event details
 * @param {string} deletionEvent.instanceId - Instance ID being deleted
 * @param {string} deletionEvent.userId - User performing deletion
 * @param {string} deletionEvent.serviceName - Service name (figma, github, etc.)
 * @param {string} deletionEvent.customName - Custom instance name
 * @param {string} deletionEvent.status - Deletion status (started, completed, failed)
 * @param {string} [deletionEvent.error] - Error message if deletion failed
 */
function logDeletionEvent(deletionEvent) {
	const timestamp = new Date().toISOString();
	const logEntry = {
		timestamp,
		event_type: 'mcp_instance_deletion',
		...deletionEvent,
	};

	// Log to console with appropriate level
	switch (deletionEvent.status) {
		case 'started':
			console.log(`🚀 Deletion started:`, logEntry);
			break;
		case 'completed':
			console.log(`✅ Deletion completed:`, logEntry);
			break;
		case 'failed':
			console.error(`❌ Deletion failed:`, logEntry);
			break;
		default:
			console.log(`ℹ️ Deletion event:`, logEntry);
	}

	// In production, this could also write to:
	// - Database audit log table
	// - External logging service (e.g., CloudWatch, Datadog)
	// - File-based audit log
	// - Webhook to monitoring system
}

/**
 * Track deletion performance metrics
 * @param {Object} metrics - Performance metrics
 * @param {string} metrics.instanceId - Instance ID
 * @param {number} metrics.databaseDuration - Database operation duration in ms
 * @param {number} metrics.cacheDuration - Cache cleanup duration in ms
 * @param {number} metrics.totalDuration - Total deletion duration in ms
 * @param {boolean} metrics.cacheCleanupSuccess - Whether cache cleanup succeeded
 */
function trackDeletionMetrics(metrics) {
	const timestamp = new Date().toISOString();
	const metricsEntry = {
		timestamp,
		metric_type: 'deletion_performance',
		...metrics,
	};

	console.log(`📊 Deletion metrics:`, metricsEntry);

	// Performance analysis
	if (metrics.totalDuration > 1000) {
		console.warn(`⚠️ Slow deletion detected (${metrics.totalDuration}ms) for instance ${metrics.instanceId}`);
	}

	if (!metrics.cacheCleanupSuccess) {
		console.warn(`⚠️ Cache cleanup failed for instance ${metrics.instanceId}`);
	}

	// In production, metrics could be sent to:
	// - Metrics collection service (e.g., Prometheus, StatsD)
	// - Application performance monitoring (e.g., New Relic, Datadog)
	// - Custom analytics dashboard
}

/**
 * Validate deletion request before processing
 * @param {Object} request - Deletion request
 * @param {string} request.instanceId - Instance ID to delete
 * @param {string} request.userId - User requesting deletion
 * @returns {Object} Validation result
 */
function validateDeletionRequest(request) {
	const errors = [];

	// Validate instance ID format (UUID)
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!request.instanceId || !uuidRegex.test(request.instanceId)) {
		errors.push('Invalid instance ID format');
	}

	// Validate user ID
	if (!request.userId) {
		errors.push('User ID is required');
	}

	// Additional validation rules can be added here
	// - Instance ownership verification
	// - User permissions check
	// - Rate limiting validation

	return {
		isValid: errors.length === 0,
		errors: errors,
	};
}

/**
 * Generate deletion summary for response
 * @param {Object} deletionResult - Deletion operation result
 * @param {string} deletionResult.instanceId - Deleted instance ID
 * @param {string} deletionResult.serviceName - Service name
 * @param {string} deletionResult.customName - Instance custom name
 * @param {boolean} deletionResult.databaseSuccess - Database deletion success
 * @param {boolean} deletionResult.cacheSuccess - Cache cleanup success
 * @param {number} deletionResult.duration - Total operation duration
 * @returns {Object} Formatted deletion summary
 */
function generateDeletionSummary(deletionResult) {
	return {
		instance_id: deletionResult.instanceId,
		service_type: deletionResult.serviceName,
		custom_name: deletionResult.customName,
		deleted_at: new Date().toISOString(),
		database_cleanup: deletionResult.databaseSuccess ? 'completed' : 'failed',
		cache_cleanup: deletionResult.cacheSuccess ? 'completed' : 'failed',
		total_duration_ms: deletionResult.duration,
		status: deletionResult.databaseSuccess ? 'success' : 'failed',
	};
}

/**
 * Check if instance deletion should be allowed
 * @param {Object} instance - Instance details
 * @param {string} instance.status - Current instance status
 * @param {string} instance.last_used_at - Last usage timestamp
 * @param {number} instance.usage_count - Total usage count
 * @returns {Object} Deletion permission result
 */
function checkDeletionPermission(instance) {
	const warnings = [];
	let allowed = true;

	// Check if instance was recently used (within last hour)
	if (instance.last_used_at) {
		const lastUsed = new Date(instance.last_used_at);
		const hoursSinceUsed = (new Date().getTime() - lastUsed.getTime()) / (1000 * 60 * 60);

		if (hoursSinceUsed < 1) {
			warnings.push('Instance was used within the last hour');
		}
	}

	// Check usage count for high-value instances
	if (instance.usage_count > 1000) {
		warnings.push('Instance has high usage count - consider backing up data');
	}

	// Check for active status
	if (instance.status === 'active') {
		warnings.push('Deleting active instance will immediately revoke access');
	}

	return {
		allowed,
		warnings,
		should_confirm: warnings.length > 0,
	};
}

/**
 * Format deletion error for user-friendly response
 * @param {Error} error - Error that occurred during deletion
 * @param {string} instanceId - Instance ID that failed to delete
 * @returns {Object} Formatted error response
 */
function formatDeletionError(error, instanceId) {
	const errorMessage = error instanceof Error ? error.message : String(error);

	// Map internal errors to user-friendly messages
	const userMessage = mapErrorToUserMessage(errorMessage);

	return {
		error: {
			code: 'DELETION_FAILED',
			message: userMessage,
			instance_id: instanceId,
			timestamp: new Date().toISOString(),
			details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
		},
	};
}

/**
 * Map internal error messages to user-friendly messages
 * @param {string} internalError - Internal error message
 * @returns {string} User-friendly error message
 */
function mapErrorToUserMessage(internalError) {
	const errorMappings = {
		connection: 'Database connection error - please try again',
		timeout: 'Operation timed out - please try again',
		constraint: 'Cannot delete instance due to data constraints',
		permission: 'You do not have permission to delete this instance',
		'not found': 'Instance not found or already deleted',
	};

	// Find matching error type
	for (const [key, message] of Object.entries(errorMappings)) {
		if (internalError.toLowerCase().includes(key)) {
			return message;
		}
	}

	// Default user-friendly message
	return 'Failed to delete instance - please contact support if the problem persists';
}

module.exports = {
	logDeletionEvent,
	trackDeletionMetrics,
	validateDeletionRequest,
	generateDeletionSummary,
	checkDeletionPermission,
	formatDeletionError
};
