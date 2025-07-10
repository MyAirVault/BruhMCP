import { useState, useEffect } from 'react';
import type { ProfileData } from '../../types/profile';
import { apiService } from '../../services/apiService';

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

  // Load profile data from API
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const settings = await apiService.getSettings();
        const newProfileData: ProfileData = {
          firstName: settings.user.name.split(' ')[0] || '',
          lastName: settings.user.name.split(' ').slice(1).join(' ') || '',
          email: settings.user.email,
          emailNotifications: settings.preferences.notifications_enabled,
          createdAt: '2024-01-15T10:30:00Z', // This would come from user creation date
          mcpStats: {
            totalMCPs: 12, // This would come from MCP count
            activeMCPs: 8  // This would come from active MCP count
          }
        };
        setProfileData(newProfileData);
        setEditedData(newProfileData);
      } catch (error) {
        console.error('Failed to load profile data:', error);
        // Fallback to existing logic
        if (userName) {
          setProfileData(prev => ({ ...prev, email: userName }));
          setEditedData(prev => ({ ...prev, email: userName }));
        }
      }
    };

    loadProfileData();
  }, [userName]);

  const handleInputChange = (field: keyof ProfileData, value: string | boolean) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleNotificationToggle = async () => {
    const newValue = !profileData.emailNotifications;
    try {
      await apiService.updateSettings({
        preferences: {
          notifications_enabled: newValue
        }
      });
      setProfileData(prev => ({ ...prev, emailNotifications: newValue }));
      setEditedData(prev => ({ ...prev, emailNotifications: newValue }));
      console.log('Notification settings updated:', newValue);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Update settings via API
      await apiService.updateSettings({
        preferences: {
          notifications_enabled: editedData.emailNotifications
        }
      });
      
      console.log('Saving profile data:', editedData);
      setProfileData(editedData);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save profile data:', error);
      throw error; // Re-throw to allow component to handle error
    }
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