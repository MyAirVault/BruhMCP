/**
 * Database connection pool
 */
export const pool: pg.Pool;
/**
 * Test database connection
 * @returns {Promise<void>}
 */
export function testConnection(): Promise<void>;
/**
 * Check if required database tables exist
 * @returns {Promise<boolean>}
 */
export function checkDatabaseTables(): Promise<boolean>;
/**
 * Initialize database connection and verify tables
 * @returns {Promise<void>}
 */
export function initializeDatabase(): Promise<void>;
import pg = require("pg");
export { pool as db };
//# sourceMappingURL=config.d.ts.map