"use client";
import { MdEditor } from "md-editor-rt";

const BlogShow = ({ content }: { content: string }) => {
  return (
    <MdEditor
      editorId="mdEditorTwo"
      theme="dark"
      readOnly={true}
      modelValue={content}
    />
  );
};
export default BlogShow;
