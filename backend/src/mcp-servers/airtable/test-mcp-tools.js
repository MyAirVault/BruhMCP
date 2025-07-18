/**
 * Comprehensive test script for Airtable MCP tools
 * Tests all available tools with various parameters
 */

import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const MCP_URL = 'https://mcpglobal.duckdns.org/airtable/6459926c-86e0-4bba-a506-e6f347361b09';
const SESSION_ID = 'test-session-' + Date.now();

// Test configuration - you'll need to update these with actual IDs from your Airtable
const TEST_CONFIG = {
  // These are example IDs - replace with your actual Airtable IDs
  baseId: 'appXXXXXXXXXXXXXX', // Replace with actual base ID
  tableId: 'tblXXXXXXXXXXXXXX', // Replace with actual table ID
  recordId: 'recXXXXXXXXXXXXXX', // Replace with actual record ID (if exists)
  viewId: 'viwXXXXXXXXXXXXXX', // Replace with actual view ID (optional)
};

// Helper function to make MCP requests
async function makeMCPRequest(method, params = {}, id = null) {
  const requestBody = {
    jsonrpc: '2.0',
    method,
    params,
    id: id || Date.now()
  };

  try {
    const response = await fetch(`${MCP_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'mcp-session-id': SESSION_ID
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return {
      success: response.ok && !data.error,
      status: response.status,
      data,
      error: data.error || null
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
  // 1. Initialize session
  async testInitialize() {
    console.log('\n📌 Testing: initialize');
    const result = await makeMCPRequest('initialize', {
      protocolVersion: '0.1.0',
      clientInfo: {
        name: 'Airtable MCP Test Client',
        version: '1.0.0'
      }
    });
    
    testResults.tools['initialize'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
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
    
    return result.success;
  },

  // 4. Get base schema
  async testGetBaseSchema() {
    console.log('\n📋 Testing: get_base_schema');
    const result = await makeMCPRequest('tools/call', {
      name: 'get_base_schema',
      arguments: {
        baseId: TEST_CONFIG.baseId
      }
    });
    
    testResults.tools['get_base_schema'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
    return result.success;
  },

  // 5. List records
  async testListRecords() {
    console.log('\n📋 Testing: list_records');
    
    // Test with basic parameters
    const result = await makeMCPRequest('tools/call', {
      name: 'list_records',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        tableId: TEST_CONFIG.tableId,
        maxRecords: 10
      }
    });
    
    // Test with advanced parameters
    const advancedResult = await makeMCPRequest('tools/call', {
      name: 'list_records',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        tableId: TEST_CONFIG.tableId,
        maxRecords: 5,
        fields: ['Name', 'Status'],
        filterByFormula: "Status = 'Active'",
        sort: [{ field: 'Name', direction: 'asc' }]
      }
    });
    
    testResults.tools['list_records'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error,
      advanced: {
        success: advancedResult.success,
        error: advancedResult.error
      }
    };
    
    return result.success;
  },

  // 6. Get record
  async testGetRecord() {
    console.log('\n📄 Testing: get_record');
    const result = await makeMCPRequest('tools/call', {
      name: 'get_record',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        tableId: TEST_CONFIG.tableId,
        recordId: TEST_CONFIG.recordId
      }
    });
    
    testResults.tools['get_record'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
    return result.success;
  },

  // 7. Create record
  async testCreateRecord() {
    console.log('\n➕ Testing: create_record');
    const testFields = {
      Name: 'Test Record - ' + new Date().toISOString(),
      Status: 'Active',
      Notes: 'Created by MCP test script'
    };
    
    const result = await makeMCPRequest('tools/call', {
      name: 'create_record',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        tableId: TEST_CONFIG.tableId,
        fields: testFields
      }
    });
    
    testResults.tools['create_record'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error,
      createdRecordId: result.data?.result?.content?.[0]?.text?.match(/rec[a-zA-Z0-9]+/)?.[0]
    };
    
    return result.success;
  },

  // 8. Update record
  async testUpdateRecord() {
    console.log('\n✏️ Testing: update_record');
    const updateFields = {
      Notes: 'Updated by MCP test script at ' + new Date().toISOString()
    };
    
    const result = await makeMCPRequest('tools/call', {
      name: 'update_record',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        tableId: TEST_CONFIG.tableId,
        recordId: TEST_CONFIG.recordId,
        fields: updateFields
      }
    });
    
    testResults.tools['update_record'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
    return result.success;
  },

  // 9. Create multiple records
  async testCreateMultipleRecords() {
    console.log('\n➕➕ Testing: create_multiple_records');
    const records = [
      {
        fields: {
          Name: 'Batch Test 1 - ' + Date.now(),
          Status: 'Active'
        }
      },
      {
        fields: {
          Name: 'Batch Test 2 - ' + Date.now(),
          Status: 'Pending'
        }
      },
      {
        fields: {
          Name: 'Batch Test 3 - ' + Date.now(),
          Status: 'Active'
        }
      }
    ];
    
    const result = await makeMCPRequest('tools/call', {
      name: 'create_multiple_records',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        tableId: TEST_CONFIG.tableId,
        records
      }
    });
    
    testResults.tools['create_multiple_records'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
    return result.success;
  },

  // 10. Search records
  async testSearchRecords() {
    console.log('\n🔍 Testing: search_records');
    const result = await makeMCPRequest('tools/call', {
      name: 'search_records',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        query: 'Test',
        tables: [TEST_CONFIG.tableId],
        maxRecords: 10
      }
    });
    
    testResults.tools['search_records'] = {
      tested: true,
      success: result.success,
      response: result.data,
      error: result.error
    };
    
    return result.success;
  },

  // 11. Delete record
  async testDeleteRecord() {
    console.log('\n🗑️ Testing: delete_record');
    
    // First create a record to delete
    const createResult = await makeMCPRequest('tools/call', {
      name: 'create_record',
      arguments: {
        baseId: TEST_CONFIG.baseId,
        tableId: TEST_CONFIG.tableId,
        fields: {
          Name: 'Record to Delete - ' + Date.now(),
          Status: 'ToDelete'
        }
      }
    });
    
    if (createResult.success) {
      // Extract the created record ID
      const createdId = createResult.data?.result?.content?.[0]?.text?.match(/rec[a-zA-Z0-9]+/)?.[0];
      
      if (createdId) {
        const deleteResult = await makeMCPRequest('tools/call', {
          name: 'delete_record',
          arguments: {
            baseId: TEST_CONFIG.baseId,
            tableId: TEST_CONFIG.tableId,
            recordId: createdId
          }
        });
        
        testResults.tools['delete_record'] = {
          tested: true,
          success: deleteResult.success,
          response: deleteResult.data,
          error: deleteResult.error
        };
        
        return deleteResult.success;
      }
    }
    
    testResults.tools['delete_record'] = {
      tested: true,
      success: false,
      error: 'Could not create test record for deletion'
    };
    
    return false;
  },

  // 12. Get service stats
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
    
    return result.success;
  }
};

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Airtable MCP Tools Test Suite');
  console.log('==========================================');
  console.log(`URL: ${MCP_URL}`);
  console.log(`Session ID: ${SESSION_ID}`);
  console.log(`Timestamp: ${testResults.timestamp}`);
  
  // Check if test config needs updating
  if (TEST_CONFIG.baseId.includes('XXX')) {
    console.log('\n⚠️  WARNING: Please update TEST_CONFIG with actual Airtable IDs!');
    console.log('   Current config uses placeholder values.');
    console.log('   Some tests may fail without valid IDs.\n');
  }
  
  // Run tests in sequence
  const testSequence = [
    'testInitialize',
    'testListTools',
    'testListBases',
    'testGetBaseSchema',
    'testListRecords',
    'testGetRecord',
    'testCreateRecord',
    'testUpdateRecord',
    'testCreateMultipleRecords',
    'testSearchRecords',
    'testDeleteRecord',
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
        
        const tool = testName.replace('test', '').toLowerCase();
        if (testResults.tools[tool]?.error) {
          console.log(`     Error: ${JSON.stringify(testResults.tools[tool].error)}`);
          testResults.summary.errors.push({
            tool,
            error: testResults.tools[tool].error
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
  
  // Save detailed results
  const fs = await import('fs/promises');
  const reportPath = `/home/ritz/GlobalMCPServer/backend/src/mcp-servers/airtable/test-results-${Date.now()}.json`;
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  return testResults;
}

// Run the tests
runAllTests().catch(console.error);