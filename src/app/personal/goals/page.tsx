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
    <main className="min-h-[calc(100vh-180px)] py-6">
      <section className="mx-auto max-w-6xl space-y-6 p-4">
        <div className="rounded-lg border p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold">目标列表</h1>
            <Link
              href="/personal/goals/new"
              className="rounded bg-black px-3 py-2 text-sm text-white"
            >
              + 创建目标
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-600">
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
                className={`rounded px-3 py-1 text-sm ${
                  active
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {goals.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-gray-500">
              当前筛选下暂无目标
            </div>
          ) : (
            goals.map((goal: GoalItem) => {
              const progress = Math.min(
                100,
                Math.floor((goal.currentValue / goal.targetValue) * 100)
              );
              return (
                <article key={goal.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg font-semibold">{goal.title}</h2>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        goal.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {goal.status === "COMPLETED" ? "已完成" : "进行中"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    进度：{goal.currentValue} / {goal.targetValue}（{progress}%）
                  </p>
                  <div className="mt-2 h-2 rounded bg-gray-200">
                    <div
                      className="h-2 rounded bg-green-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {goal.rewardText ? (
                    <p className="mt-3 text-sm">奖励：{goal.rewardText}</p>
                  ) : null}

                  <div className="mt-4">
                    <Link
                      href={`/personal/goals/${goal.id}`}
                      className="text-sm text-blue-600"
                    >
                      查看详情并记录进度
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
