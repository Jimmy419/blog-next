import { getMyBlogList } from "@/actions/blog.action";
import BlogEditForm from "@/components/blogEditForm/BlogEditForm";
import BlogList from "@/components/blogList/BlogList";

export default async function MePage() {
  const blogList = await getMyBlogList();

  return (
    <div>
      <BlogList blogList={blogList} />
    </div>
  );
}
