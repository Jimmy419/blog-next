"use client";

import { addGoalRecord, deleteGoal } from "@/actions/goal.action";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

type GoalRecord = {
  id: number;
  value: number;
  note: string | null;
  recordDate: string | Date;
};

type GoalDetail = {
  id: number;
  title: string;
  targetValue: number;
  currentValue: number;
  rewardText: string | null;
  rewardImage: string | null;
  status: string;
  records: GoalRecord[];
};

interface GoalDetailManagerProps {
  goal: GoalDetail;
}

const toDatetimeLocal = (value: Date = new Date()) => {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function GoalDetailManager({ goal }: GoalDetailManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const progress = Math.min(
    100,
    Math.floor((goal.currentValue / goal.targetValue) * 100)
  );

  const handleAddRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = Number(formData.get("value"));
    const note = `${formData.get("note") || ""}`.trim();
    const recordDateValue = `${formData.get("recordDate") || ""}`.trim();
    const recordDate = recordDateValue ? new Date(recordDateValue) : new Date();
    setMessage("");

    startTransition(async () => {
      try {
        await addGoalRecord({
          goalId: goal.id,
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

  const handleDeleteGoal = () => {
    const password = window.prompt("请输入登录密码以确认删除该目标：");
    if (password === null) return;
    if (!password.trim()) {
      setMessage("请输入密码后再删除");
      return;
    }
    setMessage("");

    startTransition(async () => {
      try {
        await deleteGoal({ goalId: goal.id, password: password.trim() });
        router.push("/personal/goals");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "删除目标失败");
      }
    });
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="rounded-lg border p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{goal.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
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
        {goal.rewardText ? <p className="mt-3">奖励：{goal.rewardText}</p> : null}
        {goal.rewardImage ? (
          <Image
            src={goal.rewardImage}
            alt={goal.rewardText || "reward"}
            width={280}
            height={160}
            className="mt-2 rounded-md border object-cover"
          />
        ) : null}
        <div className="mt-3">
          <Link href="/personal/goals" className="text-sm text-blue-600">
            返回目标列表
          </Link>
        </div>
      </div>

      {message ? (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {message}
        </p>
      ) : null}

      <form onSubmit={handleAddRecord} className="rounded-lg border p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-medium">记录进度</h2>
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
          className="mt-2 w-full rounded-md border p-2"
          name="note"
          placeholder="备注（例如：今天主动吃完饭）"
        />
        <button
          className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          + 记录进度
        </button>
      </form>

      <div className="rounded-lg border p-4 shadow-sm">
        <h2 className="text-lg font-medium">历史记录</h2>
        <ul className="mt-3 space-y-2 text-sm">
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
                {record.note ? <p className="text-gray-700">{record.note}</p> : null}
              </li>
            ))
          )}
        </ul>
      </div>

      <button
        className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600"
        type="button"
        onClick={handleDeleteGoal}
        disabled={pending}
      >
        删除目标
      </button>
    </section>
  );
}
