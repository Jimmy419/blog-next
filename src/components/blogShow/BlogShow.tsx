"use client";
import { MdPreview } from "md-editor-rt";

const BlogShow = ({ content }: { content: string }) => {
  return <MdPreview editorId="mdEditorTwo" theme="dark" modelValue={content} />;
};
export default BlogShow;
