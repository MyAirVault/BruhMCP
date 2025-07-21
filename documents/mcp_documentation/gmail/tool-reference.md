# Gmail MCP Service - Tool Reference

## Tool Categories

### 📧 Email Operations (5 tools)
- [`send_email`](#send_email) - Send email messages
- [`send_email_with_attachments`](#send_email_with_attachments) - Send emails with attachments
- [`fetch_emails`](#fetch_emails) - Fetch emails from inbox/folders
- [`fetch_message_by_id`](#fetch_message_by_id) - Fetch specific message by ID
- [`reply_to_email`](#reply_to_email) - Reply to email threads

### 📝 Draft Management (3 tools)
- [`create_draft`](#create_draft) - Create email drafts
- [`send_draft`](#send_draft) - Send existing drafts
- [`list_drafts`](#list_drafts) - List all drafts

### 🔍 Search & Discovery (2 tools)
- [`search_emails`](#search_emails) - Advanced email search
- [`get_thread`](#get_thread) - Get email thread/conversation

### 🗂️ Message Management (4 tools)
- [`delete_message`](#delete_message) - Delete messages permanently
- [`move_to_trash`](#move_to_trash) - Move messages to trash
- [`mark_as_read`](#mark_as_read) - Mark messages as read
- [`mark_as_unread`](#mark_as_unread) - Mark messages as unread

### 🏷️ Label Management (4 tools)
- [`list_labels`](#list_labels) - List all labels
- [`create_label`](#create_label) - Create new labels
- [`modify_labels`](#modify_labels) - Add/remove message labels
- [`delete_label`](#delete_label) - Delete labels

### 📎 Attachment Operations (2 tools)
- [`list_attachments`](#list_attachments) - List message attachments
- [`download_attachment`](#download_attachment) - Download attachments

---

## Tool Details

### `send_email`
**Description**: Send an email message through Gmail with support for CC, BCC, and HTML formatting.

**Parameters**:
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject line
- `body` (string, required): Email body content (supports HTML)
- `cc` (string, optional): CC email addresses (comma separated)
- `bcc` (string, optional): BCC email addresses (comma separated)
- `format` (string, optional): Email format ('text' or 'html', default: 'text')

**Gmail API**: `POST /gmail/v1/users/me/messages/send`

**Response**: Email send confirmation with message ID and thread ID

**Example**:
```json
{
  "name": "send_email",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Weekly Report",
    "body": "Please find the weekly report attached.",
    "cc": "manager@example.com",
    "format": "text"
  }
}
```

---

### `send_email_with_attachments`
**Description**: Send an email with file attachments up to 50MB total size.

**Parameters**:
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject line
- `body` (string, required): Email body content (supports HTML)
- `cc` (string, optional): CC email addresses (comma separated)
- `bcc` (string, optional): BCC email addresses (comma separated)
- `format` (string, optional): Email format ('text' or 'html', default: 'text')
- `attachments` (array, optional): Array of attachment objects

**Attachment Object Properties**:
- `filename` (string, required): Filename of the attachment
- `mimeType` (string, required): MIME type (e.g., 'application/pdf', 'image/jpeg')
- `data` (string, required): Base64 encoded attachment data

**Gmail API**: `POST /gmail/v1/users/me/messages/send`

**Response**: Email send confirmation with attachment count

**Example**:
```json
{
  "name": "send_email_with_attachments",
  "arguments": {
    "to": "team@example.com",
    "subject": "Project Documentation",
    "body": "Please review the attached documents.",
    "attachments": [
      {
        "filename": "report.pdf",
        "mimeType": "application/pdf",
        "data": "JVBERi0xLjQKJdPr6eEKMSAwIG9iago..."
      }
    ]
  }
}
```

---

### `fetch_emails`
**Description**: Fetch emails from Gmail inbox or specific folders with advanced filtering.

**Parameters**:
- `query` (string, optional): Gmail search query (supports Gmail search operators)
- `maxResults` (number, optional): Maximum number of emails (1-500, default: 10)
- `labelIds` (array, optional): Label IDs to filter by
- `includeSpamTrash` (boolean, optional): Include spam and trash (default: false)

**Gmail API**: `GET /gmail/v1/users/me/messages`

**Response**: Array of email messages with metadata

**Example**:
```json
{
  "name": "fetch_emails",
  "arguments": {
    "query": "from:important@example.com",
    "maxResults": 20,
    "labelIds": ["INBOX"],
    "includeSpamTrash": false
  }
}
```

---

### `fetch_message_by_id`
**Description**: Fetch a specific email message by its Gmail message ID.

**Parameters**:
- `messageId` (string, required): Gmail message ID to fetch
- `format` (string, optional): Message format ('minimal', 'full', 'raw', 'metadata', default: 'full')

**Gmail API**: `GET /gmail/v1/users/me/messages/{messageId}`

**Response**: Complete message object with headers, body, and attachments

**Example**:
```json
{
  "name": "fetch_message_by_id",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3",
    "format": "full"
  }
}
```

---

### `reply_to_email`
**Description**: Reply to an existing email thread with proper threading.

**Parameters**:
- `threadId` (string, required): Thread ID to reply to
- `body` (string, required): Reply message body
- `subject` (string, optional): Reply subject (will use 'Re:' prefix if not provided)
- `format` (string, optional): Reply format ('text' or 'html', default: 'text')

**Gmail API**: `POST /gmail/v1/users/me/messages/send`

**Response**: Reply confirmation with message ID and thread ID

**Example**:
```json
{
  "name": "reply_to_email",
  "arguments": {
    "threadId": "18f1c2e4b2d5a8f3",
    "body": "Thank you for your email. I will review and respond shortly.",
    "format": "text"
  }
}
```

---

### `create_draft`
**Description**: Create an email draft for later editing and sending.

**Parameters**:
- `to` (string, required): Recipient email address
- `subject` (string, required): Email subject line
- `body` (string, required): Email body content
- `cc` (string, optional): CC email addresses (comma separated)
- `bcc` (string, optional): BCC email addresses (comma separated)
- `format` (string, optional): Email format ('text' or 'html', default: 'text')

**Gmail API**: `POST /gmail/v1/users/me/drafts`

**Response**: Draft creation confirmation with draft ID

**Example**:
```json
{
  "name": "create_draft",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Draft Email",
    "body": "This is a draft email.",
    "format": "text"
  }
}
```

---

### `send_draft`
**Description**: Send an existing draft email.

**Parameters**:
- `draftId` (string, required): Draft ID to send

**Gmail API**: `POST /gmail/v1/users/me/drafts/{draftId}/send`

**Response**: Draft send confirmation with message ID

**Example**:
```json
{
  "name": "send_draft",
  "arguments": {
    "draftId": "r-1234567890123456789"
  }
}
```

---

### `list_drafts`
**Description**: List all email drafts with optional search filtering.

**Parameters**:
- `maxResults` (number, optional): Maximum number of drafts (1-500, default: 100)
- `query` (string, optional): Search query for drafts

**Gmail API**: `GET /gmail/v1/users/me/drafts`

**Response**: Array of draft objects with metadata

**Example**:
```json
{
  "name": "list_drafts",
  "arguments": {
    "maxResults": 50,
    "query": "subject:important"
  }
}
```

---

### `search_emails`
**Description**: Advanced email search using Gmail search operators with date filtering.

**Parameters**:
- `query` (string, required): Gmail search query using search operators
- `maxResults` (number, optional): Maximum number of results (1-500, default: 50)
- `newerThan` (string, optional): Only return emails newer than date (YYYY-MM-DD format)
- `olderThan` (string, optional): Only return emails older than date (YYYY-MM-DD format)

**Gmail API**: `GET /gmail/v1/users/me/messages`

**Response**: Array of matching email messages

**Example**:
```json
{
  "name": "search_emails",
  "arguments": {
    "query": "from:client@example.com has:attachment",
    "maxResults": 30,
    "newerThan": "2024-01-01"
  }
}
```

---

### `get_thread`
**Description**: Get an entire email thread/conversation with all messages.

**Parameters**:
- `threadId` (string, required): Thread ID to retrieve
- `format` (string, optional): Format for messages ('minimal', 'full', 'metadata', default: 'full')

**Gmail API**: `GET /gmail/v1/users/me/threads/{threadId}`

**Response**: Thread object with all messages and metadata

**Example**:
```json
{
  "name": "get_thread",
  "arguments": {
    "threadId": "18f1c2e4b2d5a8f3",
    "format": "full"
  }
}
```

---

### `delete_message`
**Description**: Permanently delete a message from Gmail (cannot be undone).

**Parameters**:
- `messageId` (string, required): Message ID to delete permanently

**Gmail API**: `DELETE /gmail/v1/users/me/messages/{messageId}`

**Response**: Deletion confirmation

**Example**:
```json
{
  "name": "delete_message",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3"
  }
}
```

---

### `move_to_trash`
**Description**: Move a message to the trash folder (can be restored).

**Parameters**:
- `messageId` (string, required): Message ID to move to trash

**Gmail API**: `POST /gmail/v1/users/me/messages/{messageId}/trash`

**Response**: Trash move confirmation

**Example**:
```json
{
  "name": "move_to_trash",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3"
  }
}
```

---

### `mark_as_read`
**Description**: Mark one or more messages as read (removes UNREAD label).

**Parameters**:
- `messageIds` (array, required): Array of message IDs to mark as read

**Gmail API**: `POST /gmail/v1/users/me/messages/{messageId}/modify`

**Response**: Batch operation confirmation

**Example**:
```json
{
  "name": "mark_as_read",
  "arguments": {
    "messageIds": ["18f1c2e4b2d5a8f3", "18f1c2e4b2d5a8f4"]
  }
}
```

---

### `mark_as_unread`
**Description**: Mark one or more messages as unread (adds UNREAD label).

**Parameters**:
- `messageIds` (array, required): Array of message IDs to mark as unread

**Gmail API**: `POST /gmail/v1/users/me/messages/{messageId}/modify`

**Response**: Batch operation confirmation

**Example**:
```json
{
  "name": "mark_as_unread",
  "arguments": {
    "messageIds": ["18f1c2e4b2d5a8f3", "18f1c2e4b2d5a8f4"]
  }
}
```

---

### `list_labels`
**Description**: List all Gmail labels including system and user-created labels.

**Parameters**: None

**Gmail API**: `GET /gmail/v1/users/me/labels`

**Response**: Array of label objects with metadata and statistics

**Example**:
```json
{
  "name": "list_labels",
  "arguments": {}
}
```

---

### `create_label`
**Description**: Create a new Gmail label with visibility settings.

**Parameters**:
- `name` (string, required): Label name
- `messageListVisibility` (string, optional): Message list visibility ('show' or 'hide', default: 'show')
- `labelListVisibility` (string, optional): Label list visibility ('labelShow' or 'labelHide', default: 'labelShow')

**Gmail API**: `POST /gmail/v1/users/me/labels`

**Response**: Created label object with ID and settings

**Example**:
```json
{
  "name": "create_label",
  "arguments": {
    "name": "Important Projects",
    "messageListVisibility": "show",
    "labelListVisibility": "labelShow"
  }
}
```

---

### `modify_labels`
**Description**: Add or remove labels from a message.

**Parameters**:
- `messageId` (string, required): Message ID to modify
- `addLabelIds` (array, optional): Label IDs to add to the message
- `removeLabelIds` (array, optional): Label IDs to remove from the message

**Gmail API**: `POST /gmail/v1/users/me/messages/{messageId}/modify`

**Response**: Modified message with updated label list

**Example**:
```json
{
  "name": "modify_labels",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3",
    "addLabelIds": ["Label_1", "Label_2"],
    "removeLabelIds": ["INBOX"]
  }
}
```

---

### `delete_label`
**Description**: Delete a Gmail label (cannot be undone).

**Parameters**:
- `labelId` (string, required): Label ID to delete

**Gmail API**: `DELETE /gmail/v1/users/me/labels/{labelId}`

**Response**: Deletion confirmation

**Example**:
```json
{
  "name": "delete_label",
  "arguments": {
    "labelId": "Label_1"
  }
}
```

---

### `list_attachments`
**Description**: List all attachments for a specific Gmail message.

**Parameters**:
- `messageId` (string, required): Gmail message ID to list attachments for

**Gmail API**: `GET /gmail/v1/users/me/messages/{messageId}`

**Response**: Array of attachment objects with metadata

**Example**:
```json
{
  "name": "list_attachments",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3"
  }
}
```

---

### `download_attachment`
**Description**: Download an attachment from a Gmail message with size limits and timeout protection.

**Parameters**:
- `messageId` (string, required): Gmail message ID containing the attachment
- `attachmentId` (string, required): Attachment ID to download
- `returnDataUrl` (boolean, optional): Return full data for large attachments (default: false)

**Gmail API**: `GET /gmail/v1/users/me/messages/{messageId}/attachments/{attachmentId}`

**Response**: Attachment data with size information and format details

**Example**:
```json
{
  "name": "download_attachment",
  "arguments": {
    "messageId": "18f1c2e4b2d5a8f3",
    "attachmentId": "ANGjdJ-5fUt9...",
    "returnDataUrl": true
  }
}
```

## Common Response Patterns

### Success Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "Operation completed successfully. [Details]"
    }
  ]
}
```

### Error Response
```json
{
  "error": {
    "code": -32603,
    "message": "Error description",
    "data": {
      "details": "Additional error context"
    }
  }
}
```

## Tool Usage Tips

1. **Gmail Search Operators**: Use Gmail's powerful search operators in `query` parameters:
   - `from:sender@example.com` - Find emails from specific sender
   - `has:attachment` - Find emails with attachments
   - `is:unread` - Find unread emails
   - `after:2024-01-01` - Find emails after specific date
   - `subject:important` - Find emails with specific subject content

2. **Attachment Handling**: Large attachments (>10MB) may require `returnDataUrl: true` for full download

3. **Rate Limiting**: Gmail API has strict rate limits; the service includes automatic retry logic

4. **Thread Management**: Use thread IDs consistently for proper conversation handling

5. **Label Operations**: System labels (like INBOX, SENT) use special IDs; user labels use generated IDs

## Authentication Requirements

All tools require:
- Valid OAuth 2.0 access token with Gmail scopes
- Active Gmail account with API access enabled
- Proper OAuth client configuration in Google Cloud Console

## Performance Considerations

- **Batch Operations**: Use array parameters for multiple message operations
- **Search Optimization**: Use specific search operators for better performance
- **Attachment Limits**: Files over 50MB will be rejected
- **Token Refresh**: Automatic token refresh handles expired credentials
- **Caching**: Credential caching reduces authentication overhead

## Security Features

- **OAuth 2.0 Integration**: Secure token-based authentication
- **Automatic Token Refresh**: Seamless credential renewal
- **Audit Logging**: Complete operation tracking
- **Error Sanitization**: Sensitive data redaction in error messages
- **Multi-tenant Isolation**: Instance-based credential separation

## Error Handling

The service handles common Gmail API errors:
- **Invalid Token**: Automatic token refresh or re-authentication prompt
- **Rate Limits**: Exponential backoff and retry logic
- **Message Not Found**: Clear error messages with context
- **Attachment Errors**: Size limits and timeout protection
- **Permission Errors**: Scope validation and clear instructions