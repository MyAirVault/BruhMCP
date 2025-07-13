# MCP Instance Editing with Credential Validation

## Overview

This document outlines the comprehensive system for editing MCP instances, including custom name updates and credential changes with real-time validation. The system reuses the proven credential validation infrastructure from the MCP creation process to ensure consistency and reliability.

## Core Principles

### Validation-First Approach

**Real-Time Credential Validation**:
- All credential updates are validated against the actual service API before storage
- Users receive immediate feedback on credential validity
- Invalid credentials are rejected, preserving existing working credentials
- Consistent experience with MCP instance creation flow

**Separation of Concerns**:
- Custom name changes require no validation or cache operations
- Credential changes trigger validation and cache invalidation
- Combined updates handle both operations intelligently
- Each update type has appropriate error handling

### Reuse Existing Infrastructure

**Leverage MCP Creation Validation**:
- Extract existing credential validation logic into reusable services
- Maintain consistency between creation and update flows
- Reduce code duplication and testing overhead
- Ensure proven validation patterns are maintained

## Custom Name Update Flow

### User Interface Process

**Simple Metadata Update**:
- User clicks edit icon next to instance name
- Inline text editor or modal dialog appears
- User enters new custom name
- Real-time character count and validation
- Save button triggers immediate update

**Frontend Validation**:
- Length limits (1-100 characters)
- Character restrictions (alphanumeric, spaces, basic punctuation)
- Whitespace trimming and normalization
- Immediate visual feedback for invalid input

### Backend Processing

**Lightweight Update Process**:
1. **Request Validation**: Verify user ownership and authentication
2. **Input Sanitization**: Clean and validate name format
3. **Database Update**: Simple UPDATE query on custom_name field
4. **Response**: Return updated instance metadata
5. **No Cache Operations**: Name changes don't affect credential cache

**Database Transaction**:
- Single atomic update operation
- Update timestamp tracking for audit purposes
- Rollback capability if constraints violated
- Minimal database interaction for performance

### API Endpoint Design

**Name Update Endpoint**:
```
PATCH /api/v1/mcps/{instanceId}/name
Authorization: Bearer {userToken}
Content-Type: application/json

Request Body:
{
  "custom_name": "My Updated Instance Name"
}

Success Response (200):
{
  "data": {
    "message": "Instance name updated successfully",
    "instance_id": "uuid-here",
    "old_name": "Previous Name",
    "new_name": "My Updated Instance Name", 
    "updated_at": "2025-07-13T15:30:00Z"
  }
}

Validation Error (400):
{
  "error": {
    "code": "INVALID_NAME",
    "message": "Instance name must be 1-100 characters",
    "field": "custom_name",
    "current_length": 150
  }
}
```

## Credential Update Flow with Validation

### Validation-First Architecture

**Pre-Storage Validation Process**:
1. User submits new credentials through secure form
2. Backend extracts service type from instance record
3. Credentials are validated against actual service API
4. Only validated credentials are stored in database
5. Cache is invalidated to force refresh with new credentials

**Service-Specific Validation**:
- Each service has dedicated validation logic
- Test API calls verify credential functionality
- Service-specific error messages and suggestions
- Graceful handling of service unavailability

### Figma Credential Validation

**Validation Process**:
1. **Format Check**: Verify API key starts with 'figd_' prefix
2. **Test API Call**: Send request to Figma's `/v1/me` endpoint
3. **Response Analysis**: Parse authentication result
4. **User Info Extraction**: Confirm valid user account
5. **Validation Result**: Return success with user details or failure with error

**Test API Call Details**:
- **Endpoint**: `GET https://api.figma.com/v1/me`
- **Headers**: `X-Figma-Token: {provided_api_key}`
- **Success Criteria**: HTTP 200 with valid user object
- **Failure Handling**: Parse error codes and provide helpful messages

**Validation Response Analysis**:
- **Success**: Extract user email, name, and account status
- **Authentication Failure**: Invalid or expired token
- **Permission Failure**: Token lacks required permissions
- **Network Failure**: Figma API unavailable or timeout
- **Rate Limiting**: Too many validation requests

