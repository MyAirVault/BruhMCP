export type AuthCredentials = import("../types/auth-types.js").AuthCredentials;
export type InstanceCreationData = import("../types/auth-types.js").InstanceCreationData;
export type AuthenticatedRequest = {
    /**
     * - Authenticated user
     */
    user: {
        id: string;
        email: string;
    };
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
 * @typedef {Object} AuthenticatedRequest
 * @property {Object} user - Authenticated user
 * @property {string} user.id - User ID
 * @property {string} user.email - User email
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
    oauthCoordinator: import("../coordinators/oauth-coordinator.js");
    apiKeyCoordinator: import("../coordinators/apikey-coordinator.js");
}): express.Router;
import express = require("express");
//# sourceMappingURL=auth-routes.d.ts.map