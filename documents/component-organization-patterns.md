# Component Organization Patterns

This document outlines the component organization patterns implemented in the MiniMCP codebase to comply with CLAUDE.md rules.

## Overview

The MiniMCP project follows a strict component organization pattern that ensures:
- **Maximum 8 files per folder** (CLAUDE.md compliance)
- **Single responsibility** per component/module
- **Logical grouping** by feature domain
- **Clear separation** of concerns between components, hooks, and utilities

## Frontend Organization Patterns

### Component Directory Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components (7 files)
│   ├── layout/             # Layout components (3 files)
│   ├── logs/               # Logs page components (8 files)
│   ├── mcp/                # MCP-related components (2 files)
│   ├── modals/             # Modal components (5 files)
│   └── ui/                 # Reusable UI components (5 files + 1 subfolder)
│       └── form/           # Form-specific components (5 files)
├── hooks/                  # Custom React hooks (3 files)
├── utils/                  # Utility functions (4 files)
├── types/                  # Type definitions (2 files)
├── services/               # API services (2 files)
└── pages/                  # Page components (5 files)
```

### Organization Principles

#### 1. Domain-Based Grouping
Components are organized by their primary domain or feature:
- **`dashboard/`** - All dashboard-related components
- **`logs/`** - All log viewing and management components
- **`mcp/`** - MCP instance display components
- **`modals/`** - All modal/dialog components
- **`ui/`** - Reusable UI components that can be used across domains

#### 2. Functional Separation
Each directory contains components with related functionality:
- **`hooks/`** - Custom React hooks for state management and logic
- **`utils/`** - Pure utility functions with no React dependencies
- **`types/`** - TypeScript type definitions
- **`services/`** - API service functions and external integrations

#### 3. File Naming Conventions
- **Components**: PascalCase with descriptive names (e.g., `DashboardHeader.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useDashboardState.ts`)
- **Utilities**: camelCase with descriptive names (e.g., `dropdownHelpers.ts`)
- **Types**: camelCase with descriptive names (e.g., `createMCPModal.ts`)

### Component Splitting Strategy

When components exceed 240 lines or become too complex, they are split using these patterns:

#### 1. Feature-Based Splitting
Large components are split by feature areas:
- **Dashboard** → `DashboardHeader`, `DashboardContent`, `DashboardEmptyState`
- **Logs** → `LogsHeader`, `LogsFilters`, `LogsTable`, `LogsDisplay`
- **CreateMCPModal** → Modal remains intact, but form logic moved to hooks and utilities

#### 2. Responsibility-Based Splitting
Components are split by their primary responsibility:
- **State Management** → Custom hooks (e.g., `useDashboardState.ts`)
- **Event Handling** → Action hooks (e.g., `useDashboardActions.ts`)
- **Business Logic** → Utility functions (e.g., `mcpHelpers.ts`)
- **UI Rendering** → Focused components (e.g., `StatusBadge.tsx`)

#### 3. Reusability-Based Splitting
Reusable elements are extracted to the `ui/` directory:
- **Form Components** → `ui/form/` subdirectory
- **Status Displays** → `StatusBadge.tsx`
- **Interactive Elements** → `Tooltip.tsx`, `Dropdown.tsx`

### Index File Pattern

Each component directory includes an `index.ts` file for clean imports:

```typescript
// components/logs/index.ts
export { LogsDisplay } from './LogsDisplay';
export { LogsFilters } from './LogsFilters';
export { LogsTable } from './LogsTable';
export { LogsHeader } from './LogsHeader';
export * from './types';
```

This allows for clean imports in parent components:
```typescript
import { LogsDisplay, LogsFilters } from '../components/logs';
```

## Backend Organization Patterns

### Controller Directory Structure

```
src/
├── controllers/
│   ├── apiKeys/            # API key management (5 files)
│   ├── mcpInstances/       # MCP instance management (8 files in 3 subdirs)
│   │   ├── crud/           # CRUD operations (5 files)
│   │   ├── logs/           # Log management (2 files)
│   │   └── operations/     # MCP operations (2 files)
│   ├── mcpTypes/           # MCP type management (2 files)
│   └── authController.js   # Authentication controller (1 file)
├── db/                     # Database operations
│   ├── mcp-instances/      # MCP instance queries (5 files)
│   ├── mcp-types/          # MCP type queries (9 files)
│   └── [legacy files]      # Legacy query files
├── services/               # Business logic services
│   ├── process/            # Process management (3 files)
│   └── [service files]     # Individual service files
└── mcp-servers/            # MCP server implementation
    ├── config/             # Server configuration (1 file)
    ├── handlers/           # Request handlers (3 files)
    ├── routes/             # MCP routing (1 file)
    └── utils/              # Server utilities (1 file)
