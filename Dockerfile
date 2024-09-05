# 使用官方 Node.js 镜像作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制所有项目文件到容器
COPY . .

# 构建 Next.js 项目
RUN npm run build

# 全局安装 PM2
RUN npm install pm2 -g

# 暴露应用端口
EXPOSE 3000

# 使用 PM2 启动 Next.js 应用
# CMD ["pm2-runtime", "start", "npm", "--", "start"]

# 使用 PM2 和 pm2.config.js 启动 Next.js 应用
CMD ["sh", "-c", "npx pm2 list && npx pm2-runtime start pm2.json"]

