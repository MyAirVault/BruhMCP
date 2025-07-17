# Gmail MCP Server - Available Endpoints & Actions

Your Gmail MCP server provides comprehensive access to the Gmail API through 20 different tools/endpoints with enterprise-grade optimization and features:

## 📧 **Email Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `send_email` | Send an email message through Gmail | `to`, `subject`, `body` |
| `send_email_with_attachments` | Send an email with file attachments | `to`, `subject`, `body` |
| `fetch_emails` | Fetch emails from Gmail inbox or specific folder | None |
| `fetch_message_by_id` | Fetch a specific email message by its ID | `messageId` |
| `reply_to_email` | Reply to an existing email thread | `threadId`, `body` |

## 📝 **Draft Management**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `create_draft` | Create an email draft | `to`, `subject`, `body` |
| `send_draft` | Send an existing draft email | `draftId` |
| `list_drafts` | List all email drafts | None |

## 🔍 **Search & Discovery**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `search_emails` | Advanced email search with Gmail operators | `query` |
| `get_thread` | Get an entire email thread/conversation | `threadId` |

## 🗂️ **Message Management**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `delete_message` | Permanently delete a message | `messageId` |
| `move_to_trash` | Move a message to trash | `messageId` |
| `mark_as_read` | Mark message(s) as read | `messageIds` |
| `mark_as_unread` | Mark message(s) as unread | `messageIds` |

## 🏷️ **Label Management**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `list_labels` | List all Gmail labels | None |
| `create_label` | Create a new Gmail label | `name` |
| `modify_labels` | Add or remove labels from a message | `messageId` |
| `delete_label` | Delete a Gmail label | `labelId` |

## 📎 **Attachment Operations**
| Tool | Description | Required Parameters |
|------|-------------|-------------------|
| `list_attachments` | List all attachments for a specific Gmail message | `messageId` |
| `download_attachment` | Download an attachment from a Gmail message | `messageId`, `attachmentId` |

## 🔐 **Authentication**
Your Gmail MCP server uses **OAuth 2.0 authentication**:
- Requires Google OAuth Client ID and Client Secret
- Uses standard OAuth 2.0 flow with refresh token support
- Supports automatic token refresh for uninterrupted access
- Scopes: `gmail.modify`, `userinfo.profile`, `userinfo.email`

## 🚀 **Common Use Cases**

### **Email Management**
```javascript
// Send a simple email
send_email({
  to: "recipient@example.com",
  subject: "Meeting Follow-up",
  body: "Thank you for the productive meeting today.",
  format: "text"
})

// Send email with attachments
send_email_with_attachments({
  to: "team@example.com",
  subject: "Project Documentation",
  body: "Please review the attached documents.",
  attachments: [
    {
      filename: "report.pdf",
      mimeType: "application/pdf",
      data: "JVBERi0xLjQKJdPr6eEKMSAwIG9iago..."
    }
  ]
})

// Fetch recent unread emails
fetch_emails({
  query: "is:unread",
  maxResults: 20,
  labelIds: ["INBOX"]
})
```

### **Thread Operations**
```javascript
// Get an email thread
get_thread({
  threadId: "18f1c2e4b2d5a8f3",
  format: "full"
})

// Reply to a thread
reply_to_email({
  threadId: "18f1c2e4b2d5a8f3",
  body: "Thank you for your email. I will review and respond shortly.",
  format: "text"
})

// Search for emails with attachments
search_emails({
  query: "from:client@example.com has:attachment",
  maxResults: 50,
  newerThan: "2024-01-01"
})
```

### **Draft Operations**
```javascript
// Create a draft
create_draft({
  to: "recipient@example.com",
  subject: "Draft Email",
  body: "This is a draft email.",
  format: "text"
})

// List all drafts
list_drafts({
  maxResults: 50,
  query: "subject:important"
})

// Send a draft
send_draft({
  draftId: "r-1234567890123456789"
})
```

### **Label Management**
```javascript
// List all labels
list_labels()

// Create a new label
create_label({
  name: "Important Projects",
  messageListVisibility: "show",
  labelListVisibility: "labelShow"
})

// Modify message labels
modify_labels({
  messageId: "18f1c2e4b2d5a8f3",
  addLabelIds: ["Label_1", "Label_2"],
  removeLabelIds: ["INBOX"]
})

// Delete a label
delete_label({
  labelId: "Label_1"
})
```

### **Attachment Operations**
```javascript
// List message attachments
list_attachments({
  messageId: "18f1c2e4b2d5a8f3"
})

// Download an attachment
download_attachment({
  messageId: "18f1c2e4b2d5a8f3",
  attachmentId: "ANGjdJ-5fUt9...",
  returnDataUrl: true
})

// Mark messages as read
mark_as_read({
  messageIds: ["18f1c2e4b2d5a8f3", "18f1c2e4b2d5a8f4"]
})
```

## 🚀 **Enhanced Features**

### **Enterprise-Grade Performance**
- **OAuth Integration**: Secure authentication with automatic token refresh
- **Credential Caching**: High-performance in-memory token storage
- **Error Recovery**: Comprehensive error handling with retry logic
- **Rate Limiting**: Automatic handling of Gmail API limits
- **Audit Logging**: Complete operation tracking and security logging

### **Advanced Email Processing**
- **Attachment Support**: Upload and download attachments up to 50MB
- **HTML Support**: Send and receive HTML-formatted emails
- **Thread Management**: Full conversation thread handling
- **Search Operators**: Advanced Gmail search with date filtering
- **Label Operations**: Complete label management and organization

