/**
 * Gmail Label Operations
 * Handle Gmail label management via API
 */

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';

/**
 * @typedef {Object} RequestOptions
 * @property {string} [method] - HTTP method
 * @property {Record<string, string>} [headers] - Request headers
 * @property {any} [body] - Request body
 */

/**
 * @typedef {Object} GmailLabel
 * @property {string} id - Label ID
 * @property {string} name - Label name
 * @property {string} type - Label type (system/user)
 * @property {number} [messagesTotal] - Total messages
 * @property {number} [messagesUnread] - Unread messages
 * @property {number} [threadsTotal] - Total threads
 * @property {number} [threadsUnread] - Unread threads
 * @property {string} [messageListVisibility] - Message list visibility
 * @property {string} [labelListVisibility] - Label list visibility
 */

/**
 * @typedef {Object} GmailApiResponse
 * @property {GmailLabel[]} [labels] - Array of labels
 * @property {string} [id] - ID field
 * @property {string} [name] - Name field
 * @property {string} [type] - Type field
 * @property {string} [threadId] - Thread ID
 * @property {string[]} [labelIds] - Label IDs
 * @property {number} [messagesTotal] - Total messages
 * @property {number} [messagesUnread] - Unread messages
 * @property {number} [threadsTotal] - Total threads
 * @property {number} [threadsUnread] - Unread threads
 * @property {string} [messageListVisibility] - Message list visibility
 * @property {string} [labelListVisibility] - Label list visibility
 */

/**
 * @typedef {Object} CreateLabelArgs
 * @property {string} name - Label name
 * @property {string} [messageListVisibility] - Message list visibility
 * @property {string} [labelListVisibility] - Label list visibility
 */

/**
 * @typedef {Object} ModifyLabelsArgs
 * @property {string} messageId - Message ID
 * @property {string[]} [addLabelIds] - Label IDs to add
 * @property {string[]} [removeLabelIds] - Label IDs to remove
 */

/**
 * @typedef {Object} LabelIdArgs
 * @property {string} labelId - Label ID
 */

/**
 * @typedef {Object} UpdateLabelArgs
 * @property {string} labelId - Label ID
 * @property {string} [name] - Label name
 * @property {string} [messageListVisibility] - Message list visibility
 * @property {string} [labelListVisibility] - Label list visibility
 */

/**
 * Make authenticated request to Gmail API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {RequestOptions} options - Request options
 * @returns {Promise<GmailApiResponse>} API response
 */
async function makeGmailRequest(endpoint, bearerToken, options = {}) {
  const url = `${GMAIL_API_BASE}${endpoint}`;
  
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  console.log(`📡 Gmail Labels API Request: ${requestOptions.method} ${url}`);

  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Gmail Labels API error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error && errorData.error.message) {
        errorMessage = `Gmail Labels API error: ${errorData.error.message}`;
      }
    } catch (parseError) {
      // Use the default error message if JSON parsing fails
    }
    
    throw new Error(errorMessage);
  }

  /** @type {GmailApiResponse} */
  const data = /** @type {GmailApiResponse} */ (await response.json());
  console.log(`✅ Gmail Labels API Response: ${response.status}`);
  
  return data;
}

/**
 * List all Gmail labels
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Labels list
 */
