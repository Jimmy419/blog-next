"use client";
import { MdCatalog, MdPreview } from "md-editor-rt";
import "md-editor-rt/lib/preview.css";
import { useState } from "react";

const BlogShow = ({ content }: { content: string }) => {
  const [id] = useState("preview-only");
  const [scrollElement] = useState("body");

  return (
    <div className="flex w-full flex-col md:flex-row">
      <MdCatalog
        className="md:flex-none md:w-1/5"
        editorId={id}
        scrollElement={scrollElement}
      />
      <MdPreview className="md:flex-auto" editorId={id} modelValue={content} />
    </div>
  );
};
export default BlogShow;
