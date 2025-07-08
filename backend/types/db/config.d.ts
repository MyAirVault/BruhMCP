/**
 * Test database connection
 * @returns {Promise<void>}
 */
export function testConnection(): Promise<void>;
/**
 * Database connection pool
 * @type {Pool}
 */
export const pool: Pool;
export type Pool = import("pg").Pool;
export type PoolConfig = import("pg").PoolConfig;
