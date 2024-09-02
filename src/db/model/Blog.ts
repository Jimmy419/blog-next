import { DataTypes } from "sequelize";
import seq from "../schema";

const Blog = seq.define(
  "blog", // 对应数据库的 blogs 表（英文复数）
  {
    /* 不用定义 id ，seq 会自动增加 */

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    tag: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT, // TEXT 可存储大文件
      allowNull: false,
    },

    author: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /* 不用定义 createTime ，seq 会自动增加 createdAt 和 updatedAt */
  }
);

export default Blog;
