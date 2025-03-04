import { NextResponse } from "next/server";
import { RemoteRunnable } from "langchain/runnables/remote";
import { applyPatch } from "@langchain/core/utils/json_patch";

export const runtime = "edge";

// 创建可重用的解析器
const parseRequestBody = async (req: Request) => {
  const clone = req.clone(); // 创建请求的副本
  return clone.json();
};

export async function POST(req: Request) {
  console.log("🚀 ~ POST ~ req:", req)
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  try {
    // 使用新的解析方式
    const { question, chat_history, retriever, llm, conversation_id } =
      await parseRequestBody(req);

    const remoteChain = new RemoteRunnable({
      url: process.env.BACKEND_URL + "/chat",
      options: {
        timeout: 60000,
      },
    });
    console.log("🚀 ~ POST ~ remoteChain:", remoteChain)
    

    const logStream = await remoteChain.streamLog(
      { question, chat_history },
      {
        configurable: { retriever, llm },
        metadata: { conversation_id },
      }
    );

    // 使用立即执行异步函数处理流
    (async () => {
      let streamedResponse: Record<string, any> = {};

      try {
        for await (const chunk of logStream) {
            console.log("🚀 ~ POST ~ chunk:", chunk)
          streamedResponse = applyPatch(
            streamedResponse,
            chunk.ops
          ).newDocument;

          // 处理内容块
          if (Array.isArray(streamedResponse?.streamed_output)) {
            const content = streamedResponse.streamed_output.join("");
            await writer.write(
              encoder.encode(JSON.stringify({ content }) + "\n")
            );
            // await writer.write(encoder.encode(JSON.stringify({
            //     content: deltaContent // 只发送增量内容
            //   }) + "\n"));
          }

          // 处理来源信息
          if (
            streamedResponse?.logs?.FinalSourceRetriever?.final_output
              ?.documents
          ) {
            const sources =
              streamedResponse.logs.FinalSourceRetriever.final_output.documents;
            await writer.write(
              encoder.encode(JSON.stringify({ sources }) + "\n")
            );
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e: any) {
    console.error("Error processing request:", e);
    await writer.write(
      encoder.encode(
        JSON.stringify({
          error: e.message || "An error occurred",
        }) + "\n"
      )
    );
    await writer.close();
    return new NextResponse(stream.readable, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
