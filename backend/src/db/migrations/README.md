# Database Migrations

## Migration Order

The migrations must be run in the following order:

1. **000_cleanup_old_tables.sql** - Removes any conflicting/old tables
2. **001_microsaas_auth.sql** - Creates the main authentication system (users, auth_tokens, subscriptions)
3. **002_mcp_tables.sql** - Creates MCP service registry and credential management tables
4. **003_token_audit_log.sql** - Adds OAuth token audit logging
5. **004_add_optimistic_locking.sql** - Adds version columns for optimistic locking
6. **005_add_user_plans_with_active_limits.sql** - Adds user subscription plans with instance limits
7. **006_add_billing_fields.sql** - Adds billing-related fields and webhook events
8. **007_add_user_billing_details.sql** - Adds user billing details table

## Table Structure

### From 001_microsaas_auth.sql (Core Auth System)
- `users` - Main user table with authentication (email, password, first_name, last_name, email_verified)
- `auth_tokens` - OTP, refresh tokens, password reset tokens
- `user_subscriptions` - User subscription management
- `subscription_transactions` - Payment tracking
- `account_credits` - Refunds and adjustments

### From 002_mcp_tables.sql (MCP System)
- `mcp_table` - MCP service registry
- `mcp_service_table` - User MCP instances
- `mcp_credentials` - OAuth/API credentials for instances

### From Other Migrations
- `token_audit_log` - OAuth token operation tracking
- `user_plans` - Subscription plans with instance limits
- `webhook_events` - Payment gateway webhooks
- `user_billing_details` - Billing addresses and card management

## Running Migrations

To run all migrations in order:

```bash
# From the backend directory
npm run db:migrate
```

To run a specific migration:

```bash
psql -U postgres -d bruhmcp -f src/db/migrations/001_microsaas_auth.sql
```

## Important Notes

1. **000_cleanup_old_tables.sql** should be run FIRST on existing databases to remove conflicts
2. The `users` table from 001 uses UUID primary keys and includes password authentication
3. All MCP tables reference the users table from 001
4. The system uses PostgreSQL-specific features (gen_random_uuid(), triggers, etc.)