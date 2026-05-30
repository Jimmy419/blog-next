"use client";

import {
  addGoalRecord,
  deleteGoal,
  deleteGoalRecord,
  updateGoal,
} from "@/actions/goal.action";
import BackButton from "@/components/common/BackButton";
import { toGoalRewardApiPath } from "@/lib/goal-reward-image";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";
import ReactDatePicker from "react-datepicker";

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

const getNoteCharacterCount = (note: string) => note.replace(/\s/g, "").length;

export default function GoalDetailManager({ goal }: GoalDetailManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [recordNote, setRecordNote] = useState("");
  const [previewImageOpen, setPreviewImageOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editTargetValue, setEditTargetValue] = useState(goal.targetValue);
  const [editRewardText, setEditRewardText] = useState(goal.rewardText || "");
  const [editRewardImage, setEditRewardImage] = useState(goal.rewardImage || "");
  const [uploading, setUploading] = useState(false);
  const [recordDateTime, setRecordDateTime] = useState<Date | null>(null);
  const progress = Math.min(
    100,
    Math.floor((goal.currentValue / goal.targetValue) * 100)
  );

  useEffect(() => {
    setEditTitle(goal.title);
    setEditTargetValue(goal.targetValue);
    setEditRewardText(goal.rewardText || "");
    setEditRewardImage(goal.rewardImage || "");
  }, [goal]);

  useEffect(() => {
    // Avoid SSR hydration mismatch by initializing date after mount.
    setRecordDateTime(new Date());
  }, []);

  const handleAddRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = Number(formData.get("value"));
    const note = recordNote.trim();
    const recordDate = recordDateTime || new Date();
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
        setRecordNote("");
        setRecordDateTime(new Date());
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
      setEditRewardImage(payload.url);
      setMessage("奖励图片上传成功");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      try {
        await updateGoal({
          goalId: goal.id,
          title: editTitle.trim(),
          targetValue: editTargetValue,
          rewardText: editRewardText.trim() || undefined,
          rewardImage: editRewardImage || null,
        });
        setIsEditing(false);
        setMessage("目标信息更新成功");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "更新目标失败");
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
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200"
          >
            {isEditing ? "收起编辑" : "编辑目标"}
          </button>
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
          <button
            type="button"
            onClick={() => setPreviewImageOpen(true)}
            className="mt-2 block text-left"
          >
            <Image
              src={toGoalRewardApiPath(goal.rewardImage) || ""}
              alt={goal.rewardText || "reward"}
              width={280}
              height={160}
              unoptimized
              className="rounded-md border border-slate-700 object-cover transition hover:opacity-90"
            />
            <span className="mt-2 block text-xs text-slate-400">
              点击图片查看大图
            </span>
          </button>
        ) : null}
      </div>

      {previewImageOpen && goal.rewardImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="奖励图片预览"
          onClick={() => setPreviewImageOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImageOpen(false)}
              className="absolute right-0 top-0 z-10 rounded-full border border-slate-600 bg-slate-900/90 px-3 py-1 text-sm text-slate-100"
            >
              关闭
            </button>
            <Image
              src={toGoalRewardApiPath(goal.rewardImage) || ""}
              alt={goal.rewardText || "reward preview"}
              width={1600}
              height={1200}
              unoptimized
              className="h-auto max-h-[85vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-md border border-blue-300/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
          {message}
        </p>
      ) : null}

      {isEditing ? (
        <form
          onSubmit={handleUpdateGoal}
          className="grid w-full min-w-0 gap-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
        >
          <h2 className="text-lg font-medium">编辑目标</h2>
          <input
            className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
            value={editTitle}
            onChange={(event) => setEditTitle(event.target.value)}
            placeholder="目标名称"
            required
          />
          <input
            className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
            type="number"
            min={1}
            value={editTargetValue}
            onChange={(event) => setEditTargetValue(Number(event.target.value || 1))}
            required
          />
          <input
            className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
            value={editRewardText}
            onChange={(event) => setEditRewardText(event.target.value)}
            placeholder="奖励说明（可选）"
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
            {editRewardImage ? (
              <div className="flex items-start gap-3">
                <Image
                  src={toGoalRewardApiPath(editRewardImage) || ""}
                  alt="reward preview"
                  width={220}
                  height={140}
                  unoptimized
                  className="rounded-md border border-slate-700 object-cover"
                />
                <button
                  type="button"
                  className="rounded border border-red-400/60 bg-red-500/10 px-2 py-1 text-xs text-red-200"
                  onClick={() => setEditRewardImage("")}
                >
                  清空图片
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={pending || uploading}
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {pending || uploading ? "处理中..." : "保存修改"}
          </button>
        </form>
      ) : null}

      <form
        onSubmit={handleAddRecord}
        className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
      >
        <h2 className="mb-3 text-lg font-medium">记录进度</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <input
            className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
            type="number"
            name="value"
            placeholder="增量（如 +1）"
            defaultValue={1}
            required
          />
          <ReactDatePicker
            selected={recordDateTime}
            onChange={(value: Date | null) => setRecordDateTime(value)}
            showTimeSelect
            timeIntervals={1}
            dateFormat="yyyy/MM/dd HH:mm"
            className="goal-date-input h-12 w-full min-w-0 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            calendarClassName="goal-date-calendar"
            popperClassName="goal-date-popper"
            placeholderText="选择记录时间"
          />
        </div>
        <div className="mt-2">
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
            name="note"
            value={recordNote}
            onChange={(event) => setRecordNote(event.target.value)}
            maxLength={500}
            placeholder="备注（例如：今天主动吃完饭）"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            已输入 {getNoteCharacterCount(recordNote)} / 500 字（不含空格）
          </p>
        </div>
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
                      <>
                        <p className="mt-1 text-xs text-slate-400">
                          备注（{getNoteCharacterCount(record.note)} 字，不含空格）
                        </p>
                        <p className="text-slate-300">{record.note}</p>
                      </>
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
