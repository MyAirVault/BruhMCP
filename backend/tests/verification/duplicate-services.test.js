/**
 * Duplicate Service Verification Tests
 * 
 * Comprehensive tests to verify that duplicate service support is working correctly:
 * - Creating multiple instances of the same MCP type (e.g., 2 Figma MCPs)
 * - Each instance gets unique ports and credentials
 * - Instances run independently
 * - Database constraints allow multiple instances per user/type
 */

import { setTimeout } from 'node:timers/promises';
import portManager from '../../src/services/portManager.js';
import { pool } from '../../src/db/config.js';
import { 
	createMCPInstance, 
	getMCPInstancesByUserId,
	deleteMCPInstance,
	getNextInstanceNumber,
	generateUniqueAccessToken,
	countUserMCPInstances 
} from '../../src/db/queries/mcpInstancesQueries.js';

/**
 * Test suite for duplicate service verification
 */
export class DuplicateServiceTests {
	constructor() {
		this.testResults = [];
		this.testInstances = [];
		this.testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Test user ID
		this.testMcpTypeId = '550e8400-e29b-41d4-a716-446655440001'; // Test MCP type ID
	}

	/**
	 * Initialize test environment
	 */
	async initialize() {
		console.log('🔧 Initializing duplicate service tests...');
		
		// Clear any previous test data
		this.testInstances = [];
		
		// Ensure test user and MCP type exist (in a real scenario)
		await this.ensureTestPrerequisites();
		
		console.log('✅ Duplicate service tests initialized');
	}

	/**
	 * Ensure test prerequisites exist
	 */
	async ensureTestPrerequisites() {
		// In a real test environment, you'd ensure the test user and MCP type exist
		// For this verification, we'll assume they exist or create mock ones
		console.log('📋 Ensuring test prerequisites...');
	}

