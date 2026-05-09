"use client";

// @ts-ignore
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth.action";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "提交中..." : "发送重置邮件"}
    </button>
  );
}

const ForgotPasswordForm = () => {
  const [state, formAction] = useFormState(requestPasswordReset, undefined);

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <h2 className="text-2xl font-bold">忘记密码</h2>
        <p className="mt-1 text-sm text-slate-300">
          输入注册邮箱，我们会发送一封重置密码邮件
        </p>
      </div>

      <input
        type="email"
        name="email"
        placeholder="请输入注册邮箱"
        required
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
      />

      {state?.error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}

      {state?.message ? (
        <p className="rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {state.message}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-sm text-slate-300">
        想起密码了？
        <Link href="/login" className="ml-1 font-semibold text-blue-400">
          返回登录
        </Link>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
