import LoginForm from "@/components/loginForm/loginForm";
import Image from "next/image";

const LoginPage = () => {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-slate-950 px-4 py-10 text-slate-100 md:py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 md:p-8">
          <Image
            src="/goalmanager-logo.svg"
            alt="GoalManager"
            width={220}
            height={56}
            className="h-12 w-auto"
            priority
          />
          <h1 className="mt-6 text-3xl font-bold leading-tight">
            欢迎回来，继续你的目标计划
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            登录后你可以继续记录目标进度、查看历史轨迹，并安全管理每一条记录。
          </p>
          <div className="mt-6 space-y-2 text-sm text-slate-300">
            <p>• 多目标并行管理</p>
            <p>• 自动计算完成率</p>
            <p>• 删除需密码确认</p>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <LoginForm />
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
