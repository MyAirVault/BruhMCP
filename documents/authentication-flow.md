# Authentication Flow

## Overview

**Magic link authentication with JWT cookies and polling-based UI** - Enhanced email-based magic link authentication with seamless user experience. User enters email → gets magic link → clicks link → automatically redirected to dashboard with persistent session.

**Current Implementation**: Token-based magic link flow with React frontend integration, JWT cookie storage, and polling-based verification detection for smooth user experience.

## Authentication Flow

### Step 1: Request Magic Link
**User Action**: Enter email address on login page
**Endpoint**: `POST /auth/request`
**UI State**: Login form with email input and "Send Magic Link" button
**Process**:
1. User visits login page (`/login` or `/`)
2. User enters email address in form
3. User clicks "Send Magic Link" button
4. Button shows "Sending..." state and is disabled
5. Frontend sends email to `POST /auth/request`
6. Server generates UUID v4 token
7. Server stores token in memory: `{token: {email, expiry}}`
8. Server logs magic link to console: `http://localhost:5000/verify?token=<uuid>`
9. Frontend displays MagicLinkPopup with confirmation

### Step 2: Magic Link Verification & Redirect
**User Action**: Click magic link in browser/console
**Flow**: `http://localhost:5000/verify?token=<uuid>` → `http://localhost:5173/verify?token=<uuid>`
**UI State**: Magic link popup with polling mechanism OR direct VerifyPage
**Process**:
1. Backend redirects magic link to React frontend VerifyPage
2. VerifyPage first checks if user is already authenticated via `/auth/me`
3. If already authenticated, redirects to dashboard immediately
4. If not authenticated, extracts UUID token from URL parameters
5. VerifyPage auto-submits token to `POST /auth/verify`
6. Backend validates UUID format and token existence
7. Backend finds or creates user in PostgreSQL database
8. Backend generates JWT and sets HTTP-only cookie
9. VerifyPage shows success message and redirects to dashboard after 1.5 seconds
10. If MagicLinkPopup is active, it polls `/api/auth/me` every 2 seconds and detects authentication
11. **Fallback**: If verification fails but cookie exists, VerifyPage performs auth check and redirects

## Implementation

### Token Storage
- **In-memory Map**: `const authTokens = new Map()`
- **Token format**: UUID v4 (36 characters, e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **Expiry**: 15 minutes from generation
- **Cleanup**: Remove expired tokens every 5 minutes
- **Validation**: Zod schema validates UUID format

### User Management
- **Database**: PostgreSQL with `users` table
- **User Creation**: Automatic on first authentication
- **User Data**: `{id: UUID, email: string, created_at: timestamp, updated_at: timestamp}`
- **No Passwords**: Passwordless authentication via magic links

### Session Management
- **JWT Tokens**: Signed with JWT_SECRET, 7-day expiry
- **Cookie Storage**: HTTP-only, SameSite strict, secure in production
- **Payload**: `{userId: uuid, email: string}`
- **Persistence**: Survives server restarts (stored in browser cookies)

### API Endpoints

#### POST /auth/request
```javascript
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "Magic link generated. Check console for link.",
  "email": "user@example.com"
}
```

#### POST /auth/verify
```javascript
{
  "token": "550e8400-e29b-41d4-a716-446655440000"
}

// Response
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

#### GET /auth/me
```javascript
// No request body (uses cookies)

// Response (authenticated)
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}

// Response (not authenticated)
{
  "error": {
    "code": "MISSING_AUTH_TOKEN",
    "message": "Authentication required"
  }
}
```

#### POST /auth/logout
```javascript
// No request body

// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /verify (Redirect Route)
- Redirects `http://localhost:5000/verify?token=<uuid>` to `http://localhost:5173/verify?token=<uuid>`
- Enables magic link clicking from any browser

## Security

### Token Generation
- **UUID v4**: Industry-standard format with 122 bits of entropy
- **Cryptographically Random**: Uses secure random number generation
- **Format Validation**: Zod schema validates proper UUID format
- **No Collision Risk**: UUID v4 virtually eliminates duplicate tokens

### Authentication Security
- **HTTP-Only Cookies**: JWT not accessible via JavaScript
- **SameSite Strict**: CSRF protection
- **Secure Flag**: HTTPS-only in production
- **JWT Expiry**: 7-day automatic logout
- **One-Time Tokens**: Magic link tokens consumed after use

