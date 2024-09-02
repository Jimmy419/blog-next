import User from "../db/model/User";

export const getUsers = async () => {
  try {
    // await User.sync();
    const list = await User.findAll({
      // where: whereOpt,
      // order: [
      //     ['id', 'desc'] // 排序
      // ]
    });
    return list;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch posts!");
  }
};
