import { apiService } from './apiService';
import type { MCPLog } from '../types';

interface LogsParams {
  start_time?: string;
  end_time?: string;
  level?: string;
  limit?: number;
  offset?: number;
}

interface ExportLogsData {
  format: 'json' | 'csv' | 'txt';
  start_time?: string;
  end_time?: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
}

interface ExportLogsResponse {
  download_url: string;
  expires_at: string;
  size_bytes: number;
  format: string;
  total_logs: number;
  filename: string;
}

/**
 * Service for managing log-related API calls
 * Handles fetching, filtering, and exporting logs for MCP instances
 */
export const logsService = {
  /**
   * Fetch logs for a specific MCP instance
   * @param mcpId - The ID of the MCP instance
   * @param params - Optional filtering parameters
   * @returns Promise<MCPLog[]> - Array of log entries
   */
  getMCPLogs: async (mcpId: string, params?: LogsParams): Promise<MCPLog[]> => {
    return apiService.getMCPLogs(mcpId, params);
  },

  /**
   * Fetch logs from all user's MCP instances
   * @param params - Optional filtering parameters  
   * @returns Promise<MCPLog[]> - Array of log entries from all MCPs
   */
  getAllLogs: async (params?: LogsParams): Promise<MCPLog[]> => {
    return apiService.getAllMCPLogs(params);
  },

  /**
   * Export logs for a specific MCP instance
   * @param mcpId - The ID of the MCP instance
   * @param data - Export configuration (format, time range, level)
   * @returns Promise<ExportLogsResponse> - Export file information
   */
  exportMCPLogs: async (mcpId: string, data: ExportLogsData): Promise<ExportLogsResponse> => {
    return apiService.exportMCPLogs(mcpId, data);
  },

  /**
   * Get time filter date for filtering logs
   * @param timeFilter - Time filter string ('1hour', '1day', '1week', '1month')
   * @returns string - ISO date string for the cutoff time
   */
  getTimeFilterDate: (timeFilter: string): string => {
    const now = new Date();
    const cutoffTime = new Date();
    
    switch (timeFilter) {
      case '1hour':
        cutoffTime.setHours(now.getHours() - 1);
        break;
      case '1day':
        cutoffTime.setDate(now.getDate() - 1);
        break;
      case '1week':
        cutoffTime.setDate(now.getDate() - 7);
        break;
      case '1month':
        cutoffTime.setMonth(now.getMonth() - 1);
        break;
      default:
        return '';
    }
    
    return cutoffTime.toISOString();
  },

  /**
   * Apply client-side filters to logs
   * Used for additional filtering beyond server-side filters
   * @param logs - Array of log entries to filter
   * @param searchTerm - Search term to filter by message, MCP name, or level
   * @returns MCPLog[] - Filtered log entries
   */
  filterLogs: (logs: MCPLog[], searchTerm: string): MCPLog[] => {
    if (!searchTerm) return logs;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.message.toLowerCase().includes(lowerSearchTerm) ||
      log.mcpName?.toLowerCase().includes(lowerSearchTerm) ||
      log.level.toLowerCase().includes(lowerSearchTerm) ||
      log.source.toLowerCase().includes(lowerSearchTerm)
    );
  }
};