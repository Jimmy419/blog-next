"use client";
// @ts-ignore
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/actions/auth.action";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "注册中..." : "创建账号"}
    </button>
  );
}

const RegisterForm = () => {
  const [state, formAction] = useFormState(register, undefined);

  const router = useRouter();

  useEffect(() => {
    state?.success && router.push("/login");
  }, [state?.success, router]);

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <h2 className="text-2xl font-bold">注册 GoalManager</h2>
        <p className="mt-1 text-sm text-slate-300">创建账号，开始你的目标计划</p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="用户名"
          name="username"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
        />
        <input
          type="email"
          placeholder="邮箱"
          name="email"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
        />
        <input
          type="password"
          placeholder="密码"
          name="password"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
        />
        <input
          type="password"
          placeholder="再次输入密码"
          name="passwordRepeat"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
        />
      </div>

      {state?.error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-sm text-slate-300">
        已有账号？
        <Link href="/login" className="ml-1 font-semibold text-blue-400">
          去登录
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
