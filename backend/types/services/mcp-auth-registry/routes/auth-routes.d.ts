export type AuthCredentials = import("../types/auth-types.js").AuthCredentials;
export type InstanceCreationData = import("../types/auth-types.js").InstanceCreationData;
export type InstanceStatus = {
    /**
     * - OAuth status
     */
    oauth_status: string;
    /**
     * - Instance status
     */
    status: string;
    /**
     * - Error message
     */
    error?: string | undefined;
    /**
     * - Status message
     */
    message?: string | undefined;
};
export type AuthenticatedUser = {
    /**
     * - User ID
     */
    id: string;
    /**
     * - User email
     */
    email: string;
};
export type AuthenticatedRequest = {
    /**
     * - Authenticated user
     */
    user: AuthenticatedUser;
    /**
     * - Request body
     */
    body: Object;
    /**
     * - Request parameters
     */
    params: Object;
    /**
     * - Query parameters
     */
    query: Object;
};
/**
 * @typedef {import('../types/auth-types.js').AuthCredentials} AuthCredentials
 * @typedef {import('../types/auth-types.js').InstanceCreationData} InstanceCreationData
 */
/**
 * @typedef {Object} InstanceStatus
 * @property {string} oauth_status - OAuth status
 * @property {string} status - Instance status
 * @property {string} [error] - Error message
 * @property {string} [message] - Status message
 */
/**
 * @typedef {Object} AuthenticatedUser
 * @property {string} id - User ID
 * @property {string} email - User email
 */
/**
 * @typedef {Object} AuthenticatedRequest
 * @property {AuthenticatedUser} user - Authenticated user
 * @property {Object} body - Request body
 * @property {Object} params - Request parameters
 * @property {Object} query - Query parameters
 */
/**
 * Creates authentication routes for the MCP auth registry
 * @param {Object} coordinators - Coordinator instances
 * @param {import('../coordinators/oauth-coordinator.js')} coordinators.oauthCoordinator - OAuth coordinator
 * @param {import('../coordinators/apikey-coordinator.js')} coordinators.apiKeyCoordinator - API key coordinator
 * @returns {express.Router} Express router with auth routes
 */
export function createAuthRoutes(coordinators: {
    oauthCoordinator: typeof import("../coordinators/oauth-coordinator.js");
    apiKeyCoordinator: typeof import("../coordinators/apikey-coordinator.js");
}): express.Router;
import express from 'express';
//# sourceMappingURL=auth-routes.d.ts.map