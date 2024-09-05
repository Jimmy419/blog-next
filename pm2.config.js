// module.exports = {
//   apps: [
//     {
//       name: "blog-next", // 应用名称
//       script: "npm", // 使用 npm 命令启动
//       args: "start", // npm 启动参数
//       cwd: "./", // 应用的工作目录，通常是项目的根目录
//       instances: 1, // 实例数量，0 或 "max" 表示根据 CPU 核心数启动
//       autorestart: true, // 是否自动重启
//       watch: false, // 是否监视文件变化，建议在生产环境中设为 false
//       max_memory_restart: "200M", // 当内存占用超过指定值时重启
//       error_file: "./logs/err.log",
//       out_file: "./logs/out.log",
//       env: {
//         NODE_ENV: "production", // 设置环境变量
//       },
//     },
//     // {
//     //   name: "nextjs-app",
//     //   script: "node",
//     //   args: "node_modules/next/dist/bin/next start",
//     //   cwd: "./",
//     //   instances: 1,
//     //   autorestart: true,
//     //   watch: false,
//     //   max_memory_restart: "200M",
//     //   env: {
//     //     NODE_ENV: "production",
//     //   },
//     //   restart_delay: 5000,
//     //   min_uptime: 60000,
//     //   max_restarts: 5,
//     //   error_file: "./logs/err.log",
//     //   out_file: "./logs/out.log",
//     //   combine_logs: true,
//     // }
//   ],
// };

module.exports = {
  apps: [
    {
      cwd: "./", // 应用的工作目录，通常是项目的根目录
      name: "blog-next",
      // script: "npm",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4000 ./",
      // args: "start",
      autorestart: true, // 是否自动重启
      // instances: 2,  // 使用机器的所有CPU内核
      exec_mode: "cluster", // Cluster模式
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      // env: {
      //   NODE_ENV: "production",
      // },
    },
  ],
};
