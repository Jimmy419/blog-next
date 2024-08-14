import seq from "../schema";

export const syncDb = async () => {
  try {
    await seq.sync();
    console.log("模型创建成功！");
  } catch (error) {
    console.error("模型创建失败：", error);
  } 
//   finally {
//     seq.close(); // 关闭数据库连接
//   }
};
