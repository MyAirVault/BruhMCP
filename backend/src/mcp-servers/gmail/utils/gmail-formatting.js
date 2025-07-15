/**
 * Gmail response formatting utilities
 * Standardizes Gmail API responses for MCP protocol
 */

/**
 * Format email response for MCP protocol
 * @param {Object} data - Email data to format
 * @returns {string} Formatted email response
 */
export function formatEmailResponse(data) {
  const timestamp = data.timestamp || new Date().toISOString();
  
  switch (data.action) {
    case 'sent':
      return `✅ Email sent successfully!

Message Details:
- Message ID: ${data.messageId}
- Thread ID: ${data.threadId}
- To: ${data.to}
- Subject: ${data.subject}
- Sent at: ${timestamp}

The email has been delivered to the recipient's inbox.`;

    case 'replied':
      return `✅ Reply sent successfully!

Reply Details:
- Message ID: ${data.messageId}
- Thread ID: ${data.threadId}
- Subject: ${data.subject}
- Sent at: ${timestamp}

Your reply has been added to the email conversation.`;

    case 'fetch':
      const emailList = data.messages.map((msg, index) => {
        const snippet = msg.snippet ? msg.snippet.substring(0, 100) + '...' : '';
        return `${index + 1}. ${msg.subject}
   From: ${msg.from}
   Date: ${msg.date}
   ${snippet}
   Message ID: ${msg.id}`;
      }).join('\n\n');

      return `📧 Retrieved ${data.count} email(s) ${data.query ? `matching "${data.query}"` : ''}

${data.totalEstimate > data.count ? `Showing ${data.count} of approximately ${data.totalEstimate} results\n` : ''}${emailList || 'No emails found.'}`;

    case 'deleted':
      return `🗑️ Email deleted successfully!

- Message ID: ${data.messageId}
- Deleted at: ${timestamp}

The email has been permanently removed.`;

    case 'moved_to_trash':
      return `🗑️ Email moved to trash!

- Message ID: ${data.messageId}
- Moved at: ${timestamp}

The email has been moved to the trash folder.`;

    case 'draft_sent':
      return `✅ Draft sent successfully!

- Message ID: ${data.messageId}
- Thread ID: ${data.threadId}
- Draft ID: ${data.draftId}
- Sent at: ${timestamp}

Your draft has been sent and is no longer in drafts.`;

    case 'marked_as_read':
      return `📖 Marked ${data.count} message(s) as read

- Message IDs: ${data.messageIds.join(', ')}
- Updated at: ${timestamp}

The messages are now marked as read.`;

    case 'marked_as_unread':
      return `📩 Marked ${data.count} message(s) as unread

- Message IDs: ${data.messageIds.join(', ')}
- Updated at: ${timestamp}

The messages are now marked as unread.`;

    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Format individual message response
 * @param {Object} message - Gmail message object
 * @returns {Object} Formatted message data
 */
export function formatMessageResponse(message) {
  const headers = message.payload?.headers || [];
  
  // Extract important headers
  const getHeader = (name) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };

  const subject = getHeader('Subject') || '(No Subject)';
  const from = getHeader('From') || '(Unknown Sender)';
  const to = getHeader('To') || '(Unknown Recipient)';
  const date = getHeader('Date') || message.internalDate;
  const messageId = getHeader('Message-ID') || message.id;

  // Extract body content
  let body = '';
  if (message.payload) {
    body = extractMessageBody(message.payload);
  }

  // Format date
  let formattedDate;
  try {
    if (message.internalDate) {
      formattedDate = new Date(parseInt(message.internalDate)).toISOString();
    } else if (date) {
      formattedDate = new Date(date).toISOString();
    } else {
      formattedDate = new Date().toISOString();
    }
  } catch (error) {
    formattedDate = new Date().toISOString();
  }

  return {
    id: message.id,
    threadId: message.threadId,
    subject,
    from,
    to,
    date: formattedDate,
    snippet: message.snippet || '',
    body: body.substring(0, 2000), // Limit body length
    labelIds: message.labelIds || [],
    messageId,
    sizeEstimate: message.sizeEstimate || 0,
    raw: message.raw ? 'Available' : 'Not available'
  };
}

/**
 * Extract message body from Gmail payload
 * @param {Object} payload - Gmail message payload
 * @returns {string} Extracted body text
 */
function extractMessageBody(payload) {
  let body = '';

  // Simple text part
  if (payload.body && payload.body.data) {
    try {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } catch (error) {
      console.warn('Failed to decode message body:', error);
    }
  }

  // Multipart message
  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        try {
          const partBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          body += partBody + '\n';
        } catch (error) {
          console.warn('Failed to decode message part:', error);
        }
      }
      // Recursively check nested parts
      if (part.parts) {
        body += extractMessageBody(part);
      }
    }
  }

  return body.trim();
}

