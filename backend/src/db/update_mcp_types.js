// @ts-check
import { pool } from './config.js';

/**
 * Update MCP types with proper credential fields and add missing types
 * This script updates the existing MCP types to match frontend expectations
 * and adds the missing Slack MCP type
 */

/**
 * MCP type definitions with proper credential structures
 */
const mcpTypesData = [
	{
		name: 'figma',
		display_name: 'Figma MCP',
		description: 'Access and manage Figma design files, components, and team libraries through MCP',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg',
		server_script: './mcp-servers/figma-mcp-server.js',
		config_template: {
			api_version: 'v1',
			base_url: 'https://api.figma.com/v1'
		},
		required_credentials: [
			{
				name: 'api_key',
				type: 'password',
				description: 'Personal Access Token from Figma account settings',
				required: true
			}
		],
		resource_limits: {
			max_memory_mb: 512,
			max_cpu_percent: 50,
			max_requests_per_minute: 1000
		}
	},
	{
		name: 'gmail',
		display_name: 'Gmail MCP',
		description: 'Access Gmail API for email management, sending, and organization through MCP',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg',
		server_script: './mcp-servers/gmail-mcp-server.js',
		config_template: {
			api_version: 'v1',
			scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
			base_url: 'https://gmail.googleapis.com/gmail/v1'
		},
		required_credentials: [
			{
				name: 'client_id',
				type: 'text',
				description: 'OAuth 2.0 Client ID from Google Cloud Console',
				required: true
			},
			{
				name: 'client_secret',
				type: 'password',
				description: 'OAuth 2.0 Client Secret from Google Cloud Console',
				required: true
			},
			{
				name: 'refresh_token',
				type: 'password',
				description: 'OAuth 2.0 Refresh Token for accessing Gmail API',
				required: true
			}
		],
		resource_limits: {
			max_memory_mb: 1024,
			max_cpu_percent: 60,
			max_requests_per_minute: 250
		}
	},
	{
		name: 'slack',
		display_name: 'Slack MCP',
		description: 'Integrate with Slack workspaces for messaging, channel management, and bot interactions',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg',
		server_script: './mcp-servers/slack-mcp-server.js',
		config_template: {
			api_version: 'v1',
			base_url: 'https://slack.com/api',
			scopes: ['channels:read', 'chat:write', 'users:read', 'files:read']
		},
		required_credentials: [
			{
				name: 'bot_token',
				type: 'password',
				description: 'Bot User OAuth Token (xoxb-...) from Slack App settings',
				required: true
			}
		],
		resource_limits: {
			max_memory_mb: 768,
			max_cpu_percent: 40,
			max_requests_per_minute: 100
		}
	},
	{
		name: 'github',
		display_name: 'GitHub MCP',
		description: 'Access GitHub repositories, issues, pull requests, and manage code through MCP',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg',
		server_script: './mcp-servers/github-mcp-server.js',
		config_template: {
			api_version: 'v3',
			base_url: 'https://api.github.com',
			scopes: ['repo', 'read:org', 'read:user', 'gist']
		},
		required_credentials: [
			{
				name: 'personal_access_token',
				type: 'password',
				description: 'Personal Access Token from GitHub Developer settings',
				required: true
			}
		],
		resource_limits: {
			max_memory_mb: 1024,
			max_cpu_percent: 50,
			max_requests_per_minute: 5000
		}
	}
];

/**
 * Update or insert MCP type
 * @param {Object} mcpType - MCP type data
 */
async function upsertMCPType(mcpType) {
	const {
		name,
		display_name,
		description,
		icon_url,
		server_script,
		config_template,
		required_credentials,
		resource_limits
	} = mcpType;

	const query = `
		INSERT INTO mcp_types (
			name, display_name, description, icon_url, server_script, 
			config_template, required_credentials, resource_limits, is_active
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (name) DO UPDATE SET
			display_name = EXCLUDED.display_name,
			description = EXCLUDED.description,
			icon_url = EXCLUDED.icon_url,
			server_script = EXCLUDED.server_script,
			config_template = EXCLUDED.config_template,
			required_credentials = EXCLUDED.required_credentials,
			resource_limits = EXCLUDED.resource_limits,
			is_active = EXCLUDED.is_active,
			updated_at = CURRENT_TIMESTAMP
	`;

	const values = [
		name,
		display_name,
		description,
		icon_url,
		server_script,
		JSON.stringify(config_template),
		JSON.stringify(required_credentials),
		JSON.stringify(resource_limits),
		true
	];

	await pool.query(query, values);
	console.log(`✅ Upserted MCP type: ${name} (${display_name})`);
}

/**
 * Main function to update all MCP types
 */
async function updateMCPTypes() {
	try {
		console.log('🔄 Updating MCP types in database...');
		console.log('');

		// Update each MCP type
		for (const mcpType of mcpTypesData) {
			await upsertMCPType(mcpType);
		}

		console.log('');
		console.log('🎉 All MCP types updated successfully!');
		console.log('');

		// Display summary
		const result = await pool.query(`
			SELECT name, display_name, 
			       jsonb_array_length(required_credentials) as credential_count,
			       is_active
			FROM mcp_types 
			ORDER BY name
		`);

		console.log('📊 Current MCP types in database:');
		console.table(result.rows);

	} catch (error) {
		console.error('❌ Failed to update MCP types:', error);
		throw error;
	}
}

/**
 * Verify the update was successful
 */
async function verifyUpdate() {
	try {
		console.log('🔍 Verifying MCP types update...');
		
		const result = await pool.query(`
			SELECT name, display_name, description, icon_url, 
			       required_credentials, resource_limits, is_active
			FROM mcp_types 
			WHERE name IN ('figma', 'gmail', 'slack', 'github')
			ORDER BY name
		`);

		console.log('');
		console.log('✅ Verification complete - Found', result.rows.length, 'MCP types');
		
		for (const row of result.rows) {
			console.log(`\n📋 ${row.display_name} (${row.name}):`);
			console.log(`   Description: ${row.description}`);
			console.log(`   Icon URL: ${row.icon_url || 'Not set'}`);
			console.log(`   Required credentials: ${JSON.stringify(row.required_credentials, null, 2)}`);
			console.log(`   Resource limits: ${JSON.stringify(row.resource_limits, null, 2)}`);
			console.log(`   Active: ${row.is_active}`);
		}

	} catch (error) {
		console.error('❌ Verification failed:', error);
		throw error;
	}
}

/**
 * Run the update script
 */
async function main() {
	try {
		await updateMCPTypes();
		await verifyUpdate();
	} catch (error) {
		console.error('❌ Script execution failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Run the script if executed directly
if (import.meta.url === new URL(import.meta.url).href) {
	main();
}

export { updateMCPTypes, verifyUpdate };