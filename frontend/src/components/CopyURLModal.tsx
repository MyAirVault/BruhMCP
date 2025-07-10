import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { type MCPItem } from '../types';

interface CopyURLModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcp: MCPItem | null;
}

const CopyURLModal: React.FC<CopyURLModalProps> = ({ isOpen, onClose, mcp }) => {
  const [copied, setCopied] = useState(false);

  // Generate URL based on MCP - use the actual access_url from backend
  const generateMCPUrl = (mcp: MCPItem): string => {
    // The 'email' field actually contains the access_url from backend
    return mcp.email;
  };

  // Reset copied state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
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
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
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
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  if (!isOpen || !mcp) return null;

  const mcpUrl = generateMCPUrl(mcp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Copy MCP URL
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MCP URL
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm text-gray-800 font-mono break-all">
                  {mcpUrl}
                </p>
              </div>
              <button
                onClick={handleCopyURL}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors cursor-pointer ${
                  copied 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                title={copied ? 'Copied!' : 'Copy URL'}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-2">
                URL copied to clipboard!
              </p>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>Share this URL to provide access to your MCP configuration.</p>
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