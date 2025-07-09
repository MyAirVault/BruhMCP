# Authentication Flow

## Overview

**Magic link authentication with JWT cookies** - Simple email-based magic link authentication. User enters email → gets magic link → clicks link → automatically logged in with JWT cookie.

**Current Implementation**: Token-based magic link flow with React frontend integration and JWT cookie storage for persistent sessions.

## Authentication Flow

### Step 1: Request Magic Link
**User Action**: Enter email address
**Endpoint**: `POST /auth/request`
**Process**:
1. User submits email via Postman/frontend
2. Server generates UUID v4 token
3. Server stores token in memory: `{token: {email, expiry}}`
4. Server logs magic link to console: `http://localhost:5000/verify?token=<uuid>`
5. User copies magic link from console

### Step 2: Magic Link Verification
**User Action**: Click magic link in browser
**Flow**: `http://localhost:5000/verify?token=<uuid>` → `http://localhost:5173/verify?token=<uuid>`
**Process**:
1. Backend redirects magic link to React frontend
2. React component extracts UUID token from URL
3. React component auto-submits token to `POST /auth/verify`
4. Backend validates UUID format and token existence
5. Backend finds or creates user in PostgreSQL database
6. Backend generates JWT and sets HTTP-only cookie
7. User sees success message and is authenticated

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

### React Component: VerifyPage.tsx
- **Router Integration**: React Router handles `/verify` route
- **URL Parameter Extraction**: `useSearchParams()` gets token from URL
- **Auto-Verification**: Automatically submits token on page load
- **User Feedback**: Loading spinner, success/error states
- **Styling**: Tailwind CSS responsive design

### Development Flow
1. **Backend**: `npm run dev` (port 5000)
2. **Frontend**: `npm run dev` (port 5173)
3. **Request**: POST to `/auth/request` with email
4. **Console**: Copy magic link from backend console
5. **Verify**: Click magic link → automatic redirect and verification
6. **Success**: JWT cookie set, user authenticated

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