"use client";
// import { MdPreview } from "md-editor-rt";
import { MdCatalog, MdEditor } from "md-editor-rt";
import { useEffect, useState } from "react";
import "md-editor-rt/lib/preview.css";

const BlogShow = ({ content }: { content: string }) => {
  // const [id] = useState("preview-only");
  // const [scrollElement, setScrollElement] = useState("");
  // const [pageLoaded, setPageLoaded] = useState(false);

  // useEffect(() => {
  //   setPageLoaded(true);
  //   setScrollElement("body");
  // }, []);

  // if (!pageLoaded) return <></>;
  // const scrollElement = document.documentElement;
  // return <MdPreview editorId="mdEditorTwo" theme="dark" modelValue={content} />;
  // return (
  //   <>
  //     <MdEditor editorId={id} modelValue={content} toolbars={[]}/>
  //     <MdCatalog editorId={id} scrollElement={scrollElement} />
  //   </>
  // );

  // return (
  //   <MdEditor
  //   editorId="mdEditor3"
  // pageFullscreen
  //   theme="dark"
  //   modelValue={content}
  //   toolbars={[]}
  // />
  // )

  return <div dangerouslySetInnerHTML={{ __html: content }}></div>
};
export default BlogShow;
