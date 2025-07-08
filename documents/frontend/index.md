# Frontend Documentation

This directory contains documentation for the frontend components and pages of the MiniMCP application.

## Documents

-   [Authentication Verify Page](./verify-page.md) - Magic link verification page documentation

## Frontend Structure

The frontend is built with:

-   **Framework**: React + TypeScript + Vite
-   **Styling**: Tailwind CSS
-   **Location**: `/frontend/` directory

## Key Components

### Authentication Flow

-   Magic link verification component (`/frontend/src/pages/VerifyPage.tsx`)
-   React Router integration for `/verify` route
-   Auto-verification with JWT cookie setting
-   CORS-enabled API communication with backend

## Development

Frontend runs on port 5173 by default with Vite dev server:

```bash
cd frontend
npm run dev
```

Backend redirects `/verify` requests to frontend dev server for React Router handling.

## Key Dependencies

- **React Router DOM**: Client-side routing for `/verify` path
- **Tailwind CSS**: Utility-first styling framework  
- **TypeScript**: Type safety for components
- **Vite**: Fast development server and build tool
