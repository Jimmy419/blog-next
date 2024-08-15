import { DataTypes } from "sequelize";
import seq from "../schema";

const User = seq.define(
  "user", // 对应数据库的 users 表（英文复数）
  {
    /* 不用定义 id ，seq 会自动增加 */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    username: {
      type: DataTypes.STRING,
    },

    password: {
      type: DataTypes.STRING,
    },

    realname: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
    },

    image: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

export default User;
