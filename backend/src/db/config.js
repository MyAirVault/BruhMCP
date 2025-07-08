// @ts-check

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Database configuration
 */
const config = {
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT || '5432'),
	database: process.env.DB_NAME || 'minimcp',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
};

/**
 * Database connection pool
 */
export const pool = new Pool(config);

/**
 * Test database connection
 */
export async function testConnection() {
	try {
		const client = await pool.connect();
		console.log('Database connected successfully');
		client.release();
	} catch (error) {
		console.error('Database connection error:', error);
		throw error;
	}
}
