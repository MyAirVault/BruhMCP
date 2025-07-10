# Credential Validation Modals

## Overview

This document outlines the UI flow and implementation details for credential validation in MCP creation and editing modals. The validation flow ensures API credentials are working before proceeding with MCP instance creation.

**Related Documentation**:
- [`/documents/api-documentation.md`](../api-documentation.md) - API endpoint for credential validation
- [`/documents/frontend/frontend-enhancements.md`](./frontend-enhancements.md) - Modal patterns and UI components
- [`/documents/mcp-server-creation-guide.md`](../mcp-server-creation-guide.md) - Credential requirements per MCP type

## Credential Validation Flow

### User Journey

1. **Credential Input**: User enters API credentials in Create/Edit MCP modal
2. **Client-Side Validation**: Basic format validation (required fields, length, format)
3. **Test Connection**: User clicks "Test Credentials" or "Done" button
4. **Validation Request**: Frontend sends `POST /api/v1/api-keys/validate` request
5. **Loading State**: Show validation progress indicator
6. **Result Handling**:
   - **Success**: Show validation success, enable MCP creation
   - **Failure**: Display specific error message, block MCP creation

### UI Components

#### Credential Input Form

**Supported Credential Types** (based on MCP type requirements):

```jsx
// Primary credentials
- api_key: Text input with mask/reveal toggle
- client_secret: Password input with mask/reveal toggle  
- client_id: Text input
- personal_access_token: Text input with mask/reveal toggle
- refresh_token: Text input with mask/reveal toggle

// Advanced credentials  
- custom_headers: JSON textarea with syntax validation
- base_url: URL input with validation
- webhook_secret: Password input with mask/reveal toggle
```

**Form Structure**:
```jsx
<div className="credential-form">
  {/* Dynamic fields based on mcp_type.required_credentials */}
  {requiredCredentials.map(credType => (
    <CredentialField
      key={credType}
      type={credType}
      value={credentials[credType]}
      onChange={handleCredentialChange}
      error={validationErrors[credType]}
      showPassword={showPasswords[credType]}
      onTogglePassword={() => togglePasswordVisibility(credType)}
    />
  ))}
  
  {/* Validation controls */}
  <div className="validation-controls">
    <button 
      type="button"
      onClick={validateCredentials}
      disabled={isValidating || !hasRequiredCredentials}
      className="btn-secondary"
    >
      {isValidating ? 'Testing...' : 'Test Credentials'}
    </button>
    
    {validationResult && (
      <ValidationResult result={validationResult} />
    )}
  </div>
</div>
```

#### Validation States

**1. Idle State** (no validation attempted)
```jsx
<div className="validation-idle">
  <button className="btn-secondary">Test Credentials</button>
  <p className="text-sm text-gray-500">
    Click to verify your credentials work with the API
  </p>
</div>
```

**2. Validating State** (request in progress)
```jsx
<div className="validation-loading">
  <button className="btn-secondary" disabled>
    <Spinner className="w-4 h-4 mr-2" />
    Testing Credentials...
  </button>
  <p className="text-sm text-blue-600">
    Connecting to {mcpType.display_name} API...
  </p>
</div>
```

**3. Success State** (credentials valid)
```jsx
<div className="validation-success">
  <div className="flex items-center text-green-600">
    <CheckIcon className="w-5 h-5 mr-2" />
    <span>Credentials validated successfully</span>
  </div>
  
  {apiInfo && (
    <div className="mt-2 text-sm text-gray-600">
      <div>Service: {apiInfo.service}</div>
      {apiInfo.quota_remaining && (
        <div>Quota remaining: {apiInfo.quota_remaining.toLocaleString()}</div>
      )}
      {apiInfo.permissions && (
        <div>Permissions: {apiInfo.permissions.join(', ')}</div>
      )}
    </div>
  )}
  
  <button 
    onClick={handleProceedToCreation}
    className="btn-primary mt-3"
  >
    Create MCP Instance
  </button>
</div>
```

**4. Error State** (credentials invalid)
```jsx
<div className="validation-error">
  <div className="flex items-center text-red-600">
    <XIcon className="w-5 h-5 mr-2" />
    <span>Credential validation failed</span>
  </div>
  
  {/* Zod validation errors (field-level) */}
  {validationResult.validationErrors && (
    <div className="mt-2 space-y-2">
      {Object.entries(validationResult.validationErrors).map(([field, message]) => (
        <div key={field} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
          <div className="font-medium text-red-800">{formatFieldName(field)}</div>
          <div className="text-red-600">{message}</div>
        </div>
      ))}
    </div>
  )}
  
  {/* API-level errors (credentials, permissions, etc.) */}
  {!validationResult.validationErrors && (
    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
      <div className="text-sm text-red-800">
        <div className="font-medium">{error.message}</div>
        {error.details && (
          <div className="mt-1">
            {error.details.field && (
              <div>Field: {error.details.field}</div>
            )}
            {error.details.reason && (
              <div>Reason: {error.details.reason}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )}
  
  <div className="mt-3 flex gap-2">
    <button 
      onClick={validateCredentials}
      className="btn-secondary"
    >
      Retry Validation
    </button>
    <button 
      onClick={handleEditCredentials}
      className="btn-outline"
    >
      Edit Credentials
    </button>
  </div>
</div>

// Helper function to format field names for display
function formatFieldName(field: string): string {
  return field
    .replace(/^credentials\./, '') // Remove "credentials." prefix
    .replace(/_/g, ' ')           // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
}
```

