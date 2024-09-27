import prisma from "@/db";

export const getUsers = async () => {
  try {
    // await User.sync();
    const list = await prisma.user.findMany({});
    return list;
  } catch (err) {
    throw new Error("Failed to fetch posts!");
  }
};
