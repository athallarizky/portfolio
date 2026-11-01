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
      // sprint-29 (sprint-11 RCA): bounded restart beats OOM-kill on the 2 GB box —
      // PM2 recycles the process instead of the kernel taking out sshd next.
      max_memory_restart: '1G',
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
      max_memory_restart: '512M',
    },
  ],
};
