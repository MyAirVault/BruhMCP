import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Zap } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface DashboardHeaderProps {
  onCreateMCP: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onCreateMCP }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-base lg:text-lg text-gray-600 mb-3">Manage your MCPs</p>
        <button
          onClick={() => navigate('/logs')}
          className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 py-1 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>View All Logs</span>
        </button>
      </div>
      <Tooltip content="Press Ctrl+K (Cmd+K on Mac) to quickly open this modal" position="bottom">
        <button
          onClick={onCreateMCP}
          className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap transition-colors cursor-pointer lg:min-w-[183px]"
        >
          <Zap className="w-5 h-5" />
          <span className='text-sm'>Create new MCP</span>
        </button>
      </Tooltip>
    </div>
  );
};

export default DashboardHeader;