### Error Handling Patterns

#### Error Types and UI Responses

**1. Zod Validation Errors (400 Bad Request - VALIDATION_ERROR)**
```jsx
// Display Zod validation errors with field highlighting
{validationResult.validationErrors && (
  <div className="validation-errors">
    {Object.entries(validationResult.validationErrors).map(([field, message]) => {
      const fieldKey = field.replace('credentials.', '');
      return (
        <div key={field} className="field-validation-error">
          <div className="flex items-center text-red-600 text-sm">
            <XIcon className="w-4 h-4 mr-1" />
            <span>{formatFieldName(field)}: {message}</span>
          </div>
        </div>
      );
    })}
  </div>
)}

// Automatically highlight problematic fields
const getFieldClassName = (fieldName: string) => {
  const fieldPath = `credentials.${fieldName}`;
  const hasError = validationResult?.validationErrors?.[fieldPath];
  
  return hasError 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
};

<input 
  className={`input ${getFieldClassName('api_key')}`}
  data-field="credentials.api_key"
  // ... other props
/>
```

**2. Invalid Credentials (400 Bad Request - INVALID_CREDENTIALS)**
```jsx
// Display API-level credential errors
<div className="api-error">
  <div className="flex items-center text-red-600">
    <XIcon className="w-4 h-4 mr-2" />
    <span>API key is invalid or expired</span>
  </div>
  
  {error.details?.field && (
    <div className="mt-1 text-sm text-red-600">
      Problem with: {formatFieldName(error.details.field)}
    </div>
  )}
</div>
```

**3. Insufficient Permissions (403 Forbidden)**
```jsx
<div className="permission-error">
  <div className="text-red-600 font-medium">
    Insufficient Permissions
  </div>
  <div className="mt-2 text-sm">
    <div>Required: {error.details.required_permissions.join(', ')}</div>
    <div>Granted: {error.details.granted_permissions.join(', ')}</div>
  </div>
  <a 
    href={getPermissionSetupLink(mcpType)} 
    className="text-blue-600 hover:underline mt-2 inline-block"
  >
    Learn how to grant required permissions →
  </a>
</div>
```

**4. Rate Limit Exceeded (429 Too Many Requests)**
```jsx
<div className="rate-limit-error">
  <div className="text-orange-600 font-medium">
    Rate limit exceeded
  </div>
  <div className="mt-2 text-sm">
    Please wait {error.details.retry_after} seconds before retrying.
  </div>
  {error.details.quota_reset && (
    <div className="text-xs text-gray-500">
      Quota resets at {new Date(error.details.quota_reset).toLocaleString()}
    </div>
  )}
</div>
```

**5. Service Unavailable (503 Service Unavailable)**
```jsx
<div className="service-error">
  <div className="text-red-600 font-medium">
    Service temporarily unavailable
  </div>
  <div className="mt-2 text-sm">
    {error.details.service} is currently experiencing issues.
  </div>
  {error.details.status_page && (
    <a 
      href={error.details.status_page} 
      className="text-blue-600 hover:underline mt-2 inline-block"
      target="_blank"
      rel="noopener noreferrer"
    >
      Check service status →
    </a>
  )}
</div>
```

### Modal Integration

#### Create MCP Modal Flow

**Step 1: MCP Type Selection**
```jsx
// Standard MCP type selection (existing)
<MCPTypeSelector onSelect={setSelectedMCPType} />
```

**Step 2: Credential Input**
```jsx
// Show credentials form based on selected type
{selectedMCPType && (
  <CredentialForm
    mcpType={selectedMCPType}
    credentials={credentials}
    onChange={setCredentials}
    onValidate={handleValidateCredentials}
    validationResult={validationResult}
    isValidating={isValidating}
  />
)}
```

**Step 3: MCP Configuration** (only after successful validation)
```jsx
// Only show if credentials are validated
{validationResult?.valid && (
  <MCPConfigForm
    config={config}
    onChange={setConfig}
    configTemplate={selectedMCPType.config_template}
  />
)}
```

**Modal Actions**:
```jsx
<div className="modal-actions">
  <button onClick={onCancel} className="btn-secondary">
    Cancel
  </button>
  
  {!validationResult?.valid ? (
    // Show validation button if not validated
    <button 
      onClick={handleValidateCredentials}
      disabled={!hasRequiredCredentials || isValidating}
      className="btn-primary"
    >
      {isValidating ? 'Validating...' : 'Validate & Continue'}
    </button>
  ) : (
    // Show create button if validated
    <button 
      onClick={handleCreateMCP}
      disabled={isCreating}
      className="btn-primary"
    >
      {isCreating ? 'Creating...' : 'Create MCP Instance'}
    </button>
  )}
</div>
```

#### Edit MCP Modal Flow

