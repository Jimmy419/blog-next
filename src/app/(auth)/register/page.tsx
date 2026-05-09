import RegisterForm from "@/components/registerForm/registerForm";
import Image from "next/image";

const RegisterPage = () => {
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
            创建你的目标管理空间
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            注册后即可开始创建目标、记录进度、查看完成情况，逐步建立你的长期习惯。
          </p>
          <div className="mt-6 space-y-2 text-sm text-slate-300">
            <p>• 支持目标奖励与图片</p>
            <p>• 历史记录可追溯</p>
            <p>• 支持移动端快速录入</p>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <RegisterForm />
        </section>
      </div>
    </main>
  );
};

export default RegisterPage;
