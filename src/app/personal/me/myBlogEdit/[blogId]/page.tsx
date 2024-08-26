import { getBlogById } from "@/actions/blog.action";
import BlogEditForm from "@/components/blogEditForm/BlogEditForm";

export default async function MyBlogEditPage({
  params: { blogId },
}: {
  params: { blogId: string };
}) {
  const blogInfor =
    blogId != "0" ? await getBlogById(Number(blogId)) : undefined;

  return <BlogEditForm blogIpt={blogInfor} />;
}
