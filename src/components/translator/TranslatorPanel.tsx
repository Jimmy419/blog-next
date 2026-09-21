"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type BrowserSpeechRecognitionEvent = {
  results: ArrayLike<BrowserSpeechRecognitionResult>;
};

type BrowserSpeechRecognitionErrorEvent = {
  error: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

const TranslatorPanel = () => {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  const [sourceText, setSourceText] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] =
    useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] =
    useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const isIosDevice = useCallback(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  const speakTranslation = useCallback((text: string) => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }, []);

  const translateText = useCallback(
    async (value: string) => {
      const normalizedValue = value.trim();

      if (!normalizedValue) {
        setError("请先输入或录入你想翻译的内容。");
        setTranslatedText("");
        return;
      }

      setIsTranslating(true);
      setError("");

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: normalizedValue,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "翻译失败，请稍后再试。");
        }

        const englishText =
          typeof data?.translatedText === "string" ? data.translatedText : "";

        if (!englishText) {
          throw new Error("没有拿到有效的翻译结果。");
        }

        setRecognizedText(normalizedValue);
        setTranslatedText(englishText);

        if (autoSpeak && speechSynthesisSupported) {
          speakTranslation(englishText);
        }
      } catch (translationError) {
        const message =
          translationError instanceof Error
            ? translationError.message
            : "翻译失败，请稍后再试。";
        setError(message);
        setTranslatedText("");
      } finally {
        setIsTranslating(false);
      }
    },
    [autoSpeak, speakTranslation, speechSynthesisSupported]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setSpeechSynthesisSupported(
      "speechSynthesis" in window &&
        typeof SpeechSynthesisUtterance !== "undefined"
    );

    const browserWindow = window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };

    const SpeechRecognitionConstructor =
      browserWindow.SpeechRecognition ||
      browserWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      if (isIosDevice()) {
        setError(
          "当前 iPhone 浏览器没有可用的网页语音识别能力，请先使用手动输入，或改成服务端语音转文字方案。"
        );
      }
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      finalTranscriptRef.current = "";
      setIsListening(true);
      setError("");
      setInterimText("");
      setRecognizedText("");
    };

    recognition.onresult = (event) => {
      let nextFinalText = "";
      let nextInterimText = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          nextFinalText += transcript;
        } else {
          nextInterimText += transcript;
        }
      }

      finalTranscriptRef.current = nextFinalText.trim();
      setRecognizedText(nextFinalText.trim());
      setInterimText(nextInterimText.trim());
      setSourceText(`${nextFinalText}${nextInterimText}`.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setError("麦克风权限未开启，请先允许浏览器使用麦克风。");
        return;
      }

      if (event.error === "no-speech") {
        setError("没有识别到语音内容，可以再试一次。");
        return;
      }

      setError("语音识别失败，请稍后再试。");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");

      const finalText = finalTranscriptRef.current.trim();

      if (finalText) {
        setSourceText(finalText);
        setRecognizedText(finalText);
        void translateText(finalText);
      }
    };

    recognitionRef.current = recognition;
    setSpeechRecognitionSupported(true);

    return () => {
      recognition.stop();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isIosDevice, translateText]);

  const handleVoiceInput = () => {
    setError("");

    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError(
        "当前页面不是安全上下文。iPhone 上语音识别通常需要 HTTPS；如果你是用手机访问电脑本地地址，请改成 HTTPS 域名或隧道地址。"
      );
      return;
    }

    if (!recognitionRef.current) {
      setError("当前浏览器暂不支持语音识别，请使用手动输入。");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (startError) {
      const message =
        startError instanceof DOMException
          ? startError.name
          : startError instanceof Error
            ? startError.message
            : "";

      if (/notallowed/i.test(message)) {
        setError(
          "语音识别启动失败。请确认 Safari 麦克风权限已开启，且不是从 iPhone 主屏幕以独立模式打开页面。"
        );
        return;
      }

      if (/invalidstate/i.test(message)) {
        setError("语音识别正在启动中，请稍等一下再试。");
        return;
      }

      setError("语音识别启动失败，请稍后再试。");
    }
  };

  const handleClear = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    finalTranscriptRef.current = "";
    setSourceText("");
    setRecognizedText("");
    setInterimText("");
    setTranslatedText("");
    setError("");
    setIsListening(false);
  };

  return (
    <section className="min-h-[calc(100vh-68px)] bg-slate-950 px-4 pb-24 pt-8 text-slate-100 md:pb-12">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-2xl md:p-8">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Speech to English
            </span>
            <h1 className="text-3xl font-bold md:text-4xl">实时语音翻译</h1>
            <p className="text-sm leading-7 text-slate-300 md:text-base">
              你可以直接说中文，页面会把录入内容展示出来，并自动翻译成英文。也支持手动输入，翻译完成后还能直接朗读英文结果。
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    isListening
                      ? "bg-red-500 text-white hover:bg-red-400"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {isListening ? "结束录音" : "开始语音录入"}
                </button>
                <button
                  type="button"
                  onClick={() => void translateText(sourceText)}
                  disabled={isTranslating}
                  className="rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isTranslating ? "翻译中..." : "翻译成英文"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  清空
                </button>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={autoSpeak}
                  onChange={(event) => setAutoSpeak(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                />
                翻译完成后自动语音播放英文
              </label>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-200">中文输入区</p>
                  <span className="text-xs text-slate-400">
                    语音录入或手动输入都可以
                  </span>
                </div>
                <textarea
                  value={sourceText}
                  onChange={(event) => setSourceText(event.target.value)}
                  placeholder="比如：你好，请问最近的地铁站怎么走？"
                  className="min-h-[180px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-sm font-medium text-slate-200">识别结果</p>
                  <p className="mt-3 min-h-[72px] whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {recognizedText || "录音结束后，这里会显示识别出的中文内容。"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <p className="text-sm font-medium text-slate-200">实时识别</p>
                  <p className="mt-3 min-h-[72px] whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {interimText || "语音录入过程中，这里会显示实时转写内容。"}
                  </p>
                </div>
              </div>

              {!speechRecognitionSupported ? (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                  当前浏览器不支持语音识别，仍然可以使用手动输入完成翻译。
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">英文翻译结果</p>
                  <p className="mt-1 text-xs text-slate-400">
                    翻译完成后会显示在这里
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => speakTranslation(translatedText)}
                  disabled={!translatedText || !speechSynthesisSupported}
                  className="rounded-full border border-emerald-400/40 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  播放英文
                </button>
              </div>

              <div className="mt-4 min-h-[320px] rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="whitespace-pre-wrap text-base leading-8 text-slate-100">
                  {translatedText ||
                    "等待翻译结果。你可以点击语音录入，也可以先在左侧手动输入内容。"}
                </p>
              </div>

              <div className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
                <p>1. 点“开始语音录入”后直接说中文。</p>
                <p>2. 录音结束会自动显示识别文本，并翻译成英文。</p>
                <p>3. 如果你愿意，也可以直接在左侧输入中文再点翻译。</p>
                <p>4. 浏览器支持时，英文翻译会自动朗读，也可手动重播。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TranslatorPanel;
