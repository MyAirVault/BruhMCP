export type CredentialsData = import("../types/serviceTypes.js").CredentialsData;
export type InstanceData = import("../types/serviceTypes.js").InstanceData;
/**
 * @typedef {import('../types/serviceTypes.js').CredentialsData} CredentialsData
 * @typedef {import('../types/serviceTypes.js').InstanceData} InstanceData
 */
/**
 * Creates authentication routes for the MCP auth registry
 * @param {import('../core/registry.js').ServiceRegistry} serviceRegistry - Service registry instance
 * @returns {express.Router} Express router with auth routes
 */
export function createAuthRoutes(serviceRegistry: import("../core/registry.js").ServiceRegistry): express.Router;
import express = require("express");
//# sourceMappingURL=authRoutes.d.ts.map