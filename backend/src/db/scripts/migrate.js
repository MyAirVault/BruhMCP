import { pool } from './config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrations = [
	'002_create_mcp_types_table.sql',
	'003_create_api_keys_table.sql',
	'004_create_mcp_instances_table.sql',
];

async function runMigrations() {
	try {
		console.log('🔄 Running database migrations...');

		for (const migration of migrations) {
			const migrationPath = join(__dirname, 'migrations', migration);
			const sql = readFileSync(migrationPath, 'utf8');

			console.log(`📄 Running migration: ${migration}`);
			await pool.query(sql);
			console.log(`✅ Migration completed: ${migration}`);
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
