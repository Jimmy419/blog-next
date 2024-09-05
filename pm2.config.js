module.exports = {
  apps: [
    {
      cwd: "./", // 应用的工作目录，通常是项目的根目录
      name: "blog-next",
      script: "npm",
      args: "start",
      autorestart: true, // 是否自动重启
      instances: "max",
      exec_mode: "cluster", // Cluster模式
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
    },
  ],
};
