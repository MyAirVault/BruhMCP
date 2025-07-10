import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { LogsHeader, LogsFilters, LogsDisplay, useLogsData, useLogsFilters, useLogsExport } from '../components/logs';

const Logs: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract MCP information from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const mcpId = urlParams.get('mcp');
  const mcpName = urlParams.get('name');
  const isSpecificMCP = Boolean(mcpId && mcpName);

  // Use custom hooks for data management
  const { logs, isLoading: isLoadingLogs, refetch } = useLogsData(isSpecificMCP, mcpId || undefined);
  const { filters, setFilters, filteredLogs } = useLogsFilters(logs);
  const { exportLogs } = useLogsExport(isSpecificMCP, mcpId || undefined);

  // Handle actions
  const handleBack = () => navigate('/dashboard');
  const handleRefresh = () => refetch();
  const handleExport = () => exportLogs(filteredLogs, filters.timeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout userName={userName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="max-w-[1280px] mx-auto">
          <LogsHeader
            isSpecificMCP={isSpecificMCP}
            mcpName={mcpName || undefined}
            isLoadingLogs={isLoadingLogs}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onBack={handleBack}
          />

          <LogsFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalLogs={logs.length}
            filteredLogs={filteredLogs.length}
          />

          <LogsDisplay
            logs={filteredLogs}
            isLoading={isLoadingLogs}
            isSpecificMCP={isSpecificMCP}
            mcpName={mcpName || undefined}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Logs;