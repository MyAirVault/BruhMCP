# Shared Instances Architecture

This document outlines the migration from dynamic service creation to shared instance architecture for MCP services.

## Overview

The shared instances architecture allows multiple users to access the same MCP service through unique instance URLs while maintaining complete isolation between users.

## Key Concepts

- **Static Services**: All MCP services start at server boot and run continuously
- **User Isolation**: Each user gets a unique instance URL for each service they use
- **Shared Resources**: Multiple users share the same service process but with isolated contexts
- **API Key Management**: Users authenticate per service with their own API credentials

## Architecture Benefits

1. **Performance**: No process startup delay - services always ready
2. **Resource Efficiency**: Shared processes reduce memory and CPU usage
3. **Scalability**: Can handle many users per service without spawning new processes
4. **Security**: Complete user isolation through instance-based authentication
5. **Reliability**: Services stay running, reducing failure points

## Documentation Structure

- `architecture-overview.md` - High-level architecture description
- `migration-plan.md` - Step-by-step migration guide from current system
- `technical-implementation.md` - Detailed implementation specifications
- `database-schema.md` - Database changes and new table structures
- `service-isolation.md` - User isolation patterns and security model
- `examples/` - Concrete examples using different services

## Quick Example: Figma Service

**Before**: User activates Figma → New process spawned on dynamic port  
**After**: User enters Figma API key → Gets unique URL to shared Figma service

User gets: `https://yourdomain.com/fig_user_a_abc123/figma/*`  
Service runs on: `localhost:49160` (static port from config)

## Next Steps

1. Review architecture overview
2. Plan migration timeline
3. Implement service registry
4. Update database schema
5. Deploy shared services via PM2