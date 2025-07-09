# Frontend Documentation

This directory contains documentation for the frontend components and pages of the MiniMCP application.

## Documents

-   [Authentication Verify Page](./verify-page.md) - Magic link verification page documentation

## Frontend Structure

The frontend is built with:

-   **Framework**: React + TypeScript + Vite
-   **Styling**: Tailwind CSS
-   **Location**: `/frontend/` directory

## Pages

### Authentication Pages

-   **Login Page** (`/frontend/src/pages/LoginPage.tsx`)
    -   Email input form for magic link authentication
    -   Connects to `/api/auth/request` endpoint
    -   Shows MagicLinkPopup component after successful submission
    -   Route: `/login` and `/` (default)

-   **Magic Link Verification** (`/frontend/src/pages/VerifyPage.tsx`)
    -   Verifies authentication tokens from email links
    -   Connects to `/api/auth/verify` endpoint
    -   Automatically redirects to dashboard after successful verification
    -   Route: `/verify?token={uuid}`

-   **Dashboard** (`/frontend/src/pages/Dashboard.tsx`)
    -   Protected route showing "Hello {email}" message
    -   Includes logout functionality
    -   Route: `/dashboard`

### Components

-   **MagicLinkPopup** (`/frontend/src/components/MagicLinkPopup.tsx`)
    -   Modal popup showing magic link sent confirmation
    -   Displays user's email and instructions
    -   Development note about console link visibility

## Authentication Flow

1. User visits `/login` or `/` (redirects to LoginPage)
2. User enters email and submits form
3. Frontend calls `/api/auth/request` with email
4. MagicLinkPopup appears with confirmation
5. User clicks magic link from email (goes to `/verify?token={uuid}`)
6. VerifyPage validates token via `/api/auth/verify`
7. On success, user is redirected to `/dashboard`
8. Dashboard shows personalized greeting with email address

## Development

Frontend runs on port 5173 by default with Vite dev server:

```bash
cd frontend
npm run dev
```

### API Proxy Configuration

The frontend uses Vite's proxy configuration to route API calls to the backend:

```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

This allows frontend to call `/api/auth/request` which proxies to `http://localhost:5000/auth/request`.

## Key Dependencies

- **React Router DOM**: Client-side routing for authentication flow
- **Tailwind CSS**: Utility-first styling framework  
- **TypeScript**: Type safety for components and API calls
- **Vite**: Fast development server and build tool with proxy support
