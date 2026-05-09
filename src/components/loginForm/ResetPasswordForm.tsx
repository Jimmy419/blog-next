"use client";

// @ts-ignore
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { resetPassword } from "@/actions/auth.action";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "重置中..." : "确认重置密码"}
    </button>
  );
}

const ResetPasswordForm = ({ token }: { token: string }) => {
  const [state, formAction] = useFormState(resetPassword, undefined);

  return (
    <form className="space-y-4" action={formAction}>
      <div>
        <h2 className="text-2xl font-bold">重置密码</h2>
        <p className="mt-1 text-sm text-slate-300">请设置你的新密码</p>
      </div>

      <input type="hidden" name="token" value={token} />

      <div className="space-y-3">
        <input
          type="password"
          name="password"
          placeholder="请输入新密码（至少 6 位）"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
        />
        <input
          type="password"
          name="passwordRepeat"
          placeholder="请再次输入新密码"
          required
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500 placeholder:text-slate-400 focus:ring-2"
        />
      </div>

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
        已有账号？
        <Link href="/login" className="ml-1 font-semibold text-blue-400">
          去登录
        </Link>
      </p>
    </form>
  );
};

export default ResetPasswordForm;
