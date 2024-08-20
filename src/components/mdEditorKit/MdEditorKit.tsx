"use client";
import { FC } from "react";
import React, { useState } from "react";
import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";

interface MdEditorKitProps {}

const MdEditorKit: FC<MdEditorKitProps> = () => {
  const [text, setText] = useState("# Hello Editor");
  return <MdEditor editorId="mdEditor" theme="dark" modelValue={text} onChange={setText} />;
};

export default MdEditorKit;