**Existing Credentials Display**:
```jsx
<div className="existing-credentials">
  <div className="flex items-center justify-between">
    <h3>API Credentials</h3>
    <span className="text-sm text-green-600 flex items-center">
      <CheckIcon className="w-4 h-4 mr-1" />
      Configured & Validated
    </span>
  </div>
  
  {/* Never show any credential information */}
  <div className="credential-status">
    <p className="text-sm text-gray-600">
      Credentials are securely stored and validated. They cannot be viewed for security reasons.
    </p>
  </div>
  
  <button 
    onClick={() => setEditingCredentials(true)}
    className="btn-outline mt-2"
  >
    Replace Credentials
  </button>
</div>
```

**Credential Update Flow**:
```jsx
{editingCredentials && (
  <CredentialForm
    mcpType={mcpInstance.mcp_type}
    credentials={newCredentials}
    onChange={setNewCredentials}
    onValidate={handleValidateNewCredentials}
    validationResult={newValidationResult}
    isValidating={isValidating}
    mode="update"
  />
)}
```

### Implementation Guidelines

#### State Management

```typescript
interface CredentialValidationState {
  mcpTypeId: string; // UUID reference to mcp_types table
  credentials: Record<string, string>;
  validationResult: ValidationResult | null;
  isValidating: boolean;
  validationErrors: Record<string, string>;
  showPasswords: Record<string, boolean>;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  api_info?: {
    service: string;
    quota_remaining?: number;
    permissions?: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  validationErrors?: Record<string, string>; // Zod field-level errors
}
```

#### API Integration with Zod Error Handling

```typescript
interface ZodValidationError {
  field: string;
  message: string;
}

interface ValidationResponse {
  data?: {
    valid: boolean;
    message: string;
    api_info?: {
      service: string;
      quota_remaining?: number;
      permissions?: string[];
    };
  };
  error?: {
    code: string;
    message: string;
    details?: ZodValidationError[] | Record<string, any>;
  };
}

async function validateCredentials(
  mcpTypeId: string, 
  credentials: Record<string, string>
): Promise<ValidationResult> {
  try {
    const response = await fetch('/api/v1/api-keys/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header - uses HTTP-only cookies for authentication
      },
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({
        mcp_type_id: mcpTypeId,
        credentials
      })
    });
    
    const data: ValidationResponse = await response.json();
    
    if (response.ok && data.data) {
      return {
        valid: true,
        message: data.data.message,
        api_info: data.data.api_info
      };
    } else if (data.error) {
      // Handle Zod validation errors (VALIDATION_ERROR)
      if (data.error.code === 'VALIDATION_ERROR' && Array.isArray(data.error.details)) {
        return {
          valid: false,
          message: data.error.message,
          error: data.error,
          validationErrors: data.error.details.reduce((acc, detail) => {
            acc[detail.field] = detail.message;
            return acc;
          }, {} as Record<string, string>)
        };
      }
      
      // Handle other API errors (INVALID_CREDENTIALS, etc.)
      return {
        valid: false,
        message: data.error.message,
        error: data.error
      };
    }
    
    return {
      valid: false,
      message: 'Unexpected response format',
      error: {
        code: 'UNEXPECTED_RESPONSE',
        message: 'Server returned unexpected response format'
      }
    };
  } catch (error) {
    return {
      valid: false,
      message: 'Network error during validation',
      error: {
        code: 'NETWORK_ERROR',
        message: error.message
      }
    };
  }
}

// Helper function to display Zod validation errors
function displayValidationErrors(validationErrors: Record<string, string>) {
  Object.entries(validationErrors).forEach(([field, message]) => {
    const fieldElement = document.querySelector(`[data-field="${field}"]`);
    if (fieldElement) {
      fieldElement.classList.add('border-red-300', 'focus:border-red-500');
      const errorElement = fieldElement.parentElement?.querySelector('.field-error');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
      }
    }
  });
}
```

#### Security Considerations

1. **No Credential Display**: Never show any credential information to users after storage
2. **Input Validation**: Validate format and length on client-side before API call
3. **Error Sanitization**: Don't expose internal system details in error messages
4. **Temporary Storage**: Don't persist credentials in browser storage during validation
5. **Auto-clear**: Clear sensitive form data when modal closes
6. **One-Way Storage**: Once credentials are validated and stored, they cannot be retrieved or viewed
7. **Replace Only**: Users can only replace existing credentials, never view them

#### Accessibility

1. **Screen Reader Support**: Proper labels and ARIA attributes for form fields
2. **Keyboard Navigation**: Tab order through form fields and validation controls
3. **Error Announcements**: Use ARIA live regions for validation status changes
4. **Focus Management**: Focus on first error field when validation fails

#### Testing Considerations

1. **Mock API Responses**: Test all validation response scenarios
2. **Error State Testing**: Verify proper error display and recovery flows
3. **Loading State Testing**: Ensure proper loading indicators and button states
4. **Form Validation**: Test client-side validation before API calls
5. **Accessibility Testing**: Verify keyboard navigation and screen reader compatibility

This credential validation UI flow ensures a smooth user experience while maintaining security and providing clear feedback throughout the credential verification process.