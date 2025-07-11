/**
 * Port Management Verification Tests
 *
 * Comprehensive tests to verify that port management is working correctly:
 * - Port allocation and release
 * - Database synchronization
 * - Conflict prevention
 * - Cleanup on process termination
 */

import { spawn } from 'child_process';
import { setTimeout } from 'node:timers/promises';
import portManager from '../../src/services/portManager.js';
import { pool } from '../../src/db/config.js';
import { getAllActiveInstancePorts } from '../../src/db/queries/mcpInstancesQueries.js';

/**
 * Test suite for port management verification
 */
export class PortManagementTests {
	constructor() {
		this.testResults = [];
		this.originalPorts = new Set();
	}

	/**
	 * Initialize test environment
	 */
	async initialize() {
		console.log('🔧 Initializing port management tests...');

		// Store original port state
		this.originalPorts = new Set(portManager.getUsedPorts());

		// Force reinitialize port manager to test database sync
		portManager.usedPorts.clear();
		portManager.initialized = false;

		await portManager.initialize();

		console.log('✅ Port management tests initialized');
	}

	/**
	 * Test 1: Port manager database synchronization
	 */
	async testDatabaseSync() {
		console.log('🧪 Testing port manager database synchronization...');

		try {
			// Get ports from database
			const dbPorts = await getAllActiveInstancePorts();
			const managerPorts = portManager.getUsedPorts();

			// Compare sets
			const dbPortsSet = new Set(dbPorts);
			const managerPortsSet = new Set(managerPorts);

			const missing = dbPorts.filter(port => !managerPortsSet.has(port));
			const extra = managerPorts.filter(port => !dbPortsSet.has(port));

			const success = missing.length === 0 && extra.length === 0;

			this.testResults.push({
				test: 'Database Synchronization',
				success,
				details: {
					dbPorts: dbPorts.length,
					managerPorts: managerPorts.length,
					missing,
					extra,
				},
				message: success
					? 'Port manager successfully synchronized with database'
					: `Sync mismatch - Missing: ${missing}, Extra: ${extra}`,
			});

			console.log(success ? '✅' : '❌', 'Database sync test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Database Synchronization',
				success: false,
				error: error.message,
				message: 'Failed to test database synchronization',
			});

			console.log('❌ Database sync test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 2: Port allocation and release
	 */
	async testPortAllocation() {
		console.log('🧪 Testing port allocation and release...');

		try {
			const initialUsed = portManager.getUsedPorts().length;
			const testPorts = [];

			// Allocate 5 ports
			for (let i = 0; i < 5; i++) {
				const port = await portManager.getAvailablePort();
				testPorts.push(port);
			}

			const afterAllocation = portManager.getUsedPorts().length;
			const allocationCorrect = afterAllocation === initialUsed + 5;

			// Release all test ports
			testPorts.forEach(port => portManager.releasePort(port));
			const afterRelease = portManager.getUsedPorts().length;
			const releaseCorrect = afterRelease === initialUsed;

			// Test unique port allocation
			const uniquePorts = new Set(testPorts);
			const uniqueCorrect = uniquePorts.size === testPorts.length;

			const success = allocationCorrect && releaseCorrect && uniqueCorrect;

			this.testResults.push({
				test: 'Port Allocation/Release',
				success,
				details: {
					initialUsed,
					afterAllocation,
					afterRelease,
					testPorts,
					uniquePorts: uniquePorts.size,
				},
				message: success
					? 'Port allocation and release working correctly'
					: 'Port allocation/release has issues',
			});

			console.log(success ? '✅' : '❌', 'Port allocation test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Port Allocation/Release',
				success: false,
				error: error.message,
				message: 'Failed to test port allocation',
			});

			console.log('❌ Port allocation test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 3: Port conflict prevention
	 */
	async testPortConflictPrevention() {
		console.log('🧪 Testing port conflict prevention...');

		try {
			// Get a port and manually reserve it
			const port1 = await portManager.getAvailablePort();

			// Try to reserve the same port again
			const reserved = portManager.reservePort(port1);

			// Should fail because port is already used
			const conflictPrevented = !reserved;

			// Check availability
			const isAvailable = portManager.isPortAvailable(port1);

			// Release the port
			portManager.releasePort(port1);

			// Now it should be available
			const nowAvailable = portManager.isPortAvailable(port1);

			const success = conflictPrevented && !isAvailable && nowAvailable;

			this.testResults.push({
				test: 'Port Conflict Prevention',
				success,
				details: {
					port: port1,
					conflictPrevented,
					wasAvailable: isAvailable,
					nowAvailable,
				},
				message: success ? 'Port conflict prevention working correctly' : 'Port conflict prevention has issues',
			});

			console.log(success ? '✅' : '❌', 'Port conflict prevention test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Port Conflict Prevention',
				success: false,
				error: error.message,
				message: 'Failed to test port conflict prevention',
			});

			console.log('❌ Port conflict prevention test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 4: Port range validation
	 */
	async testPortRangeValidation() {
		console.log('🧪 Testing port range validation...');

		try {
			const portRange = portManager.getPortRange();
			const { start, end, total, used, available } = portRange;

			// Validate range consistency
			const totalCorrect = total === end - start + 1;
			const availableCorrect = available === total - used;

			// Validate allocated ports are within range
			const usedPorts = portManager.getUsedPorts();
			const allInRange = usedPorts.every(port => port >= start && port <= end);

			// Test exhaustion scenario (if safe to do so)
			let exhaustionHandled = true;
			if (available < 10) {
				// Only test if we have few ports left
				try {
					// Try to allocate more ports than available
					const ports = [];
					for (let i = 0; i < available + 1; i++) {
						ports.push(await portManager.getAvailablePort());
					}
					// This should throw an error before completing
					exhaustionHandled = false;
					// Clean up
					ports.forEach(port => portManager.releasePort(port));
				} catch (error) {
					// Expected behavior - should throw when exhausted
					exhaustionHandled = error.message.includes('No available ports');
				}
			}

			const success = totalCorrect && availableCorrect && allInRange && exhaustionHandled;

			this.testResults.push({
				test: 'Port Range Validation',
				success,
				details: {
					portRange,
					totalCorrect,
					availableCorrect,
					allInRange,
					exhaustionHandled,
					usedPortsCount: usedPorts.length,
				},
				message: success ? 'Port range validation working correctly' : 'Port range validation has issues',
			});

			console.log(success ? '✅' : '❌', 'Port range validation test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Port Range Validation',
				success: false,
				error: error.message,
				message: 'Failed to test port range validation',
			});

			console.log('❌ Port range validation test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 5: Port cleanup on process termination simulation
	 */
	async testPortCleanupSimulation() {
		console.log('🧪 Testing port cleanup simulation...');

		try {
			const initialUsed = portManager.getUsedPorts().length;

			// Simulate process creation and termination
			const testPort = await portManager.getAvailablePort();

			// Verify port is allocated
			const allocated = !portManager.isPortAvailable(testPort);

			// Simulate process termination by releasing port
			portManager.releasePort(testPort);

			// Verify port is released
			const released = portManager.isPortAvailable(testPort);

			// Verify we're back to initial state
			const finalUsed = portManager.getUsedPorts().length;
			const backToInitial = finalUsed === initialUsed;

			const success = allocated && released && backToInitial;

			this.testResults.push({
				test: 'Port Cleanup Simulation',
				success,
				details: {
					testPort,
					initialUsed,
					finalUsed,
					allocated,
					released,
					backToInitial,
				},
				message: success ? 'Port cleanup simulation working correctly' : 'Port cleanup simulation has issues',
			});

			console.log(success ? '✅' : '❌', 'Port cleanup simulation test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Port Cleanup Simulation',
				success: false,
				error: error.message,
				message: 'Failed to test port cleanup simulation',
			});

			console.log('❌ Port cleanup simulation test failed:', error.message);
			return false;
		}
	}

	/**
	 * Run all port management tests
	 */
	async runAllTests() {
		console.log('🚀 Starting port management verification tests...\n');

		await this.initialize();

		const tests = [
			() => this.testDatabaseSync(),
			() => this.testPortAllocation(),
			() => this.testPortConflictPrevention(),
			() => this.testPortRangeValidation(),
			() => this.testPortCleanupSimulation(),
		];

		let passedTests = 0;

		for (const test of tests) {
			const result = await test();
			if (result) passedTests++;
			console.log(''); // Add spacing between tests
		}

		const summary = {
			total: tests.length,
			passed: passedTests,
			failed: tests.length - passedTests,
			successRate: ((passedTests / tests.length) * 100).toFixed(1),
		};

		console.log('📊 Port Management Test Summary:');
		console.log(`   Total Tests: ${summary.total}`);
		console.log(`   Passed: ${summary.passed}`);
		console.log(`   Failed: ${summary.failed}`);
		console.log(`   Success Rate: ${summary.successRate}%`);

		return {
			summary,
			results: this.testResults,
		};
	}

	/**
	 * Cleanup test environment
	 */
	async cleanup() {
		console.log('🧹 Cleaning up port management tests...');
		// Restore original port state if needed
		// This is handled automatically by the port manager
		console.log('✅ Port management tests cleaned up');
	}
}

export default PortManagementTests;
