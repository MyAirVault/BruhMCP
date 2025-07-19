/**
 * Fixed test script for Airtable MCP tools with proper session handling
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const MCP_URL = 'https://app.bruhmcp.com/airtable/6459926c-86e0-4bba-a506-e6f347361b09';
let SESSION_ID = null; // Will be set after initialization

// Test configuration - update these with actual IDs from your Airtable
const TEST_CONFIG = {
  baseId: 'appXXXXXXXXXXXXXX', // Replace with actual base ID
  tableId: 'tblXXXXXXXXXXXXXX', // Replace with actual table ID
  recordId: 'recXXXXXXXXXXXXXX', // Replace with actual record ID (if exists)
  viewId: 'viwXXXXXXXXXXXXXX', // Replace with actual view ID (optional)
};

// Helper function to make MCP requests
async function makeMCPRequest(method, params = {}, id = null, useSessionId = true) {
  const requestBody = {
    jsonrpc: '2.0',
    method,
    params,
    id: id || Date.now()
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Only add session ID if we have one and should use it
  if (useSessionId && SESSION_ID) {
    headers['mcp-session-id'] = SESSION_ID;
  }

  try {
    const response = await fetch(`${MCP_URL}/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // Extract session ID from response headers if present
    const newSessionId = response.headers.get('mcp-session-id');
    if (newSessionId) {
      SESSION_ID = newSessionId;
      console.log(`  📍 Session ID obtained: ${SESSION_ID}`);
    }
    
    return {
      success: response.ok && !data.error,
      status: response.status,
      data,
      error: data.error || null,
      sessionId: newSessionId
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      networkError: true
    };
  }
}

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  url: MCP_URL,
  sessionId: null,
  tools: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

// Test functions for each tool
const tests = {
  // 1. Initialize session (no session ID should be provided)
  async testInitialize() {
    console.log('\n📌 Testing: initialize');
    const result = await makeMCPRequest('initialize', {
      protocolVersion: '0.1.0',
      clientInfo: {
        name: 'Airtable MCP Test Client',
        version: '1.0.0'
      }
    }, null, false); // Don't use session ID for initialize
    
    testResults.tools['initialize'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error,
      sessionId: result.sessionId || SESSION_ID
    };
    
    if (result.success && SESSION_ID) {
      testResults.sessionId = SESSION_ID;
      console.log(`  ✓ Initialized with session: ${SESSION_ID}`);
    }
    
    return result.success;
  },

  // 2. List tools
  async testListTools() {
    console.log('\n🔧 Testing: tools/list');
    const result = await makeMCPRequest('tools/list');
    
    testResults.tools['tools/list'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error,
      toolCount: result.data?.result?.tools?.length || 0
    };
    
    if (result.success && result.data?.result?.tools) {
      console.log(`  ✓ Found ${result.data.result.tools.length} tools`);
      result.data.result.tools.forEach(tool => {
        console.log(`    - ${tool.name}: ${tool.description}`);
      });
    }
    
    return result.success;
  },

  // 3. List bases
  async testListBases() {
    console.log('\n📊 Testing: list_bases');
    const result = await makeMCPRequest('tools/call', {
      name: 'list_bases',
      arguments: {}
    });
    
    testResults.tools['list_bases'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
    if (result.success && result.data?.result?.content) {
      console.log('  ✓ Successfully listed bases');
      const content = result.data.result.content[0]?.text || '';
      const baseCount = (content.match(/app[a-zA-Z0-9]+/g) || []).length;
      if (baseCount > 0) {
        console.log(`    Found ${baseCount} bases`);
      }
    }
    
    return result.success;
  },

  // 4. Get base schema
  async testGetBaseSchema() {
    console.log('\n📋 Testing: get_base_schema');
    
    // If we have placeholder config, try to get a real base ID first
    let baseIdToUse = TEST_CONFIG.baseId;
    if (baseIdToUse.includes('XXX')) {
      console.log('  ℹ️  Attempting to find a real base ID...');
      const listResult = await makeMCPRequest('tools/call', {
        name: 'list_bases',
        arguments: {}
      });
      
      if (listResult.success && listResult.data?.result?.content) {
        const content = listResult.data.result.content[0]?.text || '';
        const baseMatch = content.match(/Base ID: (app[a-zA-Z0-9]+)/);
        if (baseMatch) {
          baseIdToUse = baseMatch[1];
          console.log(`  ℹ️  Using found base ID: ${baseIdToUse}`);
        }
      }
    }
    
    const result = await makeMCPRequest('tools/call', {
      name: 'get_base_schema',
      arguments: {
        baseId: baseIdToUse
      }
    });
    
    testResults.tools['get_base_schema'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error,
      baseIdUsed: baseIdToUse
    };
    
    return result.success;
  },

  // 5. Get service stats
  async testGetServiceStats() {
    console.log('\n📊 Testing: get_service_stats');
    const result = await makeMCPRequest('tools/call', {
      name: 'get_service_stats',
      arguments: {}
    });
    
    testResults.tools['get_service_stats'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
    if (result.success && result.data?.result?.content) {
      console.log('  ✓ Successfully retrieved service stats');
    }
    
    return result.success;
  },

  // Additional tests can be added here for other tools...
};

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Airtable MCP Tools Test Suite');
  console.log('==========================================');
  console.log(`URL: ${MCP_URL}`);
  console.log(`Timestamp: ${testResults.timestamp}`);
  
  // Check if test config needs updating
  if (TEST_CONFIG.baseId.includes('XXX')) {
    console.log('\n⚠️  WARNING: Test config uses placeholder values.');
    console.log('   Some tests will attempt to find real IDs automatically.\n');
  }
  
  // Run tests in sequence
  const testSequence = [
    'testInitialize',
    'testListTools',
    'testListBases',
    'testGetBaseSchema',
    'testGetServiceStats'
  ];
  
  for (const testName of testSequence) {
    testResults.summary.total++;
    
    try {
      const success = await tests[testName]();
      
      if (success) {
        testResults.summary.passed++;
        console.log(`  ✅ ${testName.replace('test', '')} - PASSED`);
      } else {
        testResults.summary.failed++;
        console.log(`  ❌ ${testName.replace('test', '')} - FAILED`);
        
        const toolKey = testName.replace('test', '').toLowerCase();
        if (testResults.tools[toolKey]?.error) {
          console.log(`     Error: ${JSON.stringify(testResults.tools[toolKey].error)}`);
          testResults.summary.errors.push({
            tool: toolKey,
            error: testResults.tools[toolKey].error
          });
        }
      }
    } catch (error) {
      testResults.summary.failed++;
      console.log(`  ❌ ${testName.replace('test', '')} - ERROR: ${error.message}`);
      testResults.summary.errors.push({
        tool: testName.replace('test', ''),
        error: error.message
      });
    }
  }
  
  // Print summary
  console.log('\n==========================================');
  console.log('📊 Test Summary');
  console.log('==========================================');
  console.log(`Session ID: ${testResults.sessionId || 'Not obtained'}`);
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`Passed: ${testResults.summary.passed} ✅`);
  console.log(`Failed: ${testResults.summary.failed} ❌`);
  console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  if (testResults.summary.errors.length > 0) {
    console.log('\n🚨 Errors:');
    testResults.summary.errors.forEach(({ tool, error }) => {
      console.log(`  - ${tool}: ${typeof error === 'object' ? JSON.stringify(error) : error}`);
    });
  }
  
  // Provide recommendations
  console.log('\n📝 Recommendations:');
  if (!SESSION_ID) {
    console.log('  ❗ Session initialization failed - check server logs');
  }
  if (testResults.summary.passed === testResults.summary.total) {
    console.log('  ✅ All basic tools are working correctly!');
    console.log('  📌 Next steps: Update TEST_CONFIG with real Airtable IDs to test CRUD operations');
  } else {
    console.log('  ⚠️  Some tools are failing - check the specific errors above');
    console.log('  💡 Common issues: API key problems, network connectivity, server configuration');
  }
  
  // Save detailed results
  const fs = await import('fs/promises');
  const reportPath = `/home/ritz/GlobalMCPServer/backend/src/mcp-servers/airtable/test-results-fixed-${Date.now()}.json`;
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  return testResults;
}

// Run the tests
runAllTests().catch(console.error);