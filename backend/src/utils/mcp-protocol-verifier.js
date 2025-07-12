import fetch from 'node-fetch';

/**
 * MCP Protocol Compliance Verifier
 * Tests MCP servers for proper JSON-RPC 2.0 protocol implementation
 */
export class MCPProtocolVerifier {
	constructor(baseUrl) {
		this.baseUrl = baseUrl;
		this.testResults = [];
	}

	/**
	 * Run all protocol compliance tests
	 * @returns {Object} Test results summary
	 */
	async runAllTests() {
		console.log(`🧪 Starting MCP Protocol Compliance Tests for ${this.baseUrl}`);

		this.testResults = [];

		// Test basic connectivity
		await this.testConnectivity();

		// Test JSON-RPC format validation
		await this.testJsonRpcFormatValidation();

		// Test initialize method
		await this.testInitializeMethod();

		// Test tools/list method
		await this.testToolsListMethod();

		// Test tools/call method
		await this.testToolsCallMethod();

		// Test resources/list method
		await this.testResourcesListMethod();

		// Test error handling
		await this.testErrorHandling();

		return this.generateTestReport();
	}

	/**
	 * Test basic server connectivity
	 */
	async testConnectivity() {
		try {
			// Extract port from baseUrl for health check
			const portMatch = this.baseUrl.match(/:(\d+)/);
			const port = portMatch ? portMatch[1] : '49161';
			const healthUrl = `http://localhost:${port}/health`;

			const response = await fetch(healthUrl);

			if (response.ok) {
				this.addTestResult('connectivity', 'PASS', 'Server is accessible');
			} else {
				this.addTestResult('connectivity', 'FAIL', `Server returned ${response.status}`);
			}
		} catch (error) {
			this.addTestResult('connectivity', 'FAIL', `Connection failed: ${error.message}`);
		}
	}

	/**
	 * Test JSON-RPC format validation
	 */
	async testJsonRpcFormatValidation() {
		// Test invalid JSON-RPC format
		try {
			const response = await this.sendJsonRpcMessage({
				invalid: 'message',
			});

			if (response.error && response.error.code === -32600) {
				this.addTestResult('jsonrpc_validation', 'PASS', 'Properly rejects invalid JSON-RPC format');
			} else {
				this.addTestResult('jsonrpc_validation', 'FAIL', 'Should reject invalid JSON-RPC format');
			}
		} catch (error) {
			this.addTestResult('jsonrpc_validation', 'FAIL', `Error testing format validation: ${error.message}`);
		}
	}

