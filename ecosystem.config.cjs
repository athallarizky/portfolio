module.exports = {
  apps: [
    {
      name: 'portfolio-backend',
      cwd: './backend',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'portfolio-frontend',
      cwd: './frontend',
      script: 'dist/server/entry.mjs',
      env: {
        NODE_ENV: 'production',
        PORT: '4321',
      },
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
