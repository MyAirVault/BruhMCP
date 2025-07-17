/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */
/**
 * Create credential authentication middleware for OAuth Bearer tokens
 * @returns {Function} Express middleware function
 */
export function createCredentialAuthMiddleware(): Function;
/**
 * Create lightweight authentication middleware for non-critical endpoints
 * @returns {Function} Express middleware function
 */
export function createLightweightAuthMiddleware(): Function;
/**
 * Create cache performance monitoring middleware for development
 * @returns {Function} Express middleware function
 */
export function createCachePerformanceMiddleware(): Function;
export type Request = import("express").Request;
export type Response = import("express").Response;
export type NextFunction = import("express").NextFunction;
//# sourceMappingURL=credential-auth.d.ts.map