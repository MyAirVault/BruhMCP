import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import type { ProfileHeaderProps } from '../../types/profile';

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onBackClick, onEditClick, isEditing }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
      <div>
        <button
          onClick={onBackClick}
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg px-2 py-1 transition-colors cursor-pointer mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-base lg:text-lg text-gray-600">Manage your account settings</p>
      </div>
      {!isEditing && (
        <button
          onClick={onEditClick}
          className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap transition-colors cursor-pointer"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Edit Profile</span>
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;