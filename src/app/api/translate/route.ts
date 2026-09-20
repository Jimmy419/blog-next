import { NextRequest, NextResponse } from "next/server";

const TRANSLATION_MODEL = process.env.BAILIAN_TRANSLATION_MODEL || "qwen-plus";

const sanitizeTranslation = (value: string) =>
  value
    .trim()
    .replace(/^["'`\s]+|["'`\s]+$/g, "")
    .replace(/^English translation:\s*/i, "");

export const POST = async (req: NextRequest) => {
  try {
    const { text } = await req.json();

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "待翻译内容不能为空。" },
        { status: 400 }
      );
    }

    if (!process.env.BAILIAN_API_KEY) {
      return NextResponse.json(
        { error: "翻译服务未配置 BAILIAN_API_KEY。" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BAILIAN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: TRANSLATION_MODEL,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are a professional translation assistant. Translate the user's Chinese text into natural English. Return the English translation only, without quotes, bullet points, notes, or explanations.",
            },
            {
              role: "user",
              content: text.trim(),
            },
          ],
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Translate API error:", errorText);
      return NextResponse.json(
        { error: "翻译服务调用失败，请稍后再试。" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawTranslation = data?.choices?.[0]?.message?.content;
    const translatedText =
      typeof rawTranslation === "string"
        ? sanitizeTranslation(rawTranslation)
        : "";

    if (!translatedText) {
      return NextResponse.json(
        { error: "没有获取到有效的翻译结果。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translate route error:", error);
    return NextResponse.json(
      { error: "翻译过程中发生异常，请稍后再试。" },
      { status: 500 }
    );
  }
};
