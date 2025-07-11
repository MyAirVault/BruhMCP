#!/usr/bin/env node

/**
 * MCP Protocol Compliance Test Script
 * Tests running MCP servers for proper protocol implementation
 */

import { verifyMCPCompliance } from './src/utils/mcp-protocol-verifier.js';
import { pool } from './src/db/config.js';

async function main() {
	console.log('🚀 Starting MCP Protocol Compliance Testing\n');

	try {
		// Get all active MCP instances
		const query = `
			SELECT mi.*, mt.name as mcp_type, mt.display_name 
			FROM mcp_instances mi
			JOIN mcp_types mt ON mi.mcp_type_id = mt.id
			WHERE mi.status = 'active'
			ORDER BY mi.created_at DESC
		`;
		const result = await pool.query(query);
		const instances = result.rows;

		if (instances.length === 0) {
			console.log('❌ No active MCP instances found');
			console.log('Create an MCP instance first to test protocol compliance');
			process.exit(1);
		}

		console.log(`Found ${instances.length} active MCP instance(s)\n`);

		const results = [];

		// Test each active instance
		for (const instance of instances) {
			const baseUrl = `http://localhost:${instance.assigned_port}/${instance.id}/mcp/${instance.mcp_type}`;

			console.log(`\n🔍 Testing MCP Instance:`);
			console.log(`   ID: ${instance.id}`);
			console.log(`   Type: ${instance.mcp_type}`);
			console.log(`   Name: ${instance.custom_name}`);
			console.log(`   URL: ${baseUrl}`);
			console.log(`   Status: ${instance.status}\n`);

			if (instance.status !== 'active') {
				console.log(`⏭️  Skipping inactive instance: ${instance.custom_name}\n`);
				continue;
			}

			try {
				const result = await verifyMCPCompliance(baseUrl);
				result.instance_info = {
					id: instance.id,
					type: instance.mcp_type,
					name: instance.custom_name,
					url: baseUrl,
				};
				results.push(result);
			} catch (error) {
				console.error(`❌ Failed to test instance ${instance.custom_name}: ${error.message}\n`);
				results.push({
					instance_info: {
						id: instance.id,
						type: instance.mcp_type,
						name: instance.custom_name,
						url: baseUrl,
					},
					compliance: 'ERROR',
					error: error.message,
				});
			}
		}

		// Generate overall report
		generateOverallReport(results);
	} catch (error) {
		console.error('❌ Test script failed:', error.message);
		process.exit(1);
	}
}

function generateOverallReport(results) {
	console.log('\n' + '='.repeat(60));
	console.log('📊 OVERALL MCP PROTOCOL COMPLIANCE REPORT');
	console.log('='.repeat(60));

	const compliantCount = results.filter(r => r.compliance === 'COMPLIANT').length;
	const nonCompliantCount = results.filter(r => r.compliance === 'NON_COMPLIANT').length;
	const errorCount = results.filter(r => r.compliance === 'ERROR').length;
	const totalCount = results.length;

	console.log(`\n📈 Summary:`);
	console.log(`   Total Instances Tested: ${totalCount}`);
	console.log(`   Compliant: ${compliantCount} (${Math.round((compliantCount / totalCount) * 100)}%)`);
	console.log(`   Non-Compliant: ${nonCompliantCount} (${Math.round((nonCompliantCount / totalCount) * 100)}%)`);
	console.log(`   Errors: ${errorCount} (${Math.round((errorCount / totalCount) * 100)}%)`);

	console.log(`\n📋 Instance Results:`);
	results.forEach((result, index) => {
		const icon = result.compliance === 'COMPLIANT' ? '✅' : result.compliance === 'NON_COMPLIANT' ? '❌' : '⚠️';

		console.log(`   ${icon} ${result.instance_info.name} (${result.instance_info.type})`);

		if (result.summary) {
			console.log(`      Success Rate: ${result.summary.success_rate}%`);
			console.log(`      Tests: ${result.summary.passed}/${result.summary.total} passed`);
		}

		if (result.error) {
			console.log(`      Error: ${result.error}`);
		}
	});

	// Overall compliance status
	if (compliantCount === totalCount && totalCount > 0) {
		console.log(`\n🎉 ALL MCP INSTANCES ARE PROTOCOL COMPLIANT!`);
	} else if (nonCompliantCount > 0 || errorCount > 0) {
		console.log(`\n⚠️  SOME MCP INSTANCES ARE NOT FULLY COMPLIANT`);
		console.log(`   Review the detailed test results above`);
		console.log(`   Ensure all servers implement proper JSON-RPC 2.0 protocol`);
	}

	console.log('\n' + '='.repeat(60));
	console.log(`Test completed at: ${new Date().toISOString()}`);
	console.log('='.repeat(60));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}
