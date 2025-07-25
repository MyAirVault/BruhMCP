# bruhMCP - Universal MCP Server Registry Platform

> A comprehensive full-stack platform for creating, managing, and hosting Model Context Protocol (MCP) servers with OAuth integration, payment processing, and multi-tenant architecture.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Overview

bruhMCP is a production-ready platform that allows users to create, configure, and manage MCP (Model Context Protocol) servers for various third-party services like Gmail, Google Drive, Slack, Notion, Reddit, and more. The platform provides OAuth authentication, credential management, instance monitoring, and a subscription-based pricing model.

### ✨ Key Features

- **🔌 Universal MCP Server Support** - Pre-built integrations for 20+ popular services
- **🔐 OAuth 2.0 Authentication** - Secure credential management with automatic token refresh
- **💳 Subscription Management** - Razorpay integration with free and pro plans
- **📊 Real-time Monitoring** - Instance health monitoring, logging, and analytics
- **🏗️ Multi-tenant Architecture** - Isolated user environments with resource limits
- **⚡ High Performance** - Circuit breakers, connection pooling, and caching
- **🛡️ Enterprise Security** - Comprehensive audit logging and credential encryption

### 🎯 Supported Services

| Service | Type | Authentication | Status |
|---------|------|----------------|--------|
| Gmail | Email | OAuth 2.0 | ✅ Production Ready |
| Google Drive | Storage | OAuth 2.0 | ✅ Production Ready |
| Google Sheets | Spreadsheet | OAuth 2.0 | ✅ Production Ready |
| Slack | Communication | OAuth 2.0 | ✅ Production Ready |
| Notion | Documentation | OAuth 2.0 | ✅ Production Ready |
| Reddit | Social | OAuth 2.0 | ✅ Production Ready |
| Dropbox | Storage | OAuth 2.0 | ✅ Production Ready |
| Figma | Design | API Key | ✅ Production Ready |
| Airtable | Database | API Key | ✅ Production Ready |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React +      │◄──►│   (Express +    │◄──►│   (PostgreSQL)  │
│   TypeScript)   │    │   Node.js)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  MCP Servers    │
                    │  (Individual    │
                    │   Services)     │
                    └─────────────────┘
```

### 📁 Project Structure

```
bruhMCP/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API service functions
│   │   └── types/          # TypeScript definitions
├── backend/                 # Express + Node.js backend
│   ├── src/
│   │   ├── mcp-servers/    # Individual MCP server implementations
│   │   ├── controllers/    # API route controllers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   └── db/            # Database queries and migrations
└── documents/              # Comprehensive documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bruhMCP.git
cd bruhMCP
```

### 2. Database Setup

```bash
# Install PostgreSQL and create database
createdb bruhMCP

# Run migrations
cd backend
npm install
npm run db:migrate
```

### 3. Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bruhMCP
DB_USER=postgres
DB_PASSWORD=your_password

# Local Development (Disable payments, enable pro features)
DISABLE_PAYMENTS=true
NODE_ENV=development

# JWT
JWT_SECRET=your_secure_jwt_secret

# SMTP (for magic links)
SMTP_HOST=your_smtp_host
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

### 4. Start Backend

```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:5000`

### 5. Frontend Configuration

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

### 6. Access the Application

Open your browser and navigate to `http://localhost:5173`

## 🛠️ Development

### Local Development Features

With `DISABLE_PAYMENTS=true` in your `.env`:

- ✅ **Unlimited MCP instances** for all users
- ✅ **No payment enforcement** - all users get pro features
- ✅ **Disabled plan monitoring** - no automatic downgrades
- ✅ **Skip OAuth setup** for development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server with nodemon
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint with Prettier
npm run db:migrate   # Run database migrations
```

#### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint with Prettier
```

### Creating New MCP Servers

Follow our comprehensive templates:

- **[OAuth-based Services](documents/mcp-template/oauth-based.md)** - For services requiring OAuth 2.0
- **[API Key-based Services](documents/mcp-template/apikey-based.md)** - For services using API keys

## 🚀 Production Deployment

### Environment Configuration

```bash
# Production settings
DISABLE_PAYMENTS=false
NODE_ENV=production

# Database
DB_HOST=your_production_db_host
DB_NAME=your_production_db

# Payment Processing (Razorpay)
RAZORPAY_KEY_ID=your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# URLs
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com
```

### Deployment Steps

1. **Configure Production Environment**
   ```bash
   cp .env.example .env.production
   # Edit with production values
   ```

2. **Build Applications**
   ```bash
   cd backend && npm run build
   cd frontend && npm run build
   ```

3. **Deploy to your preferred platform**
   - Vercel, Netlify (Frontend)
   - Railway, Heroku, DigitalOcean (Backend)
   - AWS RDS, DigitalOcean (Database)

## 💰 Subscription Plans

| Feature | Free Plan | Pro Plan |
|---------|-----------|----------|
| Active MCP Instances | 1 | Unlimited |
| OAuth Integrations | ✅ | ✅ |
| API Access | ✅ | ✅ |
| Priority Support | ❌ | ✅ |
| Advanced Features | ❌ | ✅ |
| **Price** | Free | ₹999/month |

## 🔧 Configuration

### OAuth Service Setup

Each MCP server requires OAuth application setup:

1. **Google Services** (Gmail, Drive, Sheets)
   - Create project in Google Cloud Console
   - Enable APIs and configure OAuth consent screen
   - Add redirect URIs

2. **Slack**
   - Create Slack App in your workspace
   - Configure OAuth scopes and redirect URIs

3. **Other Services**
   - Follow service-specific OAuth setup guides
   - Configure redirect URIs pointing to your backend

### Webhook Configuration

Configure webhooks for payment processing:

```bash
# Razorpay webhook endpoint
POST /api/billing/webhook

# Required events:
- subscription.activated
- subscription.cancelled
- payment.failed
```

## 📚 Documentation

Comprehensive documentation is available in the `/documents` folder:

- **[Complete Project Structure](documents/project-structure/complete-project-structure.md)**
- **[OAuth MCP Servers](documents/project-structure/oauth-mcp-servers.md)**
- **[Database Architecture](documents/project-structure/database-architecture.md)**
- **[Local Development Guide](documents/project-structure/local-development.md)**
- **[Logging and Monitoring](documents/project-structure/logging-and-monitoring.md)**

## 🛡️ Security Features

- **OAuth 2.0 Implementation** - Secure token management with automatic refresh
- **Credential Encryption** - Database-level encryption for sensitive data
- **Audit Logging** - Comprehensive logging for all user actions
- **Rate Limiting** - Protection against API abuse
- **Circuit Breakers** - Automatic failover for external service issues
- **Input Validation** - Comprehensive request validation and sanitization

## 🔍 Monitoring & Observability

- **Real-time Instance Health** - Monitor MCP server status and performance
- **Audit Trails** - Complete history of user actions and system events
- **Performance Metrics** - Response times, error rates, and usage statistics
- **Plan Monitoring** - Automatic subscription management and enforcement

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation for significant changes
- Ensure TypeScript compilation passes
- Run linting before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [/documents](documents/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/bruhMCP/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bruhMCP/discussions)

## 🙏 Acknowledgments

- **[Model Context Protocol](https://modelcontextprotocol.io/)** - The underlying protocol
- **[Anthropic](https://anthropic.com/)** - MCP specification and tools
- **Open Source Community** - For the amazing tools and libraries

---

**Built with ❤️ for the MCP community**

[🌟 Star this repo](https://github.com/yourusername/bruhMCP) if you find it useful!