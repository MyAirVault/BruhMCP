/**
 * Test Utilities and Helpers
 *
 * Common utilities for verification tests including:
 * - Database setup and teardown
 * - Test data generation
 * - Assertion helpers
 * - Environment setup
 */

import { pool } from '../../src/db/config.js';
import { v4 as uuidv4 } from 'uuid';
import portManager from '../../src/services/portManager.js';

/**
 * Test utilities class
 */
export class TestUtils {
	constructor() {
		this.testData = {
			users: [],
			mcpTypes: [],
			instances: [],
			apiKeys: [],
		};
	}

	/**
	 * Initialize test environment
	 */
	async initialize() {
		console.log('🔧 Initializing test environment...');

		// Ensure port manager is initialized
		await portManager.initialize();

		// Create test prerequisites
		await this.createTestPrerequisites();

		console.log('✅ Test environment initialized');
	}

	/**
	 * Create test prerequisites (users, MCP types, etc.)
	 */
	async createTestPrerequisites() {
		// Create test user
		const testUser = await this.createTestUser();
		this.testData.users.push(testUser);

		// Create test MCP types
		const figmaType = await this.createTestMCPType('figma', 'Figma');
		const githubType = await this.createTestMCPType('github', 'GitHub');
		this.testData.mcpTypes.push(figmaType, githubType);

		console.log('📋 Test prerequisites created');
	}

