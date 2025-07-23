export type CredentialsData = import("../types/service-types.js").CredentialsData;
export type InstanceData = import("../types/service-types.js").InstanceData;
/**
 * @typedef {import('../types/service-types.js').CredentialsData} CredentialsData
 * @typedef {import('../types/service-types.js').InstanceData} InstanceData
 */
/**
 * Creates authentication routes for the MCP auth registry
 * @param {import('../core/registry.js').ServiceRegistry} serviceRegistry - Service registry instance
 * @returns {express.Router} Express router with auth routes
 */
export function createAuthRoutes(serviceRegistry: import("../core/registry.js").ServiceRegistry): express.Router;
import express from 'express';
//# sourceMappingURL=auth-routes.d.ts.map