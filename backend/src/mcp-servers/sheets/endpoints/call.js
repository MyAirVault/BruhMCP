/**
 * Main MCP call endpoint for Google Sheets service
 * Handles JSON-RPC requests using the MCP protocol
 * Based on Gmail MCP implementation patterns
 */

const { getOrCreateHandlerSession } = require('../services/handler-sessions');

/**
 * Handle MCP JSON-RPC calls
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleMCPCall(req, res) {
  const { instanceId } = req.params;
  
  try {
    // Get or create handler session for this instance
    const session = await getOrCreateHandlerSession(instanceId, req.oauth);
    
    if (!session || !session.handler) {
      return res.status(500).json({
        error: 'Failed to initialize MCP handler session',
        instanceId
      });
    }

    // Forward the request to the handler
    const response = await session.handler.handleRequest(req.body);
    
    // Send the response
    res.json(response);

  } catch (error) {
    console.error(`❌ MCP call error for instance ${instanceId}:`, error);
    
    // Return JSON-RPC error response
    res.status(500).json({
      jsonrpc: "2.0",
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: "Internal error",
        data: {
          details: error.message,
          instanceId
        }
      }
    });
  }
}

module.exports = handleMCPCall;