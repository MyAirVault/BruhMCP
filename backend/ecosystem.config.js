module.exports = {
  apps: [
    {
      name: 'web-server',
      script: './src/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '5000'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: '5000'
      },
      error_file: './logs/web-server-error.log',
      out_file: './logs/web-server-out.log',
      log_file: './logs/web-server.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    },
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
      name: 'mcp-dropbox',
      script: './src/mcp-servers/dropbox/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/dropbox',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'dropbox',
        SERVICE_PORT: '49260'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'dropbox',
        SERVICE_PORT: '49260'
      },
      error_file: './logs/mcp-dropbox-error.log',
      out_file: './logs/mcp-dropbox-out.log',
      log_file: './logs/mcp-dropbox.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    },
    {
      name: 'mcp-gmail',
      script: './src/mcp-servers/gmail/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/gmail',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'gmail',
        SERVICE_PORT: '49301'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'gmail',
        SERVICE_PORT: '49301'
      },
      error_file: './logs/mcp-gmail-error.log',
      out_file: './logs/mcp-gmail-out.log',
      log_file: './logs/mcp-gmail.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    },
    {
      name: 'mcp-googledrive',
      script: './src/mcp-servers/googledrive/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/googledrive',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'googledrive',
        SERVICE_PORT: '49302'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'googledrive',
        SERVICE_PORT: '49302'
      },
      error_file: './logs/mcp-googledrive-error.log',
      out_file: './logs/mcp-googledrive-out.log',
      log_file: './logs/mcp-googledrive.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    },
    {
      name: 'mcp-sheets',
      script: './src/mcp-servers/sheets/index.js',
      cwd: process.cwd(),
      instances: 1,
      autorestart: true,
      watch: './src/mcp-servers/sheets',
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        SERVICE_NAME: 'sheets',
        SERVICE_PORT: '49467'
      },
      env_development: {
        NODE_ENV: 'development',
        SERVICE_NAME: 'sheets',
        SERVICE_PORT: '49467'
      },
      error_file: './logs/mcp-sheets-error.log',
      out_file: './logs/mcp-sheets-out.log',
      log_file: './logs/mcp-sheets.log',
      time: true,
      merge_logs: true,
      max_restarts: 10
    }
  ]
};