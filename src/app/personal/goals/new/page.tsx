import GoalCreateForm from "@/components/goals/GoalCreateForm";

export default function NewGoalPage() {
  return (
    <main className="min-h-[calc(100vh-180px)] bg-slate-950 py-6 text-slate-100">
      <GoalCreateForm />
    </main>
  );
}
