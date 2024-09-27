import { Blog } from "@prisma/client";
import Link from "next/link";
import { FC } from "react";

interface BlogListProps {
  blogList: Blog[];
}

const BlogList: FC<BlogListProps> = ({ blogList }) => {
  return blogList.map((item) => (
    <Link href={`/personal/me/myBlogEdit/${item.id}`} key={item.id}>
      {item.title}
    </Link>
  ));
};

export default BlogList;
