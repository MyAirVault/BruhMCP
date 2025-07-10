import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { MCPStatisticsCardProps } from '../../types/profile';

const MCPStatisticsCard: React.FC<MCPStatisticsCardProps> = ({ mcpStats }) => {
  return (
    <div className="bg-white border-t border-gray-200 rounded-2xl p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-4">
        <TrendingUp className="w-5 h-5 text-gray-600" />
        <span>MCP Statistics</span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {mcpStats.totalMCPs}
          </p>
          <p className="text-sm text-gray-500">Total MCPs Created</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900">
            {mcpStats.activeMCPs}
          </p>
          <p className="text-sm text-gray-500">Active MCPs</p>
        </div>
      </div>
    </div>
  );
};

export default MCPStatisticsCard;