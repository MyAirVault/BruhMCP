// @ts-check
import { pool } from './config.js';
import { getAllMCPTypes, getMCPTypeByName } from './mcpTypesQueries.js';

/**
 * Verification script to test MCP types database insertion
 */

/**
 * Test database connection
 */
async function testConnection() {
	try {
		const result = await pool.query('SELECT NOW()');
		console.log('✅ Database connection successful');
		console.log('   Server time:', result.rows[0].now);
		return true;
	} catch (error) {
		console.error('❌ Database connection failed:', error);
		return false;
	}
}

/**
 * Verify MCP types table structure
 */
async function verifyTableStructure() {
	try {
		const result = await pool.query(`
			SELECT column_name, data_type, is_nullable, column_default
			FROM information_schema.columns 
			WHERE table_name = 'mcp_types'
			ORDER BY ordinal_position
		`);

		console.log('✅ MCP types table structure verified');
		console.table(result.rows);
		return true;
	} catch (error) {
		console.error('❌ Table structure verification failed:', error);
		return false;
	}
}

/**
 * Test all MCP types retrieval
 */
async function testGetAllMCPTypes() {
	try {
		const types = await getAllMCPTypes();
		console.log('✅ Successfully retrieved all MCP types');
		console.log(`   Found ${types.length} MCP types`);
		
		for (const type of types) {
			console.log(`   - ${type.display_name} (${type.name})`);
		}
		
		return types;
	} catch (error) {
		console.error('❌ Failed to retrieve MCP types:', error);
		return [];
	}
}

/**
 * Test individual MCP type retrieval
 * @param {string} name - MCP type name
 */
async function testGetMCPTypeByName(name) {
	try {
		const type = await getMCPTypeByName(name);
		if (type) {
			console.log(`✅ Successfully retrieved ${name} MCP type`);
			console.log(`   Display name: ${type.display_name}`);
			console.log(`   Description: ${type.description}`);
			console.log(`   Icon URL: ${type.icon_url || 'Not set'}`);
			console.log(`   Required credentials: ${JSON.stringify(type.required_credentials, null, 4)}`);
			console.log(`   Resource limits: ${JSON.stringify(type.resource_limits, null, 4)}`);
			console.log(`   Active: ${type.is_active}`);
			return type;
		} else {
			console.log(`❌ ${name} MCP type not found`);
			return null;
		}
	} catch (error) {
		console.error(`❌ Failed to retrieve ${name} MCP type:`, error);
		return null;
	}
}

/**
 * Verify credential structure compatibility with frontend
 * @param {Object} mcpType - MCP type object
 */
function verifyCredentialStructure(mcpType) {
	const { required_credentials } = mcpType;
	
	if (!Array.isArray(required_credentials)) {
		console.log(`❌ ${mcpType.name}: required_credentials is not an array`);
		return false;
	}
	
	// Check if it's old format (string array) or new format (object array)
	if (required_credentials.length > 0) {
		if (typeof required_credentials[0] === 'string') {
			console.log(`⚠️  ${mcpType.name}: Using old credential format (string array)`);
			return false;
		} else if (typeof required_credentials[0] === 'object') {
			const requiredFields = ['name', 'type', 'description', 'required'];
			const hasAllFields = requiredFields.every(field => 
				field in required_credentials[0]
			);
			
			if (hasAllFields) {
				console.log(`✅ ${mcpType.name}: Credential structure is compatible with frontend`);
				return true;
			} else {
				console.log(`❌ ${mcpType.name}: Missing required credential fields`);
				return false;
			}
		}
	}
	
	console.log(`✅ ${mcpType.name}: No credentials required`);
	return true;
}

/**
 * Verify all expected MCP types exist
 */
async function verifyExpectedTypes() {
	const expectedTypes = ['figma', 'gmail', 'slack', 'github'];
	const results = [];
	
	console.log('🔍 Verifying expected MCP types...');
	
	for (const typeName of expectedTypes) {
		console.log(`\n📋 Testing ${typeName.toUpperCase()} MCP:`);
		const type = await testGetMCPTypeByName(typeName);
		
		if (type) {
			const isCompatible = verifyCredentialStructure(type);
			results.push({
				name: typeName,
				exists: true,
				compatible: isCompatible,
				type: type
			});
		} else {
			results.push({
				name: typeName,
				exists: false,
				compatible: false,
				type: null
			});
		}
	}
	
	return results;
}

/**
 * Generate test report
 * @param {Array} results - Verification results
 */
function generateTestReport(results) {
	console.log('\n📊 VERIFICATION REPORT');
	console.log('========================');
	
	const summary = {
		total: results.length,
		exists: results.filter(r => r.exists).length,
		compatible: results.filter(r => r.compatible).length,
		missing: results.filter(r => !r.exists).length,
		incompatible: results.filter(r => r.exists && !r.compatible).length
	};
	
	console.log(`Total expected types: ${summary.total}`);
	console.log(`Types found: ${summary.exists}`);
	console.log(`Frontend compatible: ${summary.compatible}`);
	console.log(`Missing types: ${summary.missing}`);
	console.log(`Incompatible types: ${summary.incompatible}`);
	
	if (summary.missing > 0) {
		console.log('\n❌ Missing MCP types:');
		results.filter(r => !r.exists).forEach(r => 
			console.log(`   - ${r.name}`)
		);
	}
	
	if (summary.incompatible > 0) {
		console.log('\n⚠️  Incompatible MCP types:');
		results.filter(r => r.exists && !r.compatible).forEach(r => 
			console.log(`   - ${r.name}`)
		);
	}
	
	if (summary.missing === 0 && summary.incompatible === 0) {
		console.log('\n🎉 All MCP types are present and compatible!');
		return true;
	} else {
		console.log('\n⚠️  Some issues found. Run the update script to fix them.');
		return false;
	}
}

/**
 * Main verification function
 */
async function main() {
	try {
		console.log('🔄 Starting MCP types verification...\n');
		
		// Test database connection
		const connectionOk = await testConnection();
		if (!connectionOk) {
			throw new Error('Database connection failed');
		}
		
		console.log('');
		
		// Verify table structure
		await verifyTableStructure();
		
		console.log('\n🔍 Testing MCP types retrieval...');
		
		// Test getAllMCPTypes
		const allTypes = await testGetAllMCPTypes();
		
		// Verify expected types
		const results = await verifyExpectedTypes();
		
		// Generate report
		const allGood = generateTestReport(results);
		
		if (allGood) {
			console.log('\n✅ Verification completed successfully!');
			process.exit(0);
		} else {
			console.log('\n❌ Verification found issues. Check the report above.');
			process.exit(1);
		}
		
	} catch (error) {
		console.error('❌ Verification failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run verification if executed directly
if (import.meta.url === new URL(import.meta.url).href) {
	main();
}

export { verifyExpectedTypes, verifyCredentialStructure, testGetAllMCPTypes };