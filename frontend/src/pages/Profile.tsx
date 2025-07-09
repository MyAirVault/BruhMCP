import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowLeft, User, Calendar, Mail, Bell, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  emailNotifications: boolean;
  createdAt: string;
  mcpStats: {
    totalMCPs: number;
    activeMCPs: number;
  };
}

interface SavePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onCancel: () => void;
}

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

const Profile: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock profile data - in real app, this would come from an API
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: userName || '',
    emailNotifications: true,
    createdAt: '2024-01-15T10:30:00Z',
    mcpStats: {
      totalMCPs: 12,
      activeMCPs: 8
    }
  });

  const [editedData, setEditedData] = useState<ProfileData>({ ...profileData });

  // Update profile data when userName changes
  useEffect(() => {
    if (userName) {
      setProfileData(prev => ({ ...prev, email: userName }));
      setEditedData(prev => ({ ...prev, email: userName }));
    }
  }, [userName]);

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleNotificationToggle = () => {
    const newValue = !profileData.emailNotifications;
    setProfileData(prev => ({ ...prev, emailNotifications: newValue }));
    setEditedData(prev => ({ ...prev, emailNotifications: newValue }));
    console.log('Notification settings updated:', newValue);
  };

  const handleSave = () => {
    console.log('Saving profile data:', editedData);
    setProfileData(editedData);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setShowSavePopup(false);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setHasUnsavedChanges(false);
    setIsEditing(false);
    setShowSavePopup(false);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowSavePopup(true);
    } else {
      navigate('/dashboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  return (
    <Layout userName={userName}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
          <div className="max-w-[1280px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
              <div>
                <button
                  onClick={handleBackClick}
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
                  onClick={() => setIsEditing(true)}
                  className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center space-x-2 shadow-lg whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Edit Profile</span>
                </button>
              )}
            </div>

            {/* Profile Content */}
            <div className="space-y-6">
              {/* Personal Information Card */}
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
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
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
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                      onClick={handleSave}
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* MCP Statistics Card */}
              <div className="bg-white border-t border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span>MCP Statistics</span>
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {profileData.mcpStats.totalMCPs}
                    </p>
                    <p className="text-sm text-gray-500">Total MCPs Created</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {profileData.mcpStats.activeMCPs}
                    </p>
                    <p className="text-sm text-gray-500">Active MCPs</p>
                  </div>
                </div>
              </div>

              {/* Notification Settings Card */}
              <div className="bg-white border-t border-gray-200 rounded-2xl p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-4">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span>Notification Settings</span>
                </h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      MCP Expiration Alerts
                    </p>
                    <p className="text-sm text-gray-500">
                      Get notified when your active MCPs are about to expire
                    </p>
                  </div>
                  <button
                    onClick={handleNotificationToggle}
                    className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      profileData.emailNotifications 
                        ? 'bg-blue-600' 
                        : 'bg-gray-900'
                    }`}>
                      <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                        profileData.emailNotifications 
                          ? 'translate-x-5' 
                          : 'translate-x-0'
                      }`}></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SavePopup
        isOpen={showSavePopup}
        onClose={() => setShowSavePopup(false)}
        onSave={handleSave}
        onCancel={() => {
          setShowSavePopup(false);
          navigate('/dashboard');
        }}
      />
    </Layout>
  );
};

export default Profile;