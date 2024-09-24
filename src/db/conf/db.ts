const env = process.env; // 环境参数

interface DbConfigType {
  host: string;
  user: string;
  password: string;
  port: string;
  database: string;
  database_seq: string;
}

// 配置
export const MYSQL_CONF: DbConfigType = {
  host: env.DB_HOST_IP as string,
  user: env.DB_USER_NAME as string,
  password: env.DB_USER_PASS as string,
  port: "3306",
  database: "blog",
  database_seq: "blog",
};
