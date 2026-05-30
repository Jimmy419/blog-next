import { GoalStatusFilter, getMyGoals } from "@/actions/goal.action";
import Link from "next/link";

const statusOptions: { label: string; value: GoalStatusFilter }[] = [
  { label: "全部目标", value: "ALL" },
  { label: "进行中", value: "IN_PROGRESS" },
  { label: "已完成", value: "COMPLETED" },
];
type GoalItem = Awaited<ReturnType<typeof getMyGoals>>[number];

export default async function GoalsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const rawStatus = searchParams?.status || "ALL";
  const status = (["ALL", "IN_PROGRESS", "COMPLETED"].includes(rawStatus)
    ? rawStatus
    : "ALL") as GoalStatusFilter;
  const goals = await getMyGoals(status);

  return (
    <main className="min-h-[calc(100vh-180px)] bg-slate-950 py-6 text-slate-100">
      <section className="mx-auto max-w-6xl space-y-6 p-4">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold md:text-3xl">目标列表</h1>
            <Link
              href="/personal/goals/new"
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              + 创建目标
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            当前共 {goals.length} 个目标
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {statusOptions.map((item) => {
            const active = item.value === status;
            return (
              <Link
                key={item.value}
                href={`/personal/goals?status=${item.value}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {goals.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
              当前筛选下暂无目标
            </div>
          ) : (
            goals.map((goal: GoalItem) => {
              const progress = Math.min(
                100,
                Math.floor((goal.currentValue / goal.targetValue) * 100)
              );
              return (
                <Link
                  key={goal.id}
                  href={`/personal/goals/${goal.id}`}
                  className="block rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm transition hover:border-blue-500/60 hover:bg-slate-900/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <article>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold">{goal.title}</h2>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          goal.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-yellow-500/20 text-yellow-200"
                        }`}
                      >
                        {goal.status === "COMPLETED" ? "已完成" : "进行中"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      进度：{goal.currentValue} / {goal.targetValue}（{progress}%）
                    </p>
                    <div className="mt-2 h-2 rounded bg-slate-800">
                      <div
                        className="h-2 rounded bg-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {goal.rewardText ? (
                      <p className="mt-3 text-sm text-slate-300">奖励：{goal.rewardText}</p>
                    ) : null}

                    <p className="mt-4 text-sm font-medium text-blue-400">
                      点击查看详情并记录进度
                    </p>
                  </article>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
