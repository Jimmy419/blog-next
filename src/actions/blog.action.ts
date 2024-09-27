import prisma from "@/db";
import { auth } from "@/lib/auth";

export const getBlogList = async () => {
  const dataList = await prisma.blog.findMany();
  return dataList;
};

export const getBlogById = async (id: number) => {
  const blogObj = await prisma.blog.findUnique({
    where: { id },
  });
  return blogObj;
};

export const getMyBlogList = async () => {
  const session = await auth();
  const author = Number(session?.user?.id);
  const blogList = await prisma.blog.findMany({
    where: {
      author,
    },
  });
  return blogList;
};
