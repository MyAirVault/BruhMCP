#!/usr/bin/env node
/**
 * Figma MCP Service Compliance Test
 * Tests the Figma service for MCP protocol compliance
 */

import fetch from 'node-fetch';

const FIGMA_SERVICE_URL = 'http://localhost:49280';
const TEST_API_KEY = 'figd_test_key_that_is_long_enough_123456789';

class FigmaMCPTester {
  constructor() {
    this.results = [];
  }

  async runAllTests() {
    console.log('🧪 Testing Figma MCP Service Compliance');
    console.log('=====================================\n');

    await this.testHealthEndpoint();
    await this.testToolsEndpoint();
    await this.testCallEndpoint();
    await this.testAuthentication();
    await this.testErrorHandling();
    await this.testDirectAPIEndpoints();

    this.printSummary();
  }

  async testHealthEndpoint() {
    console.log('📋 Testing Health Endpoint');
    try {
      const response = await fetch(`${FIGMA_SERVICE_URL}/health`);
      const data = await response.json();

      this.assert(response.status === 200, 'Health endpoint returns 200');
      this.assert(data.service === 'figma', 'Service name is correct');
      this.assert(data.status === 'healthy', 'Status is healthy');
      this.assert(typeof data.uptime === 'number', 'Uptime is a number');
      this.assert(data.port === 49280, 'Port is correct');
      this.assert(data.authType === 'api_key', 'Auth type is correct');

      console.log('   ✅ Health endpoint test passed\n');
    } catch (error) {
      console.log(`   ❌ Health endpoint test failed: ${error.message}\n`);
    }
  }

  async testToolsEndpoint() {
    console.log('🛠️  Testing Tools Endpoint');
    try {
      const response = await fetch(`${FIGMA_SERVICE_URL}/mcp/tools`);
      const data = await response.json();

      this.assert(response.status === 200, 'Tools endpoint returns 200');
      this.assert(Array.isArray(data.tools), 'Tools is an array');
      this.assert(data.tools.length === 4, 'Has 4 tools');

      const requiredTools = ['get_figma_file', 'get_figma_components', 'get_figma_styles', 'get_figma_comments'];
      requiredTools.forEach(toolName => {
        const tool = data.tools.find(t => t.name === toolName);
        this.assert(tool !== undefined, `Tool ${toolName} exists`);
        this.assert(tool.description && tool.description.length > 0, `Tool ${toolName} has description`);
        this.assert(tool.inputSchema && tool.inputSchema.type === 'object', `Tool ${toolName} has valid input schema`);
      });

      console.log('   ✅ Tools endpoint test passed\n');
    } catch (error) {
      console.log(`   ❌ Tools endpoint test failed: ${error.message}\n`);
    }
  }

  async testCallEndpoint() {
    console.log('📞 Testing Call Endpoint');
    try {
      // Test valid tool call with auth
      const response = await fetch(`${FIGMA_SERVICE_URL}/mcp/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({
          name: 'get_figma_file',
          arguments: { fileKey: 'test123' }
        })
      });

      const data = await response.json();
      this.assert(response.status === 200, 'Call endpoint accepts valid requests');
      this.assert(Array.isArray(data.content), 'Response has content array');
      this.assert(data.content[0].type === 'text', 'Content has text type');

      console.log('   ✅ Call endpoint test passed\n');
    } catch (error) {
      console.log(`   ❌ Call endpoint test failed: ${error.message}\n`);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication');
    try {
      // Test no auth
      let response = await fetch(`${FIGMA_SERVICE_URL}/mcp/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'get_figma_file', arguments: { fileKey: 'test' } })
      });
      this.assert(response.status === 401, 'Rejects requests without auth');

      // Test invalid auth format
      response = await fetch(`${FIGMA_SERVICE_URL}/mcp/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': 'invalid_key'
        },
        body: JSON.stringify({ name: 'get_figma_file', arguments: { fileKey: 'test' } })
      });
      this.assert(response.status === 401, 'Rejects invalid API key format');

      // Test valid auth format
      response = await fetch(`${FIGMA_SERVICE_URL}/mcp/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({ name: 'get_figma_file', arguments: { fileKey: 'test' } })
      });
      this.assert(response.status === 200, 'Accepts valid API key format');

      console.log('   ✅ Authentication test passed\n');
    } catch (error) {
      console.log(`   ❌ Authentication test failed: ${error.message}\n`);
    }
  }

  async testErrorHandling() {
    console.log('⚠️  Testing Error Handling');
    try {
      // Test missing tool name
      let response = await fetch(`${FIGMA_SERVICE_URL}/mcp/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({ arguments: { fileKey: 'test' } })
      });
      this.assert(response.status === 400, 'Returns 400 for missing tool name');

      // Test missing arguments
      response = await fetch(`${FIGMA_SERVICE_URL}/mcp/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({ name: 'get_figma_file' })
      });
      this.assert(response.status === 400, 'Returns 400 for missing arguments');

      // Test unknown tool
      response = await fetch(`${FIGMA_SERVICE_URL}/mcp/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': TEST_API_KEY
        },
        body: JSON.stringify({ name: 'unknown_tool', arguments: { fileKey: 'test' } })
      });
      const data = await response.json();
      this.assert(response.status === 200 && data.isError === true, 'Handles unknown tools gracefully');

      // Test 404 endpoint
      response = await fetch(`${FIGMA_SERVICE_URL}/nonexistent`);
      this.assert(response.status === 404, 'Returns 404 for non-existent endpoints');

      console.log('   ✅ Error handling test passed\n');
    } catch (error) {
      console.log(`   ❌ Error handling test failed: ${error.message}\n`);
    }
  }

  async testDirectAPIEndpoints() {
    console.log('🎯 Testing Direct API Endpoints');
    try {
      // Test direct file endpoint
      const response = await fetch(`${FIGMA_SERVICE_URL}/api/files/test123`, {
        headers: { 'X-API-Key': TEST_API_KEY }
      });
      this.assert(response.status === 200, 'Direct file endpoint works');

      // Test direct components endpoint
      const componentsResponse = await fetch(`${FIGMA_SERVICE_URL}/api/files/test123/components`, {
        headers: { 'X-API-Key': TEST_API_KEY }
      });
      this.assert(componentsResponse.status === 200, 'Direct components endpoint works');

      console.log('   ✅ Direct API endpoints test passed\n');
    } catch (error) {
      console.log(`   ❌ Direct API endpoints test failed: ${error.message}\n`);
    }
  }

  assert(condition, message) {
    const result = { message, passed: condition };
    this.results.push(result);
    if (!condition) {
      throw new Error(message);
    }
  }

  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log('📊 Test Summary');
    console.log('===============');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
      console.log('🎉 All MCP compliance tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check output above for details.');
    }
  }
}

// Run tests
const tester = new FigmaMCPTester();
tester.runAllTests().catch(console.error);