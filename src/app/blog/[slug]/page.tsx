import { getBlogById } from "@/actions/blog.action";
import BlogShow from "@/components/blogShow/BlogShow";

const SinglePostPage = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  console.log("slug", slug);
  const blogObj = await getBlogById(Number(slug));

  return (
    <div>
      <div>{blogObj.title}</div>
      <div>
        {blogObj.content}
        <BlogShow content={blogObj.content} />
      </div>
    </div>
  );
};

export default SinglePostPage;