### Additional Protection
- **Rate Limiting**: 5 requests per minute per IP for auth endpoints
- **CORS Protection**: Explicit origin and credential policies
- **Token Cleanup**: Automatic removal of expired tokens
- **Database Security**: Parameterized queries prevent SQL injection

## Frontend Integration

### React Components

#### LoginPage.tsx
- **Route**: `/login` and `/` (default)
- **Authentication Check**: Checks `/auth/me` on page load
- **Auto-Redirect**: Redirects to dashboard if already authenticated
- **Form Handling**: Email input with validation and submission
- **State Management**: Loading, error, and magic link popup states
- **Styling**: Tailwind CSS responsive design

#### MagicLinkPopup.tsx
- **Trigger**: Shown after successful magic link request
- **Polling Mechanism**: Checks `/auth/me` every 2 seconds
- **UI States**: Waiting for verification → Success → Redirect
- **Auto-Redirect**: Redirects to dashboard when verification detected
- **Cleanup**: Properly cleans up polling interval on unmount

#### VerifyPage.tsx
- **Route**: `/verify` (handles magic link redirects)
- **URL Parameter Extraction**: `useSearchParams()` gets token from URL
- **Auto-Verification**: Automatically submits token to `/auth/verify`
- **Authentication Check**: Checks if user is already authenticated on page load
- **Auto-Redirect**: Redirects to dashboard after successful verification (1.5s delay)
- **Error Handling**: Fallback auth check if verification appears to fail
- **User Feedback**: Loading spinner, success/error states with redirect notification

#### Dashboard.tsx
- **Route**: `/dashboard` (protected route)
- **Authentication Check**: Verifies auth status on page load
- **Auto-Redirect**: Redirects to login if not authenticated
- **Logout Function**: Calls `/auth/logout` and clears cookies
- **User Display**: Shows authenticated user's email

### Authentication Flow States

#### User Journey
1. **Visit Login**: User goes to `/login` or `/`
2. **Auth Check**: Page checks if user is already authenticated
3. **Already Authenticated**: Redirect to dashboard immediately
4. **Not Authenticated**: Show login form
5. **Submit Email**: User enters email and clicks "Send Magic Link"
6. **Show Popup**: MagicLinkPopup appears with confirmation
7. **Click Link**: User clicks magic link from console
8. **Verification**: VerifyPage handles token verification with multiple safety checks
9. **Success & Redirect**: VerifyPage shows success message then redirects to dashboard
10. **Fallback**: If popup is closed, VerifyPage still handles verification independently

### Development Flow
1. **Backend**: `npm run dev` (port 5000)
2. **Frontend**: `npm run dev` (port 5173)
3. **Visit**: Go to `http://localhost:5173/login`
4. **Enter Email**: Type email and click "Send Magic Link"
5. **Popup**: MagicLinkPopup appears with polling active
6. **Console**: Copy magic link from backend console
7. **Verify**: Click magic link → automatic redirect and verification
8. **Success**: VerifyPage shows success → redirects to dashboard (works with or without popup)
9. **Persistent**: Refresh page → automatically goes to dashboard

### Fixed Bug: Popup Close Issue
**Previous Issue**: If user closed MagicLinkPopup before clicking verify link, verification would show "auth failed" even though authentication succeeded.

**Resolution**: VerifyPage now includes:
- **Pre-verification auth check**: Checks if already authenticated before token verification
- **Automatic redirect on success**: Redirects to dashboard after successful verification
- **Fallback auth check**: If verification appears to fail, checks if cookie was actually set
- **Enhanced error handling**: Distinguishes between real failures and race conditions

## Error Handling

Comprehensive error scenarios:
- **VALIDATION_ERROR**: Invalid email format or UUID format
- **TOKEN_NOT_FOUND**: Token doesn't exist in memory
- **TOKEN_EXPIRED**: Token expired (15 minutes)
- **USER_CREATION_FAILED**: Database error during user creation
- **RATE_LIMITED**: Too many requests (5/minute limit)
- **MISSING_AUTH_TOKEN**: No JWT cookie for protected routes
- **INVALID_AUTH_TOKEN**: Invalid or expired JWT cookie

## Environment Configuration

### Required Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=minimcp
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# URLs
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### Database Setup
```sql
-- Users table migration
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

This modern authentication system provides secure, user-friendly magic link authentication with persistent JWT sessions and React frontend integration.