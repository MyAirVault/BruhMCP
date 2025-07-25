# Local Development Configuration

This document explains how to configure the application for local development, particularly for disabling payments and enabling pro plan features.

## Environment Configuration

### Local Development Settings

For local development, you can disable payment enforcement and give all users unlimited MCP instances by setting the following environment variable:

```bash
DISABLE_PAYMENTS=true
NODE_ENV=development
```

### Environment Variables

Add these to your local `.env` file:

```bash
# Local Development Settings
DISABLE_PAYMENTS=true
NODE_ENV=development

# Other required settings
PORT=5000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
PUBLIC_DOMAIN=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

## What This Enables

When `DISABLE_PAYMENTS=true` is set in development environment:

### 🚀 Pro Plan Features for All Users
- **Unlimited MCP instances** - All users can create as many instances as needed
- **No payment enforcement** - Users act like they have Pro plans
- **No subscription limits** - Bypass all plan restrictions

### 🛑 Disabled Services
- **Plan monitoring service** - Won't auto-start to monitor/expire plans
- **Subscription expiration** - Plans won't be automatically downgraded
- **Instance limits** - Free plan restrictions are bypassed

## Code Implementation

### Plan Limits (`/backend/src/utils/planLimits.js`)

The system includes helper functions to detect local development:

```javascript
/**
 * Check if payments are disabled in local development
 * @returns {boolean} True if payments are disabled
 */
export function isPaymentsDisabled() {
    return process.env.DISABLE_PAYMENTS === 'true' && 
           (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local');
}
```

Instance limits are bypassed:

```javascript
export function getInstanceLimitForPlan(planType) {
    // In local environment with payments disabled, give unlimited instances
    if (isPaymentsDisabled()) {
        return null; // unlimited
    }
    
    const plan = PLAN_LIMITS[planType];
    return plan ? plan.max_instances : PLAN_LIMITS.free.max_instances;
}
```

### Plan Monitoring Service (`/backend/src/services/planMonitoringService.js`)

The plan monitoring service is automatically disabled in local development:

```javascript
// Skip auto-start in local development with payments disabled
const skipInLocalDev = isPaymentsDisabled();

if (autoStartEnabled && !skipInLocalDev) {
    // Start monitoring service
    planMonitoringService.start(checkInterval);
} else if (skipInLocalDev) {
    console.log('🚫 Plan Monitoring Service disabled in local development (DISABLE_PAYMENTS=true)');
}
```

## Production vs Development

### Local Development
```bash
DISABLE_PAYMENTS=true
NODE_ENV=development
```
**Result:** All users get unlimited instances, no payment enforcement

### Production
```bash
DISABLE_PAYMENTS=false  # or omit entirely
NODE_ENV=production
```
**Result:** Normal plan enforcement (free=1 instance, pro=unlimited)

## Benefits for Development

### 🧪 Testing
- Test with multiple MCP instances without payment setup
- Focus on core functionality rather than billing logic
- Easier integration testing

### ⚡ Speed
- No need to configure Razorpay for local development
- Skip payment flow during development
- Immediate access to pro features

### 🔧 Debugging
- Test pro-level features locally
- Debug instance management without limits
- Simulate production pro user behavior

## Important Notes

### Security
- ⚠️ **Never set `DISABLE_PAYMENTS=true` in production**
- ⚠️ **Always verify environment before deployment**
- ⚠️ **Production requires proper Razorpay configuration**

### Database
- Local development still uses the same user plans table structure
- Users will have default "free" plans, but limits are bypassed
- Plan monitoring service won't run to expire/downgrade users

### Transition to Production
When deploying to production:

1. Remove or set `DISABLE_PAYMENTS=false`
2. Set `NODE_ENV=production`
3. Configure all required production services (Razorpay, SMTP, etc.)
4. Verify payment flows work correctly

## Troubleshooting

### Still Getting Plan Limits?
- Check that `DISABLE_PAYMENTS=true` is set
- Verify `NODE_ENV=development` or `NODE_ENV=local`
- Restart the backend server after changing environment variables

### Plan Monitoring Still Running?
- The service should automatically skip startup in local dev
- Check console logs for "Plan Monitoring Service disabled" message
- Manually stop service if needed: `planMonitoringService.stop()`

### Testing Payment Features Locally
If you need to test payment flows in development:
- Set `DISABLE_PAYMENTS=false` temporarily
- Configure Razorpay test keys
- Use Razorpay test payment methods