# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack web application with:

-   **Frontend**: Vite + TypeScript + React + Tailwind CSS (in `<project-root>/frontend/`)
-   **Backend**: Express + JSDoc with TypeScript compiler (in `<project-root>/backend/`)
-   **Database**: PostgreSQL

## Development Commands

### Frontend Commands (run from `/frontend/`)

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint with Prettier
```

### Backend Commands (run from `/backend/`)

```bash
npm run dev          # Start Express server with nodemon
npm run build        # Compile with TypeScript
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint with Prettier
```

### Database Commands

```bash
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
```

## Code Architecture

### Frontend Structure (`/frontend/`)

```
src/
├── components/      # React components (max 8 files per folder)
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── services/       # API service functions
└── styles/         # Global styles and Tailwind config
```

### Backend Structure (`/backend/`)

```
src/
├── routes/         # Express route handlers
├── controllers/    # Route controllers
├── services/      # Business logic
├── models/        # Database models
├── middleware/    # Express middleware
├── utils/         # Utility functions
├── types/         # TypeScript/JSDoc type definitions
└── db/            # Database configuration and migrations
```

## Development Rules

1. **Code Style**

    - Follow Prettier configuration
    - Use double newlines between sections
    - Add comments before each section explaining functionality
    - Maximum 240 lines per function
    - Maximum 8 files per folder before creating subfolders
    - Have one function per file, if u need more functions create another file following the directory structure.

2. **Programming Principles**

    - Follow DRY (Don't Repeat Yourself) principle
    - Use functional programming patterns
    - Create reusable functions

3. **Type Safety**

    - Run type checks before confirming any solution
    - Frontend: Use TypeScript strict mode
    - Backend: Use JSDoc annotations with TypeScript compiler

4. **Documentation**
    - All documentation goes in `<project-root>/documents/` folder
    - Update `<project-root>/documents/index.md` with brief descriptions of each document
    - Keep documentation synchronized with code changes
    - Look up existing documentation before implementing features
    - Always update the documentation first before implementing features.

## Project-Specific Guidelines

1. **API Communication**

    - Frontend communicates with backend via REST API
    - API endpoints follow RESTful conventions
    - Use environment variables for API URLs

2. **Database Access**

    - Use connection pooling for PostgreSQL
    - All database queries through parameterized statements
    - Migrations for schema changes

3. **Error Handling**

    - Comprehensive error handling in both frontend and backend
    - User-friendly error messages in frontend
    - Detailed error logging in backend

4. **Testing**
    - Write tests for critical business logic
    - Frontend: React Testing Library + Vitest
    - Backend: Jest for unit and integration tests