	/**
	 * Create a test user
	 */
	async createTestUser() {
		const userId = '550e8400-e29b-41d4-a716-446655440000';

		try {
			// Check if test user already exists
			const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);

			if (existingUser.rows.length > 0) {
				return { id: userId, email: 'test@example.com' };
			}

			// Create test user
			const query = `
				INSERT INTO users (id, email, password_hash, created_at)
				VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
				ON CONFLICT (id) DO NOTHING
				RETURNING id, email
			`;

			const result = await pool.query(query, [
				userId,
				'test@example.com',
				'$2b$10$test.hash.for.verification.tests',
			]);

			return result.rows[0] || { id: userId, email: 'test@example.com' };
		} catch (error) {
			console.log('Note: Test user creation skipped (may already exist)');
			return { id: userId, email: 'test@example.com' };
		}
	}

	/**
	 * Create a test MCP type
	 */
	async createTestMCPType(name, displayName) {
		const mcpTypeId =
			name === 'figma' ? '550e8400-e29b-41d4-a716-446655440001' : '550e8400-e29b-41d4-a716-446655440002';

		try {
			// Check if MCP type already exists
			const existing = await pool.query('SELECT id FROM mcp_types WHERE id = $1', [mcpTypeId]);

			if (existing.rows.length > 0) {
				return { id: mcpTypeId, name, display_name: displayName };
			}

			// Create test MCP type
			const query = `
				INSERT INTO mcp_types (id, name, display_name, description, config_schema, created_at)
				VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
				ON CONFLICT (id) DO NOTHING
				RETURNING id, name, display_name
			`;

			const result = await pool.query(query, [
				mcpTypeId,
				name,
				displayName,
				`Test ${displayName} MCP for verification`,
				JSON.stringify({
					type: 'object',
					properties: {
						apiKey: { type: 'string', description: 'API Key' },
					},
					required: ['apiKey'],
				}),
			]);

			return result.rows[0] || { id: mcpTypeId, name, display_name: displayName };
		} catch (error) {
			console.log(`Note: Test MCP type ${name} creation skipped (may already exist)`);
			return { id: mcpTypeId, name, display_name: displayName };
		}
	}

	/**
	 * Generate test instance data
	 */
	generateTestInstanceData(userId, mcpTypeId, instanceNumber = 1) {
		return {
			user_id: userId,
			mcp_type_id: mcpTypeId,
			api_key_id: null,
			custom_name: `Test Instance ${instanceNumber}`,
			instance_number: instanceNumber,
			access_token: `test_token_${uuidv4().replace(/-/g, '')}`,
			assigned_port: null, // Will be set when creating
			process_id: Math.floor(Math.random() * 100000) + 10000,
			config: {
				test: true,
				instance: instanceNumber,
				created_at: new Date().toISOString(),
			},
		};
	}

	/**
	 * Create test MCP instance
	 */
	async createTestInstance(userData = null) {
		const user = userData || this.testData.users[0];
		const mcpType = this.testData.mcpTypes[0]; // Use Figma type by default

		if (!user || !mcpType) {
			throw new Error('Test prerequisites not created. Call initialize() first.');
		}

		const instanceData = this.generateTestInstanceData(user.id, mcpType.id);
		instanceData.assigned_port = await portManager.getAvailablePort();

		const query = `
			INSERT INTO mcp_instances (
				user_id, mcp_type_id, api_key_id, custom_name, instance_number,
				access_token, assigned_port, process_id, config
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id
		`;

		const result = await pool.query(query, [
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

		const instance = { ...instanceData, id: result.rows[0].id };
		this.testData.instances.push(instance);

		return instance;
	}

	/**
	 * Clean up test data
	 */
	async cleanup() {
		console.log('🧹 Cleaning up test data...');

		try {
			// Clean up instances
			for (const instance of this.testData.instances) {
				try {
					await pool.query('DELETE FROM mcp_instances WHERE id = $1', [instance.id]);
					if (instance.assigned_port) {
						portManager.releasePort(instance.assigned_port);
					}
				} catch (error) {
					console.log(`Note: Could not delete instance ${instance.id}:`, error.message);
				}
			}

			// Clean up API keys
			for (const apiKey of this.testData.apiKeys) {
				try {
					await pool.query('DELETE FROM api_keys WHERE id = $1', [apiKey.id]);
				} catch (error) {
					console.log(`Note: Could not delete API key ${apiKey.id}:`, error.message);
				}
			}

			// Note: We don't delete users and MCP types as they might be used by other tests
			// In a real test environment, you might want to clean these up too

			console.log('✅ Test data cleaned up');
		} catch (error) {
			console.error('❌ Error during cleanup:', error.message);
		}
	}

	/**
	 * Get test user
	 */
	getTestUser() {
		return this.testData.users[0];
	}

	/**
	 * Get test MCP type
	 */
	getTestMCPType(name = 'figma') {
		return this.testData.mcpTypes.find(type => type.name === name);
	}

	/**
	 * Assertion helpers
	 */
	static assertions = {
		/**
		 * Assert that a value is truthy
		 */
		assertTrue(value, message = 'Expected value to be truthy') {
			if (!value) {
				throw new Error(message);
			}
		},

		/**
		 * Assert that a value is falsy
		 */
		assertFalse(value, message = 'Expected value to be falsy') {
			if (value) {
				throw new Error(message);
			}
		},

		/**
		 * Assert that two values are equal
		 */
		assertEqual(actual, expected, message = 'Values are not equal') {
			if (actual !== expected) {
				throw new Error(`${message}. Expected: ${expected}, Actual: ${actual}`);
			}
		},

		/**
		 * Assert that two values are not equal
		 */
		assertNotEqual(actual, expected, message = 'Values should not be equal') {
			if (actual === expected) {
				throw new Error(`${message}. Both values are: ${actual}`);
			}
		},

		/**
		 * Assert that an array contains a value
		 */
		assertContains(array, value, message = 'Array does not contain expected value') {
			if (!Array.isArray(array) || !array.includes(value)) {
				throw new Error(`${message}. Array: ${JSON.stringify(array)}, Value: ${value}`);
			}
		},

		/**
		 * Assert that an array does not contain a value
		 */
		assertNotContains(array, value, message = 'Array should not contain value') {
			if (Array.isArray(array) && array.includes(value)) {
				throw new Error(`${message}. Array: ${JSON.stringify(array)}, Value: ${value}`);
			}
		},

		/**
		 * Assert that a value is within a range
		 */
		assertInRange(value, min, max, message = 'Value is not within expected range') {
			if (value < min || value > max) {
				throw new Error(`${message}. Value: ${value}, Range: ${min}-${max}`);
			}
		},

		/**
		 * Assert that an array has a specific length
		 */
		assertLength(array, expectedLength, message = 'Array length is incorrect') {
			if (!Array.isArray(array) || array.length !== expectedLength) {
				throw new Error(`${message}. Expected: ${expectedLength}, Actual: ${array?.length || 'not an array'}`);
			}
		},
	};

	/**
	 * Database utilities
	 */
	static database = {
		/**
		 * Execute a query and return results
		 */
		async query(sql, params = []) {
			return await pool.query(sql, params);
		},

		/**
		 * Check if a record exists
		 */
		async recordExists(table, column, value) {
			const query = `SELECT 1 FROM ${table} WHERE ${column} = $1 LIMIT 1`;
			const result = await pool.query(query, [value]);
			return result.rows.length > 0;
		},

		/**
		 * Count records in a table with optional conditions
		 */
		async countRecords(table, whereClause = '', params = []) {
			const query = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
			const result = await pool.query(query, params);
			return parseInt(result.rows[0].count);
		},

		/**
		 * Get the current database transaction isolation level
		 */
		async getTransactionIsolation() {
			const result = await pool.query('SHOW transaction_isolation');
			return result.rows[0].transaction_isolation;
		},
	};

	/**
	 * Performance utilities
	 */
	static performance = {
		/**
		 * Measure execution time of a function
		 */
		async measureTime(fn, description = 'Operation') {
			const start = Date.now();
			const result = await fn();
			const end = Date.now();
			const duration = end - start;

			console.log(`⏱️  ${description} took ${duration}ms`);

			return { result, duration };
		},

		/**
		 * Wait for a specified amount of time
		 */
		async wait(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},

		/**
		 * Retry an operation with exponential backoff
		 */
		async retry(fn, maxAttempts = 3, baseDelay = 1000) {
			let lastError;

			for (let attempt = 1; attempt <= maxAttempts; attempt++) {
				try {
					return await fn();
				} catch (error) {
					lastError = error;

					if (attempt === maxAttempts) {
						throw error;
					}

					const delay = baseDelay * Math.pow(2, attempt - 1);
					console.log(`⚠️  Attempt ${attempt} failed, retrying in ${delay}ms...`);
					await this.wait(delay);
				}
			}

			throw lastError;
		},
	};

	/**
	 * Environment utilities
	 */
	static environment = {
		/**
		 * Check if we're in test environment
		 */
		isTestEnvironment() {
			return process.env.NODE_ENV === 'test';
		},

		/**
		 * Get environment variable with default
		 */
		getEnv(key, defaultValue = null) {
			return process.env[key] || defaultValue;
		},

		/**
		 * Set environment variable for test duration
		 */
		setTestEnv(key, value) {
			const originalValue = process.env[key];
			process.env[key] = value;

			// Return cleanup function
			return () => {
				if (originalValue === undefined) {
					delete process.env[key];
				} else {
					process.env[key] = originalValue;
				}
			};
		},
	};
}

/**
 * Test result formatter
 */
export class TestResultFormatter {
	/**
	 * Format test results for console output
	 */
	static formatForConsole(results) {
		let output = '';

		output += '📋 Test Results Summary:\n';
		output += '=' + '='.repeat(50) + '\n\n';

		results.forEach((result, index) => {
			const status = result.success ? '✅' : '❌';
			output += `${index + 1}. ${status} ${result.test}\n`;
			output += `   ${result.message}\n`;

			if (result.error) {
				output += `   Error: ${result.error}\n`;
			}

			if (result.details && Object.keys(result.details).length > 0) {
				output += '   Details:\n';
				Object.entries(result.details).forEach(([key, value]) => {
					const formattedValue =
						typeof value === 'object' ? JSON.stringify(value, null, 2).replace(/\n/g, '\n     ') : value;
					output += `     ${key}: ${formattedValue}\n`;
				});
			}

			output += '\n';
		});

		return output;
	}

	/**
	 * Format test results for JSON output
	 */
	static formatForJSON(results, summary = null) {
		return JSON.stringify(
			{
				timestamp: new Date().toISOString(),
				summary,
				results,
			},
			null,
			2
		);
	}

	/**
	 * Format test results for HTML output
	 */
	static formatForHTML(results, summary = null) {
		let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Verification Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 5px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; }
        .failure { background: #f8d7da; border-left: 4px solid #dc3545; }
        .details { margin-top: 10px; font-family: monospace; font-size: 12px; background: #f8f9fa; padding: 10px; border-radius: 3px; }
        pre { margin: 0; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>🔍 Verification Test Results</h1>
    <p>Generated: ${new Date().toISOString()}</p>
		`;

		if (summary) {
			html += `
    <div class="summary">
        <h2>📊 Summary</h2>
        <p><strong>Total Tests:</strong> ${summary.total}</p>
        <p><strong>Passed:</strong> ${summary.passed}</p>
        <p><strong>Failed:</strong> ${summary.failed}</p>
        <p><strong>Success Rate:</strong> ${summary.successRate}%</p>
    </div>
			`;
		}

		results.forEach((result, index) => {
			const cssClass = result.success ? 'success' : 'failure';
			const status = result.success ? '✅' : '❌';

			html += `
    <div class="test-result ${cssClass}">
        <h3>${status} ${result.test}</h3>
        <p>${result.message}</p>
			`;

			if (result.error) {
				html += `<p><strong>Error:</strong> ${result.error}</p>`;
			}

			if (result.details) {
				html += `
        <div class="details">
            <strong>Details:</strong>
            <pre>${JSON.stringify(result.details, null, 2)}</pre>
        </div>
				`;
			}

			html += '</div>';
		});

		html += `
</body>
</html>
		`;

		return html;
	}
}

export default TestUtils;
