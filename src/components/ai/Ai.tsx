"use client";
import { useEffect } from "react";
import "./Ai.css";

declare global {
  interface Window {
    CHATBOT_CONFIG: any;
  }
}

const Ai = () => {
  useEffect(() => {
    // 页面总结按钮的disabled状态设置
    const setPageSummarizeButton = (disabled: boolean) => {
      const button = document.querySelector(".webChat-footer-extra-button");
      if (button) {
        (button as HTMLButtonElement).disabled = disabled;
      }
    };

    const defaultPrompt = "总结当前页面内容";

    // 全局配置对象
    window.CHATBOT_CONFIG = {
      endpoint: "/api/ai",
      feedBackConfig: {
        like: {
          hide: false,
          onClick: () => console.log("点赞"),
        },
        disLike: {
          hide: false,
          onClick: () => console.log("点踩"),
        },
      },
      dataProcessor: {
        rewritePrompt(prompt: any) {
          if (prompt === defaultPrompt) {
            const pageContentDom = document.getElementById(
              "concept-ybr-fg1-tdb"
            );
            return `请使用中文总结以下内容：\n\n------\n\n${pageContentDom?.outerText}`;
          }
          return prompt;
        },
      },
      aiChatOptions: {
        className: "summarize-ai-chat",
        personaOptions: {
          assistant: {
            avatar:
              "https://help-static-aliyun-doc.aliyuncs.com/demos/ai-assistant-logo.gif",
          },
          user: {
            avatar:
              "https://oss.aliyuncs.com/aliyun_id_photo_bucket/default_handsome.jpg",
          },
        },
        composerOptions: {
          placeholder: "请将您遇到的问题告诉我",
          hideStopButton: true,
        },
        events: {
          messageSent: () => setPageSummarizeButton(true),
          messageReceived: () => setPageSummarizeButton(false),
        },
        conversationOptions: {
          conversationStarters: [
            { prompt: defaultPrompt },
            { prompt: "为什么说弹性是云的最大优势?" },
            { prompt: "为什么选择阿里云？" },
          ],
          layout: "list",
        },
      },
      customRenderOptions: {
        greetingOptions: {
          greeting: "你好, 我是",
          name: "AI助手",
          quickStartItemClick: ({ api, item }: { api: any; item: any }) => {
            console.log("点击了快速入口");
            api?.composer && api.composer.send(item?.prompt);
          },
        },
        onInit: (params: any) => {
          const { api } = params || {};
          const footer = document.querySelector(".nlux-composer-container");
          if (!footer) return;

          const newDiv = document.createElement("div");
          newDiv.className = "webChat-footer-extra";

          const button = document.createElement("button");
          button.innerHTML = "页面总结";
          button.className = "webChat-footer-extra-button";
          button.onclick = () => api?.composer?.send(defaultPrompt);

          newDiv.appendChild(button);
          footer.parentElement?.insertBefore(newDiv, footer);

          const title = document.querySelector(
            ".webchat-container-toolbar span"
          );
          if (title) title.innerHTML = "AI助手";
        },
        stopButtonClass: "summarize-stop-button",
        onChatbotRefresh: () => setPageSummarizeButton(false),
      },
    };

    // 加载外部 CSS 和 JS
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.crossOrigin = "anonymous";
    cssLink.href =
      "https://g.alicdn.com/aliyun-documentation/web-chatbot-ui/0.0.19/index.css";
    document.head.appendChild(cssLink);

    const jsScript = document.createElement("script");
    jsScript.type = "module";
    jsScript.crossOrigin = "anonymous";
    jsScript.src =
      "https://g.alicdn.com/aliyun-documentation/web-chatbot-ui/0.0.19/index.js";
    document.body.appendChild(jsScript);

    return () => {
      // 清理动态加载的资源
      document.head.removeChild(cssLink);
      document.body.removeChild(jsScript);
    };
  }, []);

  return null; // 该组件不会渲染 UI，仅加载外部资源
};

export default Ai;
