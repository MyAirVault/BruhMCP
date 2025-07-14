/**
 * Test database connection
 */
export function testConnection(): Promise<void>;
/**
 * Check if required database tables exist
 */
export function checkDatabaseTables(): Promise<boolean>;
/**
 * Initialize database connection and verify tables
 */
export function initializeDatabase(): Promise<void>;
/**
 * Database connection pool
 */
export const pool: pg.Pool;
import pg from 'pg';
//# sourceMappingURL=config.d.ts.map