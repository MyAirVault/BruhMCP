// @ts-check

const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const { Pool } = pg;

/**
 * Database configuration
 */
const config = {
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '5432'),
	database: process.env.DB_NAME || 'bruhmcp',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
};

/**
 * Database connection pool
 */
const pool = new Pool(config);

/**
 * Test database connection
 * @returns {Promise<void>}
 */
async function testConnection() {
	try {
		const client = await pool.connect();
		console.log('Database connected successfully');
		client.release();
	} catch (error) {
		console.error('Database connection error:', error);
		throw error;
	}
}

/**
 * Check if required database tables exist
 * @returns {Promise<boolean>}
 */
async function checkDatabaseTables() {
	const requiredTables = [
		'users',
		'mcp_table',
		'mcp_service_table',
		'mcp_credentials',
		'token_audit_log',
		'user_plans',
	];

	try {
		const client = await pool.connect();

		for (const table of requiredTables) {
			const result = await client.query(
				`
				SELECT EXISTS (
					SELECT FROM information_schema.tables 
					WHERE table_schema = 'public' 
					AND table_name = $1
				);
			`,
				[table]
			);

			if (!result.rows[0].exists) {
				throw new Error(`Required table '${table}' does not exist. Please run database migrations.`);
			}
		}

		console.log('✅ All required database tables exist');
		client.release();
		return true;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('❌ Database table check failed:', errorMessage);
		throw error;
	}
}

/**
 * Initialize database connection and verify tables
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
	try {
		console.log('🔄 Initializing database connection...');
		await testConnection();
		await checkDatabaseTables();
		console.log('✅ Database initialization complete');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error('❌ Database initialization failed:', errorMessage);
		console.error('Please ensure PostgreSQL is running and migrations have been executed.');
		console.error('Run: npm run db:migrate');
		throw error;
	}
}

module.exports = {
	db: pool,
	pool,
	testConnection,
	checkDatabaseTables,
	initializeDatabase
};
