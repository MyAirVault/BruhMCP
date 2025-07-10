import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import {
  ProfileHeader,
  PersonalInformationCard,
  MCPStatisticsCard,
  NotificationSettingsCard,
  useProfileData
} from '../components/profile';
import SavePopup from '../components/modals/SavePopup';

const Profile: React.FC = () => {
  const { userName, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showSavePopup, setShowSavePopup] = useState(false);

  const {
    profileData,
    editedData,
    hasUnsavedChanges,
    handleInputChange,
    handleNotificationToggle,
    handleSave: saveProfileData,
    handleCancel: cancelProfileEdit
  } = useProfileData(userName);

  const handleSave = async () => {
    try {
      await saveProfileData();
      setIsEditing(false);
      setShowSavePopup(false);
    } catch (error) {
      console.error('Failed to save profile data:', error);
      // Show error message to user
    }
  };

  const handleCancel = () => {
    cancelProfileEdit();
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
            <ProfileHeader
              onBackClick={handleBackClick}
              onEditClick={() => setIsEditing(true)}
              isEditing={isEditing}
            />

            <div className="space-y-6">
              <PersonalInformationCard
                profileData={profileData}
                editedData={editedData}
                isEditing={isEditing}
                onInputChange={handleInputChange}
                onSave={handleSave}
                onCancel={handleCancel}
              />

              <MCPStatisticsCard mcpStats={profileData.mcpStats} />

              <NotificationSettingsCard
                emailNotifications={profileData.emailNotifications}
                onToggle={handleNotificationToggle}
              />
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