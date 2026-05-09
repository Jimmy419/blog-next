"use client";

import { addGoalRecord, createGoal, deleteGoal } from "@/actions/goal.action";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";

type GoalRecord = {
  id: number;
  value: number;
  note: string | null;
  recordDate: string | Date;
  createdAt: string | Date;
};

type Goal = {
  id: number;
  title: string;
  targetValue: number;
  currentValue: number;
  rewardText: string | null;
  rewardImage: string | null;
  status: string;
  createdAt: string | Date;
  records: GoalRecord[];
};

interface GoalManagerProps {
  initialGoals: Goal[];
}

const toDatetimeLocal = (value: Date = new Date()) => {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function GoalManager({ initialGoals }: GoalManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState(30);
  const [rewardText, setRewardText] = useState("");
  const [rewardImage, setRewardImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const totalCompleted = useMemo(
    () => initialGoals.filter((goal) => goal.status === "COMPLETED").length,
    [initialGoals]
  );

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

  const handleCreateGoal = async (event: FormEvent<HTMLFormElement>) => {
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
        setTitle("");
        setTargetValue(30);
        setRewardText("");
        setRewardImage("");
        setMessage("目标创建成功");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "创建目标失败");
      }
    });
  };

  const handleAddRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const goalId = Number(formData.get("goalId"));
    const value = Number(formData.get("value"));
    const note = `${formData.get("note") || ""}`.trim();
    const recordDateValue = `${formData.get("recordDate") || ""}`.trim();
    const recordDate = recordDateValue ? new Date(recordDateValue) : new Date();
    setMessage("");

    startTransition(async () => {
      try {
        await addGoalRecord({
          goalId,
          value,
          note: note || undefined,
          recordDate,
        });
        setMessage("进度记录成功");
        form.reset();
        const datetime = form.querySelector<HTMLInputElement>(
          "input[name='recordDate']"
        );
        if (datetime) {
          datetime.value = toDatetimeLocal();
        }
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "记录进度失败");
      }
    });
  };

  const handleDeleteGoal = (goalId: number) => {
    const password = window.prompt("请输入登录密码以确认删除该目标：");
    if (password === null) {
      return;
    }
    if (!password.trim()) {
      setMessage("请输入密码后再删除");
      return;
    }

    setMessage("");
    startTransition(async () => {
      try {
        await deleteGoal({ goalId, password: password.trim() });
        setMessage("目标已删除");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "删除目标失败");
      }
    });
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="rounded-lg border p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">目标设置与进度录入</h1>
        <p className="mt-2 text-sm text-gray-600">
          已创建 {initialGoals.length} 个目标，已达成 {totalCompleted} 个目标
        </p>
      </div>

      <form
        onSubmit={handleCreateGoal}
        className="grid gap-3 rounded-lg border p-4 shadow-sm md:grid-cols-2"
      >
        <h2 className="md:col-span-2 text-lg font-medium">新建目标</h2>
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
          className="rounded-md border p-2 md:col-span-2"
          placeholder="奖励说明（例如：玩具车）"
          value={rewardText}
          onChange={(event) => setRewardText(event.target.value)}
        />
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm">奖励图片（可选，支持 jpg/png/webp，2MB 内）</label>
          <input type="file" accept="image/*" onChange={handleUploadImage} />
          {rewardImage ? (
            <Image
              src={rewardImage}
              alt="reward preview"
              width={220}
              height={140}
              className="rounded-md border object-cover"
            />
          ) : null}
        </div>
        <button
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60 md:col-span-2"
          type="submit"
          disabled={pending || uploading}
        >
          {pending || uploading ? "处理中..." : "创建目标"}
        </button>
      </form>

      {message ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {initialGoals.map((goal) => {
          const progress = Math.min(
            100,
            Math.floor((goal.currentValue / goal.targetValue) * 100)
          );
          return (
            <article key={goal.id} className="rounded-lg border p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <p className="text-sm text-gray-600">
                    进度：{goal.currentValue} / {goal.targetValue}（{progress}%）
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    goal.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {goal.status === "COMPLETED" ? "已达成" : "进行中"}
                </span>
              </div>

              <div className="mt-3 h-2 rounded bg-gray-200">
                <div
                  className="h-2 rounded bg-green-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {goal.rewardText ? (
                <p className="mt-3 text-sm">奖励：{goal.rewardText}</p>
              ) : null}
              {goal.rewardImage ? (
                <Image
                  src={goal.rewardImage}
                  alt={goal.rewardText || "reward"}
                  width={220}
                  height={140}
                  className="mt-2 rounded-md border object-cover"
                />
              ) : null}

              <form onSubmit={handleAddRecord} className="mt-4 grid gap-2">
                <input type="hidden" name="goalId" value={goal.id} />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="rounded-md border p-2"
                    type="number"
                    name="value"
                    placeholder="增量（如 +1）"
                    defaultValue={1}
                    required
                  />
                  <input
                    className="rounded-md border p-2"
                    type="datetime-local"
                    name="recordDate"
                    defaultValue={toDatetimeLocal()}
                  />
                </div>
                <input
                  className="rounded-md border p-2"
                  name="note"
                  placeholder="备注（例如：今天主动吃完饭）"
                />
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
                  type="submit"
                  disabled={pending}
                >
                  + 记录进度
                </button>
              </form>

              <div className="mt-4">
                <h4 className="text-sm font-medium">最近记录</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {goal.records.length === 0 ? (
                    <li className="text-gray-500">暂无记录</li>
                  ) : (
                    goal.records.map((record) => (
                      <li key={record.id} className="rounded bg-gray-50 p-2">
                        <span className="font-medium">
                          {record.value >= 0 ? "+" : ""}
                          {record.value}
                        </span>
                        <span className="ml-2 text-gray-600">
                          {new Date(record.recordDate).toLocaleString()}
                        </span>
                        {record.note ? (
                          <p className="text-gray-700">{record.note}</p>
                        ) : null}
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <button
                className="mt-3 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600"
                type="button"
                onClick={() => handleDeleteGoal(goal.id)}
                disabled={pending}
              >
                删除目标
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