	/**
	 * Test initialize method
	 */
	async testInitializeMethod() {
		try {
			const response = await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2024-11-05',
					capabilities: {},
					clientInfo: { name: 'Test Client', version: '1.0.0' },
				},
			});

			if (response.result && response.result.protocolVersion && response.result.serverInfo) {
				this.addTestResult('initialize', 'PASS', 'Initialize method works correctly');
			} else {
				this.addTestResult('initialize', 'FAIL', 'Initialize method missing required fields');
			}
		} catch (error) {
			this.addTestResult('initialize', 'FAIL', `Initialize method failed: ${error.message}`);
		}
	}

	/**
	 * Test tools/list method
	 */
	async testToolsListMethod() {
		try {
			// First initialize
			await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2024-11-05',
					capabilities: {},
					clientInfo: { name: 'Test Client', version: '1.0.0' },
				},
			});

			// Then test tools/list
			const response = await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 2,
				method: 'tools/list',
			});

			if (response.result && Array.isArray(response.result.tools)) {
				this.addTestResult('tools_list', 'PASS', `Tools list returned ${response.result.tools.length} tools`);
			} else {
				this.addTestResult('tools_list', 'FAIL', 'Tools list should return array of tools');
			}
		} catch (error) {
			this.addTestResult('tools_list', 'FAIL', `Tools list failed: ${error.message}`);
		}
	}

	/**
	 * Test tools/call method
	 */
	async testToolsCallMethod() {
		try {
			// First initialize
			await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2024-11-05',
					capabilities: {},
					clientInfo: { name: 'Test Client', version: '1.0.0' },
				},
			});

			// Get available tools
			const toolsResponse = await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 2,
				method: 'tools/list',
			});

			if (toolsResponse.result && toolsResponse.result.tools.length > 0) {
				// Test calling the first available tool
				const firstTool = toolsResponse.result.tools[0];
				const callResponse = await this.sendJsonRpcMessage({
					jsonrpc: '2.0',
					id: 3,
					method: 'tools/call',
					params: {
						name: firstTool.name,
						arguments: {},
					},
				});

				if (callResponse.result || callResponse.error) {
					this.addTestResult('tools_call', 'PASS', `Tool call handled correctly for ${firstTool.name}`);
				} else {
					this.addTestResult('tools_call', 'FAIL', 'Tool call should return result or error');
				}
			} else {
				this.addTestResult('tools_call', 'SKIP', 'No tools available to test');
			}
		} catch (error) {
			this.addTestResult('tools_call', 'FAIL', `Tools call failed: ${error.message}`);
		}
	}

	/**
	 * Test resources/list method
	 */
	async testResourcesListMethod() {
		try {
			// First initialize
			await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2024-11-05',
					capabilities: {},
					clientInfo: { name: 'Test Client', version: '1.0.0' },
				},
			});

			// Then test resources/list
			const response = await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 4,
				method: 'resources/list',
			});

			if (response.result && Array.isArray(response.result.resources)) {
				this.addTestResult(
					'resources_list',
					'PASS',
					`Resources list returned ${response.result.resources.length} resources`
				);
			} else {
				this.addTestResult('resources_list', 'FAIL', 'Resources list should return array of resources');
			}
		} catch (error) {
			this.addTestResult('resources_list', 'FAIL', `Resources list failed: ${error.message}`);
		}
	}

	/**
	 * Test error handling
	 */
	async testErrorHandling() {
		try {
			// Test method not found
			const response = await this.sendJsonRpcMessage({
				jsonrpc: '2.0',
				id: 999,
				method: 'nonexistent/method',
			});

			if (response.error && response.error.code === -32601) {
				this.addTestResult('error_handling', 'PASS', 'Properly handles method not found');
			} else {
				this.addTestResult('error_handling', 'FAIL', 'Should return -32601 for method not found');
			}
		} catch (error) {
			this.addTestResult('error_handling', 'FAIL', `Error handling test failed: ${error.message}`);
		}
	}

	/**
	 * Send JSON-RPC message to server
	 */
	async sendJsonRpcMessage(message) {
		const response = await fetch(`${this.baseUrl}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		});

		return await response.json();
	}

	/**
	 * Add test result
	 */
	addTestResult(testName, status, message) {
		this.testResults.push({
			test: testName,
			status,
			message,
			timestamp: new Date().toISOString(),
		});

		const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
		console.log(`${icon} ${testName}: ${message}`);
	}

	/**
	 * Generate test report
	 */
	generateTestReport() {
		const passCount = this.testResults.filter(r => r.status === 'PASS').length;
		const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
		const skipCount = this.testResults.filter(r => r.status === 'SKIP').length;
		const totalCount = this.testResults.length;

		const report = {
			summary: {
				total: totalCount,
				passed: passCount,
				failed: failCount,
				skipped: skipCount,
				success_rate: totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0,
			},
			details: this.testResults,
			compliance: failCount === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
			timestamp: new Date().toISOString(),
		};

		console.log(`\n📋 MCP Protocol Compliance Report:`);
		console.log(`   Total Tests: ${totalCount}`);
		console.log(`   Passed: ${passCount}`);
		console.log(`   Failed: ${failCount}`);
		console.log(`   Skipped: ${skipCount}`);
		console.log(`   Success Rate: ${report.summary.success_rate}%`);
		console.log(`   Compliance: ${report.compliance}`);

		return report;
	}
}

/**
 * Verify MCP protocol compliance for a server
 * @param {string} baseUrl - Base URL of the MCP server
 * @returns {Object} Test results
 */
export async function verifyMCPCompliance(baseUrl) {
	const verifier = new MCPProtocolVerifier(baseUrl);
	return await verifier.runAllTests();
}
