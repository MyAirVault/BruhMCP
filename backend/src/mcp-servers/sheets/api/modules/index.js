/**
 * Google Sheets API Modules Export
 * Central export file for all Sheets API operation modules
 */

// Core request handling
const { makeSheetsRequest, makeDriveRequest  } = require('./requestHandler');

module.exports = { makeSheetsRequest, makeDriveRequest  };

// Spreadsheet operations
const { createSpreadsheet,
	getSpreadsheet,
	listSpreadsheets,
	getSheetMetadata
 } = require('./spreadsheetOperations');

module.exports = { createSpreadsheet,
	getSpreadsheet,
	listSpreadsheets,
	getSheetMetadata
 };

// Cell operations
const { getCells,
	updateCells,
	appendValues,
	clearCells
 } = require('./cellOperations');

module.exports = { getCells,
	updateCells,
	appendValues,
	clearCells
 };

// Worksheet operations
const { addWorksheet,
	deleteWorksheet,
	copySheet,
	insertRows,
	deleteRows
 } = require('./worksheetOperations');

module.exports = { addWorksheet,
	deleteWorksheet,
	copySheet,
	insertRows,
	deleteRows
 };

// Formatting operations
const { formatCells,
	batchUpdate
 } = require('./formattingOperations');

module.exports = { formatCells,
	batchUpdate
 };