/**
 * Zod validation schemas for Notion MCP tools
 * Extracted from mcpHandler.js to maintain file size limits
 */

const { z  } = require('zod');

/**
 * Schema for search pages tool
 */
const searchPagesSchema = {
	query: z.string().describe("Search query"),
	page_size: z.number().min(1).max(100).optional().default(10).describe("Number of results to return (1-100)"),
	start_cursor: z.string().optional().describe("Pagination cursor"),
	sort: z.object({
		direction: z.enum(['ascending', 'descending']).optional().describe("Sort direction"),
		timestamp: z.enum(['created_time', 'last_edited_time']).optional().describe("Sort timestamp")
	}).optional().describe("Sort options"),
	filter: z.object({
		value: z.enum(['page', 'database']).optional().describe("Filter by type"),
		property: z.string().optional().describe("Filter property")
	}).optional().describe("Filter options")
};

/**
 * Schema for get page tool
 */
const getPageSchema = {
	page_id: z.string().describe("The ID of the page to retrieve")
};

/**
 * Schema for get page children tool
 */
const getPageChildrenSchema = z.object({
	page_id: z.string().describe("The ID of the page"),
	start_cursor: z.string().optional().describe("Pagination cursor"),
	page_size: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100)")
});

/**
 * Schema for create page tool
 */
const createPageSchema = z.object({
	parent: z.union([
		z.object({
			database_id: z.string().describe("Database ID to create page in")
		}),
		z.object({
			page_id: z.string().describe("Parent page ID")
		})
	]).describe("Parent object (database or page)"),
	properties: z.record(z.string(), z.unknown()).optional().describe("Page properties"),
	children: z.array(z.unknown()).optional().describe("Page content blocks")
});

/**
 * Schema for update page tool
 */
const updatePageSchema = z.object({
	page_id: z.string().describe("The ID of the page to update"),
	properties: z.record(z.string(), z.unknown()).optional().describe("Properties to update"),
	archived: z.boolean().optional().describe("Whether to archive the page")
});

/**
 * Schema for get database tool
 */
const getDatabaseSchema = z.object({
	database_id: z.string().describe("The ID of the database to retrieve")
});

/**
 * Schema for query database tool
 */
const queryDatabaseSchema = z.object({
	database_id: z.string().describe("The ID of the database to query"),
	filter: z.unknown().optional().describe("Filter criteria"),
	sorts: z.array(z.unknown()).optional().describe("Sort criteria"),
	start_cursor: z.string().optional().describe("Pagination cursor"),
	page_size: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100)")
});

/**
 * Schema for create database tool
 */
const createDatabaseSchema = z.object({
	parent: z.object({
		page_id: z.string().describe("Parent page ID")
	}).describe("Parent page object"),
	title: z.array(z.unknown()).describe("Database title"),
	properties: z.record(z.string(), z.unknown()).describe("Database properties schema")
});

/**
 * Schema for update database tool
 */
const updateDatabaseSchema = z.object({
	database_id: z.string().describe("The ID of the database to update"),
	title: z.array(z.unknown()).optional().describe("Database title"),
	properties: z.record(z.string(), z.unknown()).optional().describe("Database properties schema")
});

/**
 * Schema for append block children tool
 */
const appendBlockChildrenSchema = z.object({
	page_id: z.string().describe("The ID of the page to append blocks to"),
	children: z.array(z.unknown()).describe("Blocks to append")
});

/**
 * Schema for get user tool
 */
const getUserSchema = z.object({
	user_id: z.string().describe("The ID of the user to retrieve")
});

/**
 * Schema for list users tool
 */
const listUsersSchema = z.object({
	start_cursor: z.string().optional().describe("Pagination cursor"),
	page_size: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100)")
});

module.exports = {
	searchPagesSchema,
	getPageSchema,
	getPageChildrenSchema,
	createPageSchema,
	updatePageSchema,
	getDatabaseSchema,
	queryDatabaseSchema,
	createDatabaseSchema,
	updateDatabaseSchema,
	appendBlockChildrenSchema,
	getUserSchema,
	listUsersSchema
};