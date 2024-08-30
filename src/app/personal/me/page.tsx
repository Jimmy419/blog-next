import { getMyBlogList } from "@/actions/blog.action";
import BlogEditForm from "@/components/blogEditForm/BlogEditForm";
import BlogList from "@/components/blogList/BlogList";
import ThemeChanger from "@/components/themeChanger/ThemeChanger";
import { Button } from "@nextui-org/react";
import Link from "next/link";

export default async function MePage() {
  const blogList = await getMyBlogList();

  return (
    <div>
      <Link href={`/personal/me/myBlogEdit/0`}>
        <Button>Add New Blog</Button>
      </Link>
      <ThemeChanger />
      <BlogList blogList={blogList} />
    </div>
  );
}