### Backend Processing Flow

**Comprehensive Update Process**:

1. **Authentication & Authorization**:
   - Verify user session and token validity
   - Confirm user owns the target instance
   - Check instance exists and is accessible
   - Validate request parameters and format

2. **Instance State Validation**:
   - Retrieve current instance configuration
   - Verify instance is in updatable state
   - Extract service type for validation routing
   - Preserve existing credentials as backup

3. **Credential Validation**:
   - Route to service-specific validator
   - Perform live API test call
   - Analyze validation response
   - Generate detailed feedback message

4. **Database Update** (Only if validation succeeds):
   - Begin database transaction
   - Update credential fields atomically
   - Update modification timestamp
   - Commit transaction on success

5. **Cache Invalidation**:
   - Remove stale credentials from cache
   - Ensure next service request fetches new credentials
   - Log cache invalidation for audit
   - Update cache statistics

6. **Response Generation**:
   - Include validation confirmation details
   - Provide next-step guidance for user
   - Log successful credential update
   - Return comprehensive success response

### Error Handling Strategy

**Validation Failure Handling**:
- Preserve existing working credentials
- Return specific error codes and messages
- Provide actionable suggestions for resolution
- Log validation attempts for security monitoring

**Service-Specific Error Messages**:
- **Figma**: "Invalid Figma Personal Access Token. Please verify your token in Figma Account Settings."
- **Future GitHub**: "Invalid GitHub Personal Access Token. Ensure token has required repository permissions."
- **Network Errors**: "Unable to verify credentials due to service unavailability. Please try again."

**Database Error Recovery**:
- Transaction rollback on any failure
- Preserve original credentials on update failure
- Detailed error logging for debugging
- User-friendly error messages without technical details

## Combined Update Flow

### Smart Update Logic

**Intelligent Processing**:
- Detect which fields are being updated in request
- Route name updates through lightweight process
- Route credential updates through validation process
- Handle combinations efficiently without redundancy

**Atomic Operations**:
- All updates within single database transaction
- Cache invalidation only when credentials change
- Rollback all changes if any operation fails
- Consistent state maintenance throughout process

### Combined Endpoint Design

**Unified Update Endpoint**:
```
PATCH /api/v1/mcps/{instanceId}
Authorization: Bearer {userToken}
Content-Type: application/json

Request Body (Name Only):
{
  "custom_name": "New Instance Name"
}

Request Body (Credentials Only):
{
  "credentials": {
    "api_key": "figd_new_personal_access_token"
  }
}

Request Body (Combined):
{
  "custom_name": "Updated Instance",
  "credentials": {
    "api_key": "figd_new_token"
  }
}

Success Response (200):
{
  "data": {
    "message": "Instance updated successfully",
    "instance_id": "uuid-here",
    "updates_applied": ["custom_name", "credentials"],
    "name_change": {
      "old_name": "Previous Name",
      "new_name": "Updated Instance"
    },
    "credential_validation": {
      "status": "success",
      "service": "figma",
      "validated_user": "user@example.com",
      "test_endpoint": "https://api.figma.com/v1/me"
    },
    "cache_invalidated": true,
    "updated_at": "2025-07-13T15:30:00Z"
  }
}
```

## Service Integration Architecture

### Reusable Validation Framework

**Generic Validation Interface**:
- Abstracted validation service that routes to service-specific validators
- Consistent validation result format across all services
- Extensible architecture for adding new services
- Shared error handling and logging patterns

**Service Registry Pattern**:
- Dynamic service discovery for validation routing
- Service-specific configuration and endpoints
- Validation timeout and retry policies
- Health checking for service availability

### Figma Service Integration

**Validation Implementation**:
- Dedicated Figma validator with API-specific logic
- Error code mapping for user-friendly messages
- Rate limiting and request throttling
- Response caching for repeated validation attempts

**API Integration Details**:
- Standard Figma REST API authentication
- Proper header formatting and request structure
- Response parsing and error classification
- User information extraction and privacy handling

### Future Service Support

**GitHub Integration**:
- Personal Access Token validation
- Repository permission verification
- Organization access confirmation
- Token scope and expiration checking

