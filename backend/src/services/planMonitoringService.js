/**
 * Plan Monitoring Service - Initialize and manage plan expiration monitoring
 * @fileoverview Service to start and manage automated plan expiration monitoring
 */

/* global clearInterval, setTimeout */

const { schedulePlanExpirationAgent, runPlanExpirationAgent, checkForExpiredUsers } = require('./planExpirationAgent.js');
const { isPaymentsDisabled } = require('../utils/planLimits.js');

/**
 * Plan monitoring service instance
 */
class PlanMonitoringService {
	constructor() {
		this.scheduledJob = null;
		this.isRunning = false;
		this.intervalMinutes = 60; // Default: check every hour
	}

	/**
	 * Start the plan monitoring service
	 * @param {number} intervalMinutes - How often to check for expired plans (default: 60 minutes)
	 */
	start(intervalMinutes = 60) {
		if (this.isRunning) {
			console.log('⚠️ Plan Monitoring Service is already running');
			return;
		}

		this.intervalMinutes = intervalMinutes;
		console.log(`🚀 Starting Plan Monitoring Service (checking every ${intervalMinutes} minutes)`);

		try {
			this.scheduledJob = schedulePlanExpirationAgent(intervalMinutes);
			this.isRunning = true;

			console.log('✅ Plan Monitoring Service started successfully');
		} catch (error) {
			console.error('❌ Failed to start Plan Monitoring Service:', error);
			throw error;
		}
	}

	/**
	 * Stop the plan monitoring service
	 */
	stop() {
		if (!this.isRunning) {
			console.log('⚠️ Plan Monitoring Service is not running');
			return;
		}

		console.log('🛑 Stopping Plan Monitoring Service...');

		if (this.scheduledJob) {
			clearInterval(this.scheduledJob);
			this.scheduledJob = null;
		}

		this.isRunning = false;
		console.log('✅ Plan Monitoring Service stopped');
	}

	/**
	 * Restart the plan monitoring service with new interval
	 * @param {number} [intervalMinutes] - New interval in minutes (optional)
	 */
	restart(intervalMinutes) {
		console.log('🔄 Restarting Plan Monitoring Service...');

		this.stop();
		this.start(intervalMinutes ?? this.intervalMinutes);
	}

	/**
	 * Run the plan expiration agent manually (one-time execution)
	 * @returns {Promise<Object>} Execution result
	 */
	async runOnce() {
		console.log('🔧 Running Plan Expiration Agent manually...');

		try {
			const result = await runPlanExpirationAgent();
			console.log('✅ Manual execution completed');
			return result;
		} catch (error) {
			console.error('❌ Manual execution failed:', error);
			throw error;
		}
	}

	/**
	 * Check current status of the monitoring service
	 * @returns {Object} Service status information
	 */
	getStatus() {
		return {
			isRunning: this.isRunning,
			intervalMinutes: this.intervalMinutes,
			nextCheckEstimate: this.isRunning
				? new Date(Date.now() + this.intervalMinutes * 60 * 1000).toISOString()
				: null,
		};
	}

	/**
	 * Get summary of users that need processing
	 * @returns {Promise<Object>} Summary of expired users
	 */
	async getExpiredUsersSummary() {
		try {
			return await checkForExpiredUsers();
		} catch (error) {
			console.error('❌ Failed to get expired users summary:', error);
			throw error;
		}
	}
}

// Create and export singleton instance
const planMonitoringService = new PlanMonitoringService();

// Auto-start the service when this module is imported (with environment configuration)
const autoStartEnabled = process.env.PLAN_MONITORING_AUTO_START !== 'false';
const checkInterval = parseInt(process.env.PLAN_MONITORING_INTERVAL_MINUTES || '60') || 60;

// Skip auto-start in local development with payments disabled
const skipInLocalDev = isPaymentsDisabled();

if (autoStartEnabled && !skipInLocalDev) {
	// Start with a small delay to ensure database connections are ready
	setTimeout(() => {
		try {
			planMonitoringService.start(checkInterval);
		} catch (error) {
			console.error('❌ Failed to auto-start Plan Monitoring Service:', error);
		}
	}, 10000); // 10 second delay
} else if (skipInLocalDev) {
	console.log('🚫 Plan Monitoring Service disabled in local development (DISABLE_PAYMENTS=true)');
}

module.exports = planMonitoringService;

/**
 * Express route handlers for plan monitoring management
 */

/**
 * Get plan monitoring service status
 * @param {import('express').Request} _req - Request object (unused)
 * @param {import('express').Response} res - Response object
 */
async function getPlanMonitoringStatus(/** @type {import('express').Request} */ _req, res) {
	try {
		const status = planMonitoringService.getStatus();
		const expiredSummary = await planMonitoringService.getExpiredUsersSummary();

		res.json({
			service: status,
			expiredUsers: expiredSummary,
		});
	} catch (/** @type {unknown} */ error) {
		console.error('Error getting plan monitoring status:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'STATUS_ERROR',
				message: 'Failed to get monitoring status',
				details: errorMessage,
			},
		});
	}
}

/**
 * Manually trigger plan expiration agent
 * @param {import('express').Request} _req - Request object (unused)
 * @param {import('express').Response} res - Response object
 */
async function triggerPlanExpirationAgent(/** @type {import('express').Request} */ _req, res) {
	try {
		const result = await planMonitoringService.runOnce();

		res.json({
			message: 'Plan expiration agent executed successfully',
			result,
		});
	} catch (/** @type {unknown} */ error) {
		console.error('Error triggering plan expiration agent:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'TRIGGER_ERROR',
				message: 'Failed to trigger expiration agent',
				details: errorMessage,
			},
		});
	}
}

/**
 * Update plan monitoring service configuration
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function updatePlanMonitoringConfig(req, res) {
	try {
		const { intervalMinutes, enabled } = req.body;

		if (enabled === false) {
			planMonitoringService.stop();
		} else if (enabled === true) {
			planMonitoringService.start(intervalMinutes);
		} else if (intervalMinutes && planMonitoringService.isRunning) {
			planMonitoringService.restart(intervalMinutes);
		}

		const status = planMonitoringService.getStatus();

		res.json({
			message: 'Plan monitoring configuration updated',
			status,
		});
	} catch (/** @type {unknown} */ error) {
		console.error('Error updating plan monitoring config:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);
		res.status(500).json({
			error: {
				code: 'CONFIG_ERROR',
				message: 'Failed to update monitoring configuration',
				details: errorMessage,
			},
		});
	}
}

// Also export the route handlers
module.exports.getPlanMonitoringStatus = getPlanMonitoringStatus;
module.exports.triggerPlanExpirationAgent = triggerPlanExpirationAgent;
module.exports.updatePlanMonitoringConfig = updatePlanMonitoringConfig;
