import { getMyGoalDetail } from "@/actions/goal.action";
import GoalDetailManager from "@/components/goals/GoalDetailManager";
import { notFound } from "next/navigation";

export default async function GoalDetailPage({
  params,
}: {
  params: { goalId: string };
}) {
  const goalId = Number(params.goalId);
  if (!Number.isInteger(goalId) || goalId <= 0) {
    notFound();
  }

  try {
    const goal = await getMyGoalDetail(goalId);
    return (
      <main className="min-h-[calc(100vh-180px)] py-6">
        <GoalDetailManager goal={goal} />
      </main>
    );
  } catch {
    notFound();
  }
}
