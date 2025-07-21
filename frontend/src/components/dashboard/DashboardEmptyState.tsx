import React from 'react';
import { Rocket, Zap, ArrowRight } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface DashboardEmptyStateProps {
  onCreateMCP: () => void;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ onCreateMCP }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <img src='/logo.svg' />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to bruhMCP!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Get started by creating your first Model Context Protocol instance.
            Connect to services like Gmail, GitHub, Slack, Discord, Dropbox, and more.
          </p>
        </div>

        <div className="space-y-4">
          <Tooltip content="Press Ctrl+K (Cmd+K on Mac) to quickly open this modal" position="bottom">
            <button
              onClick={onCreateMCP}
              className="w-full bg-black text-white px-6 py-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-3 shadow-lg transition-colors cursor-pointer text-lg font-medium"
            >
              <Zap className="w-6 h-6" />
              <span>Create Your First MCP</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Tooltip>

          <div className="text-sm text-gray-500">
            <p className="mb-2">Popular integrations:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Gmail</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">GitHub</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Slack</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Discord</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900">Dropbox</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Notion</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEmptyState;