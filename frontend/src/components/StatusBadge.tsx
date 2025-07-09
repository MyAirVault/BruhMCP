import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'expired';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'active':
      return (
        <span 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--status-active-bg)', 
            color: 'var(--status-active-text)' 
          }}
        >
          Active
        </span>
      );
    case 'inactive':
      return (
        <span 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--status-inactive-bg)', 
            color: 'var(--status-inactive-text)' 
          }}
        >
          Inactive
        </span>
      );
    case 'expired':
      return (
        <span 
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--status-expired-bg)', 
            color: 'var(--status-expired-text)' 
          }}
        >
          Expired
        </span>
      );
    default:
      return null;
  }
};

export default StatusBadge;