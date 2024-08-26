import { auth } from "@/lib/auth";
import Blog from "@/server/model/Blog";

export const getBlogList = async () => {
  const dataList = await Blog.findAll();
  return dataList.map((item) => item.dataValues);
};

export const getBlogById = async (id: number) => {
  const blogObj = await Blog.findOne({
    where: { id },
  });
  return blogObj?.dataValues;
};

export const getMyBlogList = async () => {
  const session = await auth();
  const author = Number(session?.user?.id);
  const blogList = await Blog.findAll({
    where:{
      author
    }
  })
  return blogList.map(item=>item.dataValues);
}
