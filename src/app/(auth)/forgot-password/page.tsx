import ForgotPasswordForm from "@/components/loginForm/ForgotPasswordForm";
import Image from "next/image";

const ForgotPasswordPage = () => {
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
          <h1 className="mt-6 text-3xl font-bold leading-tight">找回账号访问权限</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            我们会向你的注册邮箱发送重置链接，链接短时有效，并且只能使用一次。
          </p>
          <div className="mt-6 space-y-2 text-sm text-slate-300">
            <p>• 链接默认 15 分钟过期</p>
            <p>• 重置成功后旧密码失效</p>
            <p>• 未注册邮箱不会暴露状态</p>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <ForgotPasswordForm />
        </section>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
