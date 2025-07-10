import React from 'react';
import { Settings } from 'lucide-react';
import type { SavePopupProps } from '../../types/profile';

const SavePopup: React.FC<SavePopupProps> = ({ isOpen, onSave, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Save Changes</h3>
        </div>
        
        <p className="text-gray-500 mb-6">
          You have unsaved changes to your profile. Would you like to save them?
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onSave}
            className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePopup;