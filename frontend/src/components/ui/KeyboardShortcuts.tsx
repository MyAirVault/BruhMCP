import React, { useState } from 'react';
import Tooltip from './Tooltip';

const KeyboardShortcuts: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const shortcuts = [
    {
      keys: ['Ctrl', 'K'],
      macKeys: ['Cmd', 'K'],
      description: 'Open Create New MCP modal'
    },
    {
      keys: ['Ctrl', '↓'],
      macKeys: ['Cmd', '↓'],
      description: 'Navigate to next MCP section'
    },
    {
      keys: ['Ctrl', '↑'],
      macKeys: ['Cmd', '↑'],
      description: 'Navigate to previous MCP section'
    },
    {
      keys: ['↓'],
      macKeys: ['↓'],
      description: 'Select next MCP in section'
    },
    {
      keys: ['↑'],
      macKeys: ['↑'],
      description: 'Select previous MCP in section'
    },
    {
      keys: ['Esc'],
      macKeys: ['Esc'],
      description: 'Clear selection'
    }
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const renderKeys = (keys: string[], macKeys: string[]) => {
    const keysToShow = isMac ? macKeys : keys;
    return (
      <div className="flex items-center space-x-1">
        {keysToShow.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
              {key}
            </kbd>
            {index < keysToShow.length - 1 && <span className="text-gray-500">+</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Tooltip 
        content="Keyboard Shortcuts" 
        position="left"
      >
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          aria-label="Show keyboard shortcuts"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
      </Tooltip>
      
      {isVisible && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsVisible(false)}
          />
          
          {/* Shortcuts panel */}
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex-1">{shortcut.description}</span>
                  {renderKeys(shortcut.keys, shortcut.macKeys)}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Press any shortcut to get started. Navigation highlights active sections and items.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KeyboardShortcuts;