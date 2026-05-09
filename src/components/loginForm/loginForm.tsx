"use client";
// @ts-ignore
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { login } from "@/actions/auth.action";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      aria-disabled={pending}
    >
      {pending ? "登录中..." : "登录"}
    </button>
  );
}

const LoginForm = () => {
  const [state, formAction] = useFormState(login, undefined);
  const errorText = state && state !== "User Signed In!" ? state : "";

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <h2 className="text-2xl font-bold">登录 GoalManager</h2>
        <p className="mt-1 text-sm text-slate-300">继续你的目标进度记录</p>
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
          type="password"
          placeholder="密码"
          name="password"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
        />
      </div>

      {errorText ? (
        <p className="rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorText}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-sm text-slate-300">
        还没有账号？
        <Link href="/register" className="ml-1 font-semibold text-blue-400">
          去注册
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
