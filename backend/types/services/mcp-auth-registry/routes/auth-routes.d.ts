export type CredentialsData = import("../types/service-types.js").CredentialsData;
export type InstanceData = import("../types/service-types.js").InstanceData;
export type ServiceRegistry = import("../core/registry.js").ServiceRegistry;
/**
 * @typedef {import('../types/service-types.js').CredentialsData} CredentialsData
 * @typedef {import('../types/service-types.js').InstanceData} InstanceData
 * @typedef {import('../core/registry.js').ServiceRegistry} ServiceRegistry
 */
/**
 * Creates authentication routes for the MCP auth registry
 * @param {ServiceRegistry} serviceRegistry - Service registry instance
 * @returns {express.Router} Express router with auth routes
 */
export function createAuthRoutes(serviceRegistry: ServiceRegistry): express.Router;
import express from 'express';
//# sourceMappingURL=auth-routes.d.ts.map