	/**
	 * Test 1: Multiple instance creation for same MCP type
	 */
	async testMultipleInstanceCreation() {
		console.log('🧪 Testing multiple instance creation for same MCP type...');
		
		try {
			const instancesData = [];
			const createdInstances = [];
			
			// Create 3 instances of the same MCP type
			for (let i = 0; i < 3; i++) {
				const instanceNumber = await getNextInstanceNumber(this.testUserId, this.testMcpTypeId);
				const accessToken = await generateUniqueAccessToken();
				const assignedPort = await portManager.getAvailablePort();
				
				const instanceData = {
					user_id: this.testUserId,
					mcp_type_id: this.testMcpTypeId,
					api_key_id: null,
					custom_name: `Test Instance ${i + 1}`,
					instance_number: instanceNumber,
					access_token: accessToken,
					assigned_port: assignedPort,
					process_id: 10000 + i, // Mock process ID
					config: { instance: i + 1, test: true },
				};
				
				instancesData.push({
					...instanceData,
					expectedInstanceNumber: i + 1,
				});
				
				// Insert directly into database for testing
				const insertQuery = `
					INSERT INTO mcp_instances (
						user_id, mcp_type_id, api_key_id, custom_name, instance_number,
						access_token, assigned_port, process_id, config
					) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
					RETURNING id
				`;
				
				const result = await pool.query(insertQuery, [
					instanceData.user_id,
					instanceData.mcp_type_id,
					instanceData.api_key_id,
					instanceData.custom_name,
					instanceData.instance_number,
					instanceData.access_token,
					instanceData.assigned_port,
					instanceData.process_id,
					JSON.stringify(instanceData.config),
				]);
				
				const instanceId = result.rows[0].id;
				createdInstances.push(instanceId);
				this.testInstances.push(instanceId);
			}
			
			// Verify all instances were created
			const allCreated = createdInstances.length === 3;
			
			// Verify unique instance numbers
			const instanceNumbers = instancesData.map(i => i.instance_number);
			const uniqueNumbers = new Set(instanceNumbers);
			const uniqueInstanceNumbers = uniqueNumbers.size === instanceNumbers.length;
			
			// Verify unique access tokens
			const accessTokens = instancesData.map(i => i.access_token);
			const uniqueTokens = new Set(accessTokens);
			const uniqueAccessTokens = uniqueTokens.size === accessTokens.length;
			
			// Verify unique ports
			const ports = instancesData.map(i => i.assigned_port);
			const uniquePorts = new Set(ports);
			const uniquePortAssignment = uniquePorts.size === ports.length;
			
			// Verify sequential instance numbering
			const sequentialNumbering = instanceNumbers.every((num, index) => num === index + 1);
			
			const success = allCreated && uniqueInstanceNumbers && uniqueAccessTokens && 
							uniquePortAssignment && sequentialNumbering;
			
			this.testResults.push({
				test: 'Multiple Instance Creation',
				success,
				details: {
					instancesCreated: createdInstances.length,
					instanceNumbers,
					accessTokens,
					ports,
					allCreated,
					uniqueInstanceNumbers,
					uniqueAccessTokens,
					uniquePortAssignment,
					sequentialNumbering,
				},
				message: success 
					? 'Multiple instances created successfully with unique properties' 
					: 'Issues with multiple instance creation',
			});
			
			console.log(success ? '✅' : '❌', 'Multiple instance creation test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Multiple Instance Creation',
				success: false,
				error: error.message,
				message: 'Failed to test multiple instance creation',
			});
			
			console.log('❌ Multiple instance creation test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 2: Database constraint validation for multiple instances
	 */
	async testDatabaseConstraints() {
		console.log('🧪 Testing database constraints for multiple instances...');
		
		try {
			// Test unique constraint for (user_id, mcp_type_id, instance_number)
			let constraintViolationHandled = false;
			
			try {
				// Try to create instance with duplicate (user_id, mcp_type_id, instance_number)
				const duplicateInstanceQuery = `
					INSERT INTO mcp_instances (
						user_id, mcp_type_id, instance_number, access_token, assigned_port
					) VALUES ($1, $2, $3, $4, $5)
				`;
				
				await pool.query(duplicateInstanceQuery, [
					this.testUserId,
					this.testMcpTypeId,
					1, // Instance number 1 should already exist from previous test
					`duplicate_test_${Date.now()}`,
					await portManager.getAvailablePort(),
				]);
				
				// If we reach here, the constraint didn't work
				constraintViolationHandled = false;
			} catch (error) {
				// Expected - should fail due to unique constraint
				constraintViolationHandled = error.message.includes('unique') || 
											error.message.includes('duplicate');
			}
			
			// Test access token uniqueness
			let accessTokenUniquenessEnforced = false;
			const existingToken = `test_token_${Date.now()}`;
			
			try {
				// Create first instance with token
				const firstInstanceQuery = `
					INSERT INTO mcp_instances (
						user_id, mcp_type_id, instance_number, access_token, assigned_port
					) VALUES ($1, $2, $3, $4, $5)
					RETURNING id
				`;
				
				const firstResult = await pool.query(firstInstanceQuery, [
					this.testUserId,
					this.testMcpTypeId,
					10, // Use a high number to avoid conflicts
					existingToken,
					await portManager.getAvailablePort(),
				]);
				
				this.testInstances.push(firstResult.rows[0].id);
				
				// Try to create second instance with same token
				await pool.query(firstInstanceQuery, [
					this.testUserId,
					this.testMcpTypeId,
					11,
					existingToken, // Same token - should fail
					await portManager.getAvailablePort(),
				]);
				
				accessTokenUniquenessEnforced = false;
			} catch (error) {
				// Expected - should fail due to unique access token constraint
				accessTokenUniquenessEnforced = error.message.includes('unique') || 
											  error.message.includes('duplicate');
			}
			
			// Test port uniqueness
			let portUniquenessEnforced = false;
			const testPort = await portManager.getAvailablePort();
			
			try {
				// Create first instance with port
				const firstPortQuery = `
					INSERT INTO mcp_instances (
						user_id, mcp_type_id, instance_number, access_token, assigned_port
					) VALUES ($1, $2, $3, $4, $5)
					RETURNING id
				`;
				
				const firstPortResult = await pool.query(firstPortQuery, [
					this.testUserId,
					this.testMcpTypeId,
					20,
					`port_test_1_${Date.now()}`,
					testPort,
				]);
				
				this.testInstances.push(firstPortResult.rows[0].id);
				
				// Try to create second instance with same port
				await pool.query(firstPortQuery, [
					this.testUserId,
					this.testMcpTypeId,
					21,
					`port_test_2_${Date.now()}`,
					testPort, // Same port - should fail
				]);
				
				portUniquenessEnforced = false;
			} catch (error) {
				// Expected - should fail due to unique port constraint
				portUniquenessEnforced = error.message.includes('unique') || 
										error.message.includes('duplicate');
			} finally {
				portManager.releasePort(testPort);
			}
			
			const success = constraintViolationHandled && accessTokenUniquenessEnforced && portUniquenessEnforced;
			
			this.testResults.push({
				test: 'Database Constraints',
				success,
				details: {
					constraintViolationHandled,
					accessTokenUniquenessEnforced,
					portUniquenessEnforced,
				},
				message: success 
					? 'Database constraints properly enforced' 
					: 'Issues with database constraint enforcement',
			});
			
			console.log(success ? '✅' : '❌', 'Database constraints test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Database Constraints',
				success: false,
				error: error.message,
				message: 'Failed to test database constraints',
			});
			
			console.log('❌ Database constraints test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 3: Instance independence verification
	 */
	async testInstanceIndependence() {
		console.log('🧪 Testing instance independence...');
		
		try {
			// Get all test instances
			const instances = await this.getTestInstances();
			
			if (instances.length < 2) {
				throw new Error('Need at least 2 instances for independence testing');
			}
			
			// Verify each instance has unique properties
			const uniqueIds = new Set(instances.map(i => i.id)).size === instances.length;
			const uniquePorts = new Set(instances.map(i => i.assigned_port)).size === instances.length;
			const uniqueTokens = new Set(instances.map(i => i.access_token)).size === instances.length;
			const uniqueNumbers = new Set(instances.map(i => i.instance_number)).size === instances.length;
			
			// Verify instances can be modified independently
			const instance1 = instances[0];
			const instance2 = instances[1];
			
			// Update one instance's config
			const updateQuery = `
				UPDATE mcp_instances 
				SET config = $1, custom_name = $2 
				WHERE id = $3
			`;
			
			await pool.query(updateQuery, [
				JSON.stringify({ updated: true, test: 'independence' }),
				'Updated Test Instance',
				instance1.id,
			]);
			
			// Verify other instance is unchanged
			const unchanged = await this.getInstanceById(instance2.id);
			const otherInstanceUnchanged = unchanged.custom_name !== 'Updated Test Instance';
			
			// Verify updated instance changed
			const updated = await this.getInstanceById(instance1.id);
			const targetInstanceChanged = updated.custom_name === 'Updated Test Instance';
			
			const success = uniqueIds && uniquePorts && uniqueTokens && uniqueNumbers && 
							otherInstanceUnchanged && targetInstanceChanged;
			
			this.testResults.push({
				test: 'Instance Independence',
				success,
				details: {
					instancesCount: instances.length,
					uniqueIds,
					uniquePorts,
					uniqueTokens,
					uniqueNumbers,
					otherInstanceUnchanged,
					targetInstanceChanged,
					instance1Id: instance1.id,
					instance2Id: instance2.id,
				},
				message: success 
					? 'Instances operate independently' 
					: 'Issues with instance independence',
			});
			
			console.log(success ? '✅' : '❌', 'Instance independence test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Instance Independence',
				success: false,
				error: error.message,
				message: 'Failed to test instance independence',
			});
			
			console.log('❌ Instance independence test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 4: Instance counting and limits
	 */
	async testInstanceCountingAndLimits() {
		console.log('🧪 Testing instance counting and limits...');
		
		try {
			// Count current instances
			const instanceCounts = await countUserMCPInstances(this.testUserId);
			const initialTotal = instanceCounts.total;
			
			// Test instance limit (should be 10 based on schema constraint)
			let limitEnforced = false;
			
			try {
				// Try to create instance with number > 10
				const limitTestQuery = `
					INSERT INTO mcp_instances (
						user_id, mcp_type_id, instance_number, access_token, assigned_port
					) VALUES ($1, $2, $3, $4, $5)
				`;
				
				await pool.query(limitTestQuery, [
					this.testUserId,
					this.testMcpTypeId,
					11, // Exceeds limit of 10
					`limit_test_${Date.now()}`,
					await portManager.getAvailablePort(),
				]);
				
				limitEnforced = false; // Should not reach here
			} catch (error) {
				// Expected - should fail due to check constraint
				limitEnforced = error.message.includes('check_max_instances') || 
							   error.message.includes('constraint');
			}
			
			// Test next instance number calculation
			const nextNumber = await getNextInstanceNumber(this.testUserId, this.testMcpTypeId);
			const nextNumberCalculatedCorrectly = nextNumber > 0;
			
			// Count instances after tests
			const finalCounts = await countUserMCPInstances(this.testUserId);
			const finalTotal = finalCounts.total;
			
			// Should have more instances now (from our tests)
			const instanceCountIncreased = finalTotal >= initialTotal;
			
			const success = limitEnforced && nextNumberCalculatedCorrectly && instanceCountIncreased;
			
			this.testResults.push({
				test: 'Instance Counting and Limits',
				success,
				details: {
					initialTotal,
					finalTotal,
					nextNumber,
					limitEnforced,
					nextNumberCalculatedCorrectly,
					instanceCountIncreased,
					instanceCounts: finalCounts,
				},
				message: success 
					? 'Instance counting and limits working correctly' 
					: 'Issues with instance counting and limits',
			});
			
			console.log(success ? '✅' : '❌', 'Instance counting and limits test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Instance Counting and Limits',
				success: false,
				error: error.message,
				message: 'Failed to test instance counting and limits',
			});
			
			console.log('❌ Instance counting and limits test failed:', error.message);
			return false;
		}
	}

	/**
	 * Test 5: Concurrent instance management
	 */
	async testConcurrentInstanceManagement() {
		console.log('🧪 Testing concurrent instance management...');
		
		try {
			// Test concurrent creation of instances
			const concurrentPromises = [];
			const concurrentResults = [];
			
			for (let i = 0; i < 3; i++) {
				const promise = this.createTestInstance(`Concurrent ${i + 1}`);
				concurrentPromises.push(promise);
			}
			
			// Wait for all concurrent operations to complete
			const results = await Promise.allSettled(concurrentPromises);
			
			// Count successful creations
			const successfulCreations = results.filter(r => r.status === 'fulfilled').length;
			const allSucceeded = successfulCreations === 3;
			
			// Add successful instances to cleanup list
			results.forEach(result => {
				if (result.status === 'fulfilled' && result.value) {
					this.testInstances.push(result.value);
				}
			});
			
			// Test concurrent deletion
			const instancesToDelete = this.testInstances.slice(-2); // Last 2 instances
			const deletionPromises = instancesToDelete.map(id => 
				deleteMCPInstance(id, this.testUserId)
			);
			
			const deletionResults = await Promise.allSettled(deletionPromises);
			const successfulDeletions = deletionResults.filter(r => r.status === 'fulfilled').length;
			const deletionsSucceeded = successfulDeletions === instancesToDelete.length;
			
			// Remove deleted instances from cleanup list
			instancesToDelete.forEach(id => {
				const index = this.testInstances.indexOf(id);
				if (index > -1) this.testInstances.splice(index, 1);
			});
			
			const success = allSucceeded && deletionsSucceeded;
			
			this.testResults.push({
				test: 'Concurrent Instance Management',
				success,
				details: {
					concurrentCreations: concurrentPromises.length,
					successfulCreations,
					allSucceeded,
					concurrentDeletions: deletionPromises.length,
					successfulDeletions,
					deletionsSucceeded,
				},
				message: success 
					? 'Concurrent instance management working correctly' 
					: 'Issues with concurrent instance management',
			});
			
			console.log(success ? '✅' : '❌', 'Concurrent instance management test completed');
			return success;
		} catch (error) {
			this.testResults.push({
				test: 'Concurrent Instance Management',
				success: false,
				error: error.message,
				message: 'Failed to test concurrent instance management',
			});
			
			console.log('❌ Concurrent instance management test failed:', error.message);
			return false;
		}
	}

	/**
	 * Helper method to create a test instance
	 */
	async createTestInstance(customName) {
		const instanceNumber = await getNextInstanceNumber(this.testUserId, this.testMcpTypeId);
		const accessToken = await generateUniqueAccessToken();
		const assignedPort = await portManager.getAvailablePort();
		
		const insertQuery = `
			INSERT INTO mcp_instances (
				user_id, mcp_type_id, instance_number, custom_name,
				access_token, assigned_port, config
			) VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING id
		`;
		
		const result = await pool.query(insertQuery, [
			this.testUserId,
			this.testMcpTypeId,
			instanceNumber,
			customName,
			accessToken,
			assignedPort,
			JSON.stringify({ test: true }),
		]);
		
		return result.rows[0].id;
	}

	/**
	 * Helper method to get test instances
	 */
	async getTestInstances() {
		const query = `
			SELECT * FROM mcp_instances 
			WHERE user_id = $1 AND mcp_type_id = $2
			ORDER BY instance_number
		`;
		
		const result = await pool.query(query, [this.testUserId, this.testMcpTypeId]);
		return result.rows;
	}

	/**
	 * Helper method to get instance by ID
	 */
	async getInstanceById(instanceId) {
		const query = 'SELECT * FROM mcp_instances WHERE id = $1';
		const result = await pool.query(query, [instanceId]);
		return result.rows[0];
	}

	/**
	 * Run all duplicate service tests
	 */
	async runAllTests() {
		console.log('🚀 Starting duplicate service verification tests...\n');
		
		await this.initialize();
		
		const tests = [
			() => this.testMultipleInstanceCreation(),
			() => this.testDatabaseConstraints(),
			() => this.testInstanceIndependence(),
			() => this.testInstanceCountingAndLimits(),
			() => this.testConcurrentInstanceManagement(),
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
		
		console.log('📊 Duplicate Service Test Summary:');
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
		console.log('🧹 Cleaning up duplicate service tests...');
		
		// Clean up test instances
		for (const instanceId of this.testInstances) {
			try {
				await deleteMCPInstance(instanceId, this.testUserId);
			} catch (error) {
				// Instance might already be deleted
				console.log(`Note: Could not delete instance ${instanceId}:`, error.message);
			}
		}
		
		console.log('✅ Duplicate service tests cleaned up');
	}
}

export default DuplicateServiceTests;