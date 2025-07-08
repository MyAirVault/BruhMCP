// @ts-check
import { pool } from './config.js';

/**
 * Find user by email
 * @param {string} email
 */
export async function findUserByEmail(email) {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * Create new user
 * @param {string} email
 */
export async function createUser(email) {
  const query = `
    INSERT INTO users (email) 
    VALUES ($1) 
    RETURNING *
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

/**
 * Find or create user by email
 * @param {string} email
 */
export async function findOrCreateUser(email) {
  let user = await findUserByEmail(email);
  
  if (!user) {
    user = await createUser(email);
  }
  
  return user;
}