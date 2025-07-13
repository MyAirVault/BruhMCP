import { useState, useEffect } from 'react';
import type { ProfileData } from '../../types/profile';

export const useProfileData = (userName: string | null) => {
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load profile data 
  useEffect(() => {
    if (userName) {
      const newProfileData: ProfileData = {
        firstName: userName.split('@')[0] || '',
        lastName: '',
        email: userName,
        emailNotifications: true,
        createdAt: '2024-01-15T10:30:00Z',
        mcpStats: {
          totalMCPs: 0,
          activeMCPs: 0
        }
      };
      setProfileData(newProfileData);
      setEditedData(newProfileData);
    }
  }, [userName]);

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleNotificationToggle = async () => {
    const newValue = !profileData.emailNotifications;
    setProfileData(prev => ({ ...prev, emailNotifications: newValue }));
    setEditedData(prev => ({ ...prev, emailNotifications: newValue }));
    console.log('Notification settings updated:', newValue);
  };

  const handleSave = async () => {
    console.log('Saving profile data:', editedData);
    setProfileData(editedData);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setHasUnsavedChanges(false);
  };

  return {
    profileData,
    editedData,
    hasUnsavedChanges,
    handleInputChange,
    handleNotificationToggle,
    handleSave,
    handleCancel
  };
};