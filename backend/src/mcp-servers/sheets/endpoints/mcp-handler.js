/**
 * Google Sheets MCP JSON-RPC protocol handler using official SDK
 * Multi-tenant OAuth implementation with credential caching
 * Based on Gmail MCP implementation patterns
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

// Import Google Sheets API functions (will be implemented next)
import {
  createSpreadsheet,
  getSpreadsheet,
  updateCells,
  getCells,
  addWorksheet,
  deleteWorksheet,
  listSpreadsheets,
  formatCells,
  batchUpdate,
  insertRows,
  deleteRows,
  copySheet,
  clearCells,
  appendValues,
  getSheetMetadata
} from '../api/sheets-api.js';

/**
 * @typedef {Object} OAuthConfig
 * @property {string} bearerToken
 * @property {string} instanceId
 * @property {string} userId
 */

class SheetsMCPHandler {
  /**
   * @param {OAuthConfig} oauth
   */
  constructor(oauth) {
    this.oauth = oauth;
    this.bearerToken = oauth.bearerToken;
    this.instanceId = oauth.instanceId;
    this.userId = oauth.userId;
    
    this.server = new McpServer({
      name: 'Google Sheets MCP Server',
      version: '1.0.0',
    });
    
    // Store transports by session
    this.transports = {};
    this.initialized = false;
    
    this.setupTools();
  }

