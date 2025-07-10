import React from 'react';
import { Bell } from 'lucide-react';
import type { NotificationSettingsCardProps } from '../../types/profile';

const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({
  emailNotifications,
  onToggle
}) => {
  return (
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
          onClick={onToggle}
          className="relative inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        >
          <div className={`w-11 h-6 rounded-full transition-colors ${
            emailNotifications 
              ? 'bg-blue-600' 
              : 'bg-gray-900'
          }`}>
            <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
              emailNotifications 
                ? 'translate-x-5' 
                : 'translate-x-0'
            }`}></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default NotificationSettingsCard;