module.exports = {
  apps: [
    {
      name: "nextjs-app", // 应用名称
      script: "npm", // 使用 npm 命令启动
      args: "start", // npm 启动参数
      cwd: "./", // 应用的工作目录，通常是项目的根目录
      instances: 1, // 实例数量，0 或 "max" 表示根据 CPU 核心数启动
      autorestart: true, // 是否自动重启
      watch: false, // 是否监视文件变化，建议在生产环境中设为 false
      max_memory_restart: "200M", // 当内存占用超过指定值时重启
      env: {
        NODE_ENV: "production", // 设置环境变量
      },
    },
  ],
};
