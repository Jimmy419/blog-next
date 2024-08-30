import { getMyBlogList } from "@/actions/blog.action";
import BlogEditForm from "@/components/blogEditForm/BlogEditForm";
import BlogList from "@/components/blogList/BlogList";
import ThemeChanger from "@/components/themeChanger/ThemeChanger";
import { Button } from "@nextui-org/react";

export default async function MePage() {
  const blogList = await getMyBlogList();

  return (
    <div>
      <Button>Add New Blog</Button>
      <ThemeChanger/>
      <BlogList blogList={blogList} />
    </div>
  );
}
