"use server";

import prisma from "@/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../lib/auth";
import { z } from "zod";

export const handleLogout = async () => {
  await signOut();
};

export const register = async (
  _previousState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) => {
  const parsed = z
    .object({
      username: z.string().trim().min(2),
      email: z.string().trim().email(),
      password: z.string().min(6),
      passwordRepeat: z.string().min(6),
      img: z.string().trim().optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "请填写合法的注册信息" };
  }
  const { username, email, password, img, passwordRepeat } = parsed.data;
  if (password !== passwordRepeat) {
    return { error: "两次密码不一致" };
  }

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (user) {
      return { error: "用户名或邮箱已存在" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        image: img || null,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("🚀 ~ err:", err);
    return { error: "Something went wrong!" };
  }
};

export const login = async (
  _prevState: string | undefined,
  formData: FormData
) => {
  const parsed = z
    .object({
      username: z.string().trim().min(1),
      password: z.string().min(6),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return "请输入正确的用户名和密码";
  }
  const { username, password } = parsed.data;

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/personal/goals",
    });
    return "User Signed In!";
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return "Invalid username or password";
      } else {
        return "Something went wrong";
      }
    }
    throw err;
  }
};
