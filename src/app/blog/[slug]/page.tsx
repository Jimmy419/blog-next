import { getBlogById } from "@/actions/blog.action";
import BlogShow from "@/components/blogShow/BlogShow";

const SinglePostPage = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const blogObj = await getBlogById(Number(slug));

  return (
    <div>
      <div>{blogObj.title}</div>
      <div>
        <BlogShow content={blogObj.content} />
      </div>
    </div>
  );
};

export default SinglePostPage;
