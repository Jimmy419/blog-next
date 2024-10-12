import { getBlogById } from "@/actions/blog.action";
import BlogEditForm from "@/components/blogEditForm/BlogEditForm";
import { auth } from "@/lib/auth";

export default async function MyBlogEditPage({
  params: { blogId },
}: {
  params: { blogId: string };
}) {
  const session = await auth();
  const blogInfor =
    blogId != "0" ? await getBlogById(Number(blogId)) : undefined;

  return <BlogEditForm session={session} blogIpt={blogInfor} />;
}
