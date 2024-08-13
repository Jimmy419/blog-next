// lib/db.js
import mysql from "mysql2/promise";

export async function createConnection() {
  const connection = await mysql.createConnection({
    host: "localhost", // 数据库地址
    user: "root", // 数据库用户名
    password: "11111111", // 数据库密码
    database: "blog", // 数据库名称
  });
  return connection;
}