```

### Backend Organization Principles

#### 1. Layer-Based Organization
- **Controllers** - Request handling and validation
- **Services** - Business logic and orchestration
- **Database** - Data persistence and queries
- **Routes** - API endpoint definitions

#### 2. Domain-Based Grouping
Within each layer, files are grouped by domain:
- **`apiKeys/`** - API key management functionality
- **`mcpInstances/`** - MCP instance management with CRUD/logs/operations split
- **`mcpTypes/`** - MCP type management functionality

#### 3. Operation-Based Subdivision
Large domains are subdivided by operation type:
- **`crud/`** - Create, Read, Update, Delete operations
- **`logs/`** - Log management and export operations
- **`operations/`** - Business operations like toggle and renew

## File Size and Complexity Guidelines

### Component Size Limits
- **Maximum 240 lines** per component function
- **Maximum 8 files** per directory
- **Single responsibility** per component

### When to Split Components

#### Size-Based Triggers
- Component exceeds 240 lines
- Component handles multiple distinct responsibilities
- Component contains complex state management logic

#### Complexity-Based Triggers
- Component manages multiple pieces of state
- Component handles multiple event types
- Component contains business logic that could be reused

### Splitting Strategies

#### 1. Extract Custom Hooks
Move state management and effects to custom hooks:
```typescript
// Before: Large component with state management
const Dashboard = () => {
  const [mcps, setMcps] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... more state and effects
};

// After: Split into component and hook
const useDashboardState = () => {
  const [mcps, setMcps] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... state management logic
  return { mcps, loading, /* ... */ };
};

const Dashboard = () => {
  const { mcps, loading } = useDashboardState();
  // ... render logic only
};
```

#### 2. Extract Utility Functions
Move pure logic to utility functions:
```typescript
// Before: Business logic in component
const processData = (data) => {
  // Complex data processing
};

// After: Extract to utility file
// utils/dataProcessing.ts
export const processData = (data) => {
  // Complex data processing
};
```

#### 3. Extract Child Components
Break down UI into smaller, focused components:
```typescript
// Before: Large render method
const Dashboard = () => {
  return (
    <div>
      {/* Header section */}
      {/* Content section */}
      {/* Footer section */}
    </div>
  );
};

// After: Split into focused components
const DashboardHeader = () => { /* ... */ };
const DashboardContent = () => { /* ... */ };
const DashboardFooter = () => { /* ... */ };

const Dashboard = () => {
  return (
    <div>
      <DashboardHeader />
      <DashboardContent />
      <DashboardFooter />
    </div>
  );
};
```

## Benefits of This Organization

### 1. Maintainability
- **Easy to locate** specific functionality
- **Clear boundaries** between components
- **Simplified testing** with focused components

### 2. Reusability
- **Shared components** in `ui/` directory
- **Reusable hooks** for common patterns
- **Utility functions** for common operations

### 3. Scalability
- **Room for growth** within each directory
- **Clear patterns** for adding new features
- **Consistent structure** across the application

### 4. Team Collaboration
- **Clear ownership** of components
- **Predictable locations** for functionality
- **Consistent patterns** for all developers

## Migration Strategy

When refactoring existing code to follow these patterns:

1. **Identify large components** that exceed size limits
2. **Analyze component responsibilities** and split accordingly
3. **Extract reusable elements** to appropriate directories
4. **Update imports** to use new component locations
5. **Test thoroughly** to ensure functionality is preserved

This organization pattern ensures the codebase remains maintainable, scalable, and compliant with CLAUDE.md rules while providing clear guidance for future development.