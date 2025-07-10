import React from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import type { PersonalInformationCardProps } from '../../types/profile';

const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  profileData,
  editedData,
  isEditing,
  onInputChange,
  onSave,
  onCancel
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border-t border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-600" />
          <span>Personal Information</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              placeholder="Enter your first name"
            />
          ) : (
            <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">
              {profileData.firstName || 'Not set'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              placeholder="Enter your last name"
            />
          ) : (
            <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">
              {profileData.lastName || 'Not set'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-lg flex-1">
              {profileData.email}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Email cannot be changed as it's used for authentication
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member Since
          </label>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-lg">
              {formatDate(profileData.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onSave}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalInformationCard;