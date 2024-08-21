"use client";
import { FC } from "react";
import React, { useState } from "react";
import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";

interface BlogEditFormProps {}

const BlogEditForm: FC<BlogEditFormProps> = () => {
  const [content, setContent] = useState("# Hello Editor");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");

  const submitForm = () => {
    console.log(content, title, tag);
    fetch("/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        title,
        tag,
      }),
    }).then((data) => {
      console.log("data", data);
    });
  };

  return (
    <div>
      <div>
        <label htmlFor="title">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
        />
      </div>
      <div>
        <label htmlFor="tag">标签</label>
        <input
          type="text"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value);
          }}
        />
      </div>
      <MdEditor
        editorId="mdEditor"
        theme="dark"
        modelValue={content}
        onChange={setContent}
      />
      <div>
        <button onClick={submitForm}>提交</button>
      </div>
    </div>
  );
};

export default BlogEditForm;
