import ResetPasswordForm from "@/components/loginForm/ResetPasswordForm";
import Image from "next/image";
import Link from "next/link";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = `${searchParams?.token || ""}`.trim();

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
          <h1 className="mt-6 text-3xl font-bold leading-tight">设置新密码</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            为了账户安全，请设置一个新的密码，建议长度不少于 8 位。
          </p>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">链接无效</h2>
              <p className="text-sm text-slate-300">请重新申请密码重置链接后再试。</p>
              <Link href="/forgot-password" className="text-sm font-semibold text-blue-400">
                去忘记密码页面
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
