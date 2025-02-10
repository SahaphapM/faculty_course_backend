module.exports = {
  apps: [
    {
      name: 'BUU API', // Give your application a descriptive name
      script: './dist/main.js', // Path to your built application's entry point
      cwd: './', // Current working directory (usually the project root)
      instances: 1, // Number of instances to run (for load balancing, usually equals to number of cores)
      autorestart: true, // Automatically restart if the application crashes
      watch: false, // Set to true if you want PM2 to restart on file changes (use with caution in production)
      // env: {  // Environment variables
      //   NODE_ENV: "production"
      // },
      // env_development: { // Environment variables for development
      //   NODE_ENV: "development"
      // }
    },
  ],
};
