export const DB_HOST: string;
export const DB_NAME: string;
export const DB_USER: string;
export const DB_PASSWORD: string;
export const DATABASE_URL: string;
export const PORT: string;
export const NODE_ENV: string;
export const PUBLIC_DOMAIN: string;
export const JWT_SECRET: string;
export const JWT_REFRESH_SECRET: string;
export const SMTP_HOST: string;
export const SMTP_PORT: string;
export const SMTP_USERNAME: string;
export const SMTP_PASSWORD: string;
export const CORS_ORIGIN: string;
export const RAZORPAY_KEY_ID: string;
export const RAZORPAY_KEY_SECRET: string;
export const RAZORPAY_WEBHOOK_SECRET: string;
/**
 * Environment variables configuration and validation
 * Centralizes all environment variable access and provides validation
 */
/**
 * Validates and returns an environment variable value
 * @param {string} key - Environment variable name
 * @param {string} [defaultValue] - Default value if environment variable is not set
 * @param {boolean} [required=true] - Whether the variable is required
 * @returns {string} Environment variable value
 * @throws {Error} If required environment variable is missing
 */
export function getEnvVar(key: string, defaultValue?: string, required?: boolean): string;
/**
 * Validates all required environment variables
 * @returns {boolean} True if all required variables are present
 * @throws {Error} If any required environment variable is missing
 */
export function validateEnvironment(): boolean;
export declare let DB_PORT: number;
export declare let RATE_LIMIT_WINDOW_MS: number;
export declare let RATE_LIMIT_MAX: number;
export declare let BCRYPT_ROUNDS: number;
//# sourceMappingURL=env.d.ts.map