  /**
   * Setup MCP tools using Zod schemas
   */
  setupTools() {
    // Tool 1: create_spreadsheet
    this.server.tool(
      "create_spreadsheet",
      "Create a new Google Sheets spreadsheet",
      {
        title: z.string().describe("Title of the new spreadsheet"),
        sheets: z.array(z.object({
          title: z.string().describe("Sheet name"),
          rows: z.number().optional().default(1000).describe("Number of rows"),
          cols: z.number().optional().default(26).describe("Number of columns")
        })).optional().default([]).describe("Initial sheets to create")
      },
      async ({ title, sheets }) => {
        console.log(`🔧 Tool call: create_spreadsheet`);
        try {
          const result = await createSpreadsheet({ title, sheets }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error creating spreadsheet:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error creating spreadsheet: ${error.message}` }]
          };
        }
      }
    );

    // Tool 2: get_spreadsheet
    this.server.tool(
      "get_spreadsheet",
      "Get information about a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet to fetch"),
        includeData: z.boolean().optional().default(false).describe("Include cell data in response")
      },
      async ({ spreadsheetId, includeData }) => {
        console.log(`🔧 Tool call: get_spreadsheet`);
        try {
          const result = await getSpreadsheet({ spreadsheetId, includeData }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error fetching spreadsheet:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error fetching spreadsheet: ${error.message}` }]
          };
        }
      }
    );

    // Tool 3: update_cells
    this.server.tool(
      "update_cells",
      "Update cells in a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet"),
        range: z.string().describe("A1 notation range (e.g., 'Sheet1!A1:B2')"),
        values: z.array(z.array(z.any())).describe("2D array of values to update"),
        valueInputOption: z.enum(["RAW", "USER_ENTERED"]).optional().default("USER_ENTERED").describe("How input data should be interpreted")
      },
      async ({ spreadsheetId, range, values, valueInputOption }) => {
        console.log(`🔧 Tool call: update_cells`);
        try {
          const result = await updateCells({ spreadsheetId, range, values, valueInputOption }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error updating cells:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error updating cells: ${error.message}` }]
          };
        }
      }
    );

    // Tool 4: get_cells
    this.server.tool(
      "get_cells",
      "Get cell values from a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet"),
        range: z.string().describe("A1 notation range (e.g., 'Sheet1!A1:B2')"),
        valueRenderOption: z.enum(["FORMATTED_VALUE", "UNFORMATTED_VALUE", "FORMULA"]).optional().default("FORMATTED_VALUE").describe("How values should be rendered")
      },
      async ({ spreadsheetId, range, valueRenderOption }) => {
        console.log(`🔧 Tool call: get_cells`);
        try {
          const result = await getCells({ spreadsheetId, range, valueRenderOption }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error getting cells:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error getting cells: ${error.message}` }]
          };
        }
      }
    );

    // Tool 5: add_worksheet
    this.server.tool(
      "add_worksheet",
      "Add a new worksheet to a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet"),
        title: z.string().describe("Title of the new worksheet"),
        rows: z.number().optional().default(1000).describe("Number of rows"),
        cols: z.number().optional().default(26).describe("Number of columns")
      },
      async ({ spreadsheetId, title, rows, cols }) => {
        console.log(`🔧 Tool call: add_worksheet`);
        try {
          const result = await addWorksheet({ spreadsheetId, title, rows, cols }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error adding worksheet:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error adding worksheet: ${error.message}` }]
          };
        }
      }
    );

    // Tool 6: delete_worksheet
    this.server.tool(
      "delete_worksheet",
      "Delete a worksheet from a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet"),
        sheetId: z.number().describe("ID of the sheet to delete")
      },
      async ({ spreadsheetId, sheetId }) => {
        console.log(`🔧 Tool call: delete_worksheet`);
        try {
          const result = await deleteWorksheet({ spreadsheetId, sheetId }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error deleting worksheet:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error deleting worksheet: ${error.message}` }]
          };
        }
      }
    );

    // Tool 7: append_values
    this.server.tool(
      "append_values",
      "Append values to the end of a range in a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet"),
        range: z.string().describe("A1 notation range to append to (e.g., 'Sheet1!A:B')"),
        values: z.array(z.array(z.any())).describe("2D array of values to append"),
        valueInputOption: z.enum(["RAW", "USER_ENTERED"]).optional().default("USER_ENTERED").describe("How input data should be interpreted")
      },
      async ({ spreadsheetId, range, values, valueInputOption }) => {
        console.log(`🔧 Tool call: append_values`);
        try {
          const result = await appendValues({ spreadsheetId, range, values, valueInputOption }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error appending values:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error appending values: ${error.message}` }]
          };
        }
      }
    );

    // Tool 8: clear_cells
    this.server.tool(
      "clear_cells",
      "Clear cell values in a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet"),
        range: z.string().describe("A1 notation range to clear (e.g., 'Sheet1!A1:B2')")
      },
      async ({ spreadsheetId, range }) => {
        console.log(`🔧 Tool call: clear_cells`);
        try {
          const result = await clearCells({ spreadsheetId, range }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error clearing cells:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error clearing cells: ${error.message}` }]
          };
        }
      }
    );

    // Tool 9: format_cells
    this.server.tool(
      "format_cells",
      "Format cells in a Google Sheets spreadsheet",
      {
        spreadsheetId: z.string().describe("ID of the spreadsheet"),
        range: z.string().describe("A1 notation range to format (e.g., 'Sheet1!A1:B2')"),
        format: z.object({
          backgroundColor: z.object({
            red: z.number().min(0).max(1).optional(),
            green: z.number().min(0).max(1).optional(),
            blue: z.number().min(0).max(1).optional()
          }).optional().describe("Background color (RGB values 0-1)"),
          textFormat: z.object({
            bold: z.boolean().optional(),
            italic: z.boolean().optional(),
            fontSize: z.number().optional()
          }).optional().describe("Text formatting options")
        }).describe("Formatting options to apply")
      },
      async ({ spreadsheetId, range, format }) => {
        console.log(`🔧 Tool call: format_cells`);
        try {
          const result = await formatCells({ spreadsheetId, range, format }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error formatting cells:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error formatting cells: ${error.message}` }]
          };
        }
      }
    );

    // Tool 10: list_spreadsheets
    this.server.tool(
      "list_spreadsheets",
      "List Google Sheets spreadsheets accessible to the user",
      {
        maxResults: z.number().min(1).max(100).optional().default(10).describe("Maximum number of spreadsheets to return"),
        query: z.string().optional().default("").describe("Search query to filter spreadsheets")
      },
      async ({ maxResults, query }) => {
        console.log(`🔧 Tool call: list_spreadsheets`);
        try {
          const result = await listSpreadsheets({ maxResults, query }, this.bearerToken);
          return {
            content: [{ type: 'text', text: typeof result === 'string' ? result : JSON.stringify(result, null, 2) }]
          };
        } catch (error) {
          console.error(`❌ Error listing spreadsheets:`, error);
          return {
            isError: true,
            content: [{ type: 'text', text: `Error listing spreadsheets: ${error.message}` }]
          };
        }
      }
    );

    console.log(`✅ Configured Google Sheets MCP tools`);
  }

  /**
   * Handle MCP request
   * @param {Object} request - JSON-RPC request
   * @returns {Promise<Object>} JSON-RPC response
   */
  async handleRequest(request) {
    try {
      const sessionId = request.id || randomUUID();
      
      // Create or get transport for this session
      if (!this.transports[sessionId]) {
        try {
          this.transports[sessionId] = new StreamableHTTPServerTransport();
          await this.transports[sessionId].start();
          console.log(`✅ Created new MCP transport for session: ${sessionId}`);
        } catch (transportError) {
          console.error(`❌ Failed to create MCP transport for session ${sessionId}:`, transportError);
          delete this.transports[sessionId];
          throw new Error(`Transport creation failed: ${transportError.message}`);
        }
      }

      const transport = this.transports[sessionId];
      
      // Connect server to transport if not already done
      if (!this.initialized) {
        await this.server.connect(transport);
        this.initialized = true;
      }

      // Process the request
      const response = await this.server.handleRequest(request);
      
      return response;

    } catch (error) {
      console.error('❌ MCP handler error:', error);
      return {
        jsonrpc: "2.0",
        id: request.id || null,
        error: {
          code: -32603,
          message: "Internal error",
          data: { details: error.message }
        }
      };
    }
  }

  /**
   * Update bearer token
   * @param {string} newToken - New bearer token
   */
  updateBearerToken(newToken) {
    this.bearerToken = newToken;
    this.oauth.bearerToken = newToken;
    console.log(`🔄 Updated bearer token for Google Sheets handler`);
  }

  /**
   * Cleanup handler resources
   */
  async cleanup() {
    try {
      // Close all transports
      for (const [sessionId, transport] of Object.entries(this.transports)) {
        try {
          await transport.close();
        } catch (error) {
          console.warn(`⚠️  Error closing transport ${sessionId}:`, error.message);
        }
      }
      this.transports = {};
      this.initialized = false;
      console.log('🧹 Google Sheets MCP handler cleaned up');
    } catch (error) {
      console.error('❌ Error during handler cleanup:', error);
    }
  }
}

export { SheetsMCPHandler };