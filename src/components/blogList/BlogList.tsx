import { BlogType } from "@/types";
import Link from "next/link";
import { FC } from "react";

interface BlogListProps {
  blogList: BlogType[];
}

const BlogList: FC<BlogListProps> = ({ blogList }) => {
  return blogList.map((item) => (
    <Link href={`/personal/me/myBlogEdit/${item.id}`} key={item.id}>
      {item.title}
    </Link>
  ));
};

export default BlogList;