**Slack Integration**:
- OAuth token validation and refresh
- Workspace permission verification
- Bot token vs user token handling
- Channel access confirmation

**Generic Service Framework**:
- Pluggable validation architecture
- Service-specific configuration management
- Standardized validation result format
- Shared error handling and logging

## Security Considerations

### Credential Protection

**Secure Transmission**:
- HTTPS required for all credential operations
- Request body encryption for sensitive data
- Secure token storage and handling
- Memory cleanup after validation

**Validation Security**:
- Rate limiting on validation attempts
- IP-based throttling for abuse prevention
- Audit logging for all validation attempts
- Suspicious activity detection and alerting

**Access Control**:
- Strict user ownership verification
- Session-based authentication required
- No cross-user credential access
- Admin override controls with audit trail

### Privacy and Compliance

**Data Minimization**:
- Only store necessary credential information
- Avoid logging sensitive credential data
- Secure credential deletion on instance removal
- Regular credential rotation encouragement

**Audit Requirements**:
- Complete audit trail for credential changes
- User action logging with timestamps
- Validation attempt tracking
- Compliance reporting capabilities

## Performance Considerations

### Validation Performance

**Efficient Validation**:
- Parallel processing where possible
- Timeout controls for validation requests
- Caching of validation results for repeated attempts
- Asynchronous processing for non-blocking operations

**Database Optimization**:
- Minimal transaction scope for updates
- Indexed queries for instance lookup
- Connection pooling for concurrent updates
- Optimistic locking for concurrent modification prevention

### Cache Management

**Smart Cache Invalidation**:
- Selective invalidation only when credentials change
- Immediate cache removal to prevent stale data usage
- Cache warming on first post-update request
- Cache statistics tracking for performance monitoring

**Memory Efficiency**:
- Remove invalid credentials from cache immediately
- Prevent memory leaks from failed validation attempts
- Efficient cache cleanup for deleted instances
- Monitor cache hit rates and performance

## User Experience Design

### Progressive Enhancement

**Immediate Feedback**:
- Real-time validation indicators during credential entry
- Progress indicators for validation in progress
- Clear success/failure messages with next steps
- Helpful error messages with resolution guidance

**Graceful Degradation**:
- Fallback options when validation services unavailable
- Clear communication about temporary service issues
- Retry mechanisms with exponential backoff
- Alternative validation flows when needed

### Interface Design Patterns

**Credential Update Interface**:
- Secure input fields with appropriate masking
- Validation status indicators and progress bars
- Clear separation between different credential types
- Help text and examples for credential formats

**Error State Handling**:
- Contextual error messages with specific guidance
- Visual indicators for field-level validation errors
- Recovery suggestions and alternative approaches
- Support contact information for complex issues

## Monitoring and Observability

### Validation Metrics

**Success Rate Tracking**:
- Validation success/failure rates by service
- Common validation error patterns
- User retry behavior analysis
- Service availability impact on validation

**Performance Monitoring**:
- Validation response time tracking
- Database update performance metrics
- Cache invalidation timing and success rates
- End-to-end operation duration measurement

### Audit and Compliance

**Security Monitoring**:
- Failed validation attempt tracking
- Suspicious credential update patterns
- Rate limiting trigger analysis
- Potential security threat detection

**Operational Insights**:
- Most common update patterns
- Service-specific validation challenges
- User workflow optimization opportunities
- System performance bottleneck identification

## Future Enhancements

### Advanced Validation Features

**Enhanced Validation**:
- Credential strength assessment and recommendations
- Expiration date detection and renewal reminders
- Permission scope validation and optimization
- Multi-factor authentication integration

**Batch Operations**:
- Bulk credential updates across multiple instances
- Validation queuing for high-volume operations
- Progress tracking for long-running operations
- Rollback capabilities for failed batch updates

### Integration Improvements

**Service Ecosystem**:
- Third-party validation service integration
- Custom validation rule configuration
- Webhook-based validation notifications
- Real-time credential health monitoring

**User Experience**:
- Credential import/export capabilities
- Template-based credential configuration
- Guided setup wizards for complex services
- Integration with password managers and credential stores