"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { v4 as uuidv4 } from "uuid";
import { RemoteRunnable } from "langchain/runnables/remote";
import { applyPatch } from "@langchain/core/utils/json_patch";

import { ChatMessageBubble, Message } from "./ChatMessageBubble";
import { marked } from "marked";
import { Renderer } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/gradient-dark.css";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Select,
} from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { Source } from "./SourceBubble";
import { DefaultQuestion } from "./DefaultQuestion";

type RetrieverName = "tavily" | "kay" | "you" | "google" | "kay_press_release";

export function ChatWindow(props: {
  apiBaseUrl: string;
  placeholder?: string;
  titleText?: string;
}) {
  const searchParams = useSearchParams();

  const conversationId = uuidv4();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retriever, setRetriever] = useState<RetrieverName>(
    (searchParams.get("retriever") as RetrieverName) ?? "tavily"
  );
  const [llm, setLlm] = useState(searchParams.get("llm") ?? "openai");

  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);

  const { apiBaseUrl, titleText } = props;

  const [messageDetector, setMessageDetector] = useState<number>(0);

  const parsedResult = useRef<string>("");
  const runId = useRef<string | undefined>(undefined);
  const sources = useRef<Source[] | undefined>(undefined);
  const messageIndex = useRef<number | null>(null);
  const messageValue = useRef<string>("");


  useEffect(() => {
    if (messageDetector === 1 || messageDetector === 2) {
      let newMessages = [...messages];
      if (messageIndex.current === null) {
        messageIndex.current = newMessages.length;
        newMessages.push({
          id: Math.random().toString(),
          content: parsedResult.current.trim(),
          runId: runId.current,
          sources: sources.current,
          role: "assistant",
        });
      } else {
        newMessages[messageIndex.current].content = parsedResult.current.trim();
        newMessages[messageIndex.current].runId = runId.current;
        newMessages[messageIndex.current].sources = sources.current;
      }
      setMessages(newMessages);
      if (messageDetector === 2) {
        setChatHistory((prevChatHistory) => [
          ...prevChatHistory,
          ["human", messageValue.current],
          ["ai", parsedResult.current],
        ]);
      }
      setMessageDetector(0)
    }
  }, [messageDetector]);

  /**
   * version 1
   * @param message
   * @returns
   */
  const sendMessage = async (message?: string) => {
    setMessageDetector(0);
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (isLoading) {
      return;
    }
    messageValue.current = message ?? input;
    if (messageValue.current === "") return;
    setInput("");
    setMessages((prevMessages) => {
      return [
        ...prevMessages,
        { id: Math.random().toString(), content: messageValue.current, role: "user" },
      ];
    });
    setIsLoading(true);

    let accumulatedMessage = "";
    runId.current = undefined;
    sources.current = undefined;
    messageIndex.current = null;

    let renderer = new Renderer();
    renderer.paragraph = (text) => {
      return text + "\n";
    };
    renderer.list = (text) => {
      return `${text}\n\n`;
    };
    renderer.listitem = (text) => {
      return `\n• ${text}`;
    };
    renderer.code = (code, language) => {
      const validLanguage = hljs.getLanguage(language || "")
        ? language
        : "plaintext";
      const highlightedCode = hljs.highlight(
        validLanguage || "plaintext",
        code
      ).value;
      return `<pre class="highlight bg-gray-700" style="padding: 5px; border-radius: 5px; overflow: auto; overflow-wrap: anywhere; white-space: pre-wrap; max-width: 100%; display: block; line-height: 1.2"><code class="${language}" style="color: #d6e2ef; font-size: 12px; ">${highlightedCode}</code></pre>`;
    };
    marked.setOptions({ renderer });

    try {
      const sourceStepName = "FinalSourceRetriever";
      let streamedResponse: Record<string, any> = {};
      const remoteChain = new RemoteRunnable({
        url: apiBaseUrl + "/chat",
        options: {
          timeout: 60000,
        },
      });
      const logStream = await remoteChain.streamLog(
        {
          question: messageValue.current,
          chat_history: chatHistory,
        },
        {
          configurable: {
            retriever,
            llm,
          },
          metadata: {
            conversation_id: conversationId,
          },
        },
        {
          includeNames: [sourceStepName],
        }
      );
      for await (const chunk of logStream) {
        streamedResponse = applyPatch(streamedResponse, chunk.ops).newDocument;
        if (
          Array.isArray(
            streamedResponse?.logs?.[sourceStepName]?.final_output?.documents
          )
        ) {
          sources.current = streamedResponse.logs[
            sourceStepName
          ].final_output.documents.map((doc: Record<string, any>) => ({
            url: doc.metadata.source ?? doc.metadata.data_source_link,
            defaultSourceUrl: retriever === "you" ? "https://you.com" : "",
            title: doc.metadata.title,
            images: doc.metadata.images,
          }));
        }
        if (streamedResponse.id !== undefined) {
          runId.current = streamedResponse.id;
        }
        if (streamedResponse?.final_output) {
          accumulatedMessage = streamedResponse.final_output;
        }
        
        parsedResult.current = marked.parse(accumulatedMessage);
        setMessageDetector(1);
      }
      setMessageDetector(2);
      setIsLoading(false);
    } catch (e: any) {
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        {
          id: Math.random().toString(),
          content: "发生错误，请重试",
          role: "assistant",
        },
      ]);
      setIsLoading(false);
      setInput(messageValue.current);
      toast.error(e.message);
    }
  };

  const defaultQuestions = [
    "你是谁?",
    "Who are you?",
    "怎么请假？",
    "How to apply for leave?",
    "员工有几天年假？",
    "How many days of annual leave do employees have?",
    "怎么订会议室？",
  ];

  const DEFAULT_QUESTIONS: Record<RetrieverName, string[]> = {
    tavily: defaultQuestions,
    you: defaultQuestions,
    google: defaultQuestions,
    kay: [
      "Is Johnson & Johnson increasing its marketing budget?",
      "How is Lululemon adapting to new customer trends?",
      "Which industries are growing in recent 10-Q reports?",
      "Who are Etsy’s competitors?",
      "Which companies reported data breaches?",
      "What were the biggest strategy changes made by Roku in 2023?",
    ],
    kay_press_release: [
      "How is the healthcare industry adopting generative AI tools?",
      "What were the major technological advancements in the renewable energy sector in 2023?",
      "What happened to Intel's acquisition of Tower Semiconductor?",
      "What were the biggest strategy changes made by Roku in 2023?",
    ],
  };

  const sendInitialQuestion = async (question: string) => {
    await sendMessage(question);
  };

  const insertUrlParam = (key: string, value?: string) => {
    if (window.history.pushState) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set(key, value ?? "");
      const newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        searchParams.toString();
      window.history.pushState({ path: newurl }, "", newurl);
    }
  };

  return (
    <div
      className={
        "w-screen flex flex-col items-center p-8 rounded grow max-h-[calc(100vh-150px)] h-full" +
        (messages.length === 0 ? " justify-center mb-32" : "")
      }
    >
      <div className="flex flex-col items-center pb-8 w-full">
        <Heading
          fontSize={messages.length > 0 ? "2xl" : "4xl"}
          fontWeight={"medium"}
          mb={1}
          color={"white"}
        >
          {titleText}
        </Heading>
        <Heading
          fontSize={messages.length === 0 ? "xl" : "lg"}
          fontWeight={"normal"}
          mb={1}
          color={"white"}
          marginTop={messages.length === 0 ? "12px" : ""}
        >
          {messages.length > 0
            ? "We appreciate feedback!"
            : "Ask me anything!"}
        </Heading>
        <div className="text-white flex flex-wrap items-center mt-4">
          <div className="flex items-center mb-2">
            <span className="shrink-0 mr-2">Powered by</span>
          </div>
          <div className="flex items-center mb-2">
            <Select
              value={llm}
              onChange={(e) => {
                insertUrlParam("llm", e.target.value);
                setLlm(e.target.value);
              }}
              width={"212px"}
            >
              <option value="openai">GPT-3.5-Turbo</option>
              <option value="deepseek">deepseek-r1</option>
              <option value="qwen_max">通义千问-Max</option>
            </Select>
          </div>
        </div>
      </div>
      <div
        className="flex flex-col-reverse w-full mb-2 overflow-auto scrollbar-hide"
        ref={messageContainerRef}
      >
        {messages.length > 0
          ? [...messages]
              .reverse()
              .map((m, index) => (
                <ChatMessageBubble
                  key={m.id}
                  message={{ ...m }}
                  aiEmoji="🦜"
                  apiBaseUrl={apiBaseUrl}
                  isMostRecent={index === 0}
                  messageCompleted={!isLoading}
                ></ChatMessageBubble>
              ))
          : ""}
      </div>
      <InputGroup size="md" alignItems={"center"}>
        <Input
          value={input}
          height={"55px"}
          rounded={"full"}
          type={"text"}
          placeholder="Ask anything..."
          textColor={"white"}
          borderColor={"rgb(58, 58, 61)"}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <InputRightElement h="full" paddingRight={"15px"}>
          <IconButton
            colorScheme="blue"
            rounded={"full"}
            aria-label="Send"
            icon={isLoading ? <Spinner /> : <ArrowUpIcon />}
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          />
        </InputRightElement>
      </InputGroup>
      {messages.length === 0 ? (
        <div className="w-full text-center flex flex-col">
          <div className="flex grow justify-center w-full mt-4 flex-wrap">
            {DEFAULT_QUESTIONS[retriever]
              .slice(0, 4)
              .map((defaultQuestion, i) => {
                return (
                  <DefaultQuestion
                    key={`defaultquestion:${i}`}
                    question={defaultQuestion}
                    onMouseUp={(e) =>
                      sendInitialQuestion(
                        (e.target as HTMLDivElement).innerText
                      )
                    }
                  ></DefaultQuestion>
                );
              })}
          </div>
          <div className="grow justify-center w-full mt-2 hidden md:flex">
            {DEFAULT_QUESTIONS[retriever].slice(4).map((defaultQuestion, i) => {
              return (
                <DefaultQuestion
                  key={`defaultquestion:${i + 4}`}
                  question={defaultQuestion}
                  onMouseUp={(e) =>
                    sendInitialQuestion((e.target as HTMLDivElement).innerText)
                  }
                ></DefaultQuestion>
              );
            })}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