### **Security & Reliability**
- **OAuth 2.0 Compliance**: Secure token-based authentication
- **Multi-tenant Isolation**: Instance-based credential separation
- **Token Validation**: Real-time validation of access tokens
- **Secure Logging**: Sensitive data redaction in logs
- **Error Handling**: Comprehensive error categorization and recovery

## 📊 **API Coverage**
Your implementation covers **comprehensive Gmail API endpoints**:
- ✅ Messages API (send, read, modify, delete) - **Enhanced with attachment support**
- ✅ Drafts API (create, send, list) - **Enhanced with search capabilities**
- ✅ Labels API (CRUD operations) - **Enhanced with visibility controls**
- ✅ Threads API (read, reply) - **Enhanced with conversation handling**
- ✅ Attachments API (upload, download) - **Enhanced with size limits**
- ✅ Search API (advanced queries) - **Enhanced with Gmail operators**
- ✅ Users API (profile access) - **Enhanced with OAuth integration**
- ❌ Filters API (auto-filtering) - **Future enhancement**
- ❌ Signatures API (email signatures) - **Future enhancement**
- ❌ Vacation API (auto-responders) - **Future enhancement**

## 🔧 **Technical Implementation Details**

### **Error Handling**
All endpoints include comprehensive error handling:
- **401**: Invalid or expired OAuth token
- **403**: Insufficient permissions or quota exceeded
- **404**: Message, thread, or label not found
- **429**: Rate limit exceeded (automatic retry)
- **500**: Gmail API server errors
- **Network**: Connection timeouts and retries

### **Rate Limiting**
- **Gmail API Limits**: 1 billion quota units per day
- **Per-user Limits**: 250 quota units per user per 100 seconds
- **Automatic Retry**: Exponential backoff for rate-limited requests
- **Quota Monitoring**: Real-time quota usage tracking

### **OAuth Integration**
- **Token Refresh**: Automatic refresh of expired access tokens
- **Scope Validation**: Verification of required Gmail scopes
- **Multi-tenant Support**: Instance-based credential isolation
- **Security Logging**: Audit trail of all authentication events

## 🔄 **Integration Examples**

### **Frontend Integration**
```typescript
// Example usage in your frontend
const gmailService = {
  async sendEmail(to: string, subject: string, body: string) {
    return await apiCall('send_email', { to, subject, body });
  },
  
  async fetchEmails(query: string, maxResults: number = 20) {
    return await apiCall('fetch_emails', { query, maxResults });
  },
  
  async replyToEmail(threadId: string, body: string) {
    return await apiCall('reply_to_email', { threadId, body });
  }
};
```

### **Email Automation Example**
```javascript
// Automated email processing workflow
async function processInboxEmails() {
  // Fetch unread emails
  const emails = await fetch_emails({
    query: "is:unread",
    maxResults: 50
  });
  
  // Process each email
  for (const email of emails.messages) {
    // Check if email has attachments
    const attachments = await list_attachments({
      messageId: email.id
    });
    
    if (attachments.hasAttachments) {
      // Add "has-attachment" label
      await modify_labels({
        messageId: email.id,
        addLabelIds: ["Label_HasAttachment"]
      });
    }
    
    // Mark as read
    await mark_as_read({
      messageIds: [email.id]
    });
  }
}
```

### **Search and Organization**
```javascript
// Advanced email search and organization
async function organizeEmails() {
  // Search for emails from specific clients
  const clientEmails = await search_emails({
    query: "from:client@example.com",
    maxResults: 100,
    newerThan: "2024-01-01"
  });
  
  // Create project label if doesn't exist
  await create_label({
    name: "Client Communications",
    messageListVisibility: "show"
  });
  
  // Apply label to all client emails
  for (const email of clientEmails.messages) {
    await modify_labels({
      messageId: email.id,
      addLabelIds: ["Label_ClientCommunications"]
    });
  }
}
```

## 🎯 **Performance & Reliability**

### **✅ Enterprise-Grade Features Available**
1. **✅ OAuth 2.0 Integration** - Secure authentication with automatic refresh
2. **✅ Credential caching** - High-performance in-memory token storage
3. **✅ Error recovery** - Comprehensive error handling and retry logic
4. **✅ Rate limiting** - Automatic handling of Gmail API quotas
5. **✅ Audit logging** - Complete operation tracking and security logging
6. **✅ Multi-tenant support** - Instance-based credential isolation
7. **✅ Attachment handling** - Support for files up to 50MB
8. **✅ Thread management** - Full conversation thread support

### **🏗️ Architecture Strengths**
- ✅ **Optimized API client** - Efficient Gmail API integration
- ✅ **Response formatting** - Consistent, clean response formats
- ✅ **Validation system** - Comprehensive input validation
- ✅ **Security hardening** - Token validation and secure logging
- ✅ **Performance monitoring** - Real-time metrics and tracking
- ✅ **Connection pooling** - Efficient resource utilization

### **🔮 Future Enhancements**
- **Email filters** - Automated email filtering and rules
- **Signatures** - Email signature management
- **Vacation responder** - Auto-reply functionality
- **Advanced analytics** - Email usage analytics and insights
- **Bulk operations** - Mass email operations and management

**Current Status**: The Gmail implementation provides a comprehensive, production-ready email management solution with enterprise-grade security, performance, and reliability features that exceed standard Gmail API implementations.