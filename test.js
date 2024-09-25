// 导入 http 模块
const http = require('http');

// 定义服务器端口号
const port = 3000;

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 设置响应头，状态码 200，内容类型为文本
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  // 响应内容
  res.end('Hello, World!\n');
});

// 监听指定端口
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});
