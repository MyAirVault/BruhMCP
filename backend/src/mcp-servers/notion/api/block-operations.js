/**
 * Notion Block Operations
 * Handle Notion block management via API
 */

const NOTION_BASE_URL = 'https://api.notion.com/v1';
const NOTION_API_VERSION = '2022-06-28';

/**
 * Make authenticated request to Notion API
 * @param {string} endpoint - API endpoint
 * @param {string} bearerToken - OAuth Bearer token
 * @param {Object} options - Request options
 * @returns {Object} API response
 */
async function makeNotionRequest(endpoint, bearerToken, options = {}) {
  const url = `${NOTION_BASE_URL}${endpoint}`;
  
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Notion-Version': NOTION_API_VERSION,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  console.log(`📡 Notion Blocks API Request: ${requestOptions.method} ${url}`);

  const response = await fetch(url, requestOptions);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Notion Blocks API error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.message) {
        errorMessage = `Notion Blocks API error: ${errorData.message}`;
      }
    } catch (parseError) {
      // Use the default error message if JSON parsing fails
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  console.log(`✅ Notion Blocks API Response: ${response.status}`);
  
  return data;
}

/**
 * Get block by ID
 * @param {Object} args - Block get arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block details
 */
export async function getBlock(args, bearerToken) {
  const { blockId } = args;

  const result = await makeNotionRequest(`/blocks/${blockId}`, bearerToken);

  return {
    action: 'get_block',
    block: result,
    timestamp: new Date().toISOString()
  };
}

/**
 * Update block content
 * @param {Object} args - Block update arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block update result
 */
export async function updateBlock(args, bearerToken) {
  const { blockId, ...updateData } = args;

  const result = await makeNotionRequest(`/blocks/${blockId}`, bearerToken, {
    method: 'PATCH',
    body: updateData
  });

  return {
    action: 'update_block',
    block: result,
    timestamp: new Date().toISOString()
  };
}

/**
 * Delete block
 * @param {Object} args - Block deletion arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block deletion result
 */
export async function deleteBlock(args, bearerToken) {
  const { blockId } = args;

  const result = await makeNotionRequest(`/blocks/${blockId}`, bearerToken, {
    method: 'DELETE'
  });

  return {
    action: 'delete_block',
    blockId,
    archived: result.archived || false,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get block children
 * @param {Object} args - Block children arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Block children
 */
export async function getBlockChildren(args, bearerToken) {
  const { blockId, start_cursor = null, page_size = 100 } = args;

  let endpoint = `/blocks/${blockId}/children`;
  const params = new URLSearchParams({
    page_size: Math.min(page_size, 100).toString(),
  });

  if (start_cursor) {
    params.append('start_cursor', start_cursor);
  }

  const result = await makeNotionRequest(`${endpoint}?${params}`, bearerToken);

  return {
    action: 'get_block_children',
    blockId,
    children: result.results || [],
    hasMore: result.has_more || false,
    nextCursor: result.next_cursor || null,
    timestamp: new Date().toISOString()
  };
}

/**
 * Append children to block
 * @param {Object} args - Append children arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Append result
 */
export async function appendBlockChildren(args, bearerToken) {
  const { blockId, children } = args;

  const result = await makeNotionRequest(`/blocks/${blockId}/children`, bearerToken, {
    method: 'PATCH',
    body: { children }
  });

  return {
    action: 'append_block_children',
    blockId,
    children: result.results || [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Create text block
 * @param {Object} args - Text block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Text block creation data
 */
export function createTextBlock(args, bearerToken) {
  const { content, annotations = {} } = args;

  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [
        {
          type: 'text',
          text: { content },
          annotations: {
            bold: annotations.bold || false,
            italic: annotations.italic || false,
            strikethrough: annotations.strikethrough || false,
            underline: annotations.underline || false,
            code: annotations.code || false,
            color: annotations.color || 'default'
          }
        }
      ]
    }
  };
}

/**
 * Create heading block
 * @param {Object} args - Heading block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Heading block creation data
 */
export function createHeadingBlock(args, bearerToken) {
  const { content, level = 1, annotations = {} } = args;

  const headingTypes = {
    1: 'heading_1',
    2: 'heading_2',
    3: 'heading_3'
  };

  const headingType = headingTypes[level] || 'heading_1';

  return {
    object: 'block',
    type: headingType,
    [headingType]: {
      rich_text: [
        {
          type: 'text',
          text: { content },
          annotations: {
            bold: annotations.bold || false,
            italic: annotations.italic || false,
            strikethrough: annotations.strikethrough || false,
            underline: annotations.underline || false,
            code: annotations.code || false,
            color: annotations.color || 'default'
          }
        }
      ]
    }
  };
}

/**
 * Create code block
 * @param {Object} args - Code block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} Code block creation data
 */
export function createCodeBlock(args, bearerToken) {
  const { content, language = 'plain text', caption = '' } = args;

  return {
    object: 'block',
    type: 'code',
    code: {
      rich_text: [
        {
          type: 'text',
          text: { content }
        }
      ],
      language,
      caption: caption ? [{ type: 'text', text: { content: caption } }] : []
    }
  };
}

/**
 * Create bulleted list item block
 * @param {Object} args - List item creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} List item block creation data
 */
export function createBulletedListItemBlock(args, bearerToken) {
  const { content, annotations = {} } = args;

  return {
    object: 'block',
    type: 'bulleted_list_item',
    bulleted_list_item: {
      rich_text: [
        {
          type: 'text',
          text: { content },
          annotations: {
            bold: annotations.bold || false,
            italic: annotations.italic || false,
            strikethrough: annotations.strikethrough || false,
            underline: annotations.underline || false,
            code: annotations.code || false,
            color: annotations.color || 'default'
          }
        }
      ]
    }
  };
}

/**
 * Create numbered list item block
 * @param {Object} args - List item creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} List item block creation data
 */
export function createNumberedListItemBlock(args, bearerToken) {
  const { content, annotations = {} } = args;

  return {
    object: 'block',
    type: 'numbered_list_item',
    numbered_list_item: {
      rich_text: [
        {
          type: 'text',
          text: { content },
          annotations: {
            bold: annotations.bold || false,
            italic: annotations.italic || false,
            strikethrough: annotations.strikethrough || false,
            underline: annotations.underline || false,
            code: annotations.code || false,
            color: annotations.color || 'default'
          }
        }
      ]
    }
  };
}

/**
 * Create to-do block
 * @param {Object} args - To-do block creation arguments
 * @param {string} bearerToken - OAuth Bearer token
 * @returns {Object} To-do block creation data
 */
export function createToDoBlock(args, bearerToken) {
  const { content, checked = false, annotations = {} } = args;

  return {
    object: 'block',
    type: 'to_do',
    to_do: {
      rich_text: [
        {
          type: 'text',
          text: { content },
          annotations: {
            bold: annotations.bold || false,
            italic: annotations.italic || false,
            strikethrough: annotations.strikethrough || false,
            underline: annotations.underline || false,
            code: annotations.code || false,
            color: annotations.color || 'default'
          }
        }
      ],
      checked
    }
  };
}