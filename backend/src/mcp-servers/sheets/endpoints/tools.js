/**
 * Google Sheets MCP Tools Setup
 * Defines all available MCP tools for Google Sheets operations
 */

import { z } from 'zod';
import { SheetsApi } from '../api/sheetsApi.js';

/**
 * Setup MCP tools for Google Sheets
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server - MCP server instance
 * @param {Object} handler - Handler instance with bearerToken property
 * @param {string} serviceName - Service name for logging
 */
export function setupSheetsTools(server, handler, serviceName) {

	// Tool 1: create_spreadsheet
	server.tool(
		"create_spreadsheet",
		"Create a new Google Sheets spreadsheet",
		{
			title: z.string().describe("Title of the new spreadsheet"),
			sheetNames: z.array(z.string()).optional().default(["Sheet1"]).describe("Names of initial sheets")
		},
		async ({ title, sheetNames }) => {
			console.log(`🔧 Tool call: create_spreadsheet for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.createSpreadsheet(title, sheetNames);
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error creating spreadsheet:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error creating spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);

	// Tool 2: get_spreadsheet
	server.tool(
		"get_spreadsheet",
		"Get spreadsheet metadata and sheet information",
		{
			spreadsheetId: z.string().describe("ID of the spreadsheet to retrieve")
		},
		async ({ spreadsheetId }) => {
			console.log(`🔧 Tool call: get_spreadsheet for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.getSpreadsheet(spreadsheetId);
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error getting spreadsheet:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error getting spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);

	// Tool 3: read_range
	server.tool(
		"read_range",
		"Read values from a specific range in a spreadsheet",
		{
			spreadsheetId: z.string().describe("ID of the spreadsheet"),
			range: z.string().describe("A1 notation range (e.g., 'Sheet1!A1:B10')"),
			majorDimension: z.enum(["ROWS", "COLUMNS"]).optional().default("ROWS").describe("How to interpret the values"),
			valueRenderOption: z.enum(["FORMATTED_VALUE", "UNFORMATTED_VALUE", "FORMULA"]).optional().default("FORMATTED_VALUE").describe("How values should be rendered")
		},
		async ({ spreadsheetId, range, majorDimension, valueRenderOption }) => {
			console.log(`🔧 Tool call: read_range for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.readRange(spreadsheetId, range, { majorDimension, valueRenderOption });
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error reading range:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error reading range: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);

	// Tool 4: write_range
	server.tool(
		"write_range",
		"Write values to a specific range in a spreadsheet",
		{
			spreadsheetId: z.string().describe("ID of the spreadsheet"),
			range: z.string().describe("A1 notation range (e.g., 'Sheet1!A1:B10')"),
			values: z.array(z.array(z.any())).describe("2D array of values to write"),
			valueInputOption: z.enum(["RAW", "USER_ENTERED"]).optional().default("USER_ENTERED").describe("How to interpret input values")
		},
		async ({ spreadsheetId, range, values, valueInputOption }) => {
			console.log(`🔧 Tool call: write_range for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.writeRange(spreadsheetId, range, values, { valueInputOption });
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error writing range:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error writing range: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);

	// Tool 5: append_values
	server.tool(
		"append_values",
		"Append values to the end of a sheet",
		{
			spreadsheetId: z.string().describe("ID of the spreadsheet"),
			range: z.string().describe("A1 notation range (e.g., 'Sheet1!A:B')"),
			values: z.array(z.array(z.any())).describe("2D array of values to append"),
			valueInputOption: z.enum(["RAW", "USER_ENTERED"]).optional().default("USER_ENTERED").describe("How to interpret input values")
		},
		async ({ spreadsheetId, range, values, valueInputOption }) => {
			console.log(`🔧 Tool call: append_values for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.appendValues(spreadsheetId, range, values, { valueInputOption });
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error appending values:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error appending values: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);

	// Tool 6: clear_range
	server.tool(
		"clear_range",
		"Clear values from a specific range",
		{
			spreadsheetId: z.string().describe("ID of the spreadsheet"),
			range: z.string().describe("A1 notation range to clear (e.g., 'Sheet1!A1:B10')")
		},
		async ({ spreadsheetId, range }) => {
			console.log(`🔧 Tool call: clear_range for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.clearRange(spreadsheetId, range);
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error clearing range:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error clearing range: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);

	// Tool 7: batch_update
	server.tool(
		"batch_update",
		"Perform multiple updates to a spreadsheet in a single request",
		{
			spreadsheetId: z.string().describe("ID of the spreadsheet"),
			requests: z.array(z.object({})).describe("Array of update requests (see Google Sheets API documentation)")
		},
		async ({ spreadsheetId, requests }) => {
			console.log(`🔧 Tool call: batch_update for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.batchUpdate(spreadsheetId, requests);
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error in batch update:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error in batch update: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);

	// Tool 8: add_sheet
	server.tool(
		"add_sheet",
		"Add a new sheet to an existing spreadsheet",
		{
			spreadsheetId: z.string().describe("ID of the spreadsheet"),
			sheetName: z.string().describe("Name for the new sheet"),
			index: z.number().optional().describe("Position where to insert the sheet (0-based)")
		},
		async ({ spreadsheetId, sheetName, index }) => {
			console.log(`🔧 Tool call: add_sheet for ${serviceName}`);
			try {
				const api = new SheetsApi(handler.bearerToken);
				const result = await api.addSheet(spreadsheetId, sheetName, index);
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
				};
			} catch (error) {
				console.error(`❌ Error adding sheet:`, error);
				return {
					isError: true,
					content: [{ type: 'text', text: `Error adding sheet: ${error instanceof Error ? error.message : 'Unknown error'}` }]
				};
			}
		}
	);
}