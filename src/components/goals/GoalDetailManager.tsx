"use client";

import { addGoalRecord, deleteGoal, deleteGoalRecord } from "@/actions/goal.action";
import BackButton from "@/components/common/BackButton";
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

  const handleDeleteRecord = (recordId: number) => {
    const password = window.prompt("请输入登录密码以确认删除该条记录：");
    if (password === null) return;
    if (!password.trim()) {
      setMessage("请输入密码后再删除记录");
      return;
    }
    setMessage("");

    startTransition(async () => {
      try {
        await deleteGoalRecord({
          goalId: goal.id,
          recordId,
          password: password.trim(),
        });
        setMessage("记录已删除");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "删除记录失败");
      }
    });
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{goal.title}</h1>
            <p className="mt-1 text-sm text-slate-300">
              进度：{goal.currentValue} / {goal.targetValue}（{progress}%）
            </p>
          </div>
          <span
            className={`rounded px-2 py-1 text-xs ${
              goal.status === "COMPLETED"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-yellow-500/20 text-yellow-200"
            }`}
          >
            {goal.status === "COMPLETED" ? "已达成" : "进行中"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <BackButton
            fallbackHref="/personal/goals"
            className="border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
          />
          <Link href="/personal/goals" className="text-sm text-blue-400">
            目标列表
          </Link>
        </div>
        <div className="mt-3 h-2 rounded bg-slate-800">
          <div
            className="h-2 rounded bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {goal.rewardText ? (
          <p className="mt-3 text-sm text-slate-300">奖励：{goal.rewardText}</p>
        ) : null}
        {goal.rewardImage ? (
          <Image
            src={goal.rewardImage}
            alt={goal.rewardText || "reward"}
            width={280}
            height={160}
            className="mt-2 rounded-md border border-slate-700 object-cover"
          />
        ) : null}
      </div>

      {message ? (
        <p className="rounded-md border border-blue-300/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
          {message}
        </p>
      ) : null}

      <form
        onSubmit={handleAddRecord}
        className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
      >
        <h2 className="mb-3 text-lg font-medium">记录进度</h2>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
            type="number"
            name="value"
            placeholder="增量（如 +1）"
            defaultValue={1}
            required
          />
          <input
            className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
            type="datetime-local"
            name="recordDate"
            defaultValue={toDatetimeLocal()}
          />
        </div>
        <input
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
          name="note"
          placeholder="备注（例如：今天主动吃完饭）"
        />
        <button
          className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          + 记录进度
        </button>
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <h2 className="text-lg font-medium">历史记录</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {goal.records.length === 0 ? (
            <li className="text-slate-400">暂无记录</li>
          ) : (
            goal.records.map((record) => (
              <li key={record.id} className="rounded-lg border border-slate-700 bg-slate-950 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-medium">
                      {record.value >= 0 ? "+" : ""}
                      {record.value}
                    </span>
                    <span className="ml-2 text-slate-400">
                      {new Date(record.recordDate).toLocaleString()}
                    </span>
                    {record.note ? (
                      <p className="text-slate-300">{record.note}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="rounded border border-red-400/60 bg-red-500/10 px-2 py-1 text-xs text-red-200"
                    onClick={() => handleDeleteRecord(record.id)}
                    disabled={pending}
                  >
                    删除
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <button
        className="rounded-lg border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
        type="button"
        onClick={handleDeleteGoal}
        disabled={pending}
      >
        删除目标
      </button>
    </section>
  );
}
