module.exports = {
  apps: [
    {
      name: "blog",
      script: "./server.js",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/app.log",

      env: {
        PORT: 5000,
        MONGO_CONNECT: process.env.MONGO_CONNECT,
        POSTGRES_USER: process.env.POSTGRES_USER,
        POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
        POSTGRES_DB: process.env.POSTGRES_DB,
      },
    },
  ],
};
