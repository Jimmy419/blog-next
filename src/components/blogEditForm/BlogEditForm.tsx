"use client";
import { FC } from "react";
import React, { useState } from "react";
import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import { Blog } from "@prisma/client";
import { Session } from "next-auth";
import { Random } from "mockjs";

interface BlogEditFormProps {
  blogIpt?: Blog | null;
  session: Session | null;
}

const BlogEditForm: FC<BlogEditFormProps> = ({ blogIpt, session }) => {
  const [content, setContent] = useState(blogIpt?.content || "");
  const [title, setTitle] = useState(blogIpt?.title || "");
  const [tag, setTag] = useState(blogIpt?.tag || "");
  console.log("session", session);

  const submitForm = () => {
    fetch("/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(blogIpt ? blogIpt : {}),
        content,
        title,
        tag,
      }),
    }).then((data) => {
      console.log("data", data);
    });
  };

  const mockBlog = () => {
    fetch("/api/blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: Random.string(10,2000),
        title: Random.string(10,20),
        tag: Random.string(0,10),
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
        {session?.user.roles && session?.user.roles.includes("1") && (
          <button onClick={mockBlog}>Mock Data</button>
        )}
      </div>
    </div>
  );
};

export default BlogEditForm;
