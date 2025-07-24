# Complete Project Structure - MCP Registry Application

## Project Overview

Full-stack MCP (Model Context Protocol) Registry and Management System enabling users to register, manage, and integrate with various MCP servers through OAuth and API key authentication.

**Technology Stack:**

-   Frontend: Vite + TypeScript + React + Tailwind CSS
-   Backend: Express + JSDoc with TypeScript compiler
-   Database: PostgreSQL
-   Process Management: PM2 ecosystem

## Root Level Files

### Configuration Files

-   **CLAUDE.md** - Project documentation and development guidelines for Claude Code
-   **nginx.conf** - Nginx reverse proxy configuration for production deployment
-   **nginx-site.conf** - Site-specific Nginx configuration with SSL and routing
-   **new-plan.txt** - Planning document for future development roadmap

### Documentation Directory (`/documents/`)

-   **index.md** - Documentation index with links to architecture guides
-   **project-structure/** - Detailed architectural documentation
    -   **oauth-mcp-servers.md** - OAuth-based MCP server implementation guide
    -   **apikey-based-mcp-servers.md** - API key MCP server implementation guide
    -   **mcp-auth-registry.md** - Central authentication registry documentation
    -   **database-architecture.md** - Database schema and integration patterns

### Port Configuration (`/mcp-ports/`)

Contains 200+ service configurations for future MCP integrations with port mapping and service metadata. Each service includes SVG icons for UI display covering major platforms (Google, Microsoft, Slack, GitHub, Discord, etc.).

## Backend Architecture (`/backend/`)

### Core Server Files

-   **src/index.js** - Main Express application with middleware, security, routing, startup logic
-   **package.json** - Dependencies: Express, TypeScript, PostgreSQL, OAuth libraries, testing frameworks
-   **tsconfig.json** - TypeScript configuration with strict type checking and ES2022 modules
-   **ecosystem.config.js** - PM2 process manager configuration for 8 MCP services
-   **nodemon.json** - Development server configuration for hot reloading with TypeScript

### Database Layer (`/src/db/`)

#### Core Configuration

-   **config.js** - PostgreSQL connection pool configuration and database initialization

#### Migration System (`/migrations/`)

-   **002_separate_credentials_table.sql** - Core schema: users, mcp_table, mcp_service_table, mcp_credentials
-   **003_token_audit_log.sql** - OAuth token auditing and security tracking system
-   **004_add_optimistic_locking.sql** - Concurrency control for data integrity protection
-   **005_add_user_plans_with_active_limits.sql** - Subscription plans and usage limits
-   **006_add_billing_fields.sql** - Payment processing and billing integration fields
-   **007_add_user_billing_details.sql** - Extended billing information storage

#### Query Layer (`/src/db/queries/`)

-   **apiKeysQueries.js** - API key CRUD operations, validation, encryption
-   **billingDetailsQueries.js** - User billing information management and history
-   **userQueries.js** - User account management, profile updates, authentication
-   **userPlansQueries.js** - Subscription plan management, upgrades, downgrades
-   **mcpTypesQueries.js** - MCP service type definitions and metadata

#### MCP Instance Queries (`/src/db/queries/mcpInstances/`)

-   **audit.js** - Usage tracking, activity logging, compliance auditing
-   **creation.js** - Instance creation, initialization, configuration setup
-   **crud.js** - Basic create, read, update, delete operations
-   **maintenance.js** - Instance maintenance, cleanup, optimization
-   **oauth.js** - OAuth flow management, token storage, refresh handling
-   **statistics.js** - Usage analytics, performance metrics, reporting
-   **status.js** - Instance status management, health monitoring
-   **types.js** - Type definitions, validation schemas, constants

### API Layer

#### Controllers (`/src/controllers/`)

-   **authController.js** - Magic link authentication, JWT token management, session handling

#### API Key Management (`/src/controllers/apiKeys/`)

-   **getAPIKeys.js** - Retrieve user API keys with encryption/decryption
-   **storeAPIKey.js** - Create new API keys with validation and secure storage
-   **deleteAPIKey.js** - Remove API keys with audit trail
-   **schemas.js** - Validation schemas for API key operations

#### MCP Instance Controllers (`/src/controllers/mcpInstances/`)

-   **crud/** - Complete CRUD operations with validation and error handling
-   **editing/** - Instance modification, configuration updates, status changes
-   **lifecycle/** - Instance creation, activation, deactivation, deletion flows
-   **logging/** - Instance activity logging, audit trails, debugging
-   **utils.js** - Shared utilities for instance operations

#### MCP Type Controllers (`/src/controllers/mcpTypes/`)

-   **getMCPTypes.js** - List available MCP services with metadata and icons
-   **getMCPTypeByName.js** - Get specific service details, configuration requirements

#### Routes (`/src/routes/`)

-   **authRoutes.js** - Authentication endpoints: magic link generation, verification, logout
-   **apiKeysRoutes.js** - API key management endpoints with CRUD operations
-   **mcpInstancesRoutes.js** - MCP instance management endpoints with lifecycle operations
-   **mcpTypesRoutes.js** - MCP service type discovery and information endpoints
-   **billingDetailsRoutes.js** - User billing management, payment methods, subscription updates

#### Middleware (`/src/middleware/`)

-   **authMiddleware.js** - JWT token validation, user authentication, session management
-   **mcpAccessControl.js** - Permission-based access control for MCP operations
-   **mcpLoggingMiddleware.js** - Request/response logging for MCP operations and debugging

### Services Layer (`/src/services/`)

#### Core Services

-   **authService.js** - User authentication logic, magic link generation and validation
-   **cacheInvalidationService.js** - Cache management, invalidation strategies, consistency
-   **emailService.js** - Email delivery using Nodemailer with templates and tracking
-   **expirationMonitor.js** - Automated instance expiration monitoring and cleanup
-   **planExpirationAgent.js** - Subscription plan expiration management and notifications
-   **planMonitoringService.js** - Real-time plan usage monitoring and limit enforcement

#### Logging System (`/src/services/logging/`)

-   **loggingService.js** - Centralized logging with Winston, structured logging patterns
-   **logMaintenanceService.js** - Log rotation, archival, cleanup, storage optimization
-   **systemLogger.js** - System-level event logging, performance monitoring

#### MCP Authentication Registry (`/src/services/mcp-auth-registry/`)

-   **core/registry.js** - Service registration, discovery, metadata management
-   **core/serviceDiscovery.js** - Automatic service detection and configuration loading
-   **core/serviceLoader.js** - Dynamic service loading, dependency injection
-   **routes/authRoutes.js** - Registry API endpoints for service authentication
-   **types/** - TypeScript definitions for registry system and service interfaces

#### Validation Services (`/src/services/validation/`)

-   **baseValidator.js** - Common validation patterns, error handling, sanitization utilities

### Billing System (`/src/billing/`)

#### Billing Controllers (`/src/billing/controllers/`)

-   **checkoutController.js** - Payment processing with Razorpay integration, order management
-   **savedCardsController.js** - Saved payment method management, tokenization
-   **webhookController.js** - Payment webhook handling, verification, order updates

#### Supporting Files

-   **services/paymentGateway.js** - Payment gateway abstraction layer, provider switching
-   **middleware/webhookValidation.js** - Webhook signature verification, security validation
-   **routes/billingRoutes.js** - Billing API endpoints, payment flows, subscription management

### Utilities (`/src/utils/`)

-   **circuitBreaker.js** - Circuit breaker pattern for external API resilience
-   **connectionPool.js** - Database connection pooling management and optimization
-   **deletionAudit.js** - Audit trail for data deletion operations and compliance
-   **errorResponse.js** - Standardized error response formatting across APIs
-   **jwt.js** - JWT token creation, validation, refresh utilities
-   **logDirectoryManager.js** - Log file organization, directory management, cleanup
-   **mcpInstanceLogger.js** - MCP-specific logging functionality and formatting
-   **planLimits.js** - Subscription plan limit enforcement and validation
-   **rateLimiter.js** - API rate limiting implementation, abuse prevention

### Templates & Types

-   **templates/magicLinkEmail.js** - HTML email template for magic link authentication
-   **types/** - TypeScript definitions:
    -   **auth.d.ts** - Authentication interfaces, token types, session management
    -   **billing.d.ts** - Billing, payment, subscription type definitions
    -   **database.d.ts** - Database schema types, query interfaces
    -   **express.d.ts** - Express.js extensions, custom middleware types
    -   **figma.d.ts** - Figma service-specific types and API interfaces

## Frontend Architecture (`/frontend/`)

### Core Application

-   **src/main.tsx** - React application entry point with error boundaries
-   **src/App.tsx** - Main application component with routing and state management
-   **package.json** - Dependencies: React 19, TypeScript, Vite, Tailwind CSS, testing libraries
-   **vite.config.ts** - Vite configuration with proxy setup for backend API communication
-   **tsconfig.json** - TypeScript configuration for React application with strict settings

### Component Architecture (`/src/components/`)

#### Core Components

-   **ReAuthModal.tsx** - Re-authentication modal for expired sessions and security

#### Billing Components (`/src/components/billing/`)

-   **BillingCheckoutFlow.tsx** - Complete checkout process flow with error handling
-   **BillingInfoForm.tsx** - Billing information collection form with validation
-   **CheckoutPage.tsx** - Payment processing page with Razorpay integration
-   **PlanDisplay.tsx** - Subscription plan display with features and pricing
-   **UpgradeButton.tsx** - Plan upgrade interface with confirmation flows
-   **index.ts** - Billing component exports and type definitions

#### Dashboard Components (`/src/components/dashboard/`)

-   **DashboardContent.tsx** - Main dashboard content area with MCP instance grid
-   **DashboardEmptyState.tsx** - Empty state display when no instances exist
-   **DashboardHeader.tsx** - Dashboard navigation, search, filtering, actions
-   **types.ts** - Dashboard-specific type definitions and interfaces
-   **useDashboardActions.ts** - Dashboard action hooks for CRUD operations
-   **useDashboardKeyboardShortcuts.ts** - Keyboard navigation and shortcuts
-   **useDashboardState.ts** - Dashboard state management and data fetching

#### Layout Components (`/src/components/layout/`)

-   **Footer.tsx** - Application footer with links and branding
-   **Header.tsx** - Application header with navigation, user menu, notifications
-   **Layout.tsx** - Main layout wrapper with responsive design

#### Logs Components (`/src/components/logs/`)

-   **LogsCard.tsx** - Individual log entry display with syntax highlighting
-   **LogsDisplay.tsx** - Log visualization, filtering, search functionality
-   **LogsFilters.tsx** - Log filtering controls by type, date, user, service
-   **LogsHeader.tsx** - Logs page header with export and refresh options
-   **LogsTable.tsx** - Tabular log display with sorting and pagination
-   **LogsTableRow.tsx** - Individual log row component with expandable details
-   **hooks.ts** - Logs-specific React hooks for data fetching and state
-   **types.ts** - Log data types, filter interfaces, display options
-   **utils.ts** - Log processing utilities, formatting, parsing

#### MCP Components (`/src/components/mcp/`)

-   **MCPCard.tsx** - Individual MCP instance card with status, actions, metrics
-   **MCPSection.tsx** - Grouped MCP instance sections by service type

#### Modal Components (`/src/components/modals/`)

-   **CancelSubscriptionModal.tsx** - Subscription cancellation flow with confirmation
-   **ConfirmationModal.tsx** - Generic confirmation dialogs with customizable actions
-   **CopyURLModal.tsx** - MCP URL copying interface with format options
-   **CreateMCPModal.tsx** - New MCP instance creation with form validation
-   **EditMCPModal.tsx** - MCP instance editing with real-time validation
-   **MagicLinkPopup.tsx** - Magic link authentication status and instructions
-   **PlanLimitModal.tsx** - Plan limit notification with upgrade options
-   **SavePopup.tsx** - Save operation feedback with success/error states

#### Profile Components (`/src/components/profile/`)

-   **MCPStatisticsCard.tsx** - User MCP usage statistics, charts, analytics
-   **NotificationSettingsCard.tsx** - User notification preferences management
-   **PersonalInformationCard.tsx** - User profile information editing
-   **ProfileHeader.tsx** - Profile page header with avatar and basic info
-   **useProfileData.ts** - Profile data management hook with caching

#### UI Components (`/src/components/ui/`)

-   **ConfirmationModal.tsx** - Reusable confirmation modal with theming
-   **CountryDropdown.tsx** - Country selection dropdown with search and flags
-   **CustomDropdown.tsx** - Generic dropdown component with keyboard navigation
-   **Dropdown.tsx** - Basic dropdown implementation with accessibility
-   **KeyboardShortcuts.tsx** - Keyboard shortcut display modal with help
-   **StatusBadge.tsx** - Status indicator component with color coding
-   **Tooltip.tsx** - Tooltip implementation with positioning and animations

#### Form Components (`/src/components/ui/form/`)

-   **CredentialFields.tsx** - Credential input fields with encryption indicators
-   **ExpirationDropdown.tsx** - Instance expiration time selection
-   **FormField.tsx** - Generic form field wrapper with validation display
-   **TypeDropdown.tsx** - MCP service type selection with icons and descriptions
-   **ValidationFeedback.tsx** - Form validation display with error messages

### Pages (`/src/pages/`)

-   **LoginPage.tsx** - Magic link authentication page with email input
-   **VerifyPage.tsx** - Magic link verification page with status feedback
-   **Dashboard.tsx** - Main dashboard with MCP instances, search, filtering
-   **Profile.tsx** - User profile management and settings
-   **Billing.tsx** - Billing information and subscription management
-   **Checkout.tsx** - Payment processing page with secure forms
-   **PaymentSuccess.tsx** - Payment confirmation page with next steps
-   **Logs.tsx** - System and instance logs display with advanced filtering

### Hooks (`/src/hooks/`)

-   **useAuth.ts** - Authentication state management with auto-refresh
-   **useCreateMCPForm.ts** - MCP instance creation form logic with validation
-   **useEditMCPForm.ts** - MCP instance editing form logic with change tracking
-   **useDropdown.ts** - Dropdown component state management and keyboard navigation
-   **useInstanceStatus.ts** - MCP instance status monitoring with real-time updates

### Services (`/src/services/`)

-   **apiService.ts** - Core API communication with backend, error handling, retries
-   **authService.ts** - Authentication service integration with token management
-   **billingDetailsService.ts** - Billing information management and payment processing
-   **logsService.ts** - Log data retrieval, processing, filtering, export

### Types (`/src/types/`)

-   **index.ts** - Main type definitions, interfaces, enums for application
-   **billing.ts** - Billing, payment, subscription type definitions
-   **createMCPModal.ts** - MCP creation modal types and form interfaces
-   **profile.ts** - User profile types, settings, preferences

### Utilities (`/src/utils/`)

-   **authTest.ts** - Authentication testing utilities for development
-   **dateHelpers.ts** - Date formatting, manipulation, timezone handling
-   **dropdownHelpers.ts** - Dropdown component utilities and data processing
-   **dropdownUtils.ts** - Additional dropdown utilities for search and filtering
-   **mcpHelpers.ts** - MCP-specific helper functions for data transformation
-   **mcpValidation.ts** - MCP data validation, sanitization, type checking

### Configuration & Assets

-   **src/constants/expirationOptions.ts** - Instance expiration time options configuration
-   **src/assets/** - Static assets including React logo and service icons
-   **src/vite-env.d.ts** - Vite environment type definitions
-   **src/index.css** - Global styles and Tailwind CSS imports
-   **src/App.css** - Application-specific styles and component overrides

## System Infrastructure

### Process Management

-   **PM2 Ecosystem Configuration** - Manages 8 MCP services as separate processes
-   **Service Port Allocation** - Each MCP service runs on dedicated ports (49171-49491)
-   **Auto-restart Policies** - Services automatically restart on failure with exponential backoff
-   **Memory Limits** - 200MB memory limit per service with monitoring

### Logging Architecture

-   **Winston Logging Framework** - Structured logging with daily rotation and compression
-   **Categorized Log Types** - Application, audit, cache, database, performance, security logs
-   **User-specific Logging** - Individual user activity tracking and compliance
-   **Automated Maintenance** - Log cleanup, archival, and storage optimization

### Security Implementation

-   **Magic Link Authentication** - Passwordless login system with time-limited tokens
-   **JWT Token Management** - Secure session management with refresh token rotation
-   **OAuth 2.0 Integration** - Third-party service authentication with PKCE support
-   **Rate Limiting** - API abuse prevention with user-specific quotas
-   **CORS Protection** - Cross-origin request security with whitelist management
-   **Security Headers** - Helmet.js implementation with CSP and security policies
-   **Circuit Breaker Pattern** - External API failure protection and graceful degradation

## Key System Features

### User Management System

-   Passwordless authentication using magic links sent via email
-   Comprehensive user profiles with billing and subscription information
-   Multi-tier subscription plan management with usage-based limitations
-   Real-time usage tracking and analytics dashboard

### MCP Instance Management

-   Support for 10+ different service integrations (Gmail, GitHub, Slack, etc.)
-   Dual authentication methods: OAuth 2.0 and API key based
-   Complete instance lifecycle management (creation, activation, monitoring, deletion)
-   Custom instance naming, organization, and metadata management
-   Real-time usage statistics and performance monitoring

### Billing & Subscription System

-   Razorpay payment gateway integration with multiple payment methods
-   Tiered subscription plans with feature and usage limitations
-   Automated usage monitoring and limit enforcement
-   Saved payment method management with tokenization
-   Webhook-based payment verification and subscription updates

### Developer Experience

-   Full TypeScript implementation across frontend and backend
-   Comprehensive ESLint and Prettier configuration for code quality
-   Hot reloading in development with TypeScript compilation
-   Extensive error handling with standardized error responses
-   Detailed logging, monitoring, and debugging capabilities
-   Comprehensive API documentation and type definitions
