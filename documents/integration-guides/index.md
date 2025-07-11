# Integration Guides

This directory contains step-by-step guides for integrating new services and features into the MCP system.

## Available Guides

### Service Integration
- **[Adding New MCP Service](./adding-new-mcp-service.md)** - Complete step-by-step guide for non-technical users to add new services using API documentation. No coding knowledge required.
- **[API to MCP Mapping Guide](./api-to-mcp-mapping-guide.md)** - Comprehensive technical guide for mapping REST API endpoints to MCP tools and resources, including GET, POST, PUT, DELETE operations.
- **[Logging Implementation Examples](./logging-implementation-examples.md)** - **NEW** - Detailed examples of proper logging implementation for all API operations, with templates for GET, POST, PUT, DELETE, and advanced scenarios.

## Guide Categories

### For Non-Technical Users
- **Adding New MCP Service** - Walk through the entire process of adding a service using just API documentation and the web interface

### For Technical Users
- **API to MCP Mapping Guide** - Detailed technical guide for properly mapping API endpoints to MCP tools and resources, covering all HTTP methods
- **Logging Implementation Examples** - Comprehensive logging templates and examples for all API operations, ensuring proper access and error logging
- Additional implementation guides available in the `/backend/` documentation folder

## Quick Reference

### What You Need to Add a Service
1. API documentation for the service
2. Test credentials (API key, token, etc.)
3. Service basic information (name, description, icon)
4. About 30-60 minutes to complete the process

### Common Service Types
- **Communication**: Slack, Discord, Teams, Telegram
- **Productivity**: Notion, Trello, Asana, Todoist
- **Development**: GitHub, GitLab, Jira, Jenkins
- **Design**: Figma, Sketch, Adobe Creative Cloud
- **Marketing**: HubSpot, Mailchimp, Google Analytics
- **Finance**: Stripe, PayPal, QuickBooks
- **Storage**: Google Drive, Dropbox, AWS S3

### Support
If you encounter issues while following these guides:
1. Check the troubleshooting section in each guide
2. Review the examples provided
3. Consult the technical documentation in `/backend/`
4. Contact the development team for assistance

---

*Last updated: 2025-07-11*