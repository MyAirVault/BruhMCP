import { pool } from '../config.js';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrations = [
	'002_separate_credentials_table.sql',
	'003_token_audit_log.sql',
	'004_add_optimistic_locking.sql',
	'005_add_user_plans_with_active_limits.sql',
	'006_add_billing_fields.sql',
	'007_add_user_billing_details.sql',
];

async function loadMCPServiceRegistrations() {
	const mcpServicesPath = join(__dirname, '..', '..', 'mcp-servers');
	const services = [];

	try {
		const serviceDirectories = readdirSync(mcpServicesPath);

		for (const serviceDir of serviceDirectories) {
			const servicePath = join(mcpServicesPath, serviceDir);
			const dbPath = join(servicePath, 'db', 'service.sql');

			try {
				const sql = readFileSync(dbPath, 'utf8');
				services.push({
					name: serviceDir,
					sql: sql,
				});
			} catch (error) {
				// Skip if service.sql doesn't exist
				console.log(`⚠️ No service.sql found for ${serviceDir}`);
			}
		}
	} catch (error) {
		console.error('❌ Error loading MCP services:', error);
		throw error;
	}

	return services;
}

async function runMigrations() {
	try {
		console.log('🔄 Running database migrations...');

		// Run core migrations first
		for (const migration of migrations) {
			const migrationPath = join(__dirname, '..', 'migrations', migration);
			const sql = readFileSync(migrationPath, 'utf8');

			console.log(`📄 Running migration: ${migration}`);
			await pool.query(sql);
			console.log(`✅ Migration completed: ${migration}`);
		}

		// Load and run MCP service registrations
		console.log('🔄 Loading MCP service registrations...');
		const services = await loadMCPServiceRegistrations();

		for (const service of services) {
			console.log(`📄 Registering MCP service: ${service.name}`);
			await pool.query(service.sql);
			console.log(`✅ Service registered: ${service.name}`);
		}

		console.log('🎉 All migrations completed successfully!');
	} catch (error) {
		console.error('❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

runMigrations();
