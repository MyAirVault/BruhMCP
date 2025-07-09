# Login Page Documentation

## Overview

The Login Page (`/frontend/src/pages/LoginPage.tsx`) is the main entry point for user authentication in the MiniMCP application. It handles email input, magic link requests, and manages the overall authentication flow through the MagicLinkPopup component.

## Location
- **File**: `/frontend/src/pages/LoginPage.tsx`
- **Routes**: `/login` and `/` (default route)
- **URL**: `http://localhost:5173/login` or `http://localhost:5173/`

## Functionality

### Authentication Check on Load
- **Auto-Redirect**: Checks `/api/auth/me` on page load
- **Already Authenticated**: Redirects to dashboard immediately
- **Not Authenticated**: Shows login form
- **Timeout Delay**: 100ms delay to allow logout completion

### Email Form Handling
- **Email Input**: Validates email format
- **Submit Button**: Shows loading state during request
- **Error Handling**: Displays network and validation errors
- **Magic Link Request**: Sends POST to `/api/auth/request`

### Magic Link Popup Integration
- **Popup Display**: Shows MagicLinkPopup after successful request
- **Polling Mechanism**: Popup polls for authentication status
- **Seamless UX**: User stays on login page while popup handles verification

## Technical Implementation

### React Component Structure
```typescript
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Authentication check effect
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is already authenticated
    };
    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [navigate]);
};
```

### Form Submission Process
1. **Validation**: Client-side email format validation
2. **Loading State**: Button shows "Sending..." and is disabled
3. **API Request**: POST to `/api/auth/request` with email
4. **Success**: Display MagicLinkPopup component
5. **Error**: Show error message to user

### State Management
- **email**: Current email input value
- **isLoading**: Loading state during API request
- **showMagicLink**: Controls MagicLinkPopup visibility
- **error**: Error message display

## User Experience Flow

### First-Time User
1. User visits `/login` or `/`
2. System checks authentication (not authenticated)
3. Login form is displayed
4. User enters email address
5. User clicks "Send Magic Link"
6. MagicLinkPopup appears with polling active
7. User clicks magic link from console
8. Popup detects authentication and redirects to dashboard

### Returning User
1. User visits `/login` or `/`
2. System checks authentication (already authenticated)
3. User is immediately redirected to dashboard
4. No form interaction required

## Integration with Authentication System

### Backend Integration
- **Auth Check**: GET `/api/auth/me` with cookies
- **Magic Link Request**: POST `/api/auth/request` with email
- **Cookie Handling**: Uses `credentials: 'include'` for session management

### Frontend Integration
- **React Router**: Uses `useNavigate()` for redirects
- **MagicLinkPopup**: Child component for verification flow
- **Dashboard**: Redirects authenticated users to dashboard

## Styling

### Tailwind CSS Design
- **Container**: `min-h-screen bg-gray-50 flex items-center justify-center`
- **Card**: `max-w-md w-full space-y-8`
- **Form**: `mt-8 space-y-6`
- **Input**: `rounded-md border-gray-300 focus:ring-indigo-500`
- **Button**: `bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50`

### Responsive Design
- Mobile-first approach
- Centered layout on all screen sizes
- Proper spacing and typography
- Accessible form elements

## Error Handling

### Error Types
- **Validation Error**: Invalid email format
- **Network Error**: Connection issues
- **Rate Limiting**: Too many requests
- **Server Error**: Backend issues

### Error Display
- Red text below form
- Clear error messages
- Automatic clearing on new submission

## Security Considerations

### Input Validation
- Client-side email format validation
- Server-side validation on backend
- Protection against injection attacks

### Rate Limiting
- Backend rate limiting on auth endpoints
- Prevents abuse and brute force attacks

### Cookie Security
- HTTP-only cookies for JWT storage
- Secure flag in production
- SameSite strict policy

## Testing Considerations

### Test Scenarios
1. Authentication check on page load
2. Email form submission
3. Loading states and button disabling
4. Error handling and display
5. MagicLinkPopup integration
6. Navigation and redirects

### Integration Testing
- Test with actual backend endpoints
- Verify cookie handling
- Test authentication flow end-to-end
- Mobile and desktop responsiveness

This component serves as the primary authentication entry point, providing a clean and user-friendly interface for the magic link authentication system.