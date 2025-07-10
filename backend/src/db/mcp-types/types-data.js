/**
 * MCP type definitions with proper credential structures
 */
export const mcpTypesData = [
	{
		name: 'figma',
		display_name: 'Figma MCP',
		description: 'Access and manage Figma design files, components, and team libraries through MCP',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/figma.svg',
		server_script: './mcp-servers/figma-mcp-server.js',
		config_template: {
			api_version: 'v1',
			base_url: 'https://api.figma.com/v1',
		},
		required_credentials: [
			{
				name: 'api_key',
				type: 'password',
				description: 'Personal Access Token from Figma account settings',
				required: true,
			},
		],
		resource_limits: {
			max_memory_mb: 512,
			max_cpu_percent: 50,
			max_requests_per_minute: 1000,
		},
	},
	{
		name: 'gmail',
		display_name: 'Gmail MCP',
		description: 'Access Gmail API for email management, sending, and organization through MCP',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/gmail.svg',
		server_script: './mcp-servers/gmail-mcp-server.js',
		config_template: {
			api_version: 'v1',
			scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
			base_url: 'https://gmail.googleapis.com/gmail/v1',
		},
		required_credentials: [
			{
				name: 'client_id',
				type: 'text',
				description: 'OAuth 2.0 Client ID from Google Cloud Console',
				required: true,
			},
			{
				name: 'client_secret',
				type: 'password',
				description: 'OAuth 2.0 Client Secret from Google Cloud Console',
				required: true,
			},
			{
				name: 'refresh_token',
				type: 'password',
				description: 'OAuth 2.0 Refresh Token for accessing Gmail API',
				required: true,
			},
		],
		resource_limits: {
			max_memory_mb: 1024,
			max_cpu_percent: 60,
			max_requests_per_minute: 250,
		},
	},
	{
		name: 'slack',
		display_name: 'Slack MCP',
		description: 'Integrate with Slack workspaces for messaging, channel management, and bot interactions',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg',
		server_script: './mcp-servers/slack-mcp-server.js',
		config_template: {
			api_version: 'v1',
			base_url: 'https://slack.com/api',
			scopes: ['channels:read', 'chat:write', 'users:read', 'files:read'],
		},
		required_credentials: [
			{
				name: 'bot_token',
				type: 'password',
				description: 'Bot User OAuth Token (xoxb-...) from Slack App settings',
				required: true,
			},
		],
		resource_limits: {
			max_memory_mb: 768,
			max_cpu_percent: 40,
			max_requests_per_minute: 100,
		},
	},
	{
		name: 'github',
		display_name: 'GitHub MCP',
		description: 'Access GitHub repositories, issues, pull requests, and manage code through MCP',
		icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg',
		server_script: './mcp-servers/github-mcp-server.js',
		config_template: {
			api_version: 'v3',
			base_url: 'https://api.github.com',
			scopes: ['repo', 'read:org', 'read:user', 'gist'],
		},
		required_credentials: [
			{
				name: 'personal_access_token',
				type: 'password',
				description: 'Personal Access Token from GitHub Developer settings',
				required: true,
			},
		],
		resource_limits: {
			max_memory_mb: 1024,
			max_cpu_percent: 50,
			max_requests_per_minute: 5000,
		},
	},
];
