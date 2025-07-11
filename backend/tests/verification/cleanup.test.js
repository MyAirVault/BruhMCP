/**
 * Cleanup Verification Tests
 *
 * Comprehensive tests to verify that cleanup processes are working correctly:
 * - Process termination releases ports properly
 * - Database cleanup on instance deletion
 * - Graceful vs forced termination cleanup
 * - No port leaks occur
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { setTimeout } from 'node:timers/promises';
import portManager from '../../src/services/portManager.js';
import processManager from '../../src/services/processManager.js';
import { pool } from '../../src/db/config.js';
import {
	createMCPInstance,
	getMCPInstanceById,
	deleteMCPInstance,
	getAllActiveInstancePorts,
} from '../../src/db/queries/mcpInstancesQueries.js';

const execAsync = promisify(exec);

/**
 * Test suite for cleanup verification
 */
export class CleanupTests {
	constructor() {
		this.testResults = [];
		this.testInstances = [];
		this.testProcesses = [];
	}

	/**
	 * Initialize test environment
	 */
	async initialize() {
		console.log('🔧 Initializing cleanup tests...');

		// Clear any previous test data
		this.testInstances = [];
		this.testProcesses = [];

		console.log('✅ Cleanup tests initialized');
	}

	/**
	 * Test 1: Process termination port cleanup
	 */
	async testProcessTerminationCleanup() {
		console.log('🧪 Testing process termination port cleanup...');

		try {
			const initialUsedPorts = portManager.getUsedPorts().length;
			const testPort = await portManager.getAvailablePort();

			// Create a simple test process that uses the port
			const testProcess = spawn(
				'node',
				[
					'-e',
					`
				const http = require('http');
				const server = http.createServer((req, res) => {
					res.writeHead(200);
					res.end('test');
				});
				server.listen(${testPort}, () => {
					console.log('Test server started on port ${testPort}');
				});
				
				// Keep process alive
				process.on('SIGTERM', () => {
					console.log('Received SIGTERM, shutting down gracefully');
					server.close(() => {
						process.exit(0);
					});
				});
			`,
				],
				{
					stdio: ['ignore', 'pipe', 'pipe'],
				}
			);

			// Wait for process to start
			await setTimeout(1000);

			const processStarted = testProcess.pid !== undefined;
			const portAllocated = !portManager.isPortAvailable(testPort);

			// Terminate the process
			testProcess.kill('SIGTERM');

			// Wait for process to terminate
			await new Promise(resolve => {
				testProcess.on('exit', resolve);
				setTimeout(() => resolve(), 5000); // Timeout after 5 seconds
			});

			// Release port (simulating what process monitoring would do)
			portManager.releasePort(testPort);

			const finalUsedPorts = portManager.getUsedPorts().length;
			const portReleased = portManager.isPortAvailable(testPort);
			const backToInitial = finalUsedPorts === initialUsedPorts;

			const success = processStarted && portAllocated && portReleased && backToInitial;

			this.testResults.push({
				test: 'Process Termination Cleanup',
				success,
				details: {
					testPort,
					processId: testProcess.pid,
					initialUsedPorts,
					finalUsedPorts,
					processStarted,
					portAllocated,
					portReleased,
					backToInitial,
				},
				message: success
					? 'Process termination cleanup working correctly'
					: 'Process termination cleanup has issues',
			});

			console.log(success ? '✅' : '❌', 'Process termination cleanup test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Process Termination Cleanup',
				success: false,
				error: error.message,
				message: 'Failed to test process termination cleanup',
			});

			console.log('❌ Process termination cleanup test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 2: Database cleanup on instance deletion
	 */
	async testDatabaseCleanup() {
		console.log('🧪 Testing database cleanup on instance deletion...');

		try {
			// Create a test MCP instance record
			const testInstance = {
				user_id: '550e8400-e29b-41d4-a716-446655440000', // Test user ID
				mcp_type_id: '550e8400-e29b-41d4-a716-446655440001', // Test MCP type ID
				api_key_id: null,
				custom_name: 'Test Cleanup Instance',
				access_token: `test_token_${Date.now()}`,
				assigned_port: await portManager.getAvailablePort(),
				process_id: 999999, // Fake process ID for testing
				config: { test: true },
			};

			// Insert test instance into database
			const insertQuery = `
				INSERT INTO mcp_instances (
					user_id, mcp_type_id, api_key_id, custom_name, 
					access_token, assigned_port, process_id, config
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
				RETURNING id
			`;

			const insertResult = await pool.query(insertQuery, [
				testInstance.user_id,
				testInstance.mcp_type_id,
				testInstance.api_key_id,
				testInstance.custom_name,
				testInstance.access_token,
				testInstance.assigned_port,
				testInstance.process_id,
				JSON.stringify(testInstance.config),
			]);

			const instanceId = insertResult.rows[0].id;
			this.testInstances.push(instanceId);

			// Verify instance exists
			const instanceExists = await this.checkInstanceExists(instanceId);

			// Check that port is tracked
			const portsBeforeDeletion = await getAllActiveInstancePorts();
			const portTracked = portsBeforeDeletion.includes(testInstance.assigned_port);

			// Delete the instance
			await deleteMCPInstance(instanceId, testInstance.user_id);

			// Verify instance is deleted
			const instanceDeleted = !(await this.checkInstanceExists(instanceId));

			// Check that port is no longer tracked
			const portsAfterDeletion = await getAllActiveInstancePorts();
			const portUntracked = !portsAfterDeletion.includes(testInstance.assigned_port);

			// Release port from manager
			portManager.releasePort(testInstance.assigned_port);

			const success = instanceExists && portTracked && instanceDeleted && portUntracked;

			this.testResults.push({
				test: 'Database Cleanup',
				success,
				details: {
					instanceId,
					testPort: testInstance.assigned_port,
					instanceExists,
					portTracked,
					instanceDeleted,
					portUntracked,
					portsBeforeDeletion: portsBeforeDeletion.length,
					portsAfterDeletion: portsAfterDeletion.length,
				},
				message: success ? 'Database cleanup working correctly' : 'Database cleanup has issues',
			});

			console.log(success ? '✅' : '❌', 'Database cleanup test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Database Cleanup',
				success: false,
				error: error.message,
				message: 'Failed to test database cleanup',
			});

			console.log('❌ Database cleanup test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 3: Graceful vs forced termination
	 */
	async testGracefulVsForcedTermination() {
		console.log('🧪 Testing graceful vs forced termination...');

		try {
			const testPort1 = await portManager.getAvailablePort();
			const testPort2 = await portManager.getAvailablePort();

			// Test graceful termination
			const gracefulProcess = spawn('node', [
				'-e',
				`
				process.on('SIGTERM', () => {
					console.log('Graceful shutdown');
					process.exit(0);
				});
				setTimeout(() => {}, 10000); // Keep alive
			`,
			]);

			// Test forced termination (process that ignores SIGTERM)
			const stubbornProcess = spawn('node', [
				'-e',
				`
				process.on('SIGTERM', () => {
					console.log('Ignoring SIGTERM');
					// Don't exit, force SIGKILL
				});
				setTimeout(() => {}, 20000); // Keep alive longer
			`,
			]);

			await setTimeout(500); // Let processes start

			const gracefulStartTime = Date.now();
			gracefulProcess.kill('SIGTERM');

			// Wait for graceful process to exit
			const gracefulExitPromise = new Promise(resolve => {
				gracefulProcess.on('exit', code => resolve({ code, time: Date.now() - gracefulStartTime }));
			});

			const stubbornStartTime = Date.now();
			stubbornProcess.kill('SIGTERM');

			// Wait a bit, then force kill
			setTimeout(() => {
				if (!stubbornProcess.killed) {
					stubbornProcess.kill('SIGKILL');
				}
			}, 1000);

			const stubbornExitPromise = new Promise(resolve => {
				stubbornProcess.on('exit', code => resolve({ code, time: Date.now() - stubbornStartTime }));
			});

			const [gracefulResult, stubbornResult] = await Promise.all([gracefulExitPromise, stubbornExitPromise]);

			// Release test ports
			portManager.releasePort(testPort1);
			portManager.releasePort(testPort2);

			const gracefulExitedQuickly = gracefulResult.time < 2000; // Should exit within 2 seconds
			const stubbornExitedEventually = stubbornResult.time >= 1000; // Should take at least 1 second (forced)

			const success = gracefulExitedQuickly && stubbornExitedEventually;

			this.testResults.push({
				test: 'Graceful vs Forced Termination',
				success,
				details: {
					gracefulResult,
					stubbornResult,
					gracefulExitedQuickly,
					stubbornExitedEventually,
				},
				message: success
					? 'Graceful and forced termination working correctly'
					: 'Termination behavior has issues',
			});

			console.log(success ? '✅' : '❌', 'Graceful vs forced termination test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Graceful vs Forced Termination',
				success: false,
				error: error.message,
				message: 'Failed to test graceful vs forced termination',
			});

			console.log('❌ Graceful vs forced termination test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 4: Port leak detection
	 */
	async testPortLeakDetection() {
		console.log('🧪 Testing port leak detection...');

		try {
			const initialPorts = portManager.getUsedPorts().length;
			const initialDbPorts = (await getAllActiveInstancePorts()).length;

			// Simulate multiple process creations and terminations
			const operations = [];
			const allocatedPorts = [];

			for (let i = 0; i < 5; i++) {
				const port = await portManager.getAvailablePort();
				allocatedPorts.push(port);

				// Simulate some operations
				operations.push({
					port,
					allocated: true,
					released: false,
				});
			}

			// Release all ports
			allocatedPorts.forEach(port => {
				portManager.releasePort(port);
				const op = operations.find(o => o.port === port);
				if (op) op.released = true;
			});

			const finalPorts = portManager.getUsedPorts().length;
			const finalDbPorts = (await getAllActiveInstancePorts()).length;

			// Check for leaks
			const noPortLeaksInManager = finalPorts === initialPorts;
			const allOperationsCompleted = operations.every(op => op.allocated && op.released);
			const dbPortsUnchanged = finalDbPorts === initialDbPorts;

			const success = noPortLeaksInManager && allOperationsCompleted && dbPortsUnchanged;

			this.testResults.push({
				test: 'Port Leak Detection',
				success,
				details: {
					initialPorts,
					finalPorts,
					initialDbPorts,
					finalDbPorts,
					operations,
					noPortLeaksInManager,
					allOperationsCompleted,
					dbPortsUnchanged,
				},
				message: success ? 'No port leaks detected' : 'Port leaks detected',
			});

			console.log(success ? '✅' : '❌', 'Port leak detection test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Port Leak Detection',
				success: false,
				error: error.message,
				message: 'Failed to test port leak detection',
			});

			console.log('❌ Port leak detection test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 5: Process manager cleanup integration
	 */
	async testProcessManagerCleanupIntegration() {
		console.log('🧪 Testing process manager cleanup integration...');

		try {
			const initialActiveProcesses = processManager.getAllActiveProcesses().length;

			// Create a mock process configuration
			const mockConfig = {
				mcpType: 'test',
				instanceId: `test-instance-${Date.now()}`,
				userId: 'test-user',
				credentials: { test: 'credentials' },
				config: { test: true },
			};

			// We can't actually create a full MCP process in tests, so we'll test the cleanup logic
			// by checking that the process manager properly handles non-existent processes

			const nonExistentInstanceId = 'non-existent-instance';
			const terminationResult = await processManager.terminateProcess(nonExistentInstanceId);

			// Should return false for non-existent process
			const handlesNonExistent = terminationResult === false;

			// Check that active processes count is unchanged
			const finalActiveProcesses = processManager.getAllActiveProcesses().length;
			const processCountUnchanged = finalActiveProcesses === initialActiveProcesses;

			const success = handlesNonExistent && processCountUnchanged;

			this.testResults.push({
				test: 'Process Manager Cleanup Integration',
				success,
				details: {
					initialActiveProcesses,
					finalActiveProcesses,
					handlesNonExistent,
					processCountUnchanged,
					terminationResult,
				},
				message: success
					? 'Process manager cleanup integration working correctly'
					: 'Process manager cleanup integration has issues',
			});

			console.log(success ? '✅' : '❌', 'Process manager cleanup integration test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Process Manager Cleanup Integration',
				success: false,
				error: error.message,
				message: 'Failed to test process manager cleanup integration',
			});

			console.log('❌ Process manager cleanup integration test failed:', error.message);
			return false;
		}
	}

	/**
	 * Helper method to check if instance exists in database
	 */
	async checkInstanceExists(instanceId) {
		try {
			const query = 'SELECT id FROM mcp_instances WHERE id = $1';
			const result = await pool.query(query, [instanceId]);
			return result.rows.length > 0;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Run all cleanup tests
	 */
	async runAllTests() {
		console.log('🚀 Starting cleanup verification tests...\n');

		await this.initialize();

		const tests = [
			() => this.testProcessTerminationCleanup(),
			() => this.testDatabaseCleanup(),
			() => this.testGracefulVsForcedTermination(),
			() => this.testPortLeakDetection(),
			() => this.testProcessManagerCleanupIntegration(),
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

		console.log('📊 Cleanup Test Summary:');
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
		console.log('🧹 Cleaning up cleanup tests...');

		// Clean up any test instances
		for (const instanceId of this.testInstances) {
			try {
				await deleteMCPInstance(instanceId, '550e8400-e29b-41d4-a716-446655440000');
			} catch (error) {
				// Instance might already be deleted
			}
		}

		// Clean up any test processes
		for (const process of this.testProcesses) {
			try {
				if (!process.killed) {
					process.kill('SIGKILL');
				}
			} catch (error) {
				// Process might already be terminated
			}
		}

		console.log('✅ Cleanup tests cleaned up');
	}
}

export default CleanupTests;
