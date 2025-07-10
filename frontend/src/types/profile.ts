export interface ProfileData {
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

export interface SavePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface ProfileHeaderProps {
  onBackClick: () => void;
  onEditClick: () => void;
  isEditing: boolean;
}

export interface PersonalInformationCardProps {
  profileData: ProfileData;
  editedData: ProfileData;
  isEditing: boolean;
  onInputChange: (field: keyof ProfileData, value: string | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface MCPStatisticsCardProps {
  mcpStats: ProfileData['mcpStats'];
}

export interface NotificationSettingsCardProps {
  emailNotifications: boolean;
  onToggle: () => void;
}