"use client";

import { createGoal } from "@/actions/goal.action";
import BackButton from "@/components/common/BackButton";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

export default function GoalCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState(30);
  const [rewardText, setRewardText] = useState("");
  const [rewardImage, setRewardImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload/goal-reward", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "上传失败");
      }
      setRewardImage(payload.url);
      setMessage("奖励图片上传成功");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        await createGoal({
          title: title.trim(),
          targetValue,
          rewardText: rewardText.trim() || undefined,
          rewardImage: rewardImage || undefined,
        });
        router.push("/personal/goals");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "创建目标失败");
      }
    });
  };

  const toSafeImageSrc = (raw: string) => {
    if (!raw) return raw;
    if (raw.startsWith("/")) return raw;
    try {
      const parsed = new URL(raw);
      if (parsed.pathname.startsWith("/uploads/")) {
        return parsed.pathname;
      }
      return raw;
    } catch {
      return raw;
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">创建目标</h1>
          <div className="flex items-center gap-2">
            <BackButton
              fallbackHref="/personal/goals"
              className="border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
            />
            <Link href="/personal/goals" className="text-sm text-blue-400">
              目标列表
            </Link>
          </div>
        </div>
      </div>

      {message ? (
        <p className="rounded-md border border-blue-300/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
          {message}
        </p>
      ) : null}

      <form
        onSubmit={handleCreateGoal}
        className="grid w-full min-w-0 gap-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
      >
        <input
          className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
          placeholder="目标名称（例如：好好吃饭）"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <input
          className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
          type="number"
          min={1}
          value={targetValue}
          onChange={(event) => setTargetValue(Number(event.target.value || 1))}
          required
        />
        <input
          className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
          placeholder="奖励说明（例如：玩具车）"
          value={rewardText}
          onChange={(event) => setRewardText(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">
            奖励图片（可选，支持 jpg/png/webp，2MB 内）
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUploadImage}
            className="w-full min-w-0 max-w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-slate-800 file:px-2 file:py-1 file:text-slate-200"
          />
          {rewardImage ? (
            <Image
              src={toSafeImageSrc(rewardImage)}
              alt="reward preview"
              width={280}
              height={160}
              unoptimized
              className="rounded-md border border-slate-700 object-cover"
            />
          ) : null}
        </div>

        <button
          className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          type="submit"
          disabled={pending || uploading}
        >
          {pending || uploading ? "处理中..." : "创建目标"}
        </button>
      </form>
    </section>
  );
}
