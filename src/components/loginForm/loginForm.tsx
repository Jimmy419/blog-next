"use client";

import { login } from "@/lib/action";
import styles from "./loginForm.module.css";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

const LoginForm = () => {
  const [state, formAction] = useFormState(login, undefined);
  const { pending } = useFormStatus();

  return (
    <form className={`${styles.form}`} action={formAction}>
      <input type="text" placeholder="username" name="username" />
      <input type="password" placeholder="password" name="password" />
      <button aria-disabled={pending}>Login</button>
      {state}
      <Link href="/register">
        {"Don't have an account?"} <b>Register</b>
      </Link>
    </form>
  );
};

export default LoginForm;
