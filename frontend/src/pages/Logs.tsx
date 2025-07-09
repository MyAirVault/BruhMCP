import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../hooks/useAuth';
import { Download, Filter, Search, RefreshCw, ArrowLeft, FileText, Activity, AlertCircle, Info, Bug, Server, Database, Globe } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'app' | 'access' | 'error';
  message: string;
  mcpId?: string;
  mcpName?: string;
  details?: Record<string, unknown>;
}

// Mock log data - replace with actual API call
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    level: 'info',
    source: 'app',
    message: 'Gmail MCP server started',
    mcpId: '1',
    mcpName: 'Personal Gmail MCP',
    details: { port: 3001 }
  },
  {
    id: '2',
    timestamp: '2024-01-15T10:31:00Z',
    level: 'error',
    source: 'error',
    message: 'Failed to connect to Gmail API',
    mcpId: '1',
    mcpName: 'Personal Gmail MCP',
    details: { error: 'Authentication failed', stack: 'Error stack trace...' }
  },
  {
    id: '3',
    timestamp: '2024-01-15T10:32:00Z',
    level: 'info',
    source: 'access',
    message: 'API request received',
    mcpId: '2',
    mcpName: 'API Gateway Control',
    details: { method: 'GET', endpoint: '/api/status' }
  },
  {
    id: '4',
    timestamp: '2024-01-15T09:15:00Z',
    level: 'warn',
    source: 'app',
    message: 'High memory usage detected',
    mcpId: '3',
    mcpName: 'Production Server MCP',
    details: { memoryUsage: '85%' }
  },
  {
    id: '5',
    timestamp: '2024-01-14T15:45:00Z',
    level: 'debug',
    source: 'app',
    message: 'Database connection established',
    mcpId: '4',
    mcpName: 'Backup Server MCP',
    details: { connectionPool: 'active' }
  },
  {
    id: '6',
    timestamp: '2024-01-15T11:00:00Z',
    level: 'info',
    source: 'access',
    message: 'Test environment initialized',
    mcpId: '5',
    mcpName: 'Testing Environment',
    details: { environment: 'staging' }
  },
  {
    id: '7',
    timestamp: '2024-01-15T08:30:00Z',
    level: 'error',
    source: 'error',
    message: 'Legacy system connection timeout',
    mcpId: '6',
    mcpName: 'Legacy System MCP',
    details: { timeout: '30s', retries: 3 }
  },
  {
    id: '8',
    timestamp: '2024-01-15T12:15:00Z',
    level: 'info',
    source: 'app',
    message: 'System health check passed',
    details: { status: 'healthy', uptime: '99.9%' }
  }
];

const Logs: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

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
    // Simulate API call
    const loadLogs = async () => {
      setIsLoadingLogs(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        let logsToShow = mockLogs;
        
        // Filter logs by specific MCP if provided
        if (isSpecificMCP) {
          logsToShow = mockLogs.filter(log => log.mcpId === mcpId);
        }
        
        setLogs(logsToShow);
        setFilteredLogs(logsToShow);
        setIsLoadingLogs(false);
      }, 1000);
    };

    loadLogs();
  }, [isSpecificMCP, mcpId]);

  useEffect(() => {
    let filtered = logs;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.mcpName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.level.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    // Apply time filter
    if (timeFilter !== 'all') {
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
      }
      
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffTime);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, sourceFilter, timeFilter]);

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRefreshLogs = () => {
    setIsLoadingLogs(true);
    // In real implementation, this would refresh from API
    setTimeout(() => {
      let logsToShow = [...mockLogs];
      
      // Filter logs by specific MCP if provided
      if (isSpecificMCP) {
        logsToShow = logsToShow.filter(log => log.mcpId === mcpId);
      }
      
      setLogs(logsToShow);
      setIsLoadingLogs(false);
    }, 500);
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

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoadingLogs ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading logs...</p>
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
                            {log.details && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                  Show details
                                </summary>
                                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
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
                      
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Show details
                          </summary>
                          <pre className="mt-2 text-xs text-gray-600 bg-white p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
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