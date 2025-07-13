/**
 * figma MCP Service Entry Point
 * Phase 1 Implementation
 */

// Service configuration (built-in, no external config file)
const SERVICE_CONFIG = {
  name: 'figma',
  displayName: 'Figma',
  port: 49000, // TODO: Set correct port from mcp-ports config
  authType: 'api_key', // TODO: Set correct auth type from mcp-ports config
  description: 'figma MCP service',
  version: '1.0.0'
};

console.log(`Starting ${SERVICE_CONFIG.displayName} service on port ${SERVICE_CONFIG.port}`);

// TODO: Implement Phase 1 service startup
// 1. Set up Express server
// 2. Load endpoints from endpoints/ folder
// 3. Initialize API connections from api/ folder
// 4. Start listening on configured port
