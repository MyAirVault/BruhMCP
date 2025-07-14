import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { type MCPItem } from '../../types';

interface CopyURLModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcp: MCPItem | null;
}

type LLMOption = 'vscode' | 'cursor' | 'windsurf' | 'claude';

const CopyURLModal: React.FC<CopyURLModalProps> = ({ isOpen, onClose, mcp }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [selectedOption, setSelectedOption] = useState<LLMOption>('vscode');

  // Generate URL based on MCP - use the actual access_url from backend
  const generateMCPUrl = (mcp: MCPItem): string => {
    // Use access_url if available, fallback to email field for backward compatibility
    return mcp.access_url || mcp.email;
  };

  // Generate configuration based on selected option
  const generateConfig = (mcp: MCPItem, option: LLMOption): string => {
    const url = generateMCPUrl(mcp);
    const serviceName = mcp.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (option === 'claude') {
      return `claude mcp add --transport http ${serviceName} ${url}`;
    }

    // For VS Code, Cursor, and Windsurf
    return `{
  "mcpServers": {
    "${serviceName}": {
      "type": "http",
      "url": "${url}"
    }
  }
}`;
  };

  // Reset copied state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopiedUrl(false);
      setCopiedConfig(false);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Copy URL to clipboard
  const handleCopyURL = async () => {
    if (!mcp) return;

    const url = generateMCPUrl(mcp);

    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedUrl(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUrl(true);

      setTimeout(() => {
        setCopiedUrl(false);
      }, 2000);
    }
  };

  // Copy configuration to clipboard
  const handleCopyConfig = async () => {
    if (!mcp) return;

    const config = generateConfig(mcp, selectedOption);

    try {
      await navigator.clipboard.writeText(config);
      setCopiedConfig(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedConfig(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy config:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = config;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedConfig(true);

      setTimeout(() => {
        setCopiedConfig(false);
      }, 2000);
    }
  };

  if (!isOpen || !mcp) return null;

  const mcpUrl = generateMCPUrl(mcp);
  const config = generateConfig(mcp, selectedOption);

  const llmOptions = [
    { id: 'vscode' as LLMOption, name: 'VS Code', icon: '/icons/vscode.svg' },
    { id: 'cursor' as LLMOption, name: 'Cursor', icon: '/icons/cursor.svg' },
    { id: 'windsurf' as LLMOption, name: 'Windsurf', icon: '/icons/Windsurf-black-symbol.svg' },
    { id: 'claude' as LLMOption, name: 'Claude', icon: '/icons/claude.svg' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            MCP Access & Integration
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto scrollbar-hide">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MCP Name
            </label>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">
                {mcp.name}
              </p>
            </div>
          </div>

          {/* Direct URL Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Direct Access URL
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-800 font-mono break-all">
                  {mcpUrl}
                </p>
              </div>
              <button
                onClick={handleCopyURL}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors cursor-pointer ${copiedUrl
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                title={copiedUrl ? 'Copied!' : 'Copy URL'}
              >
                {copiedUrl ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copiedUrl && (
              <p className="text-sm text-green-600 mt-2">
                URL copied to clipboard!
              </p>
            )}
          </div>

          {/* LLM Options Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {llmOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  title={option.name}
                >
                  <img 
                    src={option.icon} 
                    alt={option.name}
                    className="w-6 h-6"
                  />
                </button>
              ))}
            </div>

            {/* Configuration Display */}
            <div className="relative bg-gray-50 rounded-lg border border-gray-200 mb-2">
              <button
                onClick={handleCopyConfig}
                className={`absolute top-2 right-2 p-1.5 rounded transition-colors cursor-pointer z-10 ${copiedConfig
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
                  }`}
                title={copiedConfig ? 'Copied!' : 'Copy to clipboard'}
              >
                {copiedConfig ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <pre className="text-xs text-gray-900 whitespace-pre-wrap break-all font-mono max-h-32 overflow-y-auto scrollbar-hide p-3 pr-10">
                {config}
              </pre>
            </div>
            
            {copiedConfig && (
              <p className="text-sm text-green-600 mt-2">
                Configuration copied to clipboard!
              </p>
            )}
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">How to use:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Direct URL:</strong> Use for HTTP requests or API testing</li>
              <li><strong>Configuration:</strong> Add to your tool's settings for MCP integration</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyURLModal;