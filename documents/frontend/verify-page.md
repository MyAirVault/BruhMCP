# Authentication Verify Page

## Overview

The verify page (`/frontend/src/pages/VerifyPage.tsx`) is a React component that handles magic link authentication for the MiniMCP application.

## Location
- **File**: `/frontend/src/pages/VerifyPage.tsx`
- **Route**: `/verify` in React Router
- **URL**: `http://localhost:5173/verify?token=<auth_token>`
- **Backend Redirect**: `http://localhost:5000/verify?token=...` → `http://localhost:5173/verify?token=...`

## Functionality

### Auto-Verification Process
1. **Token Extraction**: Gets authentication token from URL query parameter using React Router
2. **API Request**: Auto-submits POST request to `/auth/verify` endpoint
3. **Cookie Setting**: Backend sets HTTP-only JWT cookie on success
4. **User Feedback**: Shows success/error message with state management

### User Experience
- **Loading State**: Tailwind spinner with "Verifying your authentication..." message
- **Success State**: "✅ Authentication successful! You can now close this window."
- **Error State**: "❌ Authentication failed" with specific error message

## Technical Implementation

### React Component
```typescript
// Extract token from URL using React Router
const [searchParams] = useSearchParams();
const token = searchParams.get('token');

// Auto-submit verification with state management
const [state, setState] = useState<VerificationState>({ status: 'loading' });

await fetch('http://localhost:5000/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ token })
});
```

### Backend Integration
- **Route**: `GET /verify` redirects to frontend dev server
- **API**: `POST /auth/verify` handles token verification
- **CORS**: Configured with `credentials: true` for cookie setting
- **Frontend URL**: Configurable via `FRONTEND_URL` environment variable

### Security Features
- **HTTP-Only Cookies**: JWT stored securely, not accessible via JavaScript
- **Same-Site Policy**: Cookies set with `sameSite: 'strict'`
- **Token Expiry**: 15-minute token validity, 7-day JWT validity
- **One-Time Use**: Tokens are deleted after successful verification
- **CORS Protection**: Explicit origin and credentials configuration

## Styling

Tailwind CSS design with:
- Responsive center-aligned layout
- Loading spinner animation (`animate-spin`)
- Color-coded success/error states (green-600, red-600)
- Card layout with shadow and rounded corners
- Mobile-responsive padding and sizing

## Error Handling

Handles various error scenarios:
- Missing token in URL
- Network connectivity issues  
- Token validation failures (expired, invalid, not found)
- User creation/database errors

## Magic Link Flow

1. User requests authentication with email
2. Backend generates magic link: `http://localhost:5000/verify?token=abc123`
3. User clicks link → backend redirects to `http://localhost:5173/verify?token=abc123`
4. React component loads and auto-submits token to backend API
5. Backend creates/logs in user, sets JWT cookie
6. User sees success message and can proceed with authenticated requests

## Development Setup

### Prerequisites
- Frontend dev server running on `http://localhost:5173`
- Backend server running on `http://localhost:5000`
- React Router configured for `/verify` route

### Environment Variables
- `FRONTEND_URL`: Frontend development server URL (default: `http://localhost:5173`)
- `CORS_ORIGIN`: CORS origin for frontend (default: `http://localhost:5173`)

### Dependencies
- `react-router-dom`: For URL parameter extraction and routing
- `@tailwindcss/vite`: For styling
- TypeScript for type safety