/**
 * Format draft response for MCP protocol
 * @param {Object} data - Draft data to format
 * @returns {string} Formatted draft response
 */
export function formatDraftResponse(data) {
  const timestamp = data.timestamp || new Date().toISOString();
  
  switch (data.action) {
    case 'created':
      return `📝 Draft created successfully!

Draft Details:
- Draft ID: ${data.draftId}
- Message ID: ${data.messageId}
- To: ${data.to}
- Subject: ${data.subject}
- Created at: ${timestamp}

Your draft has been saved and can be edited or sent later.`;

    case 'list':
      if (data.count === 0) {
        return `📝 No drafts found.

You don't have any email drafts at the moment.`;
      }

      const draftList = data.drafts.map((draft, index) => {
        return `${index + 1}. Draft ID: ${draft.draftId}
   Message ID: ${draft.messageId}
   Preview: ${draft.snippet || '(No preview available)'}
   Created: ${draft.timestamp}`;
      }).join('\n\n');

      return `📝 Found ${data.count} draft(s)

${draftList}`;

    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Format search results for better readability
 * @param {Array} messages - Array of message objects
 * @param {string} query - Search query used
 * @returns {string} Formatted search results
 */
export function formatSearchResults(messages, query) {
  if (messages.length === 0) {
    return `🔍 No emails found matching "${query}"

Try adjusting your search terms or using Gmail search operators like:
- from:sender@email.com
- to:recipient@email.com  
- subject:"exact subject"
- has:attachment
- is:unread
- after:2024-01-01
- before:2024-12-31`;
  }

  const resultList = messages.map((msg, index) => {
    const date = new Date(msg.date).toLocaleDateString();
    const snippet = msg.snippet ? msg.snippet.substring(0, 80) + '...' : '';
    
    return `${index + 1}. ${msg.subject}
   📧 ${msg.from}
   📅 ${date}
   ${snippet}`;
  }).join('\n\n');

  return `🔍 Found ${messages.length} email(s) matching "${query}"

${resultList}`;
}

/**
 * Format error messages for Gmail operations
 * @param {string} operation - Operation that failed
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(operation, error) {
  const timestamp = new Date().toISOString();
  
  let errorType = 'Unknown error';
  let suggestion = 'Please try again or contact support.';
  
  if (error.message.includes('401') || error.message.includes('unauthorized')) {
    errorType = 'Authentication failed';
    suggestion = 'Please check your OAuth credentials and try again.';
  } else if (error.message.includes('403') || error.message.includes('forbidden')) {
    errorType = 'Permission denied';
    suggestion = 'Please ensure your OAuth credentials have the required Gmail scopes.';
  } else if (error.message.includes('404') || error.message.includes('not found')) {
    errorType = 'Resource not found';
    suggestion = 'The requested email, draft, or thread may have been deleted.';
  } else if (error.message.includes('400') || error.message.includes('bad request')) {
    errorType = 'Invalid request';
    suggestion = 'Please check your input parameters and try again.';
  } else if (error.message.includes('429') || error.message.includes('rate limit')) {
    errorType = 'Rate limit exceeded';
    suggestion = 'Please wait a moment before trying again.';
  }

  return `❌ Gmail ${operation} failed

Error Type: ${errorType}
Error Message: ${error.message}
Timestamp: ${timestamp}

Suggestion: ${suggestion}`;
}