async function listLabels(bearerToken) {
  const result = await makeGmailRequest('/users/me/labels', bearerToken);

  const labels = (result.labels || []).map((/** @type {GmailLabel} */ label) => ({
    id: label.id,
    name: label.name,
    type: label.type,
    messagesTotal: label.messagesTotal || 0,
    messagesUnread: label.messagesUnread || 0,
    threadsTotal: label.threadsTotal || 0,
    threadsUnread: label.threadsUnread || 0,
    messageListVisibility: label.messageListVisibility || 'show',
    labelListVisibility: label.labelListVisibility || 'labelShow'
  }));

  // Separate system and user labels
  const systemLabels = labels.filter((/** @type {GmailLabel} */ label) => label.type === 'system');
  const userLabels = labels.filter((/** @type {GmailLabel} */ label) => label.type === 'user');

  return {
    action: 'list_labels',
    totalCount: labels.length,
    systemLabels: {
      count: systemLabels.length,
      labels: systemLabels
    },
    userLabels: {
      count: userLabels.length,
      labels: userLabels
    },
    allLabels: labels,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a new Gmail label
 * @param {CreateLabelArgs} args - Label creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label creation result
 */
async function createLabel(args, bearerToken) {
  const {
    name,
    messageListVisibility = 'show',
    labelListVisibility = 'labelShow'
  } = args;

  const labelData = {
    name,
    messageListVisibility,
    labelListVisibility
  };

  const result = await makeGmailRequest('/users/me/labels', bearerToken, {
    method: 'POST',
    body: labelData
  });

  return {
    action: 'create_label',
    label: {
      id: result.id,
      name: result.name,
      type: result.type,
      messageListVisibility: result.messageListVisibility,
      labelListVisibility: result.labelListVisibility
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Modify labels on a message
 * @param {ModifyLabelsArgs} args - Label modification arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label modification result
 */
async function modifyLabels(args, bearerToken) {
  const {
    messageId,
    addLabelIds = [],
    removeLabelIds = []
  } = args;

  if (addLabelIds.length === 0 && removeLabelIds.length === 0) {
    throw new Error('At least one of addLabelIds or removeLabelIds must be provided');
  }

  const modifyData = {};
  
  if (addLabelIds.length > 0) {
    modifyData.addLabelIds = addLabelIds;
  }
  
  if (removeLabelIds.length > 0) {
    modifyData.removeLabelIds = removeLabelIds;
  }

  const result = await makeGmailRequest(`/users/me/messages/${messageId}/modify`, bearerToken, {
    method: 'POST',
    body: modifyData
  });

  return {
    action: 'modify_labels',
    messageId: result.id,
    threadId: result.threadId,
    labelIds: result.labelIds,
    addedLabels: addLabelIds,
    removedLabels: removeLabelIds,
    timestamp: new Date().toISOString()
  };
}

/**
 * Delete a Gmail label
 * @param {LabelIdArgs} args - Label deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label deletion result
 */
async function deleteLabel(args, bearerToken) {
  const { labelId } = args;

  await makeGmailRequest(`/users/me/labels/${labelId}`, bearerToken, {
    method: 'DELETE'
  });

  return {
    action: 'delete_label',
    labelId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Update a Gmail label
 * @param {UpdateLabelArgs} args - Label update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label update result
 */
async function updateLabel(args, bearerToken) {
  const {
    labelId,
    name,
    messageListVisibility,
    labelListVisibility
  } = args;

  const updateData = {};
  
  if (name !== undefined) {
    updateData.name = name;
  }
  
  if (messageListVisibility !== undefined) {
    updateData.messageListVisibility = messageListVisibility;
  }
  
  if (labelListVisibility !== undefined) {
    updateData.labelListVisibility = labelListVisibility;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('At least one field (name, messageListVisibility, labelListVisibility) must be provided');
  }

  const result = await makeGmailRequest(`/users/me/labels/${labelId}`, bearerToken, {
    method: 'PATCH',
    body: updateData
  });

  return {
    action: 'update_label',
    label: {
      id: result.id,
      name: result.name,
      type: result.type,
      messageListVisibility: result.messageListVisibility,
      labelListVisibility: result.labelListVisibility
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get label details by ID
 * @param {LabelIdArgs} args - Label get arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Promise<Object>} Label details
 */
async function getLabel(args, bearerToken) {
  const { labelId } = args;

  const result = await makeGmailRequest(`/users/me/labels/${labelId}`, bearerToken);

  return {
    action: 'get_label',
    label: {
      id: result.id,
      name: result.name,
      type: result.type,
      messagesTotal: result.messagesTotal || 0,
      messagesUnread: result.messagesUnread || 0,
      threadsTotal: result.threadsTotal || 0,
      threadsUnread: result.threadsUnread || 0,
      messageListVisibility: result.messageListVisibility || 'show',
      labelListVisibility: result.labelListVisibility || 'labelShow'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  listLabels,
  createLabel,
  modifyLabels,
  deleteLabel,
  updateLabel,
  getLabel
};