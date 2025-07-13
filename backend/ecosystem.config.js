module.exports = {
  apps: [
    {
      name: 'mcp-figma',
      script: './src/mcp-servers/figma/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/figma',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'figma',
        SERVICE_PORT: '49280'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'figma',
        SERVICE_PORT: '49280'
      },
      error_file: './logs/mcp-figma-error.log',
      out_file: './logs/mcp-figma-out.log',
      log_file: './logs/mcp-figma.log',
      time: true,
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'mcp-github',
      script: './src/mcp-servers/github/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/github',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'github',
        SERVICE_PORT: '49294'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'github',
        SERVICE_PORT: '49294'
      },
      error_file: './logs/mcp-github-error.log',
      out_file: './logs/mcp-github-out.log',
      log_file: './logs/mcp-github.log',
      time: true,
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'mcp-slack',
      script: './src/mcp-servers/slack/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/slack',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'slack',
        SERVICE_PORT: '49295'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'slack',
        SERVICE_PORT: '49295'
      },
      error_file: './logs/mcp-slack-error.log',
      out_file: './logs/mcp-slack-out.log',
      log_file: './logs/mcp-slack.log',
      time: true,
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'mcp-notion',
      script: './src/mcp-servers/notion/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/notion',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'notion',
        SERVICE_PORT: '49296'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'notion',
        SERVICE_PORT: '49296'
      },
      error_file: './logs/mcp-notion-error.log',
      out_file: './logs/mcp-notion-out.log',
      log_file: './logs/mcp-notion.log',
      time: true,
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'mcp-discord',
      script: './src/mcp-servers/discord/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/discord',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'discord',
        SERVICE_PORT: '49297'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'discord',
        SERVICE_PORT: '49297'
      },
      error_file: './logs/mcp-discord-error.log',
      out_file: './logs/mcp-discord-out.log',
      log_file: './logs/mcp-discord.log',
      time: true,
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};