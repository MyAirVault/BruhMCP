export default {
  apps: [
    {
      name: 'mcp-figma',
      script: './src/mcp-servers/figma/index.js',
      cwd: process.cwd(),
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
      max_restarts: 10
    },
    {
      name: 'mcp-github',
      script: './src/mcp-servers/github/index.js',
      cwd: process.cwd(),
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
      max_restarts: 10
    },
    {
      name: 'mcp-slack',
      script: './src/mcp-servers/slack/index.js',
      cwd: process.cwd(),
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
      max_restarts: 10
    },
    {
      name: 'mcp-notion',
      script: './src/mcp-servers/notion/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/notion',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'notion',
        SERVICE_PORT: '49391'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'notion',
        SERVICE_PORT: '49391'
      },
      error_file: './logs/mcp-notion-error.log',
      out_file: './logs/mcp-notion-out.log',
      log_file: './logs/mcp-notion.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    },
    {
      name: 'mcp-reddit',
      script: './src/mcp-servers/reddit/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/reddit',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'reddit',
        SERVICE_PORT: '49425'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'reddit',
        SERVICE_PORT: '49425'
      },
      error_file: './logs/mcp-reddit-error.log',
      out_file: './logs/mcp-reddit-out.log',
      log_file: './logs/mcp-reddit.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    },
    {
      name: 'mcp-discord',
      script: './src/mcp-servers/discord/index.js',
      cwd: process.cwd(),
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
      max_restarts: 10
    },
    {
      name: 'mcp-airtable',
      script: './src/mcp-servers/airtable/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/airtable',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'airtable',
        SERVICE_PORT: '49171'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'airtable',
        SERVICE_PORT: '49171'
      },
      error_file: './logs/mcp-airtable-error.log',
      out_file: './logs/mcp-airtable-out.log',
      log_file: './logs/mcp-airtable.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    },
    {
      name: 'mcp-todoist',
      script: './src/mcp-servers/todoist/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/todoist',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'todoist',
        SERVICE_PORT: '49491'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'todoist',
        SERVICE_PORT: '49491'
      },
      error_file: './logs/mcp-todoist-error.log',
      out_file: './logs/mcp-todoist-out.log',
      log_file: './logs/mcp-todoist.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    }
  ]
};