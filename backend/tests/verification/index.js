/**
 * Verification System Exports
 * 
 * Main entry point for the MCP Backend Verification Agent
 */

export { default as VerificationRunner } from './verification-runner.js';
export { default as PortManagementTests } from './port-management.test.js';
export { default as CleanupTests } from './cleanup.test.js';
export { default as DuplicateServiceTests } from './duplicate-services.test.js';
export { default as TestUtils, TestResultFormatter } from './test-utils.js';

// Re-export for convenience
export * from './verification-runner.js';
export * from './port-management.test.js';
export * from './cleanup.test.js';
export * from './duplicate-services.test.js';
export * from './test-utils.js';