import Blog from "../model/Blog";
import User from "../model/User";
// import seq from "../schema";

export const syncDb = async () => {
  try {
    await User.sync();
    await Blog.sync();
    // await seq.sync({ force: true });
    console.log("模型创建成功！");
  } catch (error) {
    console.error("模型创建失败：", error);
  } 
//   finally {
//     seq.close(); // 关闭数据库连接
//   }
};
