import React from 'react';
import Layout from '../components/Layout';
import MCPSection from '../components/MCPSection';
import { useAuth } from '../hooks/useAuth';
import { useDropdown } from '../hooks/useDropdown';
import { mockMCPs, filterMCPsByStatus } from '../utils/mcpHelpers';
import { getDropdownItems } from '../utils/dropdownHelpers';

const Dashboard: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const { openDropdown, handleDropdownToggle, closeDropdowns } = useDropdown();

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

  const activeMCPs = filterMCPsByStatus(mockMCPs, 'active');
  const inactiveMCPs = filterMCPsByStatus(mockMCPs, 'inactive');
  const expiredMCPs = filterMCPsByStatus(mockMCPs, 'expired');

  return (
    <Layout userName={userName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-base lg:text-lg text-gray-600">Manage your MCPs</p>
            </div>
            <button className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap transition-colors cursor-pointer lg:min-w-[183px]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New MCP</span>
            </button>
          </div>

          <div className="space-y-6">
            <MCPSection
              title="Active MCPs"
              count={activeMCPs.length}
              mcps={activeMCPs}
              openDropdown={openDropdown}
              onDropdownToggle={handleDropdownToggle}
              onDropdownClose={closeDropdowns}
              getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns)}
            />

            <MCPSection
              title="Inactive MCPs"
              count={inactiveMCPs.length}
              mcps={inactiveMCPs}
              openDropdown={openDropdown}
              onDropdownToggle={handleDropdownToggle}
              onDropdownClose={closeDropdowns}
              getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns)}
            />

            <MCPSection
              title="Expired MCPs"
              count={expiredMCPs.length}
              mcps={expiredMCPs}
              openDropdown={openDropdown}
              onDropdownToggle={handleDropdownToggle}
              onDropdownClose={closeDropdowns}
              getDropdownItems={(mcp) => getDropdownItems(mcp, closeDropdowns)}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;