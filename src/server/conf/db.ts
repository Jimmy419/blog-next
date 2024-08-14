const env = process.env.NODE_ENV; // 环境参数

interface DbConfigType {
  host: string;
  user: string;
  password: string;
  port: string;
  database: string;
  database_seq: string;
}

// 配置
let MYSQL_CONF: DbConfigType;
let REDIS_CONF;

if (env === "development") {
  console.log('develop environment')
  // mysql
  MYSQL_CONF = {
    host: "localhost",
    user: "root",
    password: "11111111",
    port: "3306",
    database: "blog",
    database_seq: "blog",
  };

  // redis
  REDIS_CONF = {
    port: 6379,
    host: "127.0.0.1",
  };
}

if (env === "production") {
  // mysql
  MYSQL_CONF = {
    host: "localhost",
    user: "root",
    password: "11111111",
    port: "3306",
    database: "blog",
    database_seq: "blog",
  };

  // redis
  REDIS_CONF = {
    port: 6379,
    host: "127.0.0.1",
  };
}

export { MYSQL_CONF, REDIS_CONF };
