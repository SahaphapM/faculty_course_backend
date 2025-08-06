module.exports = {
  apps: [
    {
      name: 'skill-mapping-backend',
      script: 'dist/src/main.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
