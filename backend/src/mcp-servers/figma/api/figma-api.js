/**
 * Figma API integration
 * Handles all communication with Figma's REST API
 */

import fetch from 'node-fetch';

const FIGMA_BASE_URL = 'https://api.figma.com/v1';

/**
 * Get file details from Figma API
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaFile(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Get published components from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComponents(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/components`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Get published styles from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaStyles(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/styles`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}

/**
 * Get comments from a Figma file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComments(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/comments`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get file nodes by their IDs
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs to fetch
 * @returns {Promise<any>}
 */
export async function getFigmaNodes(fileKey, apiKey, nodeIds) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!nodeIds || nodeIds.length === 0) {
		throw new Error('Node IDs are required');
	}

	const ids = nodeIds.join(',');
	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/nodes?ids=${ids}`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get file metadata
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaFileMeta(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/meta`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get file versions
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaFileVersions(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/versions`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get rendered images from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string[]} nodeIds - Array of node IDs to render
 * @param {string} [format='png'] - Image format (png, jpg, svg, pdf)
 * @param {number} [scale=1] - Image scale factor
 * @returns {Promise<any>}
 */
export async function getFigmaImages(fileKey, apiKey, nodeIds, format = 'png', scale = 1) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!nodeIds || nodeIds.length === 0) {
		throw new Error('Node IDs are required');
	}

	const ids = nodeIds.join(',');
	const params = new URLSearchParams({
		ids,
		format,
		scale: scale.toString(),
	});

	const response = await fetch(`${FIGMA_BASE_URL}/images/${fileKey}?${params}`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get image fills from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaImageFills(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/images`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get user information
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaUser(apiKey) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/me`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get team projects
 * @param {string} teamId - Team ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaTeamProjects(teamId, apiKey) {
	if (!teamId) {
		throw new Error('Team ID is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/teams/${teamId}/projects`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Team not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get project files
 * @param {string} projectId - Project ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaProjectFiles(projectId, apiKey) {
	if (!projectId) {
		throw new Error('Project ID is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/projects/${projectId}/files`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Project not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Post a comment to a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} message - Comment message
 * @param {Object} [position] - Comment position with x, y coordinates
 * @returns {Promise<any>}
 */
export async function postFigmaComment(fileKey, apiKey, message, position) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!message) {
		throw new Error('Message is required');
	}

	const requestBody = {
		message,
	};

	if (position) {
		requestBody.client_meta = {
			x: position.x,
			y: position.y,
		};
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/comments`, {
		method: 'POST',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(requestBody),
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Delete a comment from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} commentId - Comment ID to delete
 * @returns {Promise<any>}
 */
export async function deleteFigmaComment(fileKey, apiKey, commentId) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!commentId) {
		throw new Error('Comment ID is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/comments/${commentId}`, {
		method: 'DELETE',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Comment not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get team components
 * @param {string} teamId - Team ID
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaTeamComponents(teamId, apiKey) {
	if (!teamId) {
		throw new Error('Team ID is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/teams/${teamId}/components`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Team not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get component sets from a file
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComponentSets(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/component_sets`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get individual component information
 * @param {string} componentKey - Component key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComponentInfo(componentKey, apiKey) {
	if (!componentKey) {
		throw new Error('Component key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/components/${componentKey}`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Component not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get component set information
 * @param {string} componentSetKey - Component set key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaComponentSetInfo(componentSetKey, apiKey) {
	if (!componentSetKey) {
		throw new Error('Component set key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/component_sets/${componentSetKey}`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Component set not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get local variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaLocalVariables(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/variables/local`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Variables API is available only to Enterprise organizations');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get published variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @returns {Promise<any>}
 */
export async function getFigmaPublishedVariables(fileKey, apiKey) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/variables/published`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Variables API is available only to Enterprise organizations');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Create variables in a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data to create
 * @returns {Promise<any>}
 */
export async function postFigmaVariables(fileKey, apiKey, variableData) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!variableData) {
		throw new Error('Variable data is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/variables`, {
		method: 'POST',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(variableData),
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Variables API is available only to Enterprise organizations');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Update variables in a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data to update
 * @returns {Promise<any>}
 */
export async function putFigmaVariables(fileKey, apiKey, variableData) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!variableData) {
		throw new Error('Variable data is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/variables`, {
		method: 'PUT',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(variableData),
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Variables API is available only to Enterprise organizations');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Delete variables from a file (Enterprise only)
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {any} variableData - Variable data specifying what to delete
 * @returns {Promise<any>}
 */
export async function deleteFigmaVariables(fileKey, apiKey, variableData) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!variableData) {
		throw new Error('Variable data is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}/variables`, {
		method: 'DELETE',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(variableData),
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Variables API is available only to Enterprise organizations');
		}
		if (response.status === 404) {
			throw new Error('Figma file not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Create a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {any} webhookData - Webhook configuration data
 * @returns {Promise<any>}
 */
export async function postFigmaWebhook(apiKey, webhookData) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!webhookData) {
		throw new Error('Webhook data is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/v2/webhooks`, {
		method: 'POST',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(webhookData),
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Insufficient permissions to create webhook');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get webhooks (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} [teamId] - Optional team ID to filter webhooks
 * @returns {Promise<any>}
 */
export async function getFigmaWebhooks(apiKey, teamId) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	let url = `${FIGMA_BASE_URL}/v2/webhooks`;
	if (teamId) {
		url += `?team_id=${teamId}`;
	}

	const response = await fetch(url, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Insufficient permissions to access webhooks');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Update a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to update
 * @param {any} webhookData - Updated webhook configuration data
 * @returns {Promise<any>}
 */
export async function putFigmaWebhook(apiKey, webhookId, webhookData) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!webhookId) {
		throw new Error('Webhook ID is required');
	}

	if (!webhookData) {
		throw new Error('Webhook data is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/v2/webhooks/${webhookId}`, {
		method: 'PUT',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(webhookData),
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Insufficient permissions to update webhook');
		}
		if (response.status === 404) {
			throw new Error('Webhook not found');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Delete a webhook (Webhooks V2 API)
 * @param {string} apiKey - User's Figma API key
 * @param {string} webhookId - Webhook ID to delete
 * @returns {Promise<any>}
 */
export async function deleteFigmaWebhook(apiKey, webhookId) {
	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!webhookId) {
		throw new Error('Webhook ID is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/v2/webhooks/${webhookId}`, {
		method: 'DELETE',
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 403) {
			throw new Error('Insufficient permissions to delete webhook');
		}
		if (response.status === 404) {
			throw new Error('Webhook not found');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}


/**
 * Get file at specific version
 * @param {string} fileKey - Figma file key
 * @param {string} apiKey - User's Figma API key
 * @param {string} versionId - Version ID to retrieve
 * @returns {Promise<any>}
 */
export async function getFigmaFileWithVersion(fileKey, apiKey, versionId) {
	if (!fileKey) {
		throw new Error('File key is required');
	}

	if (!apiKey) {
		throw new Error('Figma API key is required');
	}

	if (!versionId) {
		throw new Error('Version ID is required');
	}

	const response = await fetch(`${FIGMA_BASE_URL}/files/${fileKey}?version=${versionId}`, {
		headers: {
			'X-Figma-Token': apiKey,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Invalid Figma API key');
		}
		if (response.status === 404) {
			throw new Error('Figma file or version not found or not accessible');
		}
		throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();
	return data;
}
