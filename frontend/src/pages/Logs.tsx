import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import CustomDropdown from '../components/ui/CustomDropdown';
import { useAuth } from '../contexts/AuthContext';
import { logsService } from '../services/logsService';
import type { MCPLog } from '../types';
import { Download, Filter, Search, RefreshCw, ArrowLeft, FileText, Activity, AlertCircle, Info, Bug, Server, Database, Globe } from 'lucide-react';

const Logs: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<MCPLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<MCPLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  // Extract MCP information from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const mcpId = urlParams.get('mcp');
  const mcpName = urlParams.get('name');
  const isSpecificMCP = mcpId && mcpName;

  // Get icon for MCP type
  const getMCPIcon = (mcpName: string) => {
    const name = mcpName.toLowerCase();
    if (name.includes('gmail') || name.includes('email')) return Globe;
    if (name.includes('slack') || name.includes('discord')) return Activity;
    if (name.includes('database') || name.includes('db')) return Database;
    if (name.includes('server') || name.includes('api')) return Server;
    return FileText;
  };

  // Get icon for log level
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return AlertCircle;
      case 'warn': return AlertCircle;
      case 'info': return Info;
      case 'debug': return Bug;
      default: return Info;
    }
  };

  // Get icon for source
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'app': return Activity;
      case 'access': return Globe;
      case 'error': return AlertCircle;
      default: return FileText;
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoadingLogs(true);
        setError(null);
        
        // Build API parameters
        const apiParams = {
          limit: 100,
          offset: 0,
          // Add server-side filters
          ...(levelFilter !== 'all' && { level: levelFilter }),
          ...(timeFilter !== 'all' && { start_time: logsService.getTimeFilterDate(timeFilter) }),
        };

        let fetchedLogs: MCPLog[];
        
        if (isSpecificMCP && mcpId) {
          // Fetch logs for specific MCP instance
          fetchedLogs = await logsService.getMCPLogs(mcpId, apiParams);
        } else {
          // Fetch logs from all MCP instances
          fetchedLogs = await logsService.getAllLogs(apiParams);
        }
        
        setLogs(fetchedLogs);
      } catch (err) {
        console.error('Failed to load logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load logs');
        setLogs([]);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    loadLogs();
  }, [isSpecificMCP, mcpId, levelFilter, timeFilter]);

  useEffect(() => {
    let filtered = logs;

    // Apply client-side search filter (search is not server-side filtered)
    filtered = logsService.filterLogs(filtered, searchTerm);

    // Apply client-side source filter (source is not server-side filtered)
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, sourceFilter]);

  const handleExportLogs = async () => {
    try {
      if (isSpecificMCP && mcpId) {
        // Use API export for specific MCP - backend now returns file directly
        const exportData = {
          format: 'json',
          ...(timeFilter !== 'all' && { start_time: logsService.getTimeFilterDate(timeFilter) }),
          ...(levelFilter !== 'all' && { level: levelFilter })
        };
        
        // Make direct API call to download file
        const response = await fetch(`/api/v1/mcps/${mcpId}/logs/export`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exportData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to export logs: ${response.statusText}`);
        }
        
        // Get filename from response headers or create default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `logs_${mcpId}_${new Date().toISOString().split('T')[0]}.json`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        window.URL.revokeObjectURL(url);
      } else {
        // Local export for all logs (since backend doesn't support bulk export)
        const dataStr = JSON.stringify(filteredLogs, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `all_logs_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    } catch (err) {
      console.error('Failed to export logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to export logs');
    }
  };

  const handleRefreshLogs = async () => {
    try {
      setIsLoadingLogs(true);
      setError(null);
      
      // Build API parameters
      const apiParams = {
        limit: 100,
        offset: 0,
        // Add server-side filters
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(timeFilter !== 'all' && { start_time: logsService.getTimeFilterDate(timeFilter) }),
      };

      let fetchedLogs: MCPLog[];
      
      if (isSpecificMCP && mcpId) {
        // Fetch logs for specific MCP instance
        fetchedLogs = await logsService.getMCPLogs(mcpId, apiParams);
      } else {
        // Fetch logs from all MCP instances
        fetchedLogs = await logsService.getAllLogs(apiParams);
      }
      
      setLogs(fetchedLogs);
    } catch (err) {
      console.error('Failed to refresh logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  {isSpecificMCP && (
                    <>
                      {React.createElement(getMCPIcon(mcpName), { className: "w-8 h-8 text-gray-700" })}
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                        {mcpName} Logs
                      </h1>
                    </>
                  )}
                  {!isSpecificMCP && (
                    <>
                      <FileText className="w-8 h-8 text-gray-700" />
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                        All Logs
                      </h1>
                    </>
                  )}
                </div>
              </div>
              <p className="text-base lg:text-lg text-gray-600">
                {isSpecificMCP 
                  ? `View and analyze logs for ${mcpName}` 
                  : 'View and analyze system logs'
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={handleRefreshLogs}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportLogs}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <CustomDropdown
                label="Level"
                value={levelFilter}
                onChange={setLevelFilter}
                options={[
                  { value: 'all', label: 'All Levels' },
                  { value: 'error', label: 'Error' },
                  { value: 'warn', label: 'Warning' },
                  { value: 'info', label: 'Info' },
                  { value: 'debug', label: 'Debug' }
                ]}
                placeholder="Select level"
              />
              
              <CustomDropdown
                label="Source"
                value={sourceFilter}
                onChange={setSourceFilter}
                options={[
                  { value: 'all', label: 'All Sources' },
                  { value: 'app', label: 'Application' },
                  { value: 'access', label: 'Access' },
                  { value: 'error', label: 'Error' }
                ]}
                placeholder="Select source"
              />
              
              <CustomDropdown
                label="Time Range"
                value={timeFilter}
                onChange={setTimeFilter}
                options={[
                  { value: 'all', label: 'All Time' },
                  { value: '1hour', label: 'Last Hour' },
                  { value: '1day', label: 'Last Day' },
                  { value: '1week', label: 'Last Week' },
                  { value: '1month', label: 'Last Month' }
                ]}
                placeholder="Select time range"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {filteredLogs.length} of {logs.length} logs
              </span>
              {(searchTerm || levelFilter !== 'all' || sourceFilter !== 'all' || timeFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setLevelFilter('all');
                    setSourceFilter('all');
                    setTimeFilter('all');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Error loading logs</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <button
                onClick={handleRefreshLogs}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoadingLogs ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading logs...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">Unable to load logs. Please check the error above and try again.</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No logs found matching your criteria.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>Level</span>
                          </div>
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Activity className="w-4 h-4" />
                            <span>Source</span>
                          </div>
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MCP
                        </th>
                        <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {React.createElement(getLevelIcon(log.level), { 
                                className: `w-4 h-4 ${log.level === 'error' ? 'text-red-600' : 
                                                     log.level === 'warn' ? 'text-yellow-600' : 
                                                     log.level === 'info' ? 'text-blue-600' : 'text-gray-600'}`
                              })}
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                                {log.level.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              {React.createElement(getSourceIcon(log.source), { className: "w-4 h-4 text-gray-600" })}
                              <span>{log.source}</span>
                            </div>
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.mcpName ? (
                              <div className="flex items-center space-x-2">
                                {React.createElement(getMCPIcon(log.mcpName), { className: "w-4 h-4 text-gray-600" })}
                                <span>{log.mcpName}</span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs xl:max-w-md truncate" title={log.message}>
                              {log.message}
                            </div>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                  Show metadata
                                </summary>
                                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </details>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4 p-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {React.createElement(getLevelIcon(log.level), { 
                            className: `w-4 h-4 ${log.level === 'error' ? 'text-red-600' : 
                                                 log.level === 'warn' ? 'text-yellow-600' : 
                                                 log.level === 'info' ? 'text-blue-600' : 'text-gray-600'}`
                          })}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {React.createElement(getSourceIcon(log.source), { className: "w-4 h-4 text-gray-600" })}
                          <span className="text-sm text-gray-700">{log.source}</span>
                        </div>
                        {log.mcpName && (
                          <div className="flex items-center space-x-2">
                            {React.createElement(getMCPIcon(log.mcpName), { className: "w-4 h-4 text-gray-600" })}
                            <span className="text-sm text-gray-700 truncate max-w-[120px]">{log.mcpName}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-900">
                        {log.message}
                      </div>
                      
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Show metadata
                          </summary>
                          <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Logs;