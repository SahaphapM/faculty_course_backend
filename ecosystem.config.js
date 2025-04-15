module.exports = {
  apps: [
    {
      name: 'BUU-API',
      script: './start.sh', // Point to a shell script
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
