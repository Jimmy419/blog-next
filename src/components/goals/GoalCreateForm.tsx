"use client";

import { createGoal } from "@/actions/goal.action";
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

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">创建目标</h1>
        <Link href="/personal/goals" className="text-sm text-blue-600">
          返回目标列表
        </Link>
      </div>

      {message ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {message}
        </p>
      ) : null}

      <form
        onSubmit={handleCreateGoal}
        className="grid gap-3 rounded-lg border p-4 shadow-sm"
      >
        <input
          className="rounded-md border p-2"
          placeholder="目标名称（例如：好好吃饭）"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <input
          className="rounded-md border p-2"
          type="number"
          min={1}
          value={targetValue}
          onChange={(event) => setTargetValue(Number(event.target.value || 1))}
          required
        />
        <input
          className="rounded-md border p-2"
          placeholder="奖励说明（例如：玩具车）"
          value={rewardText}
          onChange={(event) => setRewardText(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm">奖励图片（可选，支持 jpg/png/webp，2MB 内）</label>
          <input type="file" accept="image/*" onChange={handleUploadImage} />
          {rewardImage ? (
            <Image
              src={rewardImage}
              alt="reward preview"
              width={280}
              height={160}
              className="rounded-md border object-cover"
            />
          ) : null}
        </div>

        <button
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
          type="submit"
          disabled={pending || uploading}
        >
          {pending || uploading ? "处理中..." : "创建目标"}
        </button>
      </form>
    </section>
  );
}
