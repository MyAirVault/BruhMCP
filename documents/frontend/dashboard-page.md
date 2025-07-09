# Dashboard Page Documentation

## Overview

The Dashboard Page (`/frontend/src/pages/Dashboard.tsx`) is the main authenticated user interface for the MiniMCP application. It serves as the protected landing page after successful authentication and provides logout functionality.

## Location
- **File**: `/frontend/src/pages/Dashboard.tsx`
- **Route**: `/dashboard` (protected route)
- **URL**: `http://localhost:5173/dashboard`

## Functionality

### Authentication Protection
- **Auth Check**: Verifies authentication on page load
- **Protected Route**: Redirects unauthenticated users to login
- **Loading State**: Shows loading spinner during auth check
- **User Display**: Shows authenticated user's email address

### Logout Functionality
- **Backend Logout**: Calls `/api/auth/logout` endpoint
- **Cookie Clearing**: Clears multiple possible cookie names
- **Navigation**: Redirects to login page after logout
- **Error Handling**: Graceful handling of logout errors

### User Interface
- **Welcome Message**: Personalized greeting with user email
- **Logout Button**: Prominent logout button in header
- **Dashboard Card**: Welcome message and instructions
- **Responsive Design**: Mobile-friendly layout

## Technical Implementation

### React Component Structure
```typescript
const Dashboard: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Verify authentication and get user info
    };
    checkAuth();
  }, [navigate]);
};
```

### Authentication Check
```typescript
const checkAuth = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      setUserEmail(data.user?.email || 'user');
    } else {
      navigate('/login');
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    navigate('/login');
  } finally {
    setIsLoading(false);
  }
};
```

### Logout Implementation
```typescript
const handleLogout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear multiple possible cookie names
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  navigate('/login');
};
```

## User Experience Flow

### Authenticated User
1. User navigates to `/dashboard`
2. System checks authentication status
3. User information is loaded and displayed
4. Dashboard content is shown
5. User can interact with logout button

### Unauthenticated User
1. User navigates to `/dashboard`
2. System checks authentication status
3. User is redirected to login page
4. No dashboard content is shown

### Logout Process
1. User clicks logout button
2. System calls backend logout endpoint
3. Client-side cookies are cleared
4. User is redirected to login page
5. Authentication state is reset

## State Management

### Component State
- **userEmail**: Stores authenticated user's email
- **isLoading**: Loading state during authentication check
- **navigate**: React Router navigation function

### Loading States
- **Initial Load**: Shows spinner while checking auth
- **Authenticated**: Shows dashboard content
- **Unauthenticated**: Redirects to login

## Integration with Authentication System

### Backend Integration
- **Auth Check**: GET `/api/auth/me` with cookies
- **Logout**: POST `/api/auth/logout` to clear server session
- **Cookie Handling**: Uses `credentials: 'include'` for session management

### Frontend Integration
- **React Router**: Uses `useNavigate()` for redirects
- **LoginPage**: Redirects to login when not authenticated
- **Protected Route**: Serves as authentication barrier

## Styling

### Tailwind CSS Design
- **Background**: `min-h-screen bg-gray-50`
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Header**: `flex items-center justify-between py-6`
- **Card**: `bg-white overflow-hidden shadow rounded-lg`
- **Button**: `bg-red-600 hover:bg-red-700 focus:ring-red-500`

### Responsive Design
- Mobile-first approach
- Responsive container sizing
- Proper spacing and typography
- Accessible button design

## Security Considerations

### Route Protection
- Authentication required for access
- Automatic redirect for unauthenticated users
- Secure cookie handling

### Logout Security
- Server-side session clearing
- Multiple cookie clearing for safety
- Proper error handling

### Data Protection
- No sensitive data in component state
- Secure API communication
- Proper authentication validation

## Error Handling

### Authentication Errors
- Network errors during auth check
- Invalid authentication tokens
- Server errors during validation

### Logout Errors
- Network errors during logout
- Server errors during session clearing
- Graceful fallback to client-side clearing

## Performance Considerations

### Loading Optimization
- Efficient authentication checking
- Minimal component re-renders
- Proper cleanup on unmount

### User Experience
- Fast loading states
- Smooth transitions
- Responsive design

## Testing Considerations

### Test Scenarios
1. Authentication check on page load
2. Authenticated user display
3. Unauthenticated user redirect
4. Logout functionality
5. Loading states
6. Error handling

### Integration Testing
- Test with actual authentication system
- Verify logout behavior
- Test redirect functionality
- Mobile and desktop responsiveness

This component provides the main authenticated user interface and serves as the destination for successful authentication flows, ensuring users have a secure and user-friendly experience.