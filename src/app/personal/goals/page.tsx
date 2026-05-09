import { getMyGoals } from "@/actions/goal.action";
import GoalManager from "@/components/goals/GoalManager";

export default async function GoalsPage() {
  const goals = await getMyGoals();

  return (
    <main className="min-h-[calc(100vh-180px)] py-6">
      <GoalManager initialGoals={goals} />
    </main>
